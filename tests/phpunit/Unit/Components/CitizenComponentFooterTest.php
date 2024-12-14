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
			'foo' => 'bar',
		];
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->once() )
			->method( 'msg' )
			->withConsecutive(
				[ 'citizen-footer-desc' ],
				[ 'citizen-footer-tagline' ]
			)
			->willReturn( 'msg-citizen-footer-desc' );

		$component = new CitizenComponentFooter( $localizer, $footerData );
		$templateData = $component->getTemplateData();

		$this->assertSame( $footerData, $templateData );
		$this->assertSame( 'msg-citizen-footer-desc', $templateData['msg-citizen-footer-desc'] );
		$this->assertSame( 'msg-citizen-footer-desc', $templateData['msg-citizen-footer-tagline'] );
	}
}
