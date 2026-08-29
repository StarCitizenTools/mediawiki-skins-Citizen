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
use MWHttpRequest;
use ReflectionMethod;
use RuntimeException;
use StatusValue;
use Wikimedia\ObjectCache\HashBagOStuff;
use Wikimedia\ObjectCache\WANObjectCache;

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
			self::createCache(),
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
	 * A real cache over an in-memory store: getWithSetCallback() is final, so
	 * a mock cannot stand in for it.
	 *
	 * The no-op asyncHandler drops WANObjectCache's pre-emptive refresh of a
	 * popular key. Without one it regenerates in line instead, which lands as
	 * an unexpected call on a request mock about once in 800 reads.
	 */
	private static function createCache(): WANObjectCache {
		return new WANObjectCache( [
			'cache' => new HashBagOStuff(),
			'asyncHandler' => static function ( callable $callback ): void {
			},
		] );
	}

	/**
	 * Build an API whose only icon source is $wgLogos, fetched through the
	 * given factory.
	 */
	private function createApiWithLogos(
		array $logos,
		HttpRequestFactory $httpRequestFactory,
		?WANObjectCache $cache = null
	): ApiWebappManifest {
		$contextMock = $this->createMock( IContextSource::class );
		$contextMock->method( 'getConfig' )->willReturn( new HashConfig( [
			'CitizenManifestOptions' => [ 'icons' => [] ],
			'Logos' => $logos,
		] ) );

		$mainMock = $this->createMock( ApiMain::class );
		$mainMock->method( 'getContext' )->willReturn( $contextMock );

		$urlUtils = $this->createMock( UrlUtils::class );
		$urlUtils->method( 'expand' )->willReturnArgument( 0 );

		return new ApiWebappManifest(
			$mainMock,
			'appmanifest',
			$this->createMock( Language::class ),
			$httpRequestFactory,
			$urlUtils,
			$cache ?? self::createCache(),
		);
	}

	/** A 1x1 PNG, so getimagesizefromstring() has something real to measure. */
	private static function onePixelPng(): string {
		return (string)base64_decode(
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
		);
	}

	private function createLogoRequest( bool $succeeded, string $content = '' ): MWHttpRequest {
		$request = $this->createMock( MWHttpRequest::class );
		$request->method( 'execute' )->willReturn(
			$succeeded ? StatusValue::newGood() : StatusValue::newFatal( 'http-timed-out' )
		);
		$request->method( 'getStatus' )->willReturn( $succeeded ? 200 : 0 );
		$request->method( 'getContent' )->willReturn( $content );

		return $request;
	}

	/**
	 * Without a bound, each logo request inherits $wgHTTPTimeout, so a server
	 * that cannot reach its own URL holds the worker for minutes.
	 */
	public function testGetIconsFromLogosBoundsEachRequest(): void {
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->once() )
			->method( 'create' )
			->with(
				'/logo.png',
				$this->callback( static fn ( array $options ): bool => ( $options['timeout'] ?? 0 ) > 0
					&& ( $options['connectTimeout'] ?? 0 ) > 0 ),
				$this->anything()
			)
			->willReturn( $this->createLogoRequest( true ) );
		$api = $this->createApiWithLogos( [ '1x' => '/logo.png' ], $httpRequestFactory );

		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );
		$method->invoke( $api );
	}

	public function testGetIconsFromLogosDropsALogoItCannotFetch(): void {
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->method( 'create' )->willReturn( $this->createLogoRequest( false ) );
		$api = $this->createApiWithLogos( [ '1x' => '/logo.png' ], $httpRequestFactory );

		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$this->assertSame( [], $method->invoke( $api ) );
	}

	/**
	 * @return iterable<string, array{string}>
	 */
	public static function provideSvgLogoPaths(): iterable {
		yield 'plain' => [ '/logo.svg' ];
		// Extensions are not case sensitive, and a logo path may carry a
		// cache-busting query string or a fragment.
		yield 'uppercase extension' => [ '/logo.SVG' ];
		yield 'query string' => [ '/logo.svg?ver=2' ];
		yield 'fragment' => [ '/logo.svg#icon' ];
	}

	/**
	 * Nothing about an SVG has to be measured, so fetching one is pure cost.
	 *
	 * @dataProvider provideSvgLogoPaths
	 */
	public function testGetIconsFromLogosDoesNotFetchAnSvg( string $logoPath ): void {
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->never() )->method( 'create' );
		$api = $this->createApiWithLogos( [ 'svg' => $logoPath ], $httpRequestFactory );

		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$this->assertSame(
			[ [ 'src' => $logoPath, 'sizes' => 'any', 'type' => 'image/svg+xml' ] ],
			$method->invoke( $api )
		);
	}

	/**
	 * The extension is what marks an SVG, not the last three characters of the
	 * path — otherwise a raster logo would be advertised as a scalable one.
	 */
	public function testGetIconsFromLogosMeasuresAPathMerelyEndingInSvg(): void {
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->once() )
			->method( 'create' )
			->willReturn( $this->createLogoRequest( true, self::onePixelPng() ) );
		$api = $this->createApiWithLogos( [ '1x' => '/logosvg' ], $httpRequestFactory );

		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$this->assertSame(
			[ [ 'src' => '/logosvg', 'sizes' => '1x1', 'type' => 'image/png' ] ],
			$method->invoke( $api )
		);
	}

	/**
	 * Measuring a logo means fetching it from the wiki's own web server, so an
	 * uncached manifest response must not pay for the list a second time.
	 */
	public function testGetIconsFromLogosMeasuresEachLogoOnce(): void {
		$clock = 1000.0;
		$cache = self::createCache();
		$cache->setMockTime( $clock );
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->once() )
			->method( 'create' )
			->willReturn( $this->createLogoRequest( true, self::onePixelPng() ) );
		$api = $this->createApiWithLogos( [ '1x' => '/logo.png' ], $httpRequestFactory, $cache );

		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );
		$first = $method->invoke( $api );
		$clock += 3600;

		$this->assertSame( $first, $method->invoke( $api ) );
	}

	/**
	 * A logo the server could not reach is missing from the manifest until the
	 * cached list expires, so a list that came out short must be measured again
	 * long before a complete one would be.
	 */
	public function testGetIconsFromLogosRetriesAnIncompleteListSooner(): void {
		$clock = 1000.0;
		$cache = self::createCache();
		$cache->setMockTime( $clock );
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->exactly( 2 ) )
			->method( 'create' )
			->willReturn( $this->createLogoRequest( false ) );
		$api = $this->createApiWithLogos( [ '1x' => '/logo.png' ], $httpRequestFactory, $cache );
		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$method->invoke( $api );
		$clock += 3600;

		$this->assertSame( [], $method->invoke( $api ) );
	}

	/**
	 * The short retry must still be a cached window, not a bypass: an
	 * unreachable logo that is measured again on every request is the defect
	 * this memo exists to remove.
	 */
	public function testGetIconsFromLogosCachesAnIncompleteListBriefly(): void {
		$clock = 1000.0;
		$cache = self::createCache();
		$cache->setMockTime( $clock );
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->once() )
			->method( 'create' )
			->willReturn( $this->createLogoRequest( false ) );
		$api = $this->createApiWithLogos( [ '1x' => '/logo.png' ], $httpRequestFactory, $cache );
		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$method->invoke( $api );
		$clock += 60;

		$this->assertSame( [], $method->invoke( $api ) );
	}

	/**
	 * A server slow to answer for its own logos is the one that can least
	 * afford to measure them again, so how long measuring took must not shorten
	 * how long the result is kept.
	 */
	public function testGetIconsFromLogosKeepsASlowlyMeasuredList(): void {
		$clock = 1000.0;
		$cache = self::createCache();
		$cache->setMockTime( $clock );
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->once() )
			->method( 'create' )
			->willReturnCallback( function () use ( &$clock ): MWHttpRequest {
				// Over WANObjectCache's MAX_READ_LAG of 7s, past which it cuts
				// the entry to TTL_LAGGED (30s).
				$clock += 10;
				return $this->createLogoRequest( true, self::onePixelPng() );
			} );
		$api = $this->createApiWithLogos( [ '1x' => '/logo.png' ], $httpRequestFactory, $cache );
		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$first = $method->invoke( $api );
		$clock += 3600;

		$this->assertSame( $first, $method->invoke( $api ) );
	}

	/**
	 * The cached list is keyed on the logos it was built from, so editing
	 * $wgLogos takes effect without a purge.
	 */
	public function testGetIconsFromLogosRemeasuresWhenTheLogosChange(): void {
		$cache = self::createCache();
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->exactly( 2 ) )
			->method( 'create' )
			->willReturn( $this->createLogoRequest( true, self::onePixelPng() ) );

		foreach ( [ '/old.png', '/new.png' ] as $logoPath ) {
			$api = $this->createApiWithLogos( [ '1x' => $logoPath ], $httpRequestFactory, $cache );
			$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

			$this->assertSame(
				[ [ 'src' => $logoPath, 'sizes' => '1x1', 'type' => 'image/png' ] ],
				$method->invoke( $api )
			);
		}
	}

	/**
	 * $wgLogos carries entries the manifest has no use for, and 'wordmark' is
	 * an array rather than a path — neither may reach the fetch loop.
	 */
	public function testGetIconsFromLogosIgnoresLogosItCannotUse(): void {
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->never() )->method( 'create' );
		$api = $this->createApiWithLogos( [
			'1x' => '/logo.svg',
			'wordmark' => [ 'src' => '/wordmark.svg', 'width' => 135, 'height' => 20 ],
			'icon' => '/icon.svg',
		], $httpRequestFactory );

		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$this->assertSame( [
			[ 'src' => '/logo.svg', 'sizes' => 'any', 'type' => 'image/svg+xml' ],
			[ 'src' => '/icon.svg', 'sizes' => 'any', 'type' => 'image/svg+xml' ],
		], $method->invoke( $api ) );
	}

	/**
	 * A malformed URL or a misconfigured proxy throws rather than answering,
	 * which must leave the rest of the list intact.
	 */
	public function testGetIconsFromLogosDropsALogoWhoseFetchThrows(): void {
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->method( 'create' )
			->willThrowException( new RuntimeException( 'Invalid reverseProxy configured' ) );
		$api = $this->createApiWithLogos(
			[ '1x' => '/logo.png', 'icon' => '/icon.svg' ],
			$httpRequestFactory
		);

		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$this->assertSame(
			[ [ 'src' => '/icon.svg', 'sizes' => 'any', 'type' => 'image/svg+xml' ] ],
			$method->invoke( $api )
		);
	}

	/**
	 * $wgLogos is site config, so a value of the wrong shape under a key the
	 * manifest does use must be skipped rather than stringified into a src.
	 */
	public function testGetIconsFromLogosSkipsALogoThatIsNotAPath(): void {
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->never() )->method( 'create' );
		$api = $this->createApiWithLogos( [
			'1x' => [ 'src' => '/logo.svg', 'width' => 135, 'height' => 20 ],
			'icon' => '/icon.svg',
		], $httpRequestFactory );

		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$this->assertSame(
			[ [ 'src' => '/icon.svg', 'sizes' => 'any', 'type' => 'image/svg+xml' ] ],
			$method->invoke( $api )
		);
	}

	/**
	 * The manifest's icon order is Citizen's, not whatever order $wgLogos
	 * happens to declare its keys in.
	 */
	public function testGetIconsFromLogosEmitsAFixedOrder(): void {
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->never() )->method( 'create' );
		$api = $this->createApiWithLogos( [
			'icon' => '/icon.svg',
			'svg' => '/scalable.svg',
			'1x' => '/one.svg',
		], $httpRequestFactory );

		$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

		$this->assertSame(
			[ '/one.svg', '/icon.svg', '/scalable.svg' ],
			array_column( $method->invoke( $api ), 'src' )
		);
	}

	/**
	 * The key covers only the logos the manifest can carry, so editing one it
	 * cannot use must not throw the measured list away.
	 */
	public function testGetIconsFromLogosKeepsTheListWhenAnUnusedLogoChanges(): void {
		$cache = self::createCache();
		$httpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$httpRequestFactory->expects( $this->once() )
			->method( 'create' )
			->willReturn( $this->createLogoRequest( true, self::onePixelPng() ) );

		$logoSets = [
			[ '1x' => '/logo.png' ],
			[ '1x' => '/logo.png', 'wordmark' => [ 'src' => '/wordmark.svg', 'width' => 135, 'height' => 20 ] ],
		];
		foreach ( $logoSets as $logos ) {
			$api = $this->createApiWithLogos( $logos, $httpRequestFactory, $cache );
			$method = new ReflectionMethod( $api, 'getIconsFromLogos' );

			$this->assertSame(
				[ [ 'src' => '/logo.png', 'sizes' => '1x1', 'type' => 'image/png' ] ],
				$method->invoke( $api )
			);
		}
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
