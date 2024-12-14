<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentFooter;
use MediaWikiUnitTestCase;
use MessageLocalizer;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentFooter
 */
class CitizenComponentFooterTest extends MediaWikiUnitTestCase {

	public function testGetTemplateData(): void {
		$footerData = [
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
		];

		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->once() )
			->method( 'msg' )
			->withConsecutive(
				[ 'citizen-footer-desc' ],
				[ 'citizen-footer-tagline' ]
			)
			->willReturnOnConsecutiveCalls(
				$this->returnValue( 'msg-citizen-footer-desc' ),
				$this->returnValue( 'msg-citizen-footer-tagline' )
			);

		$component = new CitizenComponentFooter( $localizer, $footerData );
		$templateData = $component->getTemplateData();

		$this->assertSame( $footerData, $templateData );
		$this->assertSame( 'msg-citizen-footer-desc', $templateData['msg-citizen-footer-desc'] );
		$this->assertSame( 'msg-citizen-footer-desc', $templateData['msg-citizen-footer-tagline'] );
	}
}
