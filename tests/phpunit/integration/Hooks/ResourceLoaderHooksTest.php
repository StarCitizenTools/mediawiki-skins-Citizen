<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Hooks;

use MediaWiki\MainConfigNames;
use MediaWiki\Request\FauxRequest;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks;
use MediaWiki\Specials\SpecialBlankpage;
use MediaWikiIntegrationTestCase;

/**
 * @group Citizen
 */
class ResourceLoaderHooksTest extends MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 * @return void
	 */
	public function testCitizenResourceLoaderConfig() {
		$this->overrideConfigValues( [
			'CitizenEnablePreferences' => false,
			'CitizenOverflowInheritedClasses' => false,
			'CitizenOverflowNowrapClasses' => false,
		] );

		$rlCtxMock = $this->getMockBuilder( Context::class )->disableOriginalConstructor()->getMock();

		$config = ResourceLoaderHooks::getCitizenResourceLoaderConfig(
			$rlCtxMock,
			$this->getServiceContainer()->getMainConfig()
		);

		$this->assertArrayContains( [
			'wgCitizenEnablePreferences' => false,
			'wgCitizenOverflowInheritedClasses' => false,
			'wgCitizenOverflowNowrapClasses' => false,
		], $config );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 * @return void
	 */
	public function testCitizenPreferencesResourceLoaderConfig() {
		$this->overrideConfigValues( [
			'CitizenThemeDefault' => 'dark',
		] );

		$rlCtxMock = $this->getMockBuilder( Context::class )->disableOriginalConstructor()->getMock();

		$config = ResourceLoaderHooks::getCitizenPreferencesResourceLoaderConfig(
			$rlCtxMock,
			$this->getServiceContainer()->getMainConfig()
		);

		$this->assertArrayContains( [
			'wgCitizenThemeDefault' => 'dark',
		], $config );
	}

	private function getCommandPaletteSpecialPages(): array {
		$context = new Context(
			$this->getServiceContainer()->getResourceLoader(),
			new FauxRequest( [ 'skin' => 'citizen', 'lang' => 'en' ] )
		);

		return ResourceLoaderHooks::getCitizenCommandPaletteSpecialPages(
			$context,
			$this->getServiceContainer()->getMainConfig()
		);
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 */
	public function testCommandPaletteSpecialPagesIncludesPagesWithoutAliases(): void {
		$this->overrideConfigValue( MainConfigNames::SpecialPages, [
			'CitizenAliaslessTestPage' => SpecialBlankpage::class,
		] );

		$pages = $this->getCommandPaletteSpecialPages();

		$this->assertContains( 'CitizenAliaslessTestPage', $pages );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 */
	public function testCommandPaletteSpecialPagesPairsNameWithDifferingAlias(): void {
		$this->overrideConfigValue( MainConfigNames::LanguageCode, 'en' );

		$pages = $this->getCommandPaletteSpecialPages();

		$this->assertContains( [ 'Recentchanges', 'RecentChanges' ], $pages );
		$this->assertContains( 'Watchlist', $pages );
	}

}
