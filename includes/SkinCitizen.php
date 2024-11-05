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

use MediaWiki\Skins\Citizen\Components\CitizenComponentFooter;
use MediaWiki\Skins\Citizen\Components\CitizenComponentMainMenu;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageFooter;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageHeading;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageSidebar;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageTools;
use MediaWiki\Skins\Citizen\Components\CitizenComponentSearchBox;
use MediaWiki\Skins\Citizen\Components\CitizenComponentSiteStats;
use MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo;
use MediaWiki\Skins\Citizen\Partials\BodyContent;
use MediaWiki\Skins\Citizen\Partials\Metadata;
use MediaWiki\Skins\Citizen\Partials\Theme;
use SkinMustache;
use SkinTemplate;

/**
 * Skin subclass for Citizen
 * @ingroup Skins
 */
class SkinCitizen extends SkinMustache {
	use GetConfigTrait;

	/** @var null|array for caching purposes */
	private $languages;

	/**
	 * Overrides template, styles and scripts module
	 *
	 * @inheritDoc
	 */
	public function __construct( $options = [] ) {
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
	 * @param SkinTemplate $skin The skin template object.
	 * @param array &$content_navigation The content navigation array.
	 */
	protected function runOnSkinTemplateNavigationHooks( SkinTemplate $skin, &$content_navigation ) {
		parent::runOnSkinTemplateNavigationHooks( $skin, $content_navigation );
		Hooks\SkinHooks::onSkinTemplateNavigation( $skin, $content_navigation );
	}

	/**
	 * Calls getLanguages with caching.
	 * From Vector 2022
	 *
	 * @return array
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
		$out = $this->getOutput();
		$title = $this->getTitle();
		$user = $this->getUser();
		$pageLang = $title->getPageLanguage();
		$isRegistered = $user->isRegistered();
		$isTemp = $user->isTemp();

		$bodycontent = new BodyContent( $this );

		$components = [
			'data-footer' => new CitizenComponentFooter(
				$localizer,
				$parentData['data-footer']
			),
			'data-main-menu' => new CitizenComponentMainMenu( $parentData['data-portlets-sidebar'] ),
			'data-page-footer' => new CitizenComponentPageFooter(
				$localizer,
				$parentData['data-footer']['data-info']
			),
			'data-page-heading' => new CitizenComponentPageHeading(
				$localizer,
				$out,
				$pageLang,
				$title,
				$parentData['html-title-heading'],
				$user
			),
			'data-page-sidebar' => new CitizenComponentPageSidebar(
				$localizer,
				$out,
				$pageLang,
				$title,
				$user
			),
			'data-page-tools' => new CitizenComponentPageTools(
				$config,
				$localizer,
				$title,
				$user,
				count( $this->getLanguagesCached() ),
				$parentData['data-portlets-sidebar'],
				// These portlets can be unindexed
				$parentData['data-portlets']['data-languages'] ?? [],
				$parentData['data-portlets']['data-variants'] ?? []
			),
			'data-search-box' => new CitizenComponentSearchBox(
				$localizer,
				$parentData['data-search-box']
			),
			'data-site-stats' => new CitizenComponentSiteStats(
				$config,
				$localizer,
				$pageLang
			),
			'data-user-info' => new CitizenComponentUserInfo(
				$isRegistered,
				$isTemp,
				$localizer,
				$title,
				$user,
				$parentData['data-portlets']['data-user-page']
			)
		];

		foreach ( $components as $key => $component ) {
			// Array of components or null values.
			if ( $component ) {
				$parentData[$key] = $component->getTemplateData();
			}
		}

		// HACK: So that we can use Icon.mustache in Header__logo.mustache
		$parentData['data-logos']['icon-home'] = 'home';

		return array_merge( $parentData, [
			// Booleans
			'toc-enabled' => !empty( $parentData['data-toc'] ),
			'html-body-content--formatted' => $bodycontent->decorateBodyContent( $parentData['html-body-content'] )
		] );
	}

	/**
	 * @inheritDoc
	 *
	 * Manually disable some site-wide tools in TOOLBOX
	 * They are re-added in the drawer
	 *
	 * TODO: Remove this hack when Desktop Improvements separate page and site tools
	 *
	 * @return array
	 */
	protected function buildNavUrls() {
		$urls = parent::buildNavUrls();

		$urls['upload'] = false;
		$urls['specialpages'] = false;

		return $urls;
	}

	/**
	 * Add client preferences features
	 * Did not add the citizen-feature- prefix because there might be features from core MW or extensions
	 *
	 * @param string $feature
	 * @param string $value
	 */
	private function addClientPrefFeature( string $feature, string $value = 'standard' ) {
		$this->getOutput()->addHtmlClasses( $feature . '-clientpref-' . $value );
	}

	/**
	 * Set up optional skin features
	 *
	 * @param array &$options
	 */
	private function buildSkinFeatures( array &$options ) {
		$title = $this->getOutput()->getTitle();

		$metadata = new Metadata( $this );
		$skinTheme = new Theme( $this );

		// Add metadata
		$metadata->addMetadata();

		// Add theme handler
		$skinTheme->setSkinTheme( $options );

		// Clientprefs feature handling
		$this->addClientPrefFeature( 'citizen-feature-autohide-navigation', '1' );
		$this->addClientPrefFeature( 'citizen-feature-pure-black', '0' );
		$this->addClientPrefFeature( 'citizen-feature-custom-font-size' );
		$this->addClientPrefFeature( 'citizen-feature-custom-width' );

		if ( $title !== null ) {
			// Collapsible sections
			if (
				$this->getConfigValue( 'CitizenEnableCollapsibleSections' ) === true &&
				$title->isContentPage()
			) {
				$options['bodyClasses'][] = 'citizen-sections-enabled';
			}

			// Add a HTML class to indicate the page is a main page
			// T363281
			// TODO: Remove this when we move to 1.43 because this is in core
			if ( $title->isMainPage() ) {
				$options['bodyClasses'][] = 'page-Main_Page';
			}
		}

		// CJK fonts
		if ( $this->getConfigValue( 'CitizenEnableCJKFonts' ) === true ) {
			$options['styles'][] = 'skins.citizen.styles.fonts.cjk';
		}

		// AR fonts
		if ( $this->getConfigValue( 'CitizenEnableARFonts' ) === true ) {
			$options['styles'][] = 'skins.citizen.styles.fonts.ar';
		}
	}
}
