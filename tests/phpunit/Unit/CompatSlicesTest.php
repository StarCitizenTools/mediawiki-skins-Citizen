<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit;

use MediaWiki\Skins\Citizen\CompatSlices;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\CompatSlices
 */
class CompatSlicesTest extends MediaWikiUnitTestCase {

	private string $tmpDir;

	protected function setUp(): void {
		parent::setUp();

		$this->tmpDir = sys_get_temp_dir() . '/citizen-compat-' . uniqid();
		mkdir( $this->tmpDir . '/resources/compat', 0777, true );
	}

	protected function tearDown(): void {
		self::removeDirectory( $this->tmpDir );

		parent::tearDown();
	}

	private static function removeDirectory( string $dir ): void {
		if ( !is_dir( $dir ) ) {
			return;
		}

		foreach ( scandir( $dir ) as $entry ) {
			if ( $entry === '.' || $entry === '..' ) {
				continue;
			}

			$path = $dir . '/' . $entry;
			if ( is_dir( $path ) ) {
				self::removeDirectory( $path );
			} else {
				unlink( $path );
			}
		}

		rmdir( $dir );
	}

	private function addSlice( string $version ): void {
		file_put_contents( $this->tmpDir . "/resources/compat/$version.less", '// test' );
	}

	public function testEmptyDirectoryYieldsNoGeneration(): void {
		$this->assertSame( [], CompatSlices::getSliceStyleFiles( $this->tmpDir ) );
		$this->assertNull( CompatSlices::getGenerationMarker( $this->tmpDir ) );
	}

	public function testMissingDirectoryYieldsNoGeneration(): void {
		$this->assertNull( CompatSlices::getGenerationMarker( $this->tmpDir . '/nonexistent' ) );
	}

	public function testSlicesAreVersionSorted(): void {
		// Arrange: 3.9 vs 3.20 catches naive string sort (which would put 3.20 first)
		$this->addSlice( '3.20' );
		$this->addSlice( '3.9' );

		// Act
		$files = CompatSlices::getSliceStyleFiles( $this->tmpDir );

		// Assert
		$this->assertSame(
			[ 'resources/compat/3.9.less', 'resources/compat/3.20.less' ],
			$files
		);
	}

	/**
	 * Every slice version is listed, not just the newest: a gate names its own
	 * version, so a token that disappears when its slice expires must be the
	 * token of a gate that expired with it.
	 */
	public function testGenerationMarkerListsEverySliceOldestFirst(): void {
		$this->addSlice( '3.20' );
		$this->addSlice( '3.9' );
		$this->addSlice( '3.14.1' );

		$this->assertSame( '3.9 3.14.1 3.20', CompatSlices::getGenerationMarker( $this->tmpDir ) );
	}

	/**
	 * `~=` matches whole whitespace-separated tokens, so a gate on 3.2 must not
	 * fire for 3.20 HTML. Dots are therefore kept verbatim — the selector quotes
	 * the value anyway, so mangling them to dashes would buy nothing.
	 */
	public function testGenerationMarkerKeepsDotsAndSeparatesTokens(): void {
		$this->addSlice( '3.2' );
		$this->addSlice( '3.20' );

		$marker = CompatSlices::getGenerationMarker( $this->tmpDir );

		$this->assertSame( [ '3.2', '3.20' ], explode( ' ', $marker ) );
	}

	/**
	 * The one path that must never drift: the module scans this directory for
	 * slices to serve, and SkinCitizen derives the marker from it. Divergence
	 * ships gates with no marker to match them, or the reverse.
	 */
	public function testBasePathHoldsTheCompatDirectory(): void {
		$this->assertDirectoryExists( CompatSlices::getBasePath() . '/resources/compat' );
	}

	public function testNonSliceFilesAreIgnored(): void {
		$this->addSlice( '3.20' );
		file_put_contents( $this->tmpDir . '/resources/compat/README.md', 'x' );
		file_put_contents( $this->tmpDir . '/resources/compat/stubs.json', '{}' );
		file_put_contents( $this->tmpDir . '/resources/compat/3.20.js', '// dom patch' );

		$this->assertSame(
			[ 'resources/compat/3.20.less' ],
			CompatSlices::getSliceStyleFiles( $this->tmpDir )
		);
	}
}
