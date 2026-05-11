<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Hooks;

use MediaWiki\Config\Config;
use MediaWiki\MainConfigNames;
use MediaWiki\MediaWikiServices;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\ResourceLoader as RL;
use MediaWiki\Skins\Citizen\OnWikiJsonReader;
use MediaWiki\Skins\Citizen\PreferencesConfigProvider;
use MediaWiki\Skins\Citizen\ShareConfigProvider;

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
			'wgCitizenShareMode' => $config->get( 'CitizenShareMode' ),
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
			'isSemanticMediaWikiEnabled' => $extensionRegistry->isLoaded( 'SemanticMediaWiki' ),
			'wgSearchSuggestCacheExpiry' => $config->get( MainConfigNames::SearchSuggestCacheExpiry )
		];
	}

	/**
	 * Passes config variables to skins.citizen.share ResourceLoader module.
	 * @param RL\Context $context
	 * @param Config $config
	 * @return array{services: array, urlShortener: array{available: bool, qrAvailable: bool}}
	 */
	public static function getCitizenShareResourceLoaderConfig(
		RL\Context $context,
		Config $config
	): array {
		$mwServices = MediaWikiServices::getInstance();
		$provider = new ShareConfigProvider(
			new OnWikiJsonReader(
				$mwServices->getRevisionLookup(),
				$mwServices->getTitleFactory()
			),
			$mwServices->getUrlUtils()
		);

		$extensionRegistry = ExtensionRegistry::getInstance();
		$urlShortenerLoaded = $extensionRegistry->isLoaded( 'UrlShortener' );
		$qrAvailable = $urlShortenerLoaded
			&& $config->has( 'UrlShortenerEnableQrCode' )
			&& (bool)$config->get( 'UrlShortenerEnableQrCode' );

		return [
			'services' => $provider->getServiceOptions() ?? [],
			'urlShortener' => [
				'available' => $urlShortenerLoaded,
				'qrAvailable' => $qrAvailable,
			],
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
			new OnWikiJsonReader(
				$services->getRevisionLookup(),
				$services->getTitleFactory()
			),
			$context
		);
		return $provider->getOverrides( $context->getLanguage() );
	}
}
