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

use Citizen\GetConfigTrait;
use Citizen\Partials\Drawer;
use Citizen\Partials\Header;
use Citizen\Partials\Metadata;
use Citizen\Partials\Theme;
use MediaWiki\MediaWikiServices;

/**
 * Skin subclass for Citizen
 * @ingroup Skins
 */
class SkinCitizen extends SkinMustache {
	use GetConfigTrait;

	/** @var array of alternate message keys for menu labels */
	private const MENU_LABEL_KEYS = [
		'tb' => 'toolbox',
		'personal' => 'personaltools',
		'lang' => 'otherlanguages',
	];

	/**
	 * Overrides template, styles and scripts module
	 *
	 * @inheritDoc
	 */
	public function __construct( $options = [] ) {
		$skin = $this;
		$out = $skin->getOutput();

		$metadata = new Metadata( $out );
		$skinTheme = new Theme( $out );

		$metadata->addMetadata();

		// Theme handler
		$skinTheme->setSkinTheme( $options );

		// Load Citizen search suggestion styles if enabled
		if ( $this->getConfigValue( 'CitizenEnableSearch' ) === true ) {
			$options['styles'] = array_merge(
				$options['styles'],
				[
					'skins.citizen.styles.search',
					'skins.citizen.icons.search'
				]
			);
		}

		// Load Citizen image lazyload modules if enabled
		if ( $this->getConfigValue( 'CitizenEnableLazyload' ) === true ) {
			$options['scripts'] = array_merge(
				$options['scripts'],
				[ 'skins.citizen.scripts.lazyload' ]
			);
			$options['styles'] = array_merge(
				$options['styles'],
				[ 'skins.citizen.styles.lazyload' ]
			);
		}

		// Load table of content script if ToC presents
		if ( $out->isTOCEnabled() ) {
			// Add class to body that notifies the page has TOC
			$out->addBodyClasses( 'skin-citizen-has-toc' );
			// Disabled style condition loading due to pop in
			$options['scripts'] = array_merge(
				$options['scripts'],
				[ 'skins.citizen.scripts.toc' ]
			);
		}

		$options['templateDirectory'] = __DIR__ . '/templates';
		parent::__construct( $options );
	}

	/**
	 * @return array Returns an array of data used by Citizen skin.
	 * @throws MWException
	 */
	public function getTemplateData() : array {
		$out = $this->getOutput();
		$title = $out->getTitle();

		$drawer = new Drawer( $this );
		$header = new Header( $this );

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
		$newTalksHtml = $this->getNewtalks() ?: null;

		return parent::getTemplateData() + [
			'msg-sitetitle' => $this->msg( 'sitetitle' )->text(),
			'html-mainpage-attributes' => Xml::expandAttributes(
				Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) + [
					'href' => Skin::makeMainPageUrl(),
				]
			),
			'data-logos' => $drawer->getLogoData(),

			'data-header' => [
				'data-drawer' => $drawer->buildDrawer(),
				'data-extratools' => $header->getExtraTools(),
				'data-personal-menu' => $header->buildPersonalMenu(),
				'data-theme-toggle' => $header->buildThemeToggleProps(),
				'data-search-box' => $header->buildSearchProps(),
			],

			'data-pagetools' => $this->buildPageTools(),

			'html-newtalk' => $newTalksHtml ? '<div class="usermessage">' . $newTalksHtml . '</div>' : '',
			'page-langcode' => $title->getPageViewLanguage()->getHtmlCode(),

			// Remember that the string '0' is a valid title.
			// From OutputPage::getPageTitle, via ::setPageTitle().
			'html-title' => $out->getPageTitle(),

			'msg-tagline' => $this->msg( 'tagline' )->text(),

			'data-pagelinks' => $this->buildPageLinks(),

			'html-categories' => $this->getCategories(),

			'data-footer' => $this->getFooterData(),
		];
	}

	/**
	 * Change access to public, as it is used in partials
	 *
	 * @return array
	 */
	public function buildPersonalUrls() {
		return parent::buildPersonalUrls();
	}

	/**
	 * @param string $label to be used to derive the id and human readable label of the menu
	 *  If the key has an entry in the constant MENU_LABEL_KEYS then that message will be used for the
	 *  human readable text instead.
	 * @param array $urls to convert to list items stored as string in html-items key
	 * @param array $options (optional) to be passed to makeListItem
	 * @return array
	 */
	public function getMenuData(
		string $label,
		array $urls = [],
		array $options = []
	) : array {
		$skin = $this->getSkin();

		// For some menu items, there is no language key corresponding with its menu key.
		// These inconsitencies are captured in MENU_LABEL_KEYS
		$msgObj = $skin->msg( self::MENU_LABEL_KEYS[ $label ] ?? $label );
		$props = [
			'id' => "p-$label",
			'label-class' => null,
			'label-id' => "p-{$label}-label",
			// If no message exists fallback to plain text (T252727)
			'label' => $msgObj->exists() ? $msgObj->text() : $label,
			'html-items' => '',
			'html-tooltip' => Linker::tooltip( 'p-' . $label ),
		];

		foreach ( $urls as $key => $item ) {
			$props['html-items'] .= $this->makeListItem( $key, $item, $options );
		}

		$props['html-after-portal'] = $this->getAfterPortlet( $label );

		// Mark the portal as empty if it has no content
		$class = ( empty( $urls ) && !$props['html-after-portal'] )
			? ' mw-portal-empty' : '';
		$props['class'] = $class;
		return $props;
	}

	/**
	 * @inheritDoc
	 *
	 * Manually disable links to upload and speacial pages
	 * as they are moved from the toolbox to the drawer
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
	 * Render page-related tools
	 * Possible visibility conditions:
	 * * true: always visible (bool)
	 * * false: never visible (bool)
	 * * 'login': only visible if logged in (string)
	 * * 'permission-*': only visible if user has permission
	 *   e.g. permission-edit = only visible if user can edit pages
	 *
	 * @return array html
	 */
	protected function buildPageTools(): array {
		$skin = $this;
		$condition = $this->getConfigValue( 'CitizenShowPageTools' );
		$contentNavigation = parent::buildContentNavigationUrls();
		$portals = parent::buildSidebar();
		$props = [];

		// Login-based condition, return true if condition is met
		if ( $condition === 'login' ) {
			$condition = $skin->getUser()->isLoggedIn();
		}

		// Permission-based condition, return true if condition is met
		if ( is_string( $condition ) && strpos( $condition, 'permission' ) === 0 ) {
			$permission = substr( $condition, 11 );
			try {
				$condition = MediaWikiServices::getInstance()->getPermissionManager()->userCan(
					$permission, $skin->getUser(), $skin->getTitle() );
			} catch ( Exception $e ) {
				$condition = false;
			}
		}

		if ( $condition === true ) {

			$viewshtml = $this->getMenuData( 'views', $contentNavigation[ 'views' ] ?? [] );
			$actionshtml = $this->getMenuData( 'actions', $contentNavigation[ 'actions' ] ?? [] );
			$toolboxhtml = $this->getMenuData( 'tb',  $portals['TOOLBOX'] ?? [] );

			if ( $viewshtml ) {
				$viewshtml[ 'label-class' ] .= 'screen-reader-text';
			}

			if ( $actionshtml ) {
				$actionshtml[ 'label-class' ] .= 'screen-reader-text';
			}

			$props = [
				'data-page-views' => $viewshtml,
				'data-page-actions' => $actionshtml,
				'data-page-toolbox' => $toolboxhtml,
			];
		}

		return $props;
	}

	/**
	 * Get rows that make up the footer
	 * @return array for use in Mustache template describing the footer elements.
	 */
	private function getFooterData() : array {
		$skin = $this;
		$footerLinks = $this->getFooterLinks();
		$lastMod = null;
		$footerRows = [];
		$footerIconRows = [];

		// Get last modified message
		if ( $footerLinks['info']['lastmod'] && isset( $footerLinks['info']['lastmod'] ) ) {
			$lastMod = $footerLinks['info']['lastmod'];
		}

		foreach ( $footerLinks as $category => $links ) {
			$items = [];
			$rowId = "footer-$category";

			// Unset footer-info
			if ( $category !== 'info' ) {
				foreach ( $links as $key => $link ) {
					// Link may be null. If so don't include it.
					if ( $link ) {
						$items[] = [
							'id' => "$rowId-$key",
							'html' => $link,
						];
					}
				}

				$footerRows[] = [
					'id' => $rowId,
					'className' => null,
					'array-items' => $items
				];
			}
		}

		// Append footer-info after links
		if ( isset( $footerLinks['info'] ) ) {
			$items = [];
			$rowId = "footer-info";

			foreach ( $footerLinks['info'] as $key => $link ) {
				// Don't include lastmod and null link
				if ( $key !== 'lastmod' && $link ) {
					$items[] = [
						'id' => "$rowId-$key",
						'html' => $link,
					];
				}
			}

			$footerRows[] = [
				'id' => $rowId,
				'className' => null,
				'array-items' => $items
			];
		}

		// If footer icons are enabled append to the end of the rows
		$footerIcons = $this->getFooterIcons();
		if ( count( $footerIcons ) > 0 ) {
			$items = [];
			foreach ( $footerIcons as $blockName => $blockIcons ) {
				$html = '';
				foreach ( $blockIcons as $icon ) {
					// Only output icons which have an image.
					// For historic reasons this mimics the `icononly` option
					// for BaseTemplate::getFooterIcons.
					if ( is_string( $icon ) || isset( $icon['src'] ) ) {
						$html .= $skin->makeFooterIcon( $icon );
					}
				}
				// For historic reasons this mimics the `icononly` option
				// for BaseTemplate::getFooterIcons. Empty rows should not be output.
				if ( $html ) {
					$items[] = [
						'id' => 'footer-' . htmlspecialchars( $blockName ) . 'ico',
						'html' => $html,
					];
				}
			}

			$footerIconRows[] = [
				'id' => 'footer-icons',
				'className' => 'noprint',
				'array-items' => $items,
			];
		}

		return [
			'html-lastmodified' => $lastMod,
			'array-footer-rows' => $footerRows,
			'array-footer-icons' => $footerIconRows,
			'msg-citizen-footer-desc' => $skin->msg( 'citizen-footer-desc' )->text(),
			'msg-citizen-footer-tagline' => $skin->msg( 'citizen-footer-tagline' )->text(),
		];
	}

	/**
	 * Render page-related links at the bottom
	 *
	 * @return array html
	 */
	private function buildPageLinks() : array {
		$contentNavigation = $this->buildContentNavigationUrls();

		$namespaceshtml = $this->getMenuData( 'namespaces', $contentNavigation[ 'namespaces' ] ?? [] );
		$variantshtml = $this->getMenuData( 'variants', $contentNavigation[ 'variants' ] ?? [] );

		if ( $namespaceshtml ) {
			$namespaceshtml[ 'label-class' ] .= 'screen-reader-text';
		}

		if ( $variantshtml ) {
			$variantshtml[ 'label-class' ] .= 'screen-reader-text';
		}

		return [
			'data-namespaces' => $namespaceshtml,
			'data-variants' => $variantshtml,
		];
	}
}
