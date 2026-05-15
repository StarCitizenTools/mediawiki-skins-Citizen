<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Components;

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

	public function provideFooterPortlets(): array {
		return [
			'footer portlets with places and icons' => [
				[
					'data-footer-places' => [
						'id' => 'footer-places',
						'className' => null,
						'array-items' => [
							[ 'id' => 'footer-places-privacy', 'html' => '<a>Privacy</a>' ],
							[ 'id' => 'footer-places-about', 'html' => '<a>About</a>' ],
						],
					],
					'data-footer-icons' => [
						'id' => 'footer-icons',
						'className' => 'noprint',
						'array-items' => [
							[ 'id' => 'footer-poweredbyico', 'html' => '<img>' ],
						],
					],
				],
			],
		];
	}

	/**
	 * @covers ::__construct
	 * @covers ::getTemplateData
	 * @dataProvider provideFooterPortlets
	 */
	public function testGetTemplateData( array $footerPortlets ): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->method( 'msg' )->willReturnCallback( function ( $key ) {
			return $this->createConfiguredMock( Message::class, [
				'inContentLanguage' => $this->createConfiguredMock( Message::class, [
					'parse' => "$key-mocked",
				] ),
			] );
		} );

		$component = new CitizenComponentFooter( $localizer, $footerPortlets );
		$result = $component->getTemplateData();

		$this->assertSame( $footerPortlets['data-footer-places'], $result['data-footer-places'] );
		$this->assertSame( $footerPortlets['data-footer-icons'], $result['data-footer-icons'] );
		$this->assertArrayNotHasKey( 'data-footer-info', $result );
		$this->assertSame( 'citizen-footer-desc-mocked', $result['msg-citizen-footer-desc'] );
		$this->assertSame( 'citizen-footer-tagline-mocked', $result['msg-citizen-footer-tagline'] );
	}
}
