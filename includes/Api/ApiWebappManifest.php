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
use Wikimedia\ObjectCache\WANObjectCache;

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

	/**
	 * How long a measured icon list is kept, and how long one that came out
	 * short is kept before the logos are measured again.
	 *
	 * Measuring a logo means fetching it from the wiki's own web server, so a
	 * list that lost one to a failure is worth retrying long before a complete
	 * one is.
	 */
	private const ICON_CACHE_TTL = WANObjectCache::TTL_DAY;
	private const ICON_CACHE_INCOMPLETE_TTL = 5 * WANObjectCache::TTL_MINUTE;

	/** Bumped when the shape of a cached icon list changes. */
	private const ICON_CACHE_VERSION = 1;

	/** The $wgLogos entries the manifest can carry, in the order it emits them. */
	private const LOGO_KEYS = [ '1x', '1.5x', '2x', 'icon', 'svg' ];

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
		private readonly WANObjectCache $wanCache,
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
	 *
	 * The key hashes the logos the list was built from, so a $wgLogos edit
	 * misses the old entry rather than needing a purge.
	 */
	private function getIconsFromLogos(): array {
		$logos = $this->getConfiguredLogos();
		if ( $logos === [] ) {
			return [];
		}

		$cache = $this->wanCache;

		return $cache->getWithSetCallback(
			$cache->makeKey(
				'citizen-manifest-icons',
				self::ICON_CACHE_VERSION,
				hash( 'sha256', serialize( $logos ) )
			),
			self::ICON_CACHE_TTL,
			function ( $oldValue, &$ttl, array &$setOpts ) use ( $logos ) {
				// No replica read here, so no lag to declare. Left unsaid,
				// WANObjectCache reads how long the fetches took as staleness
				// and keeps the list for thirty seconds.
				$setOpts['since'] = INF;

				$icons = $this->buildIcons( $logos );
				if ( count( $icons ) < count( $logos ) ) {
					$ttl = self::ICON_CACHE_INCOMPLETE_TTL;
				}
				return $icons;
			}
		);
	}

	/**
	 * The logos the manifest can carry, in the order it emits them.
	 *
	 * @return string[]
	 */
	private function getConfiguredLogos(): array {
		$logos = $this->config->get( MainConfigNames::Logos );
		if ( !is_array( $logos ) ) {
			return [];
		}

		$configured = [];
		foreach ( self::LOGO_KEYS as $logoKey ) {
			// $wgLogos also carries array-shaped entries such as wordmark.
			if ( isset( $logos[$logoKey] ) && is_string( $logos[$logoKey] ) ) {
				$configured[$logoKey] = $logos[$logoKey];
			}
		}
		return $configured;
	}

	/**
	 * Turn configured logos into manifest icon entries.
	 *
	 * A logo yields one entry or none, so a list shorter than the logos it was
	 * built from means something could not be measured.
	 *
	 * @param string[] $logos
	 * @return array[]
	 */
	private function buildIcons( array $logos ): array {
		$logger = LoggerFactory::getInstance( 'Citizen' );

		$icons = [];

		foreach ( $logos as $logoPath ) {
			if ( self::isSvgPath( $logoPath ) ) {
				// An SVG fits any size, and getimagesizefromstring() cannot
				// read one anyway, so fetching it would discard the bytes.
				$icons[] = [
					'src' => $logoPath,
					'sizes' => 'any',
					'type' => 'image/svg+xml',
				];
				continue;
			}

			$logoUrl = '';
			try {
				$logoUrl = $this->urlUtils->expand( $logoPath, PROTO_CURRENT ) ?? '';
				$request = $this->httpRequestFactory->create( $logoUrl, [
					'timeout' => self::LOGO_FETCH_TIMEOUT,
					'connectTimeout' => self::LOGO_FETCH_CONNECT_TIMEOUT,
				], __METHOD__ );
				$status = $request->execute();
				if ( $status->isOK() ) {
					$logoContent = $request->getContent();
				} else {
					$logoContent = '';
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

			$logoSize = $logoContent !== '' ? getimagesizefromstring( $logoContent ) : false;
			// Nothing measurable, so there are no sizes to declare.
			if ( $logoSize === false ) {
				continue;
			}

			$icons[] = [
				'src' => $logoPath,
				'sizes' => $logoSize[0] . 'x' . $logoSize[1],
				'type' => $logoSize['mime'],
			];
		}

		return $icons;
	}

	/**
	 * Whether a logo path points at an SVG.
	 */
	private static function isSvgPath( string $logoPath ): bool {
		// A query string or fragment is not part of the extension.
		$path = substr( $logoPath, 0, strcspn( $logoPath, '?#' ) );
		return str_ends_with( strtolower( $path ), '.svg' );
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
