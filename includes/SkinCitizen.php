<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen;

use BadMethodCallException;
use MediaWiki\Cache\GenderCache;
use MediaWiki\Config\Config;
use MediaWiki\Languages\LanguageConverterFactory;
use MediaWiki\Languages\LanguageNameUtils;
use MediaWiki\MainConfigNames;
use MediaWiki\Output\OutputPage;
use MediaWiki\Permissions\PermissionManager;
use MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent;
use MediaWiki\Skins\Citizen\Components\CitizenComponentFooter;
use MediaWiki\Skins\Citizen\Components\CitizenComponentMainMenu;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageFooter;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageHeading;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageSidebar;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageTools;
use MediaWiki\Skins\Citizen\Components\CitizenComponentSiteStats;
use MediaWiki\Skins\Citizen\Components\CitizenComponentStickyHeader;
use MediaWiki\Skins\Citizen\Components\CitizenComponentTableOfContents;
use MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo;
use MediaWiki\Title\Title;
use MediaWiki\User\UserFactory;
use MediaWiki\User\UserGroupManager;
use MediaWiki\User\UserIdentityLookup;
use MediaWiki\Utils\UrlUtils;
use MobileContext;
use SkinMustache;
use SkinTemplate;

/**
 * Skin subclass for Citizen
 * @ingroup Skins
 */
class SkinCitizen extends SkinMustache {

	private const CLIENTPREFS_THEME_MAP = [
		'auto' => 'os',
		'light' => 'day',
		'dark' => 'night'
	];

	private const DEFAULT_CLIENT_PREFS = [
		'citizen-feature-autohide-navigation' => '1',
		'citizen-feature-image-dimming' => '0',
		'citizen-feature-pure-black' => '0',
		'citizen-feature-custom-font-size' => 'standard',
		'citizen-feature-custom-width' => 'standard',
		'citizen-feature-performance-mode' => '1',
	];

	private const OPTIONAL_FONT_MODULES = [
		'CitizenEnableCJKFonts' => 'skins.citizen.styles.fonts.cjk',
		'CitizenEnableARFonts' => 'skins.citizen.styles.fonts.ar',
	];

	/** For caching purposes */
	private ?array $languages = null;

	/**
	 * Overrides template, styles and scripts module
	 *
	 * @inheritDoc
	 */
	public function __construct(
		private readonly UserFactory $userFactory,
		private readonly GenderCache $genderCache,
		private readonly UserIdentityLookup $userIdentityLookup,
		private readonly LanguageConverterFactory $languageConverterFactory,
		private readonly LanguageNameUtils $languageNameUtils,
		private readonly PermissionManager $permissionManager,
		private readonly UserGroupManager $userGroupManager,
		private readonly UrlUtils $urlUtils,
		// @phan-suppress-next-line PhanUndeclaredTypeParameter,PhanUndeclaredTypeProperty
		private readonly ?MobileContext $mfContext,
		array $options = []
	) {
		if ( !isset( $options['name'] ) ) {
			$options['name'] = 'citizen';
		}

		// Add skin-specific features that only modify the $options array.
		// OutputPage modifications (HTML classes, metadata) are deferred to
		// initPage() and getHtmlElementAttributes() so that they only run
		// when Citizen is the active rendering skin. Without this separation,
		// Special:Preferences pollutes other skins' OutputPage when it
		// instantiates all registered skins to gather their configuration.
		$this->buildSkinFeatures( $options );
		parent::__construct( $options );
	}

	/**
	 * @inheritDoc
	 */
	public function initPage( OutputPage $out ): void {
		parent::initPage( $out );
		$this->addMetadata( $out, $this->getConfig() );
	}

	/**
	 * @inheritDoc
	 */
	public function getHtmlElementAttributes(): array {
		$attrs = parent::getHtmlElementAttributes();
		$config = $this->getConfig();
		$classes = [];

		// Theme
		$theme = $config->get( 'CitizenThemeDefault' );
		if ( isset( self::CLIENTPREFS_THEME_MAP[$theme] ) ) {
			$classes[] = 'skin-theme-clientpref-' . self::CLIENTPREFS_THEME_MAP[$theme];
		}

		// Default client preferences
		foreach ( self::DEFAULT_CLIENT_PREFS as $feature => $value ) {
			$classes[] = $feature . '-clientpref-' . $value;
		}

		// Header position
		$headerPosition = $config->get( 'CitizenHeaderPosition' );
		if ( !in_array( $headerPosition, [ 'left', 'right', 'top', 'bottom' ], true ) ) {
			$headerPosition = 'left';
		}
		$classes[] = 'citizen-header-position-' . $headerPosition;

		$attrs['class'] = trim( $attrs['class'] . ' ' . implode( ' ', $classes ) );
		return $attrs;
	}

	/**
	 * Ensure onSkinTemplateNavigation runs after all SkinTemplateNavigation hooks
	 * @see T287622
	 *
	 * @param SkinTemplate $skin
	 * @param array &$content_navigation
	 */
	protected function runOnSkinTemplateNavigationHooks( SkinTemplate $skin, &$content_navigation ): void {
		parent::runOnSkinTemplateNavigationHooks( $skin, $content_navigation );
		Hooks\SkinHooks::onSkinTemplateNavigation( $skin, $content_navigation );
	}

	/**
	 * Calls getLanguages with caching.
	 * From Vector 2022
	 */
	protected function getLanguagesCached(): array {
		if ( $this->languages === null ) {
			$this->languages = $this->getLanguages();
		}
		return $this->languages;
	}

	/**
	 * @inheritDoc
	 */
	public function getTemplateData(): array {
		$parentData = parent::getTemplateData();

		$config = $this->getConfig();
		$localizer = $this->getContext();
		$lang = $this->getLanguage();
		$out = $this->getOutput();
		$title = $this->getTitle();
		$user = $this->getUser();

		[ $sidebar, $pageToolsMenu ] = $this->extractPageToolsFromSidebar(
			$parentData['data-portlets-sidebar']
		);

		$components = [
			'data-footer' => new CitizenComponentFooter(
				$localizer,
				$parentData['data-footer']
			),
			'data-main-menu' => new CitizenComponentMainMenu( $sidebar ),
			'data-page-footer' => new CitizenComponentPageFooter(
				$localizer,
				$parentData['data-footer']['data-info']
			),
			'data-page-heading' => new CitizenComponentPageHeading(
				$this->userFactory,
				$this->genderCache,
				$this->userIdentityLookup,
				$this->languageConverterFactory,
				$lang,
				$localizer,
				$out,
				$title,
				$parentData['html-title-heading']
			),
			'data-page-sidebar' => new CitizenComponentPageSidebar(
				$localizer,
				$title,
				$parentData['data-last-modified']
			),
			'data-page-tools' => new CitizenComponentPageTools(
				$config,
				$localizer,
				$title,
				$user,
				$this->permissionManager,
				count( $this->getLanguagesCached() ),
				$pageToolsMenu,
				// These portlets can be unindexed
				$parentData['data-portlets']['data-languages'] ?? [],
				$parentData['data-portlets']['data-variants'] ?? []
			),
			'data-site-stats' => new CitizenComponentSiteStats(
				$config,
				$localizer,
				$lang,
				$this->languageNameUtils
			),
			'data-user-info' => new CitizenComponentUserInfo(
				$this->userGroupManager,
				$lang,
				$localizer,
				$title,
				$user,
				$parentData['data-portlets']['data-user-page']
			),
			'data-sticky-header' => new CitizenComponentStickyHeader(
				$this->isVisualEditorTabPositionFirst( $parentData['data-portlets']['data-views'] )
			),
			'data-body-content' => new CitizenComponentBodyContent(
				$parentData['html-body-content'],
				$this->shouldMakeSections( $config, $title )
			),
			'data-toc' => new CitizenComponentTableOfContents(
				$parentData['data-toc'] ?? [],
				$localizer,
				$config
			),
		];

		foreach ( $components as $key => $component ) {
			$parentData[$key] = $component->getTemplateData();
		}

		// TODO: Pass tagline through the component instead of reaching across template data
		$parentData['data-sticky-header']['html-sticky-header-tagline'] =
			$this->prepareStickyHeaderTagline( $parentData['data-page-heading']['html-tagline'] );

		// TODO: Pass the home icon through the component instead of injecting into logos data
		$parentData['data-logos']['icon-home'] = 'home';

		$parentData['toc-enabled'] = !empty( $parentData['data-toc'][ 'array-sections' ] );
		if ( $parentData['toc-enabled'] ) {
			// This body class depends on template data so it can't move to
			// getHtmlElementAttributes(). Safe here because getTemplateData()
			// only runs for the active rendering skin.
			$out->addBodyClasses( 'citizen-toc-enabled' );
		}

		return $parentData;
	}

	/**
	 * Extracts the page tools menu from the sidebar and returns both.
	 * From Vector 2022
	 *
	 * @return array [ $sidebar, $pageToolsMenu ]
	 */
	private function extractPageToolsFromSidebar( array $sidebar ): array {
		$restPortlets = $sidebar[ 'array-portlets-rest' ] ?? [];
		$pageToolsMenu = [];
		$toolboxMenuIndex = array_search(
			CitizenComponentPageTools::TOOLBOX_ID,
			array_column(
				$restPortlets,
				'id'
			)
		);

		if ( $toolboxMenuIndex !== false ) {
			$pageToolsMenu = array_splice( $restPortlets, $toolboxMenuIndex, 1 );
			$sidebar['array-portlets-rest'] = $restPortlets;
		}

		return [ $sidebar, $pageToolsMenu ];
	}

	/**
	 * Check whether Visual Editor Tab Position is first
	 * From Vector 2022
	 */
	private function isVisualEditorTabPositionFirst( array $dataViews ): bool {
		foreach ( $dataViews[ 'array-items' ] as $item ) {
			if ( $item[ 'name' ] === 've-edit' ) {
				return true;
			}
			if ( $item[ 'name' ] === 'edit' ) {
				return false;
			}
		}
		return false;
	}

	/**
	 * Check if collapsible sections should be made
	 */
	private function shouldMakeSections( Config $config, Title $title ): bool {
		if (
			$config->get( 'CitizenEnableCollapsibleSections' ) === false ||
			!$title->canExist() ||
			$title->isMainPage() ||
			!$title->isContentPage() ||
			$title->getContentModel() !== CONTENT_MODEL_WIKITEXT
		) {
			return false;
		}

		// If MF is installed, check if page is in mobile view and let MF do the formatting
		// @phan-suppress-next-line PhanUndeclaredClassMethod MobileFrontend is an optional dependency
		return $this->mfContext === null || !$this->mfContext->shouldDisplayMobileView();
	}

	/**
	 * Prepare the tagline for the sticky header
	 * Replace <a> elements with <span> elements because
	 * you can't nest <a> elements in <a> elements
	 */
	private static function prepareStickyHeaderTagline( string $tagline ): string {
		return preg_replace( '/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/', '<span>$2</span>', $tagline ) ?? $tagline;
	}

	/**
	 * Set up skin features that modify the constructor $options array.
	 * Only bodyClasses and styles belong here — OutputPage modifications
	 * are handled by initPage() and getHtmlElementAttributes().
	 */
	private function buildSkinFeatures( array &$options ): void {
		$config = $this->getConfig();
		$title = $this->getOutput()->getTitle();

		if ( $title !== null ) {
			// Collapsible sections
			if (
				$config->get( 'CitizenEnableCollapsibleSections' ) === true &&
				$title->isContentPage()
			) {
				$options['bodyClasses'][] = 'citizen-sections-enabled';
			}
		}

		foreach ( self::OPTIONAL_FONT_MODULES as $configKey => $module ) {
			if ( $config->get( $configKey ) === true ) {
				$options['styles'][] = $module;
			}
		}
	}

	/**
	 * Adds metadata to the output page (theme-color and manifest)
	 */
	private function addMetadata( OutputPage $out, Config $config ): void {
		$out->addMeta( 'theme-color', $config->get( 'CitizenThemeColor' ) );

		if (
			$config->get( 'CitizenEnableManifest' ) !== true ||
			$config->get( MainConfigNames::GroupPermissions )['*']['read'] !== true
		) {
			return;
		}

		try {
			$href = $this->urlUtils->expand( wfAppendQuery( wfScript( 'api' ),
					[ 'action' => 'appmanifest' ] ), PROTO_RELATIVE );
		} catch ( BadMethodCallException ) {
			$href = '';
		}

		$out->addLink( [
			'rel' => 'manifest',
			'href' => $href,
		] );
	}

}
