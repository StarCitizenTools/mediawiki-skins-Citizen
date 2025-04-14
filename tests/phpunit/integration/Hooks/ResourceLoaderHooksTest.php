<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Hooks;

use MediaWiki\MainConfigNames;
use MediaWiki\ResourceLoader\Context;
use MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks;
use MediaWikiIntegrationTestCase;

/**
 * @group Citizen
 */
class ResourceLoaderHooksTest extends MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 * @return void
	 */
	public function testCitizenResourceLoaderConfig() {
		$this->overrideConfigValues( [
			'CitizenEnablePreferences' => false,
			'CitizenOverflowInheritedClasses' => false,
			'CitizenOverflowNowrapClasses' => false,
			'CitizenSearchModule' => false,
			'CitizenEnableCommandPalette' => false,
		] );

		$rlCtxMock = $this->getMockBuilder( Context::class )->disableOriginalConstructor()->getMock();

		$config = ResourceLoaderHooks::getCitizenResourceLoaderConfig(
			$rlCtxMock,
			$this->getServiceContainer()->getMainConfig()
		);

		$this->assertArraySubmapSame( [
			'wgCitizenEnablePreferences' => false,
			'wgCitizenSearchModule' => false,
			'wgCitizenOverflowInheritedClasses' => false,
			'wgCitizenOverflowNowrapClasses' => false,
			'wgCitizenEnableCommandPalette' => false,
		], $config );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 * @return void
	 */
	public function testCitizenPreferencesResourceLoaderConfig() {
		$this->overrideConfigValues( [
			'CitizenThemeDefault' => 'dark',
		] );

		$rlCtxMock = $this->getMockBuilder( Context::class )->disableOriginalConstructor()->getMock();

		$config = ResourceLoaderHooks::getCitizenPreferencesResourceLoaderConfig(
			$rlCtxMock,
			$this->getServiceContainer()->getMainConfig()
		);

		$this->assertArraySubmapSame( [
			'wgCitizenThemeDefault' => 'dark',
		], $config );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 * @return void
	 */
	public function testCitizenSearchResourceLoaderConfig() {
		$this->overrideConfigValues( [
			'CitizenSearchGateway' => 'mwRestApi',
			'CitizenSearchDescriptionSource' => 'textextracts',
			'CitizenMaxSearchResults' => 10,
			MainConfigNames::ScriptPath => 'ScriptPath',
			MainConfigNames::SearchSuggestCacheExpiry => 'SearchSuggestCacheExpiry'
		] );

		$rlCtxMock = $this->getMockBuilder( Context::class )->disableOriginalConstructor()->getMock();

		$config = ResourceLoaderHooks::getCitizenSearchResourceLoaderConfig(
			$rlCtxMock,
			$this->getServiceContainer()->getMainConfig()
		);

		$this->assertArraySubmapSame( [
			'isAdvancedSearchExtensionEnabled' => false,
			'isMediaSearchExtensionEnabled' => false,
			'wgCitizenSearchGateway' => 'mwRestApi',
			'wgCitizenSearchDescriptionSource' => 'textextracts',
			'wgCitizenMaxSearchResults' => 10,
			'wgScriptPath' => 'ScriptPath',
			'wgSearchSuggestCacheExpiry' => 'SearchSuggestCacheExpiry'
		], $config );
	}
}
