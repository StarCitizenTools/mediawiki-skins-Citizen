<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

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
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 * @dataProvider provideFooterData
	 */
	public function testGetTemplateData( array $footerData, array $expected, array $knownMessages ): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->method( 'msg' )
			->willReturnCallback( function ( $key ) use ( $knownMessages ) {
				$exists = in_array( $key, $knownMessages, true );
				$message = $this->createMock( Message::class );
				$message->method( 'exists' )->willReturn( $exists );
				$message->method( 'text' )->willReturn( 'Translated ' . $key );
				return $message;
			} );

		$component = new CitizenComponentPageFooter( $localizer, $footerData );
		$result = $component->getTemplateData();

		$this->assertIsArray( $result );
		$this->assertSameSize( $expected, $result['array-items'] ?? [] );

		foreach ( $result['array-items'] ?? [] as $item ) {
			$name = $item['name'] ?? '';
			$this->assertArrayHasKey( $name, $expected, "Unexpected item: $name" );
			$this->assertSame( $expected[$name], $item );
		}
	}

	public static function provideFooterData(): iterable {
		yield 'first-party items with matching messages' => [
			[
				'array-items' => [
					[ 'name' => 'lastmod', 'id' => 'footer-info-lastmod', 'html' => 'Last modified: 2024-03-10' ],
					[ 'name' => 'copyright', 'id' => 'footer-info-copyright', 'html' => '(c) 2024' ],
				],
			],
			[
				'lastmod' => [
					'name' => 'lastmod',
					'id' => 'footer-info-lastmod',
					'html' => 'Last modified: 2024-03-10',
					'label' => 'Translated citizen-page-info-lastmod',
				],
				'copyright' => [
					'name' => 'copyright',
					'id' => 'footer-info-copyright',
					'html' => '(c) 2024',
					'label' => 'Translated citizen-page-info-copyright',
				],
			],
			[ 'citizen-page-info-lastmod', 'citizen-page-info-copyright' ],
		];

		yield 'third-party item with explicit label falls back to label' => [
			[
				'array-items' => [
					[
						'name' => 'externalref',
						'id' => 'footer-info-externalref',
						'html' => '<a>Ref</a>',
						'label' => 'External reference',
					],
				],
			],
			[
				'externalref' => [
					'name' => 'externalref',
					'id' => 'footer-info-externalref',
					'html' => '<a>Ref</a>',
					'label' => 'External reference',
				],
			],
			[],
		];

		yield 'third-party item without label falls back to empty string' => [
			[
				'array-items' => [
					[ 'name' => 'mystery', 'id' => 'footer-info-mystery', 'html' => 'opaque' ],
				],
			],
			[
				'mystery' => [
					'name' => 'mystery',
					'id' => 'footer-info-mystery',
					'html' => 'opaque',
					'label' => '',
				],
			],
			[],
		];

		yield 'empty array-items' => [
			[ 'array-items' => [] ],
			[],
			[],
		];

		yield 'no array-items key' => [
			[],
			[],
			[],
		];
	}
}
