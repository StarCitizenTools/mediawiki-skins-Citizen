<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration;

use MediaWiki\Context\RequestContext;
use MediaWiki\Skins\Citizen\PreferencesConfigProvider;
use MediaWikiIntegrationTestCase;

/**
 * @group Citizen
 * @group Database
 * @covers \MediaWiki\Skins\Citizen\PreferencesConfigProvider
 */
class PreferencesConfigProviderTest extends MediaWikiIntegrationTestCase {

	private function createProvider(): PreferencesConfigProvider {
		$services = $this->getServiceContainer();
		return new PreferencesConfigProvider(
			$services->getRevisionLookup(),
			$services->getTitleFactory(),
			RequestContext::getMain()
		);
	}

	public function testGetOverridesReturnsNullWhenPageMissing(): void {
		$provider = $this->createProvider();

		$result = $provider->getOverrides( 'en' );

		$this->assertNull( $result['overrides'] );
		$this->assertSame( [], (array)$result['messages'] );
	}

	public function testGetOverridesReturnsParsedData(): void {
		$json = '{"sections":{"custom":{"labelMsg":"custom-section-label"}}}';
		$this->editPage( 'Citizen-preferences.json', $json, '', NS_MEDIAWIKI );

		$provider = $this->createProvider();

		$result = $provider->getOverrides( 'en' );

		$this->assertArrayHasKey( 'custom', $result['overrides']['sections'] );
		$this->assertArrayHasKey( 'custom-section-label', (array)$result['messages'] );
	}

	public function testGetOverridesReturnsNullForInvalidJson(): void {
		$this->editPage( 'Citizen-preferences.json', '<<<not json>>>', '', NS_MEDIAWIKI );

		$provider = $this->createProvider();

		$result = $provider->getOverrides( 'en' );

		$this->assertNull( $result['overrides'] );
	}
}
