<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration;

use MediaWiki\Skins\Citizen\OnWikiJsonReader;
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
			new OnWikiJsonReader(
				$services->getRevisionLookup(),
				$services->getTitleFactory()
			),
			$services->getUrlUtils()
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

	public function testGetServiceOptionsDropsJavaScriptUrls(): void {
		$json = '[{"label":"Safe","url":"https://example.com/share?u={{url}}"},'
			. '{"label":"Evil","url":"javascript:alert(1)"},'
			. '{"label":"NoUrl"},'
			. '{"label":"NumberUrl","url":123}]';
		$this->editPage( 'Citizen-share-services.json', $json, '', NS_MEDIAWIKI );

		$provider = $this->createProvider();

		$result = $provider->getServiceOptions();

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( 'Safe', $result[0]['label'] );
	}

	public function testSanitizeServicesAppliesProtocolAllowList(): void {
		$provider = $this->createProvider();

		$result = $provider->sanitizeServices( [
			[ 'label' => 'Https', 'url' => 'https://example.com/' ],
			[ 'label' => 'Http', 'url' => 'http://example.com/' ],
			[ 'label' => 'Mailto', 'url' => 'mailto:share@example.com' ],
			[ 'label' => 'Js', 'url' => 'javascript:alert(1)' ],
			[ 'label' => 'Data', 'url' => 'data:text/html,<script>1</script>' ],
		] );

		$labels = array_column( $result, 'label' );
		$this->assertContains( 'Https', $labels );
		$this->assertContains( 'Http', $labels );
		$this->assertContains( 'Mailto', $labels );
		$this->assertNotContains( 'Js', $labels );
		$this->assertNotContains( 'Data', $labels );
	}
}
