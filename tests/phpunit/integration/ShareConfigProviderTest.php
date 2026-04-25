<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration;

use MediaWiki\Skins\Citizen\ShareConfigProvider;
use MediaWikiIntegrationTestCase;

/**
 * @group Citizen
 * @group Database
 * @covers \MediaWiki\Skins\Citizen\ShareConfigProvider
 */
class ShareConfigProviderTest extends MediaWikiIntegrationTestCase {

	private function createProvider(): ShareConfigProvider {
		$services = $this->getServiceContainer();
		return new ShareConfigProvider(
			$services->getRevisionLookup(),
			$services->getTitleFactory()
		);
	}

	public function testGetServiceOptionsReturnsNullWhenPageMissing(): void {
		$provider = $this->createProvider();

		$result = $provider->getServiceOptions();

		$this->assertNull( $result );
	}

	public function testGetServiceOptionsReturnsNullForInvalidJson(): void {
		$this->editPage( 'Citizen-share-services.json', '<<<not json>>>', '', NS_MEDIAWIKI );

		$provider = $this->createProvider();

		$result = $provider->getServiceOptions();

		$this->assertNull( $result );
	}

	public function testGetServiceOptionsReturnsArrayWhenRootIsArray(): void {
		$json = '[{"label":"X","url":"https://x.com/intent/post?text={{title}}%20{{url}}","color":"#000000"}]';
		$this->editPage( 'Citizen-share-services.json', $json, '', NS_MEDIAWIKI );

		$provider = $this->createProvider();

		$result = $provider->getServiceOptions();

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( 'X', $result[0]['label'] );
	}

	public function testGetServiceOptionsReturnsArrayWhenRootHasServicesKey(): void {
		$json = '{"services":[{"label":"Facebook",'
			. '"url":"https://www.facebook.com/sharer/sharer.php?u={{url}}","color":"#0865FE"}]}';
		$this->editPage( 'Citizen-share-services.json', $json, '', NS_MEDIAWIKI );

		$provider = $this->createProvider();

		$result = $provider->getServiceOptions();

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( 'Facebook', $result[0]['label'] );
	}

	public function testGetServiceOptionsFiltersNonArrayEntries(): void {
		$json = '[{"label":"Mastodon","url":"https://mastodon.social/share?text={{title}}%20{{url}}"},'
			. 'true,123,"bad",null]';
		$this->editPage( 'Citizen-share-services.json', $json, '', NS_MEDIAWIKI );

		$provider = $this->createProvider();

		$result = $provider->getServiceOptions();

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( 'Mastodon', $result[0]['label'] );
	}
}
