<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\ResourceLoader;

use MediaWiki\ResourceLoader\Context;
use MediaWiki\Skins\Citizen\ResourceLoader\CompatSkinModule;
use MediaWikiIntegrationTestCase;

/**
 * @covers \MediaWiki\Skins\Citizen\ResourceLoader\CompatSkinModule
 * @group Citizen
 * @group Database
 */
class CompatSkinModuleTest extends MediaWikiIntegrationTestCase {

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

	private function newContext(): Context {
		$context = $this->createMock( Context::class );
		$context->method( 'getSkin' )->willReturn( 'citizen' );
		return $context;
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

	public function testDefinitionSummaryChangesWithFlag(): void {
		$basePath = $this->makeFixture();
		$context = $this->newContext();

		$off = $this->newModule( false, $basePath )->getDefinitionSummary( $context );
		$on = $this->newModule( true, $basePath )->getDefinitionSummary( $context );

		$this->assertNotEquals( $off, $on );
	}
}
