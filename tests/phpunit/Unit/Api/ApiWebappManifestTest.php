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
		$method->setAccessible( true );
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
		$method->setAccessible( true );
		$icons = $method->invoke( $api );

		$this->assertSame( [], $icons );
	}
}
