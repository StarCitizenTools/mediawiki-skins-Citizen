<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Api;

use Exception;
use MediaWiki\Api\ApiBase;
use MediaWiki\Api\ApiMain;
use MediaWiki\Config\Config;
use MediaWiki\Http\HttpRequestFactory;
use MediaWiki\Language\Language;
use MediaWiki\Logger\LoggerFactory;
use MediaWiki\MainConfigNames;
use MediaWiki\SpecialPage\SpecialPage;
use MediaWiki\Title\Title;
use MediaWiki\Utils\UrlUtils;

/**
 * Based on the MobileFrontend extension
 * Return the webapp manifest for this wiki
 *
 * T282500
 * TODO: This should be merged to core
 */
class ApiWebappManifest extends ApiBase {

	/* 1 week */
	private const CACHE_MAX_AGE = 604800;

	/**
	 * Bounds on fetching the wiki's own logo files, in seconds.
	 *
	 * Without them each request inherits $wgHTTPTimeout, so a server that
	 * cannot reach its own URL holds the worker for minutes across the logo
	 * list. These are requests to the same server for static files, so seconds
	 * are already generous.
	 */
	private const LOGO_FETCH_TIMEOUT = 3;
	private const LOGO_FETCH_CONNECT_TIMEOUT = 1;

	/** Icon fields taken from config, per the manifest spec. */
	private const ICON_KEYS = [ 'src', 'sizes', 'type', 'purpose' ];

	/** Shortcut fields taken from config, per the manifest spec. */
	private const SHORTCUT_KEYS = [ 'name', 'short_name', 'description', 'url' ];

	/** Screenshot fields taken from config, per the manifest spec. */
	private const SCREENSHOT_KEYS = [ 'src', 'sizes', 'type', 'form_factor', 'label', 'platform' ];

	/**
	 * Shortcuts used when the config declares none at all. They live here
	 * rather than in skin.json because their URLs depend on the wiki's article
	 * path, which only resolves at runtime.
	 */
	private const DEFAULT_SHORTCUT_PAGES = [ 'Search', 'Randompage', 'Recentchanges' ];

	private readonly Config $config;

	private readonly array $options;

	public function __construct(
		private readonly ApiMain $main,
		private readonly string $moduleName,
		private readonly Language $contentLanguage,
		private readonly HttpRequestFactory $httpRequestFactory,
		private readonly UrlUtils $urlUtils,
	) {
		parent::__construct( $main, $moduleName );
		$this->config = $this->getConfig();
		$this->options = $this->config->get( 'CitizenManifestOptions' );
	}

	/**
	 * Execute the requested Api actions.
	 */
	public function execute(): void {
		$config = $this->config;
		$resultObj = $this->getResult();
		$main = $this->main;

		$resultObj->addValue( null, 'dir', $this->contentLanguage->getDir() );
		$resultObj->addValue( null, 'lang', $config->get( MainConfigNames::LanguageCode ) );
		$resultObj->addValue( null, 'name', $config->get( MainConfigNames::Sitename ) );
		// Need to set it manually because the default from start_url does not include script namespace
		// E.g. index.php URLs will be thrown out of the PWA
		$resultObj->addValue( null, 'scope', $config->get( MainConfigNames::Server ) . '/' );
		$resultObj->addValue( null, 'icons', $this->getIcons() );
		$resultObj->addValue( null, 'display', 'standalone' );
		$resultObj->addValue( null, 'orientation', 'natural' );
		$resultObj->addValue( null, 'start_url', Title::newMainPage()->getLocalURL() );
		$this->addConfiguredValue( 'theme_color' );
		$this->addConfiguredValue( 'background_color' );
		$resultObj->addValue( null, 'shortcuts', $this->getShortcuts() );
		$screenshots = $this->getScreenshots();
		if ( $screenshots !== [] ) {
			$resultObj->addValue( null, 'screenshots', $screenshots );
		}
		$this->addConfiguredValue( 'short_name' );
		$this->addConfiguredValue( 'description' );

		$main->setCacheMaxAge( self::CACHE_MAX_AGE );
		$main->setCacheMode( 'public' );
	}

	/**
	 * Add a manifest member the config carries verbatim, when it has one
	 *
	 * All of these are optional in the manifest spec, so a config that says
	 * nothing about one — including a $wgCitizenManifestOptions that replaces
	 * the whole array and leaves the key out — omits the member rather than
	 * shipping it empty.
	 */
	private function addConfiguredValue( string $key ): void {
		$value = $this->options[$key] ?? null;
		if ( is_string( $value ) && $value !== '' ) {
			$this->getResult()->addValue( null, $key, $value );
		}
	}

	/**
	 * Get icons for manifest
	 */
	private function getIcons(): array {
		$iconsConfig = $this->options['icons'] ?? [];
		if ( !is_array( $iconsConfig ) || count( $iconsConfig ) === 0 ) {
			return $this->getIconsFromLogos();
		}
		return $this->filterIcons( $iconsConfig );
	}

	/**
	 * Reduce an icon list from config to the fields the manifest spec defines,
	 * dropping entries that carry none of them.
	 */
	private function filterIcons( mixed $iconsConfig ): array {
		if ( !is_array( $iconsConfig ) ) {
			return [];
		}
		$icons = [];
		foreach ( $iconsConfig as $iconConfig ) {
			if ( !is_array( $iconConfig ) ) {
				continue;
			}
			$icon = array_intersect_key( $iconConfig, array_flip( self::ICON_KEYS ) );
			if ( count( $icon ) === 0 ) {
				continue;
			}
			$icons[] = $icon;
		}
		return $icons;
	}

	/**
	 * Get icons from wgLogos
	 */
	private function getIconsFromLogos(): array {
		$urlUtils = $this->urlUtils;
		$httpRequestFactory = $this->httpRequestFactory;
		$logger = LoggerFactory::getInstance( 'Citizen' );

		$icons = [];
		$logos = $this->config->get( MainConfigNames::Logos );

		if ( !$logos ) {
			return $icons;
		}

		$logoKeys = [
			'1x',
			'1.5x',
			'2x',
			'icon',
			'svg'
		];

		foreach ( $logoKeys as $logoKey ) {
			// Avoid undefined index
			if ( !isset( $logos[$logoKey] ) ) {
				continue;
			}

			$logoPath = (string)$logos[$logoKey];

			$logoUrl = '';
			try {
				$logoUrl = $urlUtils->expand( $logoPath, PROTO_CURRENT ) ?? '';
				$request = $httpRequestFactory->create( $logoUrl, [
					'timeout' => self::LOGO_FETCH_TIMEOUT,
					'connectTimeout' => self::LOGO_FETCH_CONNECT_TIMEOUT,
				], __METHOD__ );
				$status = $request->execute();
				if ( $status->isOK() ) {
					$logoContent = $request->getContent();
				} else {
					$logoContent = '';
					// The manifest is cached for a week, so a logo the server
					// could not reach is missing from it for a week with
					// nothing else to show for it.
					$logger->warning(
						'Could not fetch logo {logo} for the webapp manifest, HTTP {code}',
						[ 'logo' => $logoUrl, 'code' => $request->getStatus() ]
					);
				}
			} catch ( Exception $e ) {
				$logoContent = '';
				$logger->warning(
					'Could not fetch logo {logo} for the webapp manifest: {exception}',
					[ 'logo' => $logoUrl, 'exception' => $e->getMessage() ]
				);
			}

			if ( $logoContent !== '' ) {
				$logoSize = getimagesizefromstring( $logoContent );
			} else {
				$logoSize = false;
			}

			$icon = [
				'src' => $logoPath
			];

			if ( $logoSize !== false ) {
				$icon['sizes'] = $logoSize[0] . 'x' . $logoSize[1];
				$icon['type'] = $logoSize['mime'];
			}

			// Set sizes to any if it is a SVG
			if ( str_ends_with( $logoPath, 'svg' ) ) {
				$icon['sizes'] = 'any';
				$icon['type'] = 'image/svg+xml';
			}

			// Exit if not sizes are detected
			if ( !isset( $icon['sizes'] ) ) {
				continue;
			}

			$icons[] = $icon;
		}

		return $icons;
	}

	/**
	 * Get shortcuts for manifest
	 *
	 * A config that declares no shortcuts at all gets Citizen's defaults, so
	 * that a $wgCitizenManifestOptions written before the option existed keeps
	 * the shortcuts it used to get. An empty list ships none.
	 */
	private function getShortcuts(): array {
		$shortcutsConfig = $this->options['shortcuts'] ?? null;
		if ( $shortcutsConfig === null ) {
			return $this->getDefaultShortcuts();
		}
		if ( !is_array( $shortcutsConfig ) ) {
			return [];
		}
		$shortcuts = [];
		foreach ( $shortcutsConfig as $shortcutConfig ) {
			if ( !is_array( $shortcutConfig ) ) {
				continue;
			}
			$shortcut = $this->buildShortcut( $shortcutConfig );
			if ( $shortcut !== null ) {
				$shortcuts[] = $shortcut;
			}
		}
		return $shortcuts;
	}

	/**
	 * Citizen's own shortcuts, resolved against this wiki's article path
	 */
	private function getDefaultShortcuts(): array {
		return array_map( static function ( $specialPage ) {
			$title = SpecialPage::getSafeTitleFor( $specialPage );
			return [
				'name' => $title->getBaseText(),
				'url' => $title->getLocalURL()
			];
		}, self::DEFAULT_SHORTCUT_PAGES );
	}

	/**
	 * Build one manifest shortcut from its config entry, or return null when
	 * the entry cannot produce one.
	 *
	 * The manifest spec requires name and url, so an entry missing either is
	 * dropped rather than shipped incomplete.
	 */
	private function buildShortcut( array $shortcutConfig ): ?array {
		$shortcut = $this->filterStringFields( $shortcutConfig, self::SHORTCUT_KEYS );

		if ( !isset( $shortcut['name'] ) || !isset( $shortcut['url'] ) ) {
			return null;
		}

		$icons = $this->filterIcons( $shortcutConfig['icons'] ?? [] );
		if ( $icons !== [] ) {
			$shortcut['icons'] = $icons;
		}

		return $shortcut;
	}

	/**
	 * Get screenshots for manifest
	 *
	 * Screenshots are images of the wiki itself, so Citizen has no default to
	 * offer — a wiki that declares none ships the member empty, and execute()
	 * leaves it out entirely.
	 */
	private function getScreenshots(): array {
		$screenshotsConfig = $this->options['screenshots'] ?? null;
		if ( !is_array( $screenshotsConfig ) ) {
			return [];
		}
		$screenshots = [];
		foreach ( $screenshotsConfig as $screenshotConfig ) {
			if ( !is_array( $screenshotConfig ) ) {
				continue;
			}
			$screenshot = $this->filterStringFields( $screenshotConfig, self::SCREENSHOT_KEYS );
			// src is the one field the spec requires of an image resource
			if ( isset( $screenshot['src'] ) ) {
				$screenshots[] = $screenshot;
			}
		}
		return $screenshots;
	}

	/**
	 * Reduce a config entry to the given fields, keeping only the ones carrying
	 * a non-empty string.
	 */
	private function filterStringFields( array $config, array $keys ): array {
		$fields = [];
		foreach ( $keys as $key ) {
			$value = $config[$key] ?? null;
			if ( is_string( $value ) && $value !== '' ) {
				$fields[$key] = $value;
			}
		}
		return $fields;
	}

	/**
	 * Get the JSON printer
	 */
	public function getCustomPrinter(): ApiWebappManifestFormatJson {
		return new ApiWebappManifestFormatJson( $this->main, 'webmanifest' );
	}
}
