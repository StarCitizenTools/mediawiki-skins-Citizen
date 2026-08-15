<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Api;

use MediaWiki\Api\ApiMain;
use MediaWiki\Api\ApiResult;
use MediaWiki\Config\Config;
use MediaWiki\Config\HashConfig;
use MediaWiki\Context\IContextSource;
use MediaWiki\MainConfigNames;
use MediaWiki\Skins\Citizen\Api\ApiWebappManifest;
use MediaWikiIntegrationTestCase;
use ReflectionMethod;

/**
 * The default shortcuts resolve special page titles against the wiki's article
 * path, which needs the service container. Everything driven purely by config
 * is covered by the unit test of the same name.
 *
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\Api\ApiWebappManifest
 */
class ApiWebappManifestTest extends MediaWikiIntegrationTestCase {

	private function createApiWithConfig( Config $config ): ApiWebappManifest {
		$services = $this->getServiceContainer();

		$contextMock = $this->createMock( IContextSource::class );
		$contextMock->method( 'getConfig' )->willReturn( $config );

		$mainMock = $this->createMock( ApiMain::class );
		$mainMock->method( 'getContext' )->willReturn( $contextMock );

		return new ApiWebappManifest(
			$mainMock,
			'appmanifest',
			$services->getContentLanguage(),
			$services->getHttpRequestFactory(),
			$services->getUrlUtils(),
		);
	}

	private function callGetShortcuts( array $manifestOptions ): array {
		$api = $this->createApiWithConfig(
			new HashConfig( [ 'CitizenManifestOptions' => $manifestOptions ] )
		);

		$method = new ReflectionMethod( $api, 'getShortcuts' );
		return $method->invoke( $api );
	}

	/**
	 * A $wgCitizenManifestOptions written before the option existed has no
	 * 'shortcuts' key, and must keep the shortcuts it used to get.
	 */
	public function testGetShortcutsFallsBackToDefaultsWhenUnset(): void {
		$shortcuts = $this->callGetShortcuts( [
			'theme_color' => '',
			'background_color' => '',
			'short_name' => '',
			'description' => '',
			'icons' => [],
		] );

		$this->assertCount( 3, $shortcuts );
		$this->assertSame( [ 'Search', 'Random', 'RecentChanges' ], array_column( $shortcuts, 'name' ) );
	}

	/**
	 * The defaults exist as special page names rather than URLs precisely so
	 * that they follow $wgArticlePath.
	 */
	public function testDefaultShortcutUrlsFollowTheArticlePath(): void {
		$this->overrideConfigValue( MainConfigNames::ArticlePath, '/index.php?title=$1' );

		$shortcuts = $this->callGetShortcuts( [ 'icons' => [] ] );

		$this->assertSame(
			[
				'/index.php?title=Special:Search',
				'/index.php?title=Special:Random',
				'/index.php?title=Special:RecentChanges',
			],
			array_column( $shortcuts, 'url' )
		);
	}

	public function testGetShortcutsEmptyConfigShipsNone(): void {
		$this->assertSame( [], $this->callGetShortcuts( [ 'shortcuts' => [] ] ) );
	}

	private function executeManifest( array $manifestOptions ): array {
		$result = new ApiResult( 1024 * 1024 );

		$contextMock = $this->createMock( IContextSource::class );
		$contextMock->method( 'getConfig' )->willReturn( new HashConfig( [
			'CitizenManifestOptions' => $manifestOptions,
			MainConfigNames::LanguageCode => 'en',
			MainConfigNames::Sitename => 'Test wiki',
			MainConfigNames::Server => 'http://localhost',
			MainConfigNames::Logos => false,
		] ) );

		$mainMock = $this->createMock( ApiMain::class );
		$mainMock->method( 'getContext' )->willReturn( $contextMock );
		$mainMock->method( 'getResult' )->willReturn( $result );

		$services = $this->getServiceContainer();
		$api = new ApiWebappManifest(
			$mainMock,
			'appmanifest',
			$services->getContentLanguage(),
			$services->getHttpRequestFactory(),
			$services->getUrlUtils(),
		);

		$api->execute();

		return $result->getResultData();
	}

	/**
	 * A $wgCitizenManifestOptions that replaces the whole array can leave any
	 * key out. Every one of them is optional in the manifest spec, so the
	 * member is omitted rather than emitted empty — and reading it must not
	 * raise a warning, which is what fails this test if the guard goes away.
	 */
	public function testManifestOmitsMembersTheConfigDoesNotCarry(): void {
		$manifest = $this->executeManifest( [] );

		$this->assertArrayNotHasKey( 'theme_color', $manifest );
		$this->assertArrayNotHasKey( 'background_color', $manifest );
		$this->assertArrayNotHasKey( 'short_name', $manifest );
		$this->assertArrayNotHasKey( 'description', $manifest );
		$this->assertArrayNotHasKey( 'screenshots', $manifest );
		$this->assertSame( 'Test wiki', $manifest['name'] );
	}

	/**
	 * An explicitly empty list has no member to carry, so it must be left out
	 * rather than emitted as [] — which is what execute() decides, not the
	 * filter the unit test covers.
	 */
	public function testManifestOmitsAnEmptyScreenshotList(): void {
		$manifest = $this->executeManifest( [ 'screenshots' => [] ] );

		$this->assertArrayNotHasKey( 'screenshots', $manifest );
	}

	public function testManifestCarriesConfiguredScreenshots(): void {
		$manifest = $this->executeManifest( [
			'screenshots' => [
				[
					'src' => '/screenshot-desktop.png',
					'sizes' => '1920x1080',
					'type' => 'image/png',
					'form_factor' => 'wide',
				],
				[
					'src' => '/screenshot-mobile.png',
					'sizes' => '750x1334',
					'type' => 'image/png',
					'form_factor' => 'narrow',
				],
			],
		] );

		$this->assertSame(
			[ 'wide', 'narrow' ],
			array_column( $manifest['screenshots'], 'form_factor' )
		);
	}
}
