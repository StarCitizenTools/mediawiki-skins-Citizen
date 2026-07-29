<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\ResourceLoader;

use MediaWiki\Request\FauxRequest;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\Skins\Citizen\ResourceLoader\CompatSkinModule;
use MediaWikiIntegrationTestCase;

/**
 * Deliberately not in the Database group: nothing here reaches storage. The module
 * declares no messages, so getDefinitionSummary() returns from getMessageBlob()
 * before consulting the MessageBlobStore, and the dependency store it does consult
 * on MW 1.44+ is backed by $wgMainStash, which core's TestSetup pins to 'hash'.
 * Should that group ever look necessary again, the test has started reaching the
 * MessageBlobStore or a SQL-backed dependency store — worth investigating rather
 * than annotating away.
 *
 * @covers \MediaWiki\Skins\Citizen\ResourceLoader\CompatSkinModule
 * @group Citizen
 */
class CompatSkinModuleTest extends MediaWikiIntegrationTestCase {

	/**
	 * No 'features' key is passed on purpose. SkinModule then falls back to
	 * DEFAULT_FEATURES_ABSENT ( [ 'logo' ] ), which leaves `toc` off, so the module
	 * declares no lessMessages and getDefinitionSummary() never consults the
	 * MessageBlobStore.
	 *
	 * `'features' => []` would NOT be equivalent: array_keys( [] ) !== range( 0, -1 ),
	 * so an empty array is read as map-form and picks up DEFAULT_FEATURES_SPECIFIED,
	 * which enables `toc`. See CompatSliceCompileTest::newFixtureModule().
	 */
	private function newModule( bool $compatEnabled, string $basePath ): CompatSkinModule {
		$this->overrideConfigValue( 'CitizenCompat', $compatEnabled );
		$module = new CompatSkinModule( [
			'styles' => [ 'resources/skins.citizen.styles/skin.less' ],
			'localBasePath' => $basePath,
			'remoteBasePath' => '',
		] );
		$module->setConfig( $this->getServiceContainer()->getMainConfig() );
		return $module;
	}

	private function makeFixture(): string {
		$dir = $this->getNewTempDirectory();
		mkdir( "$dir/resources/compat", 0777, true );
		mkdir( "$dir/resources/skins.citizen.styles", 0777, true );
		file_put_contents( "$dir/resources/skins.citizen.styles/skin.less", '// base' );
		file_put_contents( "$dir/resources/compat/3.9.less", '// old' );
		file_put_contents( "$dir/resources/compat/3.20.less", '// older' );
		return $dir;
	}

	/**
	 * A real Context is required, not a mock.
	 *
	 * Since MW 1.44, Module::getFileDependencies() resolves dependencies through
	 * $context->getResourceLoader()->getDependencyStore(), and getDefinitionSummary()
	 * reaches it via FileModule::getFileHashes(). A createMock() Context answers that
	 * chain with auto-generated stubs whose retrieveMulti() returns null, and
	 * DependencyStore::retrieve() — final in every supported version, so unstubbable —
	 * then evaluates null[$entity]. MW 1.43 took a different route there
	 * (Module::$depLoadCallback), which is why a mock survived that version alone.
	 *
	 * The real ResourceLoader always carries a dependency store: every supported
	 * version defaults it to a HashBagOStuff-backed one in the constructor, and the
	 * service is wired to $wgMainStash, which core's TestSetup pins to 'hash'. So this
	 * costs no database round-trip.
	 *
	 * Mirrors CompatSliceCompileTest::newContext().
	 */
	private function newContext(): Context {
		return new Context(
			$this->getServiceContainer()->getResourceLoader(),
			new FauxRequest( [ 'skin' => 'citizen', 'lang' => 'en' ] )
		);
	}

	/**
	 * @return string[]
	 */
	private function flattenStyleFiles( CompatSkinModule $module ): array {
		$flat = [];
		foreach ( $module->getStyleFiles( $this->newContext() ) as $files ) {
			foreach ( $files as $file ) {
				$flat[] = (string)$file;
			}
		}
		return $flat;
	}

	public function testFlagOffAddsNothing(): void {
		$module = $this->newModule( false, $this->makeFixture() );

		$files = $this->flattenStyleFiles( $module );

		$this->assertSame( [ 'resources/skins.citizen.styles/skin.less' ], $files );
	}

	public function testFlagOnAppendsVersionSortedSlices(): void {
		$module = $this->newModule( true, $this->makeFixture() );

		$files = $this->flattenStyleFiles( $module );

		$this->assertSame( [
			'resources/skins.citizen.styles/skin.less',
			'resources/compat/3.9.less',
			'resources/compat/3.20.less',
		], $files );
	}

	/**
	 * The slice list is asserted directly, not just via the inequality: turning the flag
	 * on also adds two files to the parent's own 'fileHashes' entry, so the summaries
	 * would differ even if CompatSkinModule::getDefinitionSummary() appended nothing at
	 * all. Only the appended entry proves the module's version key actually tracks the
	 * slices it serves.
	 */
	public function testDefinitionSummaryChangesWithFlag(): void {
		$basePath = $this->makeFixture();
		$context = $this->newContext();

		$off = $this->newModule( false, $basePath )->getDefinitionSummary( $context );
		$on = $this->newModule( true, $basePath )->getDefinitionSummary( $context );

		$this->assertNotEquals( $off, $on );
		$this->assertSame( [ 'citizenCompatSlices' => [] ], end( $off ) );
		$this->assertSame(
			[
				'citizenCompatSlices' => [
					'resources/compat/3.9.less',
					'resources/compat/3.20.less',
				],
			],
			end( $on )
		);
	}
}
