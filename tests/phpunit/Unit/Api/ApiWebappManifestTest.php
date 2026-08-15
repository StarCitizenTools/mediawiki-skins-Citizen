<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit\Api;

use MediaWiki\Api\ApiMain;
use MediaWiki\Config\Config;
use MediaWiki\Config\HashConfig;
use MediaWiki\Context\IContextSource;
use MediaWiki\Http\HttpRequestFactory;
use MediaWiki\Language\Language;
use MediaWiki\Skins\Citizen\Api\ApiWebappManifest;
use MediaWiki\Utils\UrlUtils;
use MediaWikiUnitTestCase;
use ReflectionMethod;

/**
 * The default shortcuts resolve special page titles through the service
 * container, so they are covered by the integration test of the same name
 * rather than here.
 *
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\Api\ApiWebappManifest
 */
class ApiWebappManifestTest extends MediaWikiUnitTestCase {

	private function createApiWithConfig( Config $config ): ApiWebappManifest {
		$contextMock = $this->createMock( IContextSource::class );
		$contextMock->method( 'getConfig' )->willReturn( $config );

		$mainMock = $this->createMock( ApiMain::class );
		$mainMock->method( 'getContext' )->willReturn( $contextMock );

		return new ApiWebappManifest(
			$mainMock,
			'appmanifest',
			$this->createMock( Language::class ),
			$this->createMock( HttpRequestFactory::class ),
			$this->createMock( UrlUtils::class ),
		);
	}

	private function callGetIcons( array $iconsConfig ): array {
		$config = new HashConfig( [
			'CitizenManifestOptions' => [
				'icons' => $iconsConfig,
				'theme_color' => '',
				'background_color' => '',
				'short_name' => '',
				'description' => '',
			],
		] );

		$api = $this->createApiWithConfig( $config );

		$method = new ReflectionMethod( $api, 'getIcons' );
		return $method->invoke( $api );
	}

	private function callGetShortcuts( array $shortcutsConfig ): array {
		$config = new HashConfig( [
			'CitizenManifestOptions' => [ 'shortcuts' => $shortcutsConfig ],
		] );

		$api = $this->createApiWithConfig( $config );

		$method = new ReflectionMethod( $api, 'getShortcuts' );
		return $method->invoke( $api );
	}

	public function testGetIconsWithValidConfig(): void {
		$icons = $this->callGetIcons( [
			[ 'src' => '/icon.png', 'sizes' => '192x192', 'type' => 'image/png' ],
			[ 'src' => '/icon.svg', 'sizes' => 'any', 'type' => 'image/svg+xml', 'purpose' => 'any maskable' ],
		] );

		$this->assertCount( 2, $icons );
		$this->assertSame( '/icon.png', $icons[0]['src'] );
		$this->assertSame( 'any maskable', $icons[1]['purpose'] );
	}

	public function testGetIconsFiltersUnknownKeys(): void {
		$icons = $this->callGetIcons( [
			[ 'src' => '/icon.png', 'sizes' => '192x192', 'unknown_key' => 'bad' ],
		] );

		$this->assertCount( 1, $icons );
		$this->assertArrayNotHasKey( 'unknown_key', $icons[0] );
		$this->assertSame( '/icon.png', $icons[0]['src'] );
	}

	public function testGetIconsSkipsNonArrayEntries(): void {
		$icons = $this->callGetIcons( [
			'not-an-array',
			42,
			[ 'src' => '/valid.png' ],
		] );

		$this->assertCount( 1, $icons );
		$this->assertSame( '/valid.png', $icons[0]['src'] );
	}

	public function testGetIconsSkipsEntriesWithNoValidKeys(): void {
		$icons = $this->callGetIcons( [
			[ 'invalid_key' => 'value' ],
			[ 'also_bad' => 'value' ],
			[ 'src' => '/valid.png' ],
		] );

		$this->assertCount( 1, $icons );
	}

	public function testGetIconsEmptyConfigFallsToLogos(): void {
		$config = new HashConfig( [
			'CitizenManifestOptions' => [
				'icons' => [],
				'theme_color' => '',
				'background_color' => '',
				'short_name' => '',
				'description' => '',
			],
			'Logos' => false,
		] );

		$api = $this->createApiWithConfig( $config );

		$method = new ReflectionMethod( $api, 'getIcons' );
		$icons = $method->invoke( $api );

		$this->assertSame( [], $icons );
	}

	/**
	 * A $wgCitizenManifestOptions that replaces the whole array can leave the
	 * key out, which must fall back rather than warn.
	 */
	public function testGetIconsMissingConfigFallsToLogos(): void {
		$config = new HashConfig( [
			'CitizenManifestOptions' => [ 'theme_color' => '' ],
			'Logos' => false,
		] );

		$api = $this->createApiWithConfig( $config );

		$method = new ReflectionMethod( $api, 'getIcons' );
		$icons = $method->invoke( $api );

		$this->assertSame( [], $icons );
	}

	public function testGetShortcutsPassesThroughConfiguredEntries(): void {
		$shortcuts = $this->callGetShortcuts( [
			[
				'name' => 'Guides',
				'short_name' => 'Guides',
				'description' => 'Community guides',
				'url' => '/wiki/Project:Guides',
			],
		] );

		$this->assertSame(
			[
				[
					'name' => 'Guides',
					'short_name' => 'Guides',
					'description' => 'Community guides',
					'url' => '/wiki/Project:Guides',
				],
			],
			$shortcuts
		);
	}

	public function testGetShortcutsEmptyConfigShipsNone(): void {
		$shortcuts = $this->callGetShortcuts( [] );

		$this->assertSame( [], $shortcuts );
	}

	public function testGetShortcutsIgnoresNonArrayConfig(): void {
		$config = new HashConfig( [
			'CitizenManifestOptions' => [ 'shortcuts' => 'Search' ],
		] );

		$api = $this->createApiWithConfig( $config );

		$method = new ReflectionMethod( $api, 'getShortcuts' );

		$this->assertSame( [], $method->invoke( $api ) );
	}

	public function testGetShortcutsDropsEntriesMissingNameOrUrl(): void {
		$shortcuts = $this->callGetShortcuts( [
			[ 'name' => 'No URL' ],
			[ 'url' => '/wiki/No_name' ],
			[ 'name' => '', 'url' => '/wiki/Empty_name' ],
			[ 'name' => 'Valid', 'url' => '/wiki/Valid' ],
		] );

		$this->assertSame( [ 'Valid' ], array_column( $shortcuts, 'name' ) );
	}

	public function testGetShortcutsSkipsNonArrayEntries(): void {
		$shortcuts = $this->callGetShortcuts( [
			'Search',
			42,
			[ 'name' => 'Valid', 'url' => '/wiki/Valid' ],
		] );

		$this->assertSame( [ 'Valid' ], array_column( $shortcuts, 'name' ) );
	}

	public function testGetShortcutsFiltersUnknownKeys(): void {
		$shortcuts = $this->callGetShortcuts( [
			[ 'name' => 'Valid', 'url' => '/wiki/Valid', 'unknown_key' => 'bad' ],
		] );

		$this->assertArrayNotHasKey( 'unknown_key', $shortcuts[0] );
	}

	public function testGetShortcutsDropsNonStringFieldValues(): void {
		$shortcuts = $this->callGetShortcuts( [
			[ 'name' => 'Valid', 'url' => '/wiki/Valid', 'description' => [ 'nested' ] ],
			[ 'name' => 'Bad URL', 'url' => 42 ],
		] );

		$this->assertSame(
			[ [ 'name' => 'Valid', 'url' => '/wiki/Valid' ] ],
			$shortcuts
		);
	}

	public function testGetShortcutsFiltersShortcutIcons(): void {
		$shortcuts = $this->callGetShortcuts( [
			[
				'name' => 'With icons',
				'url' => '/wiki/With_icons',
				'icons' => [
					[ 'src' => '/search.png', 'sizes' => '96x96', 'unknown_key' => 'bad' ],
					'not-an-array',
					[ 'invalid_key' => 'value' ],
				],
			],
			[
				'name' => 'No usable icons',
				'url' => '/wiki/No_usable_icons',
				'icons' => [ [ 'invalid_key' => 'value' ] ],
			],
		] );

		$this->assertSame(
			[ [ 'src' => '/search.png', 'sizes' => '96x96' ] ],
			$shortcuts[0]['icons']
		);
		$this->assertArrayNotHasKey( 'icons', $shortcuts[1] );
	}
}
