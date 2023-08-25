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

		$text = $partial->decorateTitle( 'Foo Title (paren)' );

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

		$text = $partial->decorateTitle( 'Foo Title (paren)' );

		$this->assertStringContainsString( 'mw-page-title-parenthesis', $text );
	}
}
