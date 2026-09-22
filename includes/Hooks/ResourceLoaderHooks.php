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
	 *
	 * citizen-v4-remove — this callback only ships the deprecated
	 * $wgCitizenThemeDefault; delete it and skin.json's config.json
	 * virtual file entry at the 4.0 flip.
	 *
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
			'isBucketEnabled' => $extensionRegistry->isLoaded( 'Bucket' ) && defined( 'NS_BUCKET' ),
			// Bucket's schemas live on pages in NS_BUCKET, which is where
			// the palette mode reads them from.
			'bucketNamespaceId' => defined( 'NS_BUCKET' ) ? NS_BUCKET : null,
			'isSemanticMediaWikiEnabled' => $extensionRegistry->isLoaded( 'SemanticMediaWiki' ),
			'wgSearchSuggestCacheExpiry' => $config->get( MainConfigNames::SearchSuggestCacheExpiry )
		];
	}

	/**
	 * Lists every registered special page for the command palette's action mode.
	 *
	 * Each entry is the canonical name, or a [ canonical name, label ] pair when
	 * the first content-language alias differs from it. Names come from the
	 * special page registry rather than the siteinfo alias table, which omits
	 * pages that declare no aliases.
	 *
	 * This runs on every startup module build, so it must not construct special
	 * pages (getPage(), isListed(), getDescription()).
	 *
	 * @param RL\Context $context
	 * @param Config $config
	 * @return array<string|string[]>
	 */
	public static function getCitizenCommandPaletteSpecialPages(
		RL\Context $context,
		Config $config
	): array {
		$services = MediaWikiServices::getInstance();
		$aliases = $services->getContentLanguage()->getSpecialPageAliases();
		$pages = [];
		foreach ( $services->getSpecialPageFactory()->getNames() as $name ) {
			// array_keys() turns a numeric page name into an int
			$name = (string)$name;
			$label = $aliases[$name][0] ?? $name;
			$pages[] = $label === $name ? $name : [ $name, $label ];
		}
		return $pages;
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
