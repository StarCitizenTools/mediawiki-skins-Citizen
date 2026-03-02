<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Unit;

use MediaWiki\Skins\Citizen\PreferencesConfigProvider;
use MediaWikiUnitTestCase;

/**
 * @group Citizen
 * @covers \MediaWiki\Skins\Citizen\PreferencesConfigProvider
 */
class PreferencesConfigProviderTest extends MediaWikiUnitTestCase {

	public function testExtractMessageKeysFromSections(): void {
		$config = [
			'sections' => [
				'custom' => [ 'labelMsg' => 'custom-section-label' ],
				'another' => [ 'labelMsg' => 'another-section-label' ]
			]
		];

		$keys = PreferencesConfigProvider::extractMessageKeys( $config );

		$this->assertSame( [ 'custom-section-label', 'another-section-label' ], $keys );
	}

	public function testExtractMessageKeysFromPreferences(): void {
		$config = [
			'preferences' => [
				'my-pref' => [
					'labelMsg' => 'my-pref-label',
					'descriptionMsg' => 'my-pref-desc'
				]
			]
		];

		$keys = PreferencesConfigProvider::extractMessageKeys( $config );

		$this->assertSame( [ 'my-pref-label', 'my-pref-desc' ], $keys );
	}

	public function testExtractMessageKeysFromOptions(): void {
		$config = [
			'preferences' => [
				'my-pref' => [
					'options' => [
						[ 'value' => 'a', 'labelMsg' => 'opt-a-label' ],
						[ 'value' => 'b', 'labelMsg' => 'opt-b-label' ]
					]
				]
			]
		];

		$keys = PreferencesConfigProvider::extractMessageKeys( $config );

		$this->assertSame( [ 'opt-a-label', 'opt-b-label' ], $keys );
	}

	public function testExtractMessageKeysDeduplicates(): void {
		$config = [
			'sections' => [
				'a' => [ 'labelMsg' => 'shared-key' ]
			],
			'preferences' => [
				'p' => [ 'labelMsg' => 'shared-key' ]
			]
		];

		$keys = PreferencesConfigProvider::extractMessageKeys( $config );

		$this->assertSame( [ 'shared-key' ], $keys );
	}

	public function testExtractMessageKeysReturnsEmptyForEmptyConfig(): void {
		$keys = PreferencesConfigProvider::extractMessageKeys( [] );

		$this->assertSame( [], $keys );
	}

	public function testExtractMessageKeysSkipsShortFormOptions(): void {
		$config = [
			'preferences' => [
				'toggle' => [
					'options' => [ '0', '1' ]
				]
			]
		];

		$keys = PreferencesConfigProvider::extractMessageKeys( $config );

		$this->assertSame( [], $keys );
	}

	public function testExtractMessageKeysSkipsNonArrayPreferences(): void {
		$config = [
			'preferences' => [
				'removed' => null
			]
		];

		$keys = PreferencesConfigProvider::extractMessageKeys( $config );

		$this->assertSame( [], $keys );
	}

	public function testExtractMessageKeysSkipsNonStringValues(): void {
		$config = [
			'sections' => [
				'a' => [ 'labelMsg' => 123 ]
			],
			'preferences' => [
				'p' => [
					'labelMsg' => true,
					'descriptionMsg' => [ 'not', 'a', 'string' ],
					'options' => [
						[ 'labelMsg' => 456 ]
					]
				]
			]
		];

		$keys = PreferencesConfigProvider::extractMessageKeys( $config );

		$this->assertSame( [], $keys );
	}
}
