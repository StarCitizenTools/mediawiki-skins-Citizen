<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Hooks;

use MediaWiki\Config\Config;
use MediaWiki\MainConfigNames;
use MediaWiki\MediaWikiServices;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\ResourceLoader as RL;
use MediaWiki\Skins\Citizen\PreferencesConfigProvider;

/**
 * Hooks to run relating to the resource loader
 */
class ResourceLoaderHooks {

	/**
	 * Passes config variables to skins.citizen.scripts ResourceLoader module.
	 * @param RL\Context $context
	 * @param Config $config
	 * @return array
	 */
	public static function getCitizenResourceLoaderConfig(
		RL\Context $context,
		Config $config
	) {
		return [
			'wgCitizenEnablePreferences' => $config->get( 'CitizenEnablePreferences' ),
			'wgCitizenOverflowInheritedClasses' => $config->get( 'CitizenOverflowInheritedClasses' ),
			'wgCitizenOverflowNowrapClasses' => $config->get( 'CitizenOverflowNowrapClasses' ),
		];
	}

	/**
	 * Passes config variables to skins.citizen.preferences ResourceLoader module.
	 * @param RL\Context $context
	 * @param Config $config
	 * @return array
	 */
	public static function getCitizenPreferencesResourceLoaderConfig(
		RL\Context $context,
		Config $config
	) {
		return [
			'wgCitizenThemeDefault' => $config->get( 'CitizenThemeDefault' ),
		];
	}

	/**
	 * Passes config variables to skins.citizen.commandPalette ResourceLoader module.
	 * @param RL\Context $context
	 * @param Config $config
	 * @return array
	 */
	public static function getCitizenCommandPaletteResourceLoaderConfig(
		RL\Context $context,
		Config $config
	) {
		$extensionRegistry = ExtensionRegistry::getInstance();

		return [
			'isMediaSearchExtensionEnabled' => $extensionRegistry->isLoaded( 'MediaSearch' ),
			'isSemanticMediaWikiEnabled' => $extensionRegistry->isLoaded( 'SemanticMediaWiki' ),
			'wgSearchSuggestCacheExpiry' => $config->get( MainConfigNames::SearchSuggestCacheExpiry )
		];
	}

	/**
	 * Return on-wiki preferences overrides with pre-resolved message texts.
	 *
	 * @param RL\Context $context
	 * @param Config $config
	 * @return array{overrides: ?array, messages: \stdClass|array<string, string>}
	 */
	public static function getCitizenPreferencesOverrides(
		RL\Context $context,
		Config $config
	): array {
		$services = MediaWikiServices::getInstance();
		$provider = new PreferencesConfigProvider(
			$services->getRevisionLookup(),
			$services->getTitleFactory(),
			$context
		);
		return $provider->getOverrides( $context->getLanguage() );
	}
}
