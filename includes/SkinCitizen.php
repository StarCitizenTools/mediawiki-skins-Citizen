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
use MediaWiki\Skins\Citizen\Components\CitizenComponentSearchBox;
use MediaWiki\Skins\Citizen\Components\CitizenComponentSiteStats;
use MediaWiki\Skins\Citizen\Components\CitizenComponentUserInfo;
use MediaWiki\Skins\Citizen\Partials\BodyContent;
use MediaWiki\Skins\Citizen\Partials\Metadata;
use MediaWiki\Skins\Citizen\Partials\PageTools;
use MediaWiki\Skins\Citizen\Partials\Theme;
use SkinMustache;
use SkinTemplate;

/**
 * Skin subclass for Citizen
 * @ingroup Skins
 */
class SkinCitizen extends SkinMustache {
	use GetConfigTrait;

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
		$tools = new PageTools( $this );

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
			'data-search-box' => new CitizenComponentSearchBox(
				$localizer,
				$parentData['data-search-box'],
				$this
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

		return array_merge( $parentData, [
			// Booleans
			'toc-enabled' => !empty( $parentData['data-toc'] ),
			'html-body-content--formatted' => $bodycontent->decorateBodyContent( $parentData['html-body-content'] )
		], $tools->getPageToolsData( $parentData ) );
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

		// Disable default ToC since it is handled by Citizen
		$options['toc'] = false;

		// Clientprefs feature handling
		$this->addClientPrefFeature( 'citizen-feature-autohide-navigation', '1' );
		$this->addClientPrefFeature( 'citizen-feature-pure-black', '0' );
		$this->addClientPrefFeature( 'citizen-feature-custom-font-size' );
		$this->addClientPrefFeature( 'citizen-feature-custom-width' );

		// Collapsible sections
		// Load in content pages
		if ( $title !== null && $title->isContentPage() ) {
			// Since we merged the sections module into core styles and scripts to reduce RL modules
			// The style is now activated through the class below
			if ( $this->getConfigValue( 'CitizenEnableCollapsibleSections' ) === true ) {
				$options['bodyClasses'][] = 'citizen-sections-enabled';
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
