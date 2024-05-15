<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Partials;

use MediaWiki\Skins\Citizen\Partials\BodyContent;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use MWException;
use RequestContext;
use Wikimedia\AtEase\AtEase;

/**
 * @group Citizen
 */
class BodyContentTest extends MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\BodyContent
	 * @return void
	 * @throws MWException
	 */
	public function testDecorateBodyContentTitleNull() {
		RequestContext::resetMain();
		RequestContext::getMain()->setTitle( null );

		$partial = new BodyContent( new SkinCitizen( [
			'name' => 'SkinCitizen'
		] ) );

		$this->assertEquals( '<Foo>', $partial->decorateBodyContent( '<Foo>' ) );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\BodyContent
	 * @return void
	 * @throws MWException
	 */
	public function testDecorateBodyContentCollapseNotEnabled() {
		$this->overrideConfigValues( [
			'CitizenEnableCollapsibleSections' => false,
		] );

		RequestContext::resetMain();
		RequestContext::getMain()->setTitle( null );

		$partial = new BodyContent( new SkinCitizen( [
			'name' => 'SkinCitizen'
		] ) );

		$this->assertEquals( '<Foo>', $partial->decorateBodyContent( '<Foo>' ) );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\BodyContent
	 * @return void
	 * @throws MWException
	 */
	public function testDecorateBodyContentCollapseEnabledContentPage() {
		$this->overrideConfigValues( [
			'CitizenEnableCollapsibleSections' => true,
		] );

		$title = Title::newFromText( 'BodyContent' );

		RequestContext::resetMain();
		RequestContext::getMain()->setTitle( $title );

		$partial = new BodyContent( new SkinCitizen( [
			'name' => 'SkinCitizen'
		] ) );

		$html = <<<HTML
<div class="mw-parser-output">
<div class="mw-heading"><h2><span class="mw-headline" id="Sidebar" data-mw-thread-id="h-Sidebar"><span data-mw-comment-start="" id="h-Sidebar"></span>Sidebar<span data-mw-comment-end="h-Sidebar"></span></span></h2><!--__DTELLIPSISBUTTON__--></div>
</div>
HTML;

		AtEase::suppressWarnings();
		$this->assertStringContainsString( 'citizen-section-indicator', $partial->decorateBodyContent( $html ) );
		AtEase::restoreWarnings();
	}
}
