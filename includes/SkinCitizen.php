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

use MediaWiki\Skins\Citizen\Components\CitizenComponentMainMenu;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageHeading;
use MediaWiki\Skins\Citizen\Components\CitizenComponentPageSidebar;
use MediaWiki\Skins\Citizen\Components\CitizenComponentSearchBox;
use MediaWiki\Skins\Citizen\Components\CitizenComponentSiteStats;
use MediaWiki\Skins\Citizen\Partials\BodyContent;
use MediaWiki\Skins\Citizen\Partials\Footer;
use MediaWiki\Skins\Citizen\Partials\Header;
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
	 * @inheritDoc
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
		$data = [];

		$config = $this->getConfig();
		$localizer = $this->getContext();
		$out = $this->getOutput();
		$title = $this->getTitle();
		$user = $this->getUser();
		$pageLang = $title->getPageLanguage();

		$header = new Header( $this );
		$bodycontent = new BodyContent( $this );
		$footer = new Footer( $this );
		$tools = new PageTools( $this );

		// Naming conventions for Mustache parameters.
		//
		// Value type (first segment):
		// - Prefix "is" or "has" for boolean values.
		// - Prefix "msg-" for interface message text.
		// - Prefix "html-" for raw HTML.
		// - Prefix "data-" for an array of template parameters that should be passed directly
		//   to a template partial.
		// - Prefix "array-" for lists of any values.
		//
		// Source of value (first or second segment)
		// - Segment "page-" for data relating to the current page (e.g. Title, WikiPage, or OutputPage).
		// - Segment "hook-" for any thing generated from a hook.
		//   It should be followed by the name of the hook in hyphenated lowercase.
		//
		// Conditionally used values must use null to indicate absence (not false or '').

		$data += [
			// Booleans
			'toc-enabled' => !empty( $parentData['data-toc'] ),
			// Data objects
			'data-user-info' => $header->getUserInfoData( $parentData['data-portlets']['data-user-page'] ),
			'html-body-content--formatted' => $bodycontent->decorateBodyContent( $parentData['html-body-content'] ),
			// Messages
			// Needed to be parsed here as it should be wikitext
			'msg-citizen-footer-desc' => $this->msg( "citizen-footer-desc" )->inContentLanguage()->parse(),
			'msg-citizen-footer-tagline' => $this->msg( "citizen-footer-tagline" )->inContentLanguage()->parse(),
			'data-footer' => $footer->decorateFooterData( $parentData['data-footer'] ),
		];

		$data += $tools->getPageToolsData( $parentData );

		$components = [
			'data-page-heading' => new CitizenComponentPageHeading(
				$localizer,
				$out,
				$title,
				$parentData['html-title-heading'],
				$user
			),
			'data-content-sidebar' => new CitizenComponentPageSidebar(
				$localizer,
				$out,
				$pageLang,
				$title,
				$user
			),
			'data-main-menu' => new CitizenComponentMainMenu( $parentData['data-portlets-sidebar'] ),
			'data-search-box' => new CitizenComponentSearchBox(
				$parentData['data-search-box'],
				$this
			),
			'data-site-stats' => new CitizenComponentSiteStats(
				$config,
				$localizer,
				$pageLang
			)
		];

		foreach ( $components as $key => $component ) {
			// Array of components or null values.
			if ( $component ) {
				$parentData[$key] = $component->getTemplateData();
			}
		}

		return array_merge( $parentData, $data );
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
