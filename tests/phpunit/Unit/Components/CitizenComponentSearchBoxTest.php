<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Components;

use MediaWiki\Skins\Citizen\Components\CitizenComponentSearchBox;
use MediaWikiUnitTestCase;
use MessageLocalizer;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentSearchBox
 */
class CitizenComponentSearchBoxTest extends MediaWikiUnitTestCase {

	public function testGetTemplateData(): void {
		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->expects( $this->once() )
			->method( 'msg' )
			->withConsecutive(
				[ 'citizen-search-toggle-shortcut' ],
				[ 'citizen-search-footer' ]
			)
			->willReturnOnConsecutiveCalls(
				$this->returnValue( 'msg-citizen-search-toggle-shortcut' ),
				$this->returnValue( 'msg-citizen-search-footer' )
			);

		$component = new CitizenComponentSearchBox( $localizer, [] );
		$templateData = $component->getTemplateData();

		$this->assertSame( 'msg-citizen-search-toggle-shortcut', $templateData['msg-citizen-search-toggle-shortcut'] );
		$this->assertSame( 'msg-citizen-search-footer', $templateData['msg-citizen-search-footer'] );
	}
}
