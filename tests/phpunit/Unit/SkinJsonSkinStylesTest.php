<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit;

use MediaWikiUnitTestCase;

/**
 * Guards skin.json's ResourceModuleSkinStyles against paths that do not
 * exist on disk. A broken registration is silent in production: the
 * override simply never ships, or the target module fails to load its
 * skin styles, and nothing else notices.
 *
 * @group Citizen
 * @coversNothing
 */
class SkinJsonSkinStylesTest extends MediaWikiUnitTestCase {

	public function testAllSkinStylePathsExistOnDisk(): void {
		$skinDir = dirname( __DIR__, 3 );
		$skinJson = json_decode(
			file_get_contents( $skinDir . '/skin.json' ),
			true,
			512,
			JSON_THROW_ON_ERROR
		);

		$missing = [];
		foreach ( $skinJson['ResourceModuleSkinStyles']['citizen'] as $module => $paths ) {
			foreach ( (array)$paths as $path ) {
				if ( !is_file( $skinDir . '/' . $path ) ) {
					$missing[] = $module . ' => ' . $path;
				}
			}
		}

		$this->assertSame(
			[],
			$missing,
			'ResourceModuleSkinStyles entries in skin.json point at files that do not exist'
		);
	}
}
