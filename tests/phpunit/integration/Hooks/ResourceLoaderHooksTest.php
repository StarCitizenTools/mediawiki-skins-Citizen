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
	 * Every name listed for one page, canonical name first. Alias lists grow
	 * between MediaWiki releases, so tests check names rather than whole lists.
	 *
	 * @param string $name Canonical name of the page
	 * @return string[]
	 */
	private function getCommandPaletteSpecialPageNames( string $name ): array {
		$entries = array_values( array_filter(
			array_map( static fn ( $entry ): array => (array)$entry, $this->getCommandPaletteSpecialPages() ),
			static fn ( array $names ): bool => $names[0] === $name
		) );
		$this->assertCount( 1, $entries, "One entry for $name" );
		return $entries[0];
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

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 */
	public function testCommandPaletteSpecialPagesListsEveryAlias(): void {
		$this->overrideConfigValue( MainConfigNames::LanguageCode, 'en' );

		$names = $this->getCommandPaletteSpecialPageNames( 'Listfiles' );

		$this->assertSame( 'ListFiles', $names[1] );
		$this->assertContains( 'FileList', $names );
		$this->assertContains( 'ImageList', $names );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 */
	public function testCommandPaletteSpecialPagesLeadsWithTheLocalName(): void {
		$this->overrideConfigValue( MainConfigNames::LanguageCode, 'ru' );

		$names = $this->getCommandPaletteSpecialPageNames( 'Version' );

		$this->assertSame( 'Версия', $names[1] );
		$this->assertContains( 'Version', array_slice( $names, 1 ) );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 */
	public function testCommandPaletteSpecialPagesLeavesOutAnAliasAnotherPageClaimed(): void {
		// A canonical name always opens its own page, so ImageList no longer
		// opens Listfiles once a page by that name exists.
		$this->overrideConfigValues( [
			MainConfigNames::LanguageCode => 'en',
			MainConfigNames::SpecialPages => [ 'ImageList' => SpecialBlankpage::class ],
		] );

		$names = $this->getCommandPaletteSpecialPageNames( 'Listfiles' );

		$this->assertContains( 'FileList', $names );
		$this->assertNotContains( 'ImageList', $names );
		$this->assertSame( [ 'ImageList' ], $this->getCommandPaletteSpecialPageNames( 'ImageList' ) );
	}

}
