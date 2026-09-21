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

	private function render( array $panels ): DOMXPath {
		$parser = new TemplateParser( __DIR__ . '/../../../../templates', new HashBagOStuff() );
		// SkinMustache renders with this on, and the table of contents needs
		// it: TableOfContents__line includes itself for nested sections.
		$parser->enableRecursivePartials( true );
		$html = $parser->processTemplate( 'PageAside', [
			'msg-citizen-page-aside-label' => 'Side column',
			'msg-toc' => 'Contents',
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
	}

	public function testLastModifiedBodyIsOneTimedLink(): void {
		$xpath = $this->render( [ $this->lastmodPanel() ] );

		$link = $this->single( $xpath, '//div[@class="citizen-page-aside__body"]/*' );

		$this->assertSame( 'a', $link->nodeName );
		$this->assertSame( 'citizen-page-aside__link', $link->getAttribute( 'class' ) );
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
}
