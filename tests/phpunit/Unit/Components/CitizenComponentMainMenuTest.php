<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponent;
use MediaWiki\Skins\Citizen\Components\CitizenComponentMainMenu;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentMainMenu
 */
class CitizenComponentMainMenuTest extends MediaWikiUnitTestCase {

	/**
	 * This test checks if the CitizenComponentMainMenu class can be instantiated
	 * @covers ::__construct
	 */
	public function testConstruct() {
		// Mock the sidebar data
		$sidebarData = [];

		// Create a new CitizenComponentMainMenu object
		$mainMenu = new CitizenComponentMainMenu( $sidebarData );

		// Assert that the object is an instance of CitizenComponent
		$this->assertInstanceOf( CitizenComponent::class, $mainMenu );
	}

	/**
	 * @return array[]
	 */
	public function provideMainMenuData(): array {
		return [
			[
				'sidebarData' => [
					'data-portlets-first' => [],
					'array-portlets-rest' => [],
				]
			]
		];
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 * @dataProvider provideMainMenuData
	 */
	public function testGetTemplateData( array $sidebarData ) {
		// Create a new CitizenComponentMainMenu object
		$mainMenu = new CitizenComponentMainMenu( $sidebarData );

		// Call the getTemplateData method
		$templateData = $mainMenu->getTemplateData();

		// Assert the structure and types of expected keys
		$this->assertIsArray( $templateData['data-portlets-first'] );
		$this->assertIsArray( $templateData['array-portlets-rest'] );

		// Assert the structure and types of expected keys
		$this->assertArrayHasKey( 'data-portlets-first', $templateData );
		$this->assertArrayHasKey( 'array-portlets-rest', $templateData );
	}
}
