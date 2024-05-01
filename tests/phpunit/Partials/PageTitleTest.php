<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Partials;

use MediaWiki\Skins\Citizen\Partials\PageTitle;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWiki\Title\Title;
use MediaWikiIntegrationTestCase;
use MWException;
use RequestContext;

/**
 * @group Citizen
 */
class PageTitleTest extends MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\PageTitle
	 * @return void
	 * @throws MWException
	 */
	public function testDecorateTitleNoParenthesis() {
		$title = Title::makeTitle( NS_PROJECT, 'Foo' );
		RequestContext::resetMain();
		RequestContext::getMain()->setTitle( $title );
		$partial = new PageTitle( new SkinCitizen() );

		$data = sprintf(
			'<h1 id="firstHeading" class="firstHeading mw-first-heading"><span class="mw-page-title-main">%s</span></h1>',
			'Foo Title (paren)'
		);
		$text = $partial->decorateTitle( $data );

		$this->assertStringNotContainsString( 'mw-page-title-parenthesis', $text );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\PageTitle
	 * @return void
	 * @throws MWException
	 */
	public function testDecorateTitle() {
		$title = Title::makeTitle( NS_MAIN, 'Foo' );
		RequestContext::resetMain();
		RequestContext::getMain()->setTitle( $title );
		$partial = new PageTitle( new SkinCitizen() );

		$data = sprintf(
			'<h1 id="firstHeading" class="firstHeading mw-first-heading"><span class="mw-page-title-main">%s</span></h1>',
			'Foo Title (paren)'
		);
		$text = $partial->decorateTitle( $data );

		$this->assertStringContainsString( 'mw-page-title-parenthesis', $text );
	}
}
