<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit;

use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWikiUnitTestCase;
use ReflectionMethod;

/**
 * @group Citizen
 * @coversDefaultClass \MediaWiki\Skins\Citizen\SkinCitizen
 */
class SkinCitizenFooterPolyfillTest extends MediaWikiUnitTestCase {

	private function invokeNormalize( array $data, bool $isIcons, string $id ): array {
		$method = new ReflectionMethod( SkinCitizen::class, 'normalizeFooterMenu' );
		return $method->invoke( null, $data, $isIcons, $id );
	}

	private function invokePolyfill( array &$parentData ): void {
		$method = new ReflectionMethod( SkinCitizen::class, 'polyfillFooterPortlets' );
		$method->invokeArgs( null, [ &$parentData ] );
	}

	/**
	 * @covers ::normalizeFooterMenu
	 */
	public function testNormalizeProducesCanonicalShape(): void {
		$data = [
			'id' => 'p-footer-places',
			'class' => 'mw-portlet mw-portlet-footer-places',
			'array-items' => [
				[ 'id' => 'footer-places-privacy', 'html' => '<a>Privacy</a>' ],
			],
		];

		$result = $this->invokeNormalize( $data, false, 'footer-places' );

		$this->assertSame( 'footer-places', $result['id'] );
		$this->assertNull( $result['className'] );
		$this->assertCount( 1, $result['array-items'] );
		$this->assertSame( 'footer-places-privacy', $result['array-items'][0]['id'] );
		$this->assertArrayNotHasKey( 'class', $result );
	}

	/**
	 * @covers ::normalizeFooterMenu
	 */
	public function testNormalizeIconsSetsNoprintClassName(): void {
		$result = $this->invokeNormalize( [ 'array-items' => [] ], true, 'footer-icons' );

		$this->assertSame( 'noprint', $result['className'] );
	}

	/**
	 * @covers ::normalizeFooterMenu
	 */
	public function testNormalizeDefaultsArrayItemsWhenKeyAbsentInHelperIsolation(): void {
		$result = $this->invokeNormalize( [], false, 'footer-info' );

		$this->assertSame( [], $result['array-items'] );
	}

	/**
	 * @covers ::polyfillFooterPortlets
	 */
	public function testPolyfillUsesPortletWhenPresent(): void {
		$parentData = [
			'data-portlets' => [
				'data-footer-places' => [
					'id' => 'p-footer-places',
					'class' => 'mw-portlet mw-portlet-footer-places',
					'array-items' => [
						[ 'id' => 'footer-places-ext', 'html' => '<a>From portlet</a>' ],
					],
				],
			],
			'data-footer' => [
				'data-places' => [
					'id' => 'footer-places',
					'array-items' => [
						[ 'id' => 'footer-places-privacy', 'html' => '<a>Privacy</a>' ],
					],
				],
			],
		];

		$this->invokePolyfill( $parentData );

		$this->assertSame( 'footer-places', $parentData['data-portlets']['data-footer-places']['id'] );
		$this->assertNull( $parentData['data-portlets']['data-footer-places']['className'] );
		$this->assertCount( 1, $parentData['data-portlets']['data-footer-places']['array-items'] );
		$this->assertSame(
			'footer-places-ext',
			$parentData['data-portlets']['data-footer-places']['array-items'][0]['id']
		);
	}

	/**
	 * @covers ::polyfillFooterPortlets
	 */
	public function testPolyfillFallsBackToLegacyWhenPortletEmpty(): void {
		$parentData = [
			'data-portlets' => [],
			'data-footer' => [
				'data-places' => [
					'id' => 'footer-places',
					'array-items' => [
						[ 'id' => 'footer-places-privacy', 'html' => '<a>Privacy</a>' ],
					],
				],
				'data-info' => [
					'id' => 'footer-info',
					'array-items' => [
						[ 'id' => 'footer-info-lastmod', 'html' => 'modified' ],
					],
				],
				'data-icons' => [
					'id' => 'footer-icons',
					'array-items' => [
						[ 'id' => 'footer-poweredbyico', 'html' => '<img>' ],
					],
				],
			],
		];

		$this->invokePolyfill( $parentData );

		$this->assertSame(
			'footer-places-privacy',
			$parentData['data-portlets']['data-footer-places']['array-items'][0]['id']
		);
		$this->assertSame( 'footer-info', $parentData['data-portlets']['data-footer-info']['id'] );
		$this->assertSame(
			'footer-info-lastmod',
			$parentData['data-portlets']['data-footer-info']['array-items'][0]['id']
		);
		$this->assertSame( 'noprint', $parentData['data-portlets']['data-footer-icons']['className'] );
		$this->assertSame(
			'footer-poweredbyico',
			$parentData['data-portlets']['data-footer-icons']['array-items'][0]['id']
		);
	}

	/**
	 * @covers ::polyfillFooterPortlets
	 */
	public function testPolyfillBothEmptyYieldsEmptyArray(): void {
		$parentData = [
			'data-portlets' => [],
			'data-footer' => [
				'data-places' => [ 'array-items' => [] ],
			],
		];

		$this->invokePolyfill( $parentData );

		$this->assertSame( [], $parentData['data-portlets']['data-footer-places'] );
	}

	/**
	 * @covers ::polyfillFooterPortlets
	 */
	public function testPolyfillHandlesMissingDataPortletsKey(): void {
		$parentData = [
			'data-footer' => [
				'data-places' => [
					'id' => 'footer-places',
					'array-items' => [
						[ 'id' => 'footer-places-privacy', 'html' => '<a>Privacy</a>' ],
					],
				],
			],
		];

		$this->invokePolyfill( $parentData );

		$this->assertIsArray( $parentData['data-portlets'] );
		$this->assertSame(
			'footer-places-privacy',
			$parentData['data-portlets']['data-footer-places']['array-items'][0]['id']
		);
	}
}
