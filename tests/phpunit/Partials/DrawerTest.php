<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Partials;

use MediaWiki\Skins\Citizen\Partials\Drawer;
use MediaWiki\Skins\Citizen\SkinCitizen;

/**
 * @group Citizen
 * @group Database
 */
class DrawerTest extends \MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Drawer::decorateMainMenuData
	 * @return void
	 */
	public function testDecorateMainMenuDataEmpty() {
		$partial = new Drawer( new SkinCitizen() );

		$this->assertEmpty( $partial->decorateMainMenuData( [
			'array-portlets-rest' => [],
		] )['array-portlets-rest'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Drawer::decorateMainMenuData
	 * @return void
	 */
	public function testDecorateMainMenuRemovePageTools() {
		$partial = new Drawer( new SkinCitizen() );

		$mainMenuData = [
			'array-portlets-rest' => [
				[ 'id' => 'foo' ],
				[ 'id' => 'p-tb' ],
			],
		];

		$this->assertNotEmpty( $partial->decorateMainMenuData( $mainMenuData ) );
		$this->assertArrayHasKey( 'array-portlets-rest', $partial->decorateMainMenuData( $mainMenuData ) );
		$this->assertNotContains( [ 'id' => 'pt-tb' ], $partial->decorateMainMenuData( $mainMenuData )['array-portlets-rest'] );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Drawer::getSiteStatsData
	 * @return void
	 */
	public function testGetSiteStatsDataDisabled() {
		$this->overrideConfigValues( [
			'CitizenEnableDrawerSiteStats' => false,
		] );

		$partial = new Drawer( new SkinCitizen() );
		$this->assertEmpty( $partial->getSiteStatsData() );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Partials\Drawer::getSiteStatsData
	 * @covers \MediaWiki\Skins\Citizen\Partials\Drawer::getSiteStatValue
	 * @return void
	 */
	public function testGetSiteStatsDataNoFormat() {
		$this->overrideConfigValues( [
			'CitizenEnableDrawerSiteStats' => true,
			'CitizenUseNumberFormatter' => false,
		] );

		$partial = new Drawer( new SkinCitizen() );
		$data = $partial->getSiteStatsData();

		$this->assertArrayHasKey( 'array-drawer-sitestats-item', $data );
		$this->assertCount( 4, $data['array-drawer-sitestats-item'] );

		foreach ( $data['array-drawer-sitestats-item'] as $stat ) {
			$this->assertArrayHasKey( 'id', $stat );
			$this->assertArrayHasKey( 'icon', $stat );
			$this->assertArrayHasKey( 'value', $stat );
			$this->assertArrayHasKey( 'label', $stat );

			$this->assertContains( $stat['id'], [ 'articles', 'images', 'users', 'edits' ] );
		}
	}
}
