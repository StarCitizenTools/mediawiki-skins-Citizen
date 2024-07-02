<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Integration\Hooks;

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
		], $config );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 * @return void
	 */
	public function testCitizenResourceLoaderConfigAllTrue() {
		$this->overrideConfigValues( [
			'CitizenEnablePreferences' => true,
			'CitizenOverflowInheritedClasses' => true,
			'CitizenOverflowNowrapClasses' => true,
			'CitizenSearchModule' => true,
		] );

		$rlCtxMock = $this->getMockBuilder( Context::class )->disableOriginalConstructor()->getMock();

		$config = ResourceLoaderHooks::getCitizenResourceLoaderConfig(
			$rlCtxMock,
			$this->getServiceContainer()->getMainConfig()
		);

		$this->assertArraySubmapSame( [
			'wgCitizenEnablePreferences' => true,
			'whCitizenOverflowInheritedClasses' => true,
			'wgCitizenOverflowNowrapClasses' => true,
			'wgCitizenSearchModule' => true,
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
			'CitizenSearchGateway' => 'CitizenSearchGateway',
			'CitizenSearchDescriptionSource' => 'CitizenSearchDescriptionSource',
			'CitizenMaxSearchResults' => 'CitizenMaxSearchResults',
			'Script' => 'Script',
			'ScriptPath' => 'ScriptPath',
			'SearchSuggestCacheExpiry' => 'SearchSuggestCacheExpiry',
		] );

		$rlCtxMock = $this->getMockBuilder( Context::class )->disableOriginalConstructor()->getMock();

		$config = ResourceLoaderHooks::getCitizenSearchResourceLoaderConfig(
			$rlCtxMock,
			$this->getServiceContainer()->getMainConfig()
		);

		$this->assertArraySubmapSame( [
			'wgCitizenSearchGateway' => 'CitizenSearchGateway',
			'wgCitizenSearchDescriptionSource' => 'CitizenSearchDescriptionSource',
			'wgCitizenMaxSearchResults' => 'CitizenMaxSearchResults',
			'wgScript' => 'Script',
			'wgScriptPath' => 'ScriptPath',
			'isMediaSearchExtensionEnabled' => false,
		], $config );
	}
}
