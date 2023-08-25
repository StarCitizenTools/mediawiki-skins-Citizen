<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Tests\Hooks;

use MediaWiki\ResourceLoader\Context;
use MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks;

/**
 * @group Citizen
 */
class ResourceLoaderHooksTest extends \MediaWikiIntegrationTestCase {
	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 * @return void
	 */
	public function testCitizenResourceLoaderConfig() {
		$this->overrideConfigValues( [
			'CitizenEnablePreferences' => false,
			'CitizenSearchModule' => false,
			'CitizenTableNowrapClasses' => false,
		] );

		$rlCtxMock = $this->getMockBuilder( Context::class )->disableOriginalConstructor()->getMock();

		$config = ResourceLoaderHooks::getCitizenResourceLoaderConfig(
			$rlCtxMock,
			$this->getServiceContainer()->getMainConfig()
		);

		$this->assertArraySubmapSame( [
			'wgCitizenEnablePreferences' => false,
			'wgCitizenSearchModule' => false,
			'wgCitizenTableNowrapClasses' => false,
		], $config );
	}

	/**
	 * @covers \MediaWiki\Skins\Citizen\Hooks\ResourceLoaderHooks
	 * @return void
	 */
	public function testCitizenResourceLoaderConfigAllTrue() {
		$this->overrideConfigValues( [
			'CitizenEnablePreferences' => true,
			'CitizenSearchModule' => true,
			'CitizenTableNowrapClasses' => true,
		] );

		$rlCtxMock = $this->getMockBuilder( Context::class )->disableOriginalConstructor()->getMock();

		$config = ResourceLoaderHooks::getCitizenResourceLoaderConfig(
			$rlCtxMock,
			$this->getServiceContainer()->getMainConfig()
		);

		$this->assertArraySubmapSame( [
			'wgCitizenEnablePreferences' => true,
			'wgCitizenSearchModule' => true,
			'wgCitizenTableNowrapClasses' => true,
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
