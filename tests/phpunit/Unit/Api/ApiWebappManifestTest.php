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

	/**
	 * Invoke one of the private members that turn $wgCitizenManifestOptions
	 * into a manifest list.
	 */
	private function callFilter( string $method, array $manifestOptions ): array {
		$api = $this->createApiWithConfig(
			new HashConfig( [ 'CitizenManifestOptions' => $manifestOptions ] )
		);

		$reflectionMethod = new ReflectionMethod( $api, $method );
		return $reflectionMethod->invoke( $api );
	}

	/**
	 * @return iterable<string, array{array, array}>
	 */
	public static function provideIcons(): iterable {
		yield 'passes through the fields the spec defines' => [
			[ 'icons' => [
				[ 'src' => '/icon.png', 'sizes' => '192x192', 'type' => 'image/png' ],
				[ 'src' => '/icon.svg', 'sizes' => 'any', 'type' => 'image/svg+xml', 'purpose' => 'any maskable' ],
			] ],
			[
				[ 'src' => '/icon.png', 'sizes' => '192x192', 'type' => 'image/png' ],
				[ 'src' => '/icon.svg', 'sizes' => 'any', 'type' => 'image/svg+xml', 'purpose' => 'any maskable' ],
			],
		];

		yield 'drops unknown keys' => [
			[ 'icons' => [ [ 'src' => '/icon.png', 'sizes' => '192x192', 'unknown_key' => 'bad' ] ] ],
			[ [ 'src' => '/icon.png', 'sizes' => '192x192' ] ],
		];

		yield 'skips non-array entries' => [
			[ 'icons' => [ 'not-an-array', 42, [ 'src' => '/valid.png' ] ] ],
			[ [ 'src' => '/valid.png' ] ],
		];

		yield 'skips entries with no valid keys' => [
			[ 'icons' => [ [ 'invalid_key' => 'value' ], [ 'also_bad' => 'value' ], [ 'src' => '/valid.png' ] ] ],
			[ [ 'src' => '/valid.png' ] ],
		];
	}

	/**
	 * @dataProvider provideIcons
	 */
	public function testGetIcons( array $manifestOptions, array $expected ): void {
		$icons = $this->callFilter( 'getIcons', $manifestOptions );

		$this->assertSame( $expected, $icons );
	}

	/**
	 * @return iterable<string, array{array, array}>
	 */
	public static function provideShortcuts(): iterable {
		yield 'passes through the fields the spec defines' => [
			[ 'shortcuts' => [ [
				'name' => 'Guides',
				'short_name' => 'Guides',
				'description' => 'Community guides',
				'url' => '/wiki/Project:Guides',
			] ] ],
			[ [
				'name' => 'Guides',
				'short_name' => 'Guides',
				'description' => 'Community guides',
				'url' => '/wiki/Project:Guides',
			] ],
		];

		yield 'empty list ships none' => [ [ 'shortcuts' => [] ], [] ];

		yield 'non-array config ships none' => [ [ 'shortcuts' => 'Search' ], [] ];

		yield 'drops entries missing name or url' => [
			[ 'shortcuts' => [
				[ 'name' => 'No URL' ],
				[ 'url' => '/wiki/No_name' ],
				[ 'name' => '', 'url' => '/wiki/Empty_name' ],
				[ 'name' => 'Valid', 'url' => '/wiki/Valid' ],
			] ],
			[ [ 'name' => 'Valid', 'url' => '/wiki/Valid' ] ],
		];

		yield 'skips non-array entries' => [
			[ 'shortcuts' => [ 'Search', 42, [ 'name' => 'Valid', 'url' => '/wiki/Valid' ] ] ],
			[ [ 'name' => 'Valid', 'url' => '/wiki/Valid' ] ],
		];

		yield 'drops unknown keys' => [
			[ 'shortcuts' => [ [ 'name' => 'Valid', 'url' => '/wiki/Valid', 'unknown_key' => 'bad' ] ] ],
			[ [ 'name' => 'Valid', 'url' => '/wiki/Valid' ] ],
		];

		yield 'drops non-string field values' => [
			[ 'shortcuts' => [
				[ 'name' => 'Valid', 'url' => '/wiki/Valid', 'description' => [ 'nested' ] ],
				[ 'name' => 'Bad URL', 'url' => 42 ],
			] ],
			[ [ 'name' => 'Valid', 'url' => '/wiki/Valid' ] ],
		];

		yield 'filters shortcut icons and drops the key when none survive' => [
			[ 'shortcuts' => [
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
			] ],
			[
				[
					'name' => 'With icons',
					'url' => '/wiki/With_icons',
					'icons' => [ [ 'src' => '/search.png', 'sizes' => '96x96' ] ],
				],
				[ 'name' => 'No usable icons', 'url' => '/wiki/No_usable_icons' ],
			],
		];
	}

	/**
	 * @dataProvider provideShortcuts
	 */
	public function testGetShortcuts( array $manifestOptions, array $expected ): void {
		$shortcuts = $this->callFilter( 'getShortcuts', $manifestOptions );

		$this->assertSame( $expected, $shortcuts );
	}

	/**
	 * @return iterable<string, array{array, array}>
	 */
	public static function provideScreenshots(): iterable {
		yield 'passes through the fields the spec defines' => [
			[ 'screenshots' => [ [
				'src' => '/screenshot-desktop.png',
				'sizes' => '1920x1080',
				'type' => 'image/png',
				'form_factor' => 'wide',
				'label' => 'Article on desktop',
				'platform' => 'windows',
			] ] ],
			[ [
				'src' => '/screenshot-desktop.png',
				'sizes' => '1920x1080',
				'type' => 'image/png',
				'form_factor' => 'wide',
				'label' => 'Article on desktop',
				'platform' => 'windows',
			] ],
		];

		yield 'empty list ships none' => [ [ 'screenshots' => [] ], [] ];

		// Unlike shortcuts, an absent key cannot fall back to anything — the
		// images would have to be of the wiki itself.
		yield 'absent key ships none' => [ [ 'icons' => [] ], [] ];

		yield 'non-array config ships none' => [ [ 'screenshots' => '/screenshot.png' ], [] ];

		yield 'skips non-array entries' => [
			[ 'screenshots' => [ '/screenshot.png', 42, [ 'src' => '/valid.png' ] ] ],
			[ [ 'src' => '/valid.png' ] ],
		];

		yield 'drops entries missing src' => [
			[ 'screenshots' => [
				[ 'sizes' => '1920x1080', 'type' => 'image/png' ],
				[ 'src' => '', 'sizes' => '1920x1080' ],
				[ 'src' => '/valid.png' ],
			] ],
			[ [ 'src' => '/valid.png' ] ],
		];

		// purpose belongs to icons, not screenshots, so it must not survive —
		// which is what fails here if the icon filter gets reused.
		yield 'drops unknown keys, including the icon-only purpose' => [
			[ 'screenshots' => [ [ 'src' => '/valid.png', 'purpose' => 'maskable', 'unknown_key' => 'bad' ] ] ],
			[ [ 'src' => '/valid.png' ] ],
		];

		yield 'drops non-string field values' => [
			[ 'screenshots' => [
				[ 'src' => '/valid.png', 'sizes' => [ 'nested' ] ],
				[ 'src' => 42, 'sizes' => '1920x1080' ],
			] ],
			[ [ 'src' => '/valid.png' ] ],
		];
	}

	/**
	 * @dataProvider provideScreenshots
	 */
	public function testGetScreenshots( array $manifestOptions, array $expected ): void {
		$screenshots = $this->callFilter( 'getScreenshots', $manifestOptions );

		$this->assertSame( $expected, $screenshots );
	}

	/**
	 * @return iterable<string, array{array}>
	 */
	public static function provideIconConfigsThatFallBackToLogos(): iterable {
		yield 'empty list' => [ [ 'icons' => [] ] ];
		// A $wgCitizenManifestOptions that replaces the whole array can leave
		// the key out, which must fall back rather than warn.
		yield 'absent key' => [ [ 'theme_color' => '' ] ];
	}

	/**
	 * @dataProvider provideIconConfigsThatFallBackToLogos
	 */
	public function testGetIconsFallsBackToLogos( array $manifestOptions ): void {
		$config = new HashConfig( [
			'CitizenManifestOptions' => $manifestOptions,
			'Logos' => false,
		] );
		$api = $this->createApiWithConfig( $config );

		$method = new ReflectionMethod( $api, 'getIcons' );
		$icons = $method->invoke( $api );

		$this->assertSame( [], $icons );
	}
}
