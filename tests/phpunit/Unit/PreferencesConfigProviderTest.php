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

	public function testExtractDefaultsReturnsValidEntries(): void {
		$config = [
			'preferences' => [
				'citizen-feature-custom-width' => [ 'default' => 'wide' ],
				'my-gadget-feature' => [ 'default' => '1' ]
			]
		];

		$defaults = PreferencesConfigProvider::extractDefaults( $config );

		$this->assertSame(
			[
				'citizen-feature-custom-width' => 'wide',
				'my-gadget-feature' => '1'
			],
			$defaults
		);
	}

	public function testExtractDefaultsSkipsInvalidValueCharset(): void {
		$config = [
			'preferences' => [
				// Values are alphanumeric only — hyphens, spaces and
				// punctuation are all rejected.
				'pref-a' => [ 'default' => 'very wide' ],
				'pref-b' => [ 'default' => 'wi-de' ],
				'pref-c' => [ 'default' => '' ]
			]
		];

		$this->assertSame( [], PreferencesConfigProvider::extractDefaults( $config ) );
	}

	public function testExtractDefaultsSkipsInvalidFeatureName(): void {
		$config = [
			'preferences' => [
				'bad name!' => [ 'default' => '1' ],
				'ok-name' => [ 'default' => '1' ]
			]
		];

		$this->assertSame(
			[ 'ok-name' => '1' ],
			PreferencesConfigProvider::extractDefaults( $config )
		);
	}

	public function testExtractDefaultsSkipsNonStringDefaults(): void {
		$config = [
			'preferences' => [
				'pref-int' => [ 'default' => 1 ],
				'pref-bool' => [ 'default' => true ],
				'pref-array' => [ 'default' => [ '1' ] ],
				'pref-missing' => [ 'section' => 'appearance' ],
				'pref-removed' => null
			]
		];

		$this->assertSame( [], PreferencesConfigProvider::extractDefaults( $config ) );
	}

	public function testExtractDefaultsHandlesNumericFeatureKeys(): void {
		// json_decode turns the JSON key "123" into PHP int 123 — the cast
		// inside extractDefaults must keep this from fataling.
		$config = [
			'preferences' => [
				123 => [ 'default' => 'a' ]
			]
		];

		$this->assertSame(
			[ '123' => 'a' ],
			PreferencesConfigProvider::extractDefaults( $config )
		);
	}

	public function testExtractDefaultsReturnsEmptyForEmptyConfig(): void {
		$this->assertSame( [], PreferencesConfigProvider::extractDefaults( [] ) );
	}

	public function testExtractDefaultsReturnsEmptyForNonArrayPreferences(): void {
		// Valid JSON, wrong shape — foreach over a string would warn.
		$config = [ 'preferences' => 'oops' ];

		$this->assertSame( [], PreferencesConfigProvider::extractDefaults( $config ) );
	}
}
