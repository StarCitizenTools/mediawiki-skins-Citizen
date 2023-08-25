<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Partials;

use MediaWiki\Skins\Citizen\Partials\Header;
use MediaWiki\Skins\Citizen\SkinCitizen;

/**
 * @group Citizen
 */
class HeaderTest extends \MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Header::decorateSearchBoxData
	 * @return void
	 */
	public function testDecorateSearchBoxData() {
		$partial = new Header( new SkinCitizen() );
		$out = $partial->decorateSearchBoxData( [] );

		$this->assertArrayHasKey( 'msg-citizen-search-toggle-shortcut', $out );
		$this->assertEquals( '[/]', $out['msg-citizen-search-toggle-shortcut'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Header::getUserInfoData
	 * @covers \MediaWiki\Skins\Citizen\Partials\Header::getUserPageHTML
	 * @covers \MediaWiki\Skins\Citizen\Partials\Header::getUserGroupsHTML
	 * @covers \MediaWiki\Skins\Citizen\Partials\Header::getUserContributionsHTML
	 * @return void
	 */
	public function testGetUserInfoData() {
		$partial = new Header( new SkinCitizen() );
		$out = $partial->getUserInfoData( [] );

		$this->assertArrayHasKey( 'id', $out );
	}
}
