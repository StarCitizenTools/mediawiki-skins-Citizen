<?php

declare(strict_types=1);

namespace MediaWiki\Skins\Citizen\Tests\Components;

use Config;
use Language;
use MediaWiki\Skins\Citizen\Components\CitizenComponentSiteStats;
use MediaWikiUnitTestCase;
use MessageLocalizer;

/**
 * @group Citizen
 * @group Components
 * @coversDefaultClass \MediaWiki\Skins\Citizen\Components\CitizenComponentSiteStats
 */
class CitizenComponentSiteStatsTest extends MediaWikiUnitTestCase
{
	/**
	 * @covers \MediaWiki\Skins\Citizen\Components\CitizenComponentSiteStats::getTemplateData
	 */
	public function testGetTemplateData(): void
	{
		$config = $this->createMock( Config::class );
		$config->method( 'get' )
			->willReturnMap( [
				[ 'CitizenEnableDrawerSiteStats', true ],
				[ 'CitizenUseNumberFormatter', true ]
			] );

		$localizer = $this->createMock( MessageLocalizer::class );
		$localizer->method( 'msg' )
			->willReturnSelf();
		$localizer->method( 'text' )
			->willReturn( 'Sample Label' );

		$pageLang = $this->createMock( Language::class );
		$pageLang->method( 'getHtmlCode' )
			->willReturn( 'en_US' );

		$component = new CitizenComponentSiteStats( $config, $localizer, $pageLang );
		$templateData = $component->getTemplateData();

		$this->assertNotEmpty( $templateData['array-sitestats-items'] );
		foreach ( $templateData['array-sitestats-items'] as $item ) {
			$this->assertArrayHasKey( 'id', $item );
			$this->assertArrayHasKey( 'icon', $item );
			$this->assertArrayHasKey( 'value', $item );
			$this->assertArrayHasKey( 'label', $item );
			$this->assertSame( 'Sample Label', $item['label'] );
		}
	}
}

