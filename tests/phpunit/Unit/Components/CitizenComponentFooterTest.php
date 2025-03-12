<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentFooter;
use MediaWikiUnitTestCase;
use Message;
use MessageLocalizer;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentFooter
 */
class CitizenComponentFooterTest extends MediaWikiUnitTestCase {

	public function provideFooterData(): array {
		return [
			'Footer data with places and icons' => [
				'places' => [
					'footer-places-privacy' => [
						'text' => 'Privacy policy',
						'href' => '/wiki/Privacy_policy'
					],
					'footer-places-about' => [
						'text' => 'About',
						'href' => '/wiki/About'
					]
				],
				'icons' => [
					'poweredby' => [
						'src' => '/path/to/icon.png',
						'alt' => 'Powered by MediaWiki'
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
	public function testGetTemplateData( array $footerData ): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->method( 'msg' )->willReturnCallback( function ( $key ) {
			return $this->createConfiguredMock( Message::class, [
				// Simulated localization output.
				'inContentLanguage' => $this->createConfiguredMock( Message::class, [
					'parse' => "$key-mocked"
				] )
			] );
		} );

		$component = new CitizenComponentFooter( $localizer, $footerData );
		$expected = array_merge( $footerData, [
			'msg-citizen-footer-desc' => 'citizen-footer-desc-mocked',
			'msg-citizen-footer-tagline' => 'citizen-footer-tagline-mocked'
		] );

		$this->assertSame( $expected, $component->getTemplateData() );
	}
}
