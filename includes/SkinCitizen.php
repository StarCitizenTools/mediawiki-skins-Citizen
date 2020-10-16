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

use MediaWiki\MediaWikiServices;

/**
 * Skin subclass for Citizen
 * @ingroup Skins
 */
class SkinCitizen extends SkinMustache {
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

		// Responsive layout
		// Replace with core responsive option if it is implemented in 1.36+
		$out->addMeta( 'viewport', 'width=device-width, initial-scale=1.0' );

		// Theme color
		$out->addMeta( 'theme-color', $this->getConfigValue( 'CitizenThemeColor' ) ?? '' );

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
			// Disabled style condition loading due to pop in
			$options['scripts'] = array_merge(
				$options['scripts'],
				[ 'skins.citizen.scripts.toc' ]
			);
		}

		// Generate webapp manifest
		$skin->addManifest();

		// Preconnect origin
		$skin->addPreConnect();

		// HTTP headers
		// CSP
		$skin->addCSP();

		// HSTS
		$skin->addHSTS();

		// Deny X-Frame-Options
		$skin->addXFrameOptions();

		// X-XSS-Protection
		$skin->addXXSSProtection();

		// Referrer policy
		$skin->addStrictReferrerPolicy();

		// Feature policy
		$skin->addFeaturePolicy();

		$options['templateDirectory'] = __DIR__ . '/templates';
		parent::__construct( $options );
	}

	/**
	 * @return array Returns an array of data used by Citizen skin.
	 */
	public function getTemplateData() : array {
		$skin = $this;
		$out = $skin->getOutput();
		$title = $out->getTitle();

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
		$newTalksHtml = $skin->getNewtalks() ?: null;

		$skinData = parent::getTemplateData() + [
			'msg-sitetitle' => $skin->msg( 'sitetitle' )->text(),
			'html-mainpage-attributes' => Xml::expandAttributes(
				Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) + [
					'href' => Skin::makeMainPageUrl(),
				]
			),

			'data-header' => [
				'data-drawer' => $this->buildDrawer(),
				'data-extratools' => $this->getExtraTools(),
				'data-search-box' => $this->buildSearchProps(),
			],

			'data-pagetools' => $this->buildPageTools(),

			'html-newtalk' => $newTalksHtml ? '<div class="usermessage">' . $newTalksHtml . '</div>' : '',
			'page-langcode' => $title->getPageViewLanguage()->getHtmlCode(),

			// Remember that the string '0' is a valid title.
			// From OutputPage::getPageTitle, via ::setPageTitle().
			'html-title' => $out->getPageTitle(),

			'msg-tagline' => $skin->msg( 'tagline' )->text(),

			'data-pagelinks' => $this->buildPageLinks(),

			'html-categories' => $skin->getCategories(),

			'data-footer' => $this->getFooterData(),
		];

		return $skinData;
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

		$data = [
			'html-lastmodified' => $lastMod,
			'array-footer-rows' => $footerRows,
			'array-footer-icons' => $footerIconRows,
			'msg-citizen-footer-desc' => $skin->msg( 'citizen-footer-desc' )->text(),
			'msg-citizen-footer-tagline' => $skin->msg( 'citizen-footer-tagline' )->text(),
		];

		return $data;
	}

	/**
	 * Render the navigation drawer
	 * Based on buildSidebar()
	 *
	 * @return array
	 * @throws MWException
	 * @throws Exception
	 */
	public function buildDrawer() {
		$skin = $this;
		$portals = parent::buildSidebar();
		$props = [];
		$languages = null;

		// Render portals
		foreach ( $portals as $name => $content ) {
			if ( $content === false ) {
				continue;
			}

			// Numeric strings gets an integer when set as key, cast back - T73639
			$name = (string)$name;

			switch ( $name ) {
				case 'SEARCH':
					break;
				case 'TOOLBOX':
					$portal = $this->getMenuData( 'tb',  $content );
					$props[] = $portal;
					break;
				case 'LANGUAGES':
					$languages = $skin->getLanguages();
					$portal = $this->getMenuData( 'lang', $content );
					// The language portal will be added provided either
					// languages exist or there is a value in html-after-portal
					// for example to show the add language wikidata link (T252800)
					if ( count( $content ) || $portal['html-after-portal'] ) {
						$languages = $portal;
					}
					break;
				default:
					// Historically some portals have been defined using HTML rather than arrays.
					// Let's move away from that to a uniform definition.
					if ( !is_array( $content ) ) {
						$html = $content;
						$content = [];
						wfDeprecated(
							"`content` field in portal $name must be array."
								. "Previously it could be a string but this is no longer supported.",
							'1.35.0'
						);
					} else {
						$html = false;
					}
					$portal = $this->getMenuData( $name, $content );
					if ( $html ) {
						$portal['html-items'] .= $html;
					}
					$props[] = $portal;
					break;
			}
		}

		$firstPortal = $props[0] ?? null;
		if ( $firstPortal ) {
			$firstPortal[ 'class' ] .= ' portal-first';
			// Hide label for first portal
			$firstPortal[ 'label-class' ] .= 'screen-reader-text';
		}

		$personalTools = self::getPersonalToolsForMakeListItem(
			$this->buildPersonalUrls()
		);
		// Move the Echo badges and ULS out of default list
		if ( isset( $personalTools['notifications-alert'] ) ) {
			unset( $personalTools['notifications-alert'] );
		}
		if ( isset( $personalTools['notifications-notice'] ) ) {
			unset( $personalTools['notifications-notice'] );
		}
		if ( isset( $personalTools['uls'] ) ) {
			unset( $personalTools['uls'] );
		}

		$personalToolsPortal = $this->getMenuData( 'personal', $personalTools );
		// Hide label for personal tools
		$personalToolsPortal[ 'label-class' ] .= 'screen-reader-text';

		return [
			'msg-citizen-drawer-toggle' => $skin->msg( 'citizen-drawer-toggle' )->text(),
			'data-logo' => $this->buildLogo(),
			'data-portals-first' => $firstPortal,
			'array-portals-rest' => array_slice( $props, 1 ),
			'data-portals-languages' => $languages,
			'data-personal-menu' => $personalToolsPortal,
		];
	}

	/**
	 * Render the logo
	 * TODO: Rebuild icon function based on Desktop Improvement Project
	 *
	 * @return array
	 * @throws MWException
	 */
	private function buildLogo() : array {
		$skin = $this;

		return [
			'msg-sitetitle' => $skin->msg( 'sitetitle' )->text(),
			'html-mainpage-attributes' => Xml::expandAttributes(
				Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) + [
					'href' => Skin::makeMainPageUrl(),
				]
			),
		];
	}

	/**
	 * Echo notification badges and ULS button
	 *
	 * @return array
	 */
	private function getExtratools(): array {
		$personalTools = self::getPersonalToolsForMakeListItem(
			$this->buildPersonalUrls()
		);

		// Create the Echo badges and ULS
		$extraTools = [];
		if ( isset( $personalTools['notifications-alert'] ) ) {
			$extraTools['notifications-alert'] = $personalTools['notifications-alert'];
		}
		if ( isset( $personalTools['notifications-notice'] ) ) {
			$extraTools['notifications-notice'] = $personalTools['notifications-notice'];
		}
		if ( isset( $personalTools['uls'] ) ) {
			$extraTools['uls'] = $personalTools['uls'];
		}

		$html = $this->getMenuData( 'personal-extra', $extraTools );

		// Hide label for extra tools
		$html[ 'label-class' ] .= 'screen-reader-text';

		return $html;
	}

	/**
	 * Render the search box
	 *
	 * @return array
	 * @throws MWException
	 */
	private function buildSearchProps() : array {
		$skin = $this->getSkin();

		$toggleMsg = $skin->msg( 'citizen-search-toggle' )->text();
		$accessKey = Linker::accesskey( 'search' );

		return [
			'msg-citizen-search-toggle' => $toggleMsg,
			'msg-citizen-search-toggle-shortcut' => $toggleMsg . ' [alt-shift-' . $accessKey . ']',
			'form-action' => $this->getConfigValue( 'Script' ),
			'html-input' => $this->makeSearchInput( [ 'id' => 'searchInput' ] ),
			'msg-search' => $skin->msg( 'search' ),
			'page-title' => SpecialPage::getTitleFor( 'Search' )->getPrefixedDBkey(),
			'html-random-href' => Skin::makeSpecialUrl( 'Randompage' ),
			'msg-random' => $skin->msg( 'Randompage' )->text(),
		];
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
		$contentNavigation = $this->buildContentNavigationUrls();
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

			$actionhtml = $this->getMenuData( 'views', $contentNavigation[ 'views' ] ?? [] );
			$actionmorehtml = $this->getMenuData( 'actions', $contentNavigation[ 'actions' ] ?? [] );

			if ( $actionhtml ) {
				$actionhtml[ 'label-class' ] .= 'screen-reader-text';
			}

			if ( $actionmorehtml ) {
				$actionmorehtml[ 'label-class' ] .= 'screen-reader-text';
			}

			$props = [
				'data-page-actions' => $actionhtml,
				'data-page-actions-more' => $actionmorehtml,
			];
		}

		return $props;
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

	/**
	 * @param string $label to be used to derive the id and human readable label of the menu
	 *  If the key has an entry in the constant MENU_LABEL_KEYS then that message will be used for the
	 *  human readable text instead.
	 * @param array $urls to convert to list items stored as string in html-items key
	 * @param array $options (optional) to be passed to makeListItem
	 * @return array
	 */
	private function getMenuData(
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
		$class = ( count( $urls ) === 0 && !$props['html-after-portal'] )
			? ' mw-portal-empty' : '';
		$props['class'] = $class;
		return $props;
	}

	/**
	 * getConfig() wrapper to catch exceptions.
	 * Returns null on exception
	 *
	 * @param string $key
	 * @return mixed|null
	 * @see SkinTemplate::getConfig()
	 */
	private function getConfigValue( $key ) {
		try {
			$value = $this->getConfig()->get( $key );
		} catch ( ConfigException $e ) {
			$value = null;
		}

		return $value;
	}

	/**
	 * Adds the manifest if enabled in 'CitizenEnableManifest'.
	 * Manifest link will be empty if wfExpandUrl throws an exception.
	 */
	private function addManifest() {
		$out = $this->getOutput();

		if ( $this->getConfigValue( 'CitizenEnableManifest' ) === true ) {
			try {
				$href =
					wfExpandUrl( wfAppendQuery( wfScript( 'api' ),
						[ 'action' => 'webapp-manifest' ] ), PROTO_RELATIVE );
			} catch ( Exception $e ) {
				$href = '';
			}

			$out->addLink( [
				'rel' => 'manifest',
				'href' => $href,
			] );
		}
	}

	/**
	 * Adds a preconnect header if enabled in 'CitizenEnablePreconnect'
	 */
	private function addPreConnect() {
		$out = $this->getOutput();

		if ( $this->getConfigValue( 'CitizenEnablePreconnect' ) === true ) {
			$out->addLink( [
				'rel' => 'preconnect',
				'href' => $this->getConfigValue( 'CitizenPreconnectURL' ),
			] );
		}
	}

	/**
	 * Adds the csp directive if enabled in 'CitizenEnableCSP'.
	 * Directive holds the content of 'CitizenCSPDirective'.
	 */
	private function addCSP() {
		$out = $this->getOutput();

		if ( $this->getConfigValue( 'CitizenEnableCSP' ) === true ) {

			$cspDirective = $this->getConfigValue( 'CitizenCSPDirective' ) ?? '';
			$cspMode = 'Content-Security-Policy';

			// Check if report mode is enabled
			if ( $this->getConfigValue( 'CitizenEnableCSPReportMode' ) === true ) {
				$cspMode = 'Content-Security-Policy-Report-Only';
			}

			$out->getRequest()->response()->header( sprintf( '%s: %s', $cspMode,
				$cspDirective ) );
		}
	}

	/**
	 * Adds the HSTS Header. If no max age or an invalid max age is set a default of 300 will be
	 * applied.
	 * Preload and Include Subdomains can be enabled by setting 'CitizenHSTSIncludeSubdomains'
	 * and/or 'CitizenHSTSPreload' to true.
	 */
	private function addHSTS() {
		$out = $this->getOutput();

		if ( $this->getConfigValue( 'CitizenEnableHSTS' ) === true ) {

			$maxAge = $this->getConfigValue( 'CitizenHSTSMaxAge' );
			$includeSubdomains = $this->getConfigValue( 'CitizenHSTSIncludeSubdomains' ) ?? false;
			$preload = $this->getConfigValue( 'CitizenHSTSPreload' ) ?? false;

			// HSTS max age
			if ( is_int( $maxAge ) ) {
				$maxAge = max( $maxAge, 0 );
			} else {
				// Default to 5 mins if input is invalid
				$maxAge = 300;
			}

			$hstsHeader = 'Strict-Transport-Security: max-age=' . $maxAge;

			if ( $includeSubdomains ) {
				$hstsHeader .= '; includeSubDomains';
			}

			if ( $preload ) {
				$hstsHeader .= '; preload';
			}

			$out->getRequest()->response()->header( $hstsHeader );
		}
	}

	/**
	 * Adds the X-Frame-Options header if set in 'CitizenEnableDenyXFrameOptions'
	 */
	private function addXFrameOptions() {
		$out = $this->getOutput();

		if ( $this->getConfigValue( 'CitizenEnableDenyXFrameOptions' ) === true ) {
			$out->getRequest()->response()->header( 'X-Frame-Options: deny' );
		}
	}

	/**
	 * Adds the X-XSS-Protection header if set in 'CitizenEnableXXSSProtection'
	 */
	private function addXXSSProtection() {
		$out = $this->getOutput();

		if ( $this->getConfigValue( 'CitizenEnableXXSSProtection' ) === true ) {
			$out->getRequest()->response()->header( 'X-XSS-Protection: 1; mode=block' );
		}
	}

	/**
	 * Adds the referrer header if enabled in 'CitizenEnableStrictReferrerPolicy'
	 */
	private function addStrictReferrerPolicy() {
		$out = $this->getOutput();

		if ( $this->getConfigValue( 'CitizenEnableStrictReferrerPolicy' ) === true ) {
			// iOS Safari, IE, Edge compatiblity
			$out->getRequest()->response()->header( 'Referrer-Policy: strict-origin' );
			$out->getRequest()->response()->header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		}
	}

	/**
	 * Adds the Feature policy header to the response if enabled in 'CitizenFeaturePolicyDirective'
	 */
	private function addFeaturePolicy() {
		$out = $this->getOutput();

		if ( $this->getConfigValue( 'CitizenEnableFeaturePolicy' ) === true ) {

			$featurePolicy = $this->getConfigValue( 'CitizenFeaturePolicyDirective' ) ?? '';

			$out->getRequest()->response()->header( sprintf( 'Feature-Policy: %s',
				$featurePolicy ) );
		}
	}
}
