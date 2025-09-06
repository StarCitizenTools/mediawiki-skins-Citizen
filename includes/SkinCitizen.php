<?php
/**
 * Citizen - A responsive skin developed for the Star Citizen Wiki
 *
 * This file is part of Citizen.
 *
 * Citizen is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Citizen is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Citizen.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @file
 * @ingroup Skins
 */

namespace MediaWiki\Skins\Citizen;

use MediaWiki\Cache\GenderCache;
use MediaWiki\Language\Language;
use MediaWiki\Languages\LanguageConverterFactory;
use MediaWiki\Permissions\PermissionManager;
use MediaWiki\Registration\ExtensionRegistry;
use MediaWiki\Skins\Citizen\Components\CitizenComponentBodyContent;
use MediaWiki\Skins\Citizen\Components\CitizenComponentFooter;
use MediaWiki\Skins\Citizen\Components\CitizenComponentMainMenu;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageFooter;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageHeading;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageSidebar;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageTools;
use MediaWiki\Skins\Citizen\Components\CitizenComponentSearchBox;
use MediaWiki\Skins\Citizen\Components\CitizenComponentSiteStats;
use MediaWiki\Skins\Citizen\Components\CitizenComponentStickyHeader;
use MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo;
use MediaWiki\Skins\Citizen\Partials\Metadata;
use MediaWiki\Skins\Citizen\Partials\Theme;
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

	/** For caching purposes */
	private ?array $languages = null;

	/**
	 * Overrides template, styles and scripts module
	 *
	 * @inheritDoc
	 */
	public function __construct(
		private UserFactory $userFactory,
		private GenderCache $genderCache,
		private UserIdentityLookup $userIdentityLookup,
		private LanguageConverterFactory $languageConverterFactory,
		private Language $contentLanguage,
		private PermissionManager $permissionManager,
		private ExtensionRegistry $extensionRegistry,
		private UserGroupManager $userGroupManager,
		private UrlUtils $urlUtils,
		private ?MobileContext $mfContext,
		array $options = []
	) {
		if ( !isset( $options['name'] ) ) {
			$options['name'] = 'citizen';
		}

		// Add skin-specific features
		$this->buildSkinFeatures( $options );
		parent::__construct( $options );
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
		$pageLang = $title->getPageLanguage();

		$sidebar = $parentData['data-portlets-sidebar'];
		$pageToolsMenu = [];

		$this->extractPageToolsFromSidebar( $sidebar, $pageToolsMenu );

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
				$this->contentLanguage,
				$localizer,
				$out,
				$pageLang,
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
			'data-search-box' => new CitizenComponentSearchBox(
				$localizer,
				$this->extensionRegistry,
				$parentData['data-search-box']
			),
			'data-site-stats' => new CitizenComponentSiteStats(
				$config,
				$localizer,
				$pageLang
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
				$this->shouldMakeSections( $title )
			),
		];

		foreach ( $components as $key => $component ) {
			// Array of components or null values.
			if ( $component ) {
				$parentData[$key] = $component->getTemplateData();
			}
		}

		// HACK: So that we only get the tagline once
		$parentData['data-sticky-header']['html-sticky-header-tagline'] = $this->prepareStickyHeaderTagline( $parentData['data-page-heading']['html-tagline'] );

		// HACK: So that we can use Icon.mustache in Header__logo.mustache
		$parentData['data-logos']['icon-home'] = 'home';

		$isTocEnabled = !empty( $parentData['data-toc'][ 'array-sections' ] );
		if ( $isTocEnabled ) {
			$this->getOutput()->addBodyClasses( 'citizen-toc-enabled' );
		}

		return array_merge( $parentData, [
			// Booleans
			'toc-enabled' => $isTocEnabled
		] );
	}

	/**
	 * Pulls the page tools menu out of $sidebar into $pageToolsMenu
	 * From Vector 2022
	 *
	 * @param array &$sidebar
	 * @param array &$pageToolsMenu
	 */
	private function extractPageToolsFromSidebar( array &$sidebar, array &$pageToolsMenu ) {
		$restPortlets = $sidebar[ 'array-portlets-rest' ] ?? [];
		$toolboxMenuIndex = array_search(
			CitizenComponentPageTools::TOOLBOX_ID,
			array_column(
				$restPortlets,
				'id'
			)
		);

		if ( $toolboxMenuIndex !== false ) {
			// Splice removes the toolbox menu from the $restPortlets array
			// and current returns the first value of array_splice, i.e. the $toolbox menu data.
			$pageToolsMenu = array_splice( $restPortlets, $toolboxMenuIndex, 1 );
			$sidebar['array-portlets-rest'] = $restPortlets;
		}
	}

	/**
	 * Check whether Visual Editor Tab Position is first
	 * From Vector 2022
	 */
	private function isVisualEditorTabPositionFirst( array $dataViews ): bool {
		$names = [ 've-edit', 'edit' ];
		// find if under key 'name' 've-edit' or 'edit' is the before item in the array
		for ( $i = 0; $i < count( $dataViews[ 'array-items' ] ); $i++ ) {
			if ( in_array( $dataViews[ 'array-items' ][ $i ][ 'name' ], $names ) ) {
				return $dataViews[ 'array-items' ][ $i ][ 'name' ] === $names[ 0 ];
			}
		}
		return false;
	}

	/**
	 * Check if collapsible sections should be made
	 */
	private function shouldMakeSections( Title $title ): bool {
		if (
			$this->getConfig()->get( 'CitizenEnableCollapsibleSections' ) === false ||
			!$title->canExist() ||
			$title->isMainPage() ||
			!$title->isContentPage() ||
			$title->getContentModel() !== CONTENT_MODEL_WIKITEXT
		) {
			return false;
		}

		// If MF is installed, check if page is in mobile view and let MF do the formatting
		return $this->mfContext === null || !$this->mfContext->shouldDisplayMobileView();
	}

	/**
	 * Prepare the tagline for the sticky header
	 * Replace <a> elements with <span> elements because
	 * you can't nest <a> elements in <a> elements
	 */
	private function prepareStickyHeaderTagline( string $tagline ): string {
		return preg_replace( '/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/', '<span>$2</span>', $tagline );
	}

	/**
	 * Add client preferences features
	 * Did not add the citizen-feature- prefix because there might be features from core MW or extensions
	 *
	 * @param string $feature
	 * @param string $value
	 */
	private function addClientPrefFeature( string $feature, string $value = 'standard' ): void {
		$this->getOutput()->addHtmlClasses( $feature . '-clientpref-' . $value );
	}

	/**
	 * Set up optional skin features
	 */
	private function buildSkinFeatures( array &$options ): void {
		$config = $this->getConfig();
		$title = $this->getOutput()->getTitle();

		$metadata = new Metadata( $this, $this->urlUtils );
		$skinTheme = new Theme( $this );

		// Add metadata
		$metadata->addMetadata();

		// Add theme handler
		$skinTheme->setSkinTheme();

		// Clientprefs feature handling
		$this->addClientPrefFeature( 'citizen-feature-autohide-navigation', '1' );
		$this->addClientPrefFeature( 'citizen-feature-pure-black', '0' );
		$this->addClientPrefFeature( 'citizen-feature-custom-font-size' );
		$this->addClientPrefFeature( 'citizen-feature-custom-width' );

		if ( $title !== null ) {
			// Collapsible sections
			if (
				$config->get( 'CitizenEnableCollapsibleSections' ) === true &&
				$title->isContentPage()
			) {
				$options['bodyClasses'][] = 'citizen-sections-enabled';
			}
		}

		// CJK fonts
		if ( $config->get( 'CitizenEnableCJKFonts' ) === true ) {
			$options['styles'][] = 'skins.citizen.styles.fonts.cjk';
		}

		// AR fonts
		if ( $config->get( 'CitizenEnableARFonts' ) === true ) {
			$options['styles'][] = 'skins.citizen.styles.fonts.ar';
		}
	}
}
