<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration;

use MediaWiki\MainConfigNames;
use MediaWiki\Skins\Citizen\SkinCitizen;
use MediaWikiIntegrationTestCase;

/**
 * Client preference default classes stamped onto <html>, including
 * defaults read from MediaWiki:Citizen-preferences.json through
 * MessageCache. Editing the page with real JsonContent also proves the
 * MessageCache path serves JSON content-model pages.
 *
 * @group Citizen
 * @group Database
 * @covers \MediaWiki\Skins\Citizen\SkinCitizen
 */
class SkinCitizenPreferenceDefaultsTest extends MediaWikiIntegrationTestCase {

	protected function setUp(): void {
		parent::setUp();

		// The test runner turns database messages off wiki-wide, which
		// disables MessageCache; production defaults them on. Restore the
		// production shape so these tests exercise the real read path.
		$this->overrideConfigValue( MainConfigNames::UseDatabaseMessages, true );
	}

	private function createSkinInstance(): SkinCitizen {
		return new SkinCitizen(
			$this->getServiceContainer()->getUserFactory(),
			$this->getServiceContainer()->getGenderCache(),
			$this->getServiceContainer()->getUserIdentityLookup(),
			$this->getServiceContainer()->getLanguageConverterFactory(),
			$this->getServiceContainer()->getLanguageNameUtils(),
			$this->getServiceContainer()->getPermissionManager(),
			$this->getServiceContainer()->getUserGroupManager(),
			$this->getServiceContainer()->getUrlUtils(),
			$this->getServiceContainer()->getTempUserConfig(),
			$this->getServiceContainer()->getSpecialPageFactory(),
			null,
			[
				'name' => 'Citizen',
			]
		);
	}

	private function setPreferencesJson( string $json ): void {
		$this->editPage( 'MediaWiki:Citizen-preferences.json', $json );
	}

	public function testBuiltInDefaultsStampedWithoutJson(): void {
		$attrs = $this->createSkinInstance()->getHtmlElementAttributes();

		$this->assertStringContainsString(
			'citizen-feature-custom-width-clientpref-standard', $attrs['class'] );
		// Config default 'auto' maps to the os clientpref class.
		$this->assertStringContainsString(
			'skin-theme-clientpref-os', $attrs['class'] );
	}

	public function testJsonDefaultOverridesBuiltIn(): void {
		$this->setPreferencesJson(
			'{ "preferences": { "citizen-feature-custom-width": { "default": "wide" } } }'
		);

		$attrs = $this->createSkinInstance()->getHtmlElementAttributes();

		$this->assertStringContainsString(
			'citizen-feature-custom-width-clientpref-wide', $attrs['class'] );
		$this->assertStringNotContainsString(
			'citizen-feature-custom-width-clientpref-standard', $attrs['class'] );
	}

	public function testJsonThemeDefaultOverridesConfig(): void {
		$this->overrideConfigValues( [ 'CitizenThemeDefault' => 'light' ] );
		$this->setPreferencesJson(
			'{ "preferences": { "skin-theme": { "default": "night" } } }'
		);

		$attrs = $this->createSkinInstance()->getHtmlElementAttributes();

		$this->assertStringContainsString(
			'skin-theme-clientpref-night', $attrs['class'] );
		$this->assertStringNotContainsString(
			'skin-theme-clientpref-day', $attrs['class'] );
	}

	public function testJsonAddedPreferenceIsStamped(): void {
		$this->setPreferencesJson(
			'{ "preferences": { "my-gadget-feature": { "default": "1" } } }'
		);

		$attrs = $this->createSkinInstance()->getHtmlElementAttributes();

		$this->assertStringContainsString(
			'my-gadget-feature-clientpref-1', $attrs['class'] );
	}

	public function testInvalidDefaultValueIsIgnored(): void {
		$this->setPreferencesJson(
			'{ "preferences": { "citizen-feature-custom-width": { "default": "very wide" } } }'
		);

		$attrs = $this->createSkinInstance()->getHtmlElementAttributes();

		$this->assertStringContainsString(
			'citizen-feature-custom-width-clientpref-standard', $attrs['class'] );
	}

	/**
	 * With MessageCache disabled the wiki serves no MediaWiki-namespace
	 * content, so the read is skipped entirely rather than asking a cache
	 * that has no page hash to key its individual-page lookup with.
	 */
	public function testOnWikiDefaultsSkippedWhenDatabaseMessagesDisabled(): void {
		$this->setPreferencesJson(
			'{ "preferences": { "citizen-feature-custom-width": { "default": "wide" } } }'
		);
		$this->overrideConfigValue( MainConfigNames::UseDatabaseMessages, false );

		$attrs = $this->createSkinInstance()->getHtmlElementAttributes();

		$this->assertStringContainsString(
			'citizen-feature-custom-width-clientpref-standard', $attrs['class'] );
	}

	public function testThemeConfigStillMapsLegacyVocabulary(): void {
		$this->overrideConfigValues( [ 'CitizenThemeDefault' => 'dark' ] );

		$attrs = $this->createSkinInstance()->getHtmlElementAttributes();

		$this->assertStringContainsString(
			'skin-theme-clientpref-night', $attrs['class'] );
	}
}
