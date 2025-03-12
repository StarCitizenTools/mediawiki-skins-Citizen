<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Message\Message;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageFooter;
use MediaWikiUnitTestCase;
use MessageLocalizer;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentPageFooter
 */
class CitizenComponentPageFooterTest extends MediaWikiUnitTestCase {

	/**
	 * @return array[]
	 */
	public function provideFooterData(): array {
		return [
			'footer with lastmod and viewcount' => [
				[
					'array-items' => [
						[
							'name' => 'lastmod',
							'id' => 'footer-info-lastmod',
							'html' => 'Last modified: 2024-03-10'
						],
						[
							'name' => 'viewcount',
							'id' => 'footer-info-viewcount',
							'html' => 'Views: 100'
						]
					]
				],
				[
					'lastmod' => [
						'name' => 'lastmod',
						'id' => 'footer-info-lastmod',
						'html' => 'Last modified: 2024-03-10',
						'label' => 'Translated citizen-page-info-lastmod'
					],
					'viewcount' => [
						'name' => 'viewcount',
						'id' => 'footer-info-viewcount',
						'html' => 'Views: 100',
						'label' => 'Translated citizen-page-info-viewcount'
					]
				]
			]
		];
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 * @dataProvider provideFooterData
	 */
	public function testGetTemplateData( array $footerData, array $expected ): void {
		// Create a mock MessageLocalizer
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->method( 'msg' )
			->willReturnCallback( function ( $key ) {
				$message = $this->createMock( Message::class );
				$message->method( 'text' )
					->willReturn( 'Translated ' . $key );
				return $message;
			} );

		// Create component instance
		$component = new CitizenComponentPageFooter( $localizer, $footerData );

		// Get template data
		$result = $component->getTemplateData();

		// Assertions
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'array-items', $result );
		$this->assertSameSize( $expected, $result['array-items'] );

		// Check each item
		foreach ( $result['array-items'] as $item ) {
			$name = $item['name'];
			$this->assertArrayHasKey( $name, $expected );
			$this->assertEquals( $expected[$name], $item );
		}
	}
}
