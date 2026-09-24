<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Templates;

use DOMDocument;
use DOMElement;
use DOMXPath;
use MediaWiki\Html\TemplateParser;
use MediaWiki\Skins\Citizen\Components\CitizenAsidePanel;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageAside;
use MediaWikiIntegrationTestCase;
use PHPUnit\Framework\MockObject\MockObject;
use Wikimedia\ObjectCache\HashBagOStuff;

/**
 * Renders PageAside.mustache with its partials and asserts the panel
 * contract every panel must satisfy: root › heading › body, direct children
 * in that order, carrying the ids and classes styles and scripts key on.
 *
 * TemplateParser opportunistically reads MediaWikiServices for cache-key
 * material, so this can't be a MediaWikiUnitTestCase: whenever an earlier
 * integration test in the same process has already built the global
 * service container, disallowGlobalInstanceInUnitTests() leaves that
 * instance in place and only flips the "allowed" flag, so the unit-test
 * guard throws "Premature access to service container" instead of the
 * true unit-test case of there being no instance at all.
 *
 * @group Citizen
 * @group Templates
 * @coversNothing
 */
class PageAsideRenderTest extends MediaWikiIntegrationTestCase {

	/**
	 * @return CitizenAsidePanel&MockObject
	 */
	private function panel(
		string $id,
		string $label,
		int $order,
		array $data,
		string $placement = CitizenAsidePanel::PLACEMENT_FLOW
	): CitizenAsidePanel&MockObject {
		$mock = $this->createMock( CitizenAsidePanel::class );
		$mock->method( 'getId' )->willReturn( $id );
		$mock->method( 'getLabel' )->willReturn( $label );
		$mock->method( 'getIcon' )->willReturn( 'article' );
		$mock->method( 'getOrder' )->willReturn( $order );
		$mock->method( 'hasContent' )->willReturn( true );
		$mock->method( 'getPlacement' )->willReturn( $placement );
		$mock->method( 'getTemplateData' )->willReturn( $data );
		return $mock;
	}

	private function lastmodPanel(): CitizenAsidePanel {
		return $this->panel( 'lastmod', 'Last modified', 10, [
			'href' => '/w/index.php?title=Akita&diff=',
			'title' => 'This page was last edited on 15 March 2024, at 10:00.',
			'datetime' => '2024-03-15T10:00:00Z',
			'date' => '15 March 2024',
			'icon' => 'history',
		] );
	}

	private function tocPanel( string $placement = CitizenAsidePanel::PLACEMENT_STICKY ): CitizenAsidePanel {
		return $this->panel( 'toc', 'Contents', 20, [
			'data-toc' => [
				'number-section-count' => 2,
				'citizen-is-collapse-sections-enabled' => false,
				'array-sections' => [
					[
						'toclevel' => 1,
						'number' => '1',
						'line' => 'History',
						'anchor' => 'History',
						'linkAnchor' => 'History',
						'is-top-level-section' => true,
						'is-parent-section' => false,
						'array-sections' => [],
					],
					[
						'toclevel' => 1,
						'number' => '2',
						'line' => 'Care',
						'anchor' => 'Care',
						'linkAnchor' => 'Care',
						'is-top-level-section' => true,
						'is-parent-section' => false,
						'array-sections' => [],
					],
				],
			],
		], $placement );
	}

	private function render( array $panels ): DOMXPath {
		$parser = new TemplateParser( __DIR__ . '/../../../../templates', new HashBagOStuff() );
		// SkinMustache renders with this on, and the table of contents needs
		// it: TableOfContents__line includes itself for nested sections.
		$parser->enableRecursivePartials( true );
		$html = $parser->processTemplate( 'PageAside', [
			'msg-citizen-page-aside-label' => 'Side column',
			// Differs from the ToC panel's label, so the heading assertion shows
			// which of the two renders there.
			'msg-toc' => 'Table of contents',
			'msg-citizen-jumptotop' => 'Back to top',
			'data-page-aside' => ( new CitizenComponentPageAside( $panels ) )->getTemplateData(),
		] );

		$doc = new DOMDocument();
		// libxml's HTML parser predates aside/details/time and reports them
		// as unknown; it still builds the elements, so the noise is dropped.
		libxml_use_internal_errors( true );
		$doc->loadHTML( '<?xml encoding="utf-8"?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		libxml_clear_errors();
		return new DOMXPath( $doc );
	}

	/**
	 * @return DOMElement[]
	 */
	private function elementChildren( DOMElement $element ): array {
		$children = [];
		foreach ( $element->childNodes as $node ) {
			if ( $node instanceof DOMElement ) {
				$children[] = $node;
			}
		}
		return $children;
	}

	private function single( DOMXPath $xpath, string $query, ?DOMElement $context = null ): DOMElement {
		$nodes = $xpath->query( $query, $context );
		$this->assertCount( 1, $nodes, "exactly one match for $query" );
		$node = $nodes->item( 0 );
		$this->assertInstanceOf( DOMElement::class, $node );
		return $node;
	}

	public function testAsideIsTheNamedLandmark(): void {
		$xpath = $this->render( [ $this->lastmodPanel() ] );

		$aside = $this->single( $xpath, '//aside' );

		$this->assertSame( 'citizen-page-aside', $aside->getAttribute( 'class' ) );
		$this->assertSame( 'Side column', $aside->getAttribute( 'aria-label' ) );
	}

	public function testFlowPanelRendersTheChrome(): void {
		$xpath = $this->render( [ $this->lastmodPanel() ] );

		$root = $this->single( $xpath, '//aside/*' );

		$this->assertSame( 'div', $root->nodeName );
		$this->assertSame( 'citizen-page-aside-lastmod', $root->getAttribute( 'id' ) );
		$this->assertSame(
			'citizen-page-aside__panel citizen-page-aside__panel--lastmod',
			$root->getAttribute( 'class' )
		);
		$this->assertSame( '10', $root->getAttribute( 'data-order' ) );

		$children = $this->elementChildren( $root );
		$this->assertCount( 2, $children, 'heading and body, nothing else' );
		[ $heading, $body ] = $children;
		// Plain divs: a heading element would put every panel into heading
		// navigation, and the aside is already the landmark.
		$this->assertSame( [ 'div', 'div' ], [ $heading->nodeName, $body->nodeName ] );
		$this->assertSame( 'citizen-page-aside__heading', $heading->getAttribute( 'class' ) );
		$this->assertSame( 'citizen-page-aside-lastmod-heading', $heading->getAttribute( 'id' ) );
		$this->assertSame( 'Last modified', trim( $heading->textContent ) );
		$this->assertSame( 'citizen-page-aside__body', $body->getAttribute( 'class' ) );

		// With no sticky panel, the sticky block is not opened at all.
		$this->assertCount( 0, $xpath->query( '//*[contains(@class,"citizen-page-aside__sticky")]' ) );
	}

	public function testLastModifiedBodyIsOneTimedLink(): void {
		$xpath = $this->render( [ $this->lastmodPanel() ] );

		$link = $this->single( $xpath, '//div[@class="citizen-page-aside__body"]/*' );

		$this->assertSame( 'a', $link->nodeName );
		$classes = explode( ' ', $link->getAttribute( 'class' ) );
		foreach ( [
			'citizen-page-aside__link',
			'cdx-button',
			'cdx-button--fake-button',
			// Codex hangs the quiet button's hover, active and focus states on it.
			'cdx-button--fake-button--enabled',
			'cdx-button--weight-quiet',
		] as $class ) {
			$this->assertContains( $class, $classes );
		}
		// It looks like a button but it is a link, and it is announced as one.
		// The link mixin matches `a:where( :not( [ role='button' ] ) )`, so
		// PageAside.less removes the underline it adds while the link is pressed.
		$this->assertFalse( $link->hasAttribute( 'role' ) );
		$this->assertSame( '/w/index.php?title=Akita&diff=', $link->getAttribute( 'href' ) );
		$this->assertSame(
			'This page was last edited on 15 March 2024, at 10:00.',
			$link->getAttribute( 'title' )
		);

		$icon = $this->single( $xpath, './span', $link );
		$this->assertStringContainsString( 'mw-ui-icon-wikimedia-history', $icon->getAttribute( 'class' ) );

		// lastModified.js finds this by id and replaces its text with a
		// relative time read from datetime; nothing else may be inside it.
		$time = $this->single( $xpath, './time', $link );
		$this->assertSame( 'citizen-page-aside-lastmod-time', $time->getAttribute( 'id' ) );
		$this->assertSame( '2024-03-15T10:00:00Z', $time->getAttribute( 'datetime' ) );
		$this->assertSame( '15 March 2024', trim( $time->textContent ) );
		$this->assertSame( [], $this->elementChildren( $time ) );
	}

	public function testTableOfContentsBuildsTheSameChrome(): void {
		$xpath = $this->render( [ $this->lastmodPanel(), $this->tocPanel() ] );

		// Flow panels are the aside's own children; the sticky zone is one
		// block after them, holding the outline.
		$roots = $xpath->query( '//aside/*' );
		$this->assertCount( 2, $roots );
		$lastmod = $roots->item( 0 );
		$this->assertInstanceOf( DOMElement::class, $lastmod );
		$this->assertSame( 'citizen-page-aside-lastmod', $lastmod->getAttribute( 'id' ) );
		$block = $roots->item( 1 );
		$this->assertInstanceOf( DOMElement::class, $block );
		$this->assertSame( 'div', $block->nodeName );
		$this->assertSame( 'citizen-page-aside__sticky', $block->getAttribute( 'class' ) );
		$nav = $this->single( $xpath, '//aside/div[@class="citizen-page-aside__sticky"]/*' );

		$this->assertSame( 'nav', $nav->nodeName );
		$this->assertSame( 'citizen-toc', $nav->getAttribute( 'id' ) );
		$this->assertSame( '20', $nav->getAttribute( 'data-order' ) );
		$classes = explode( ' ', $nav->getAttribute( 'class' ) );
		$expected = [
			'citizen-toc',
			'citizen-dropdown',
			'citizen-page-aside__panel',
			'citizen-page-aside__panel--toc',
		];
		foreach ( $expected as $class ) {
			$this->assertContains( $class, $classes );
		}
		$this->assertNotContains( 'citizen-toc--collapse-enabled', $classes );
		$this->assertSame( 'citizen-page-aside-toc-heading', $nav->getAttribute( 'aria-labelledby' ) );

		$children = $this->elementChildren( $nav );
		$this->assertCount( 3, $children, 'heading, the below-desktop control, body' );
		[ $heading, $details, $body ] = $children;
		// The root nav is the one landmark; a nav body would nest a second.
		$this->assertSame( [ 'div', 'div' ], [ $heading->nodeName, $body->nodeName ] );
		$this->assertSame( 'citizen-page-aside__heading', $heading->getAttribute( 'class' ) );
		$this->assertSame( 'citizen-page-aside-toc-heading', $heading->getAttribute( 'id' ) );
		$this->assertSame( 'Contents', trim( $heading->textContent ) );
		// Dropdown.less opens `.citizen-dropdown-details[open] + .citizen-menu__card`,
		// so the details must be the body's immediate previous sibling.
		$this->assertSame( 'details', $details->nodeName );
		$this->assertSame( 'citizen-dropdown-details', $details->getAttribute( 'class' ) );
		$this->assertSame(
			'mw-panel-toc',
			$this->single( $xpath, './summary', $details )->getAttribute( 'aria-details' )
		);
		$this->assertSame( 'mw-panel-toc', $body->getAttribute( 'id' ) );
		$this->assertSame(
			'citizen-page-aside__body citizen-toc-card citizen-menu__card',
			$body->getAttribute( 'class' )
		);

		$this->single( $xpath, './/*[@id="mw-panel-toc-list"]', $body );
		$this->assertCount( 2, $xpath->query( './/li[contains(@class,"citizen-toc-list-item")]', $body ) );
		$this->assertCount( 0, $xpath->query( '//*[@id="mw-panel-toc-label"]' ) );

		// Outline rows get their row layout from the shared panel link class,
		// so every anchor has to carry it alongside its own.
		$linkClasses = [];
		foreach ( $xpath->query( './/a[contains(@class,"citizen-toc-link")]/@class', $body ) as $attribute ) {
			$linkClasses[] = $attribute->nodeValue;
		}
		$this->assertCount( 3, $linkClasses, 'back to top and one link per section' );
		foreach ( $linkClasses as $class ) {
			$this->assertContains( 'citizen-page-aside__link', explode( ' ', $class ) );
		}
	}

	public function testTableOfContentsKeepsItsOwnChromeInTheFlowZone(): void {
		$xpath = $this->render( [ $this->tocPanel( CitizenAsidePanel::PLACEMENT_FLOW ) ] );

		$root = $this->single( $xpath, '//aside/*' );

		$this->assertSame( 'nav', $root->nodeName );
		$this->assertSame( 'citizen-toc', $root->getAttribute( 'id' ) );
		$this->assertCount( 0, $xpath->query( '//*[@id="citizen-page-aside-toc"]' ) );
	}
}
