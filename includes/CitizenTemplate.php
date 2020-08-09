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
 * BaseTemplate class for the Citizen skin
 * @ingroup Skins
 */
class CitizenTemplate extends BaseTemplate {
	/** @var array of alternate message keys for menu labels */
	private const MENU_LABEL_KEYS = [
		'tb' => 'toolbox',
		'personal' => 'personaltools',
		'lang' => 'otherlanguages',
	];

	/**
	 * @return Config
	 */
	private function getConfig() {
		return $this->config;
	}

	/**
	 * @return array Returns an array of data used by Citizen skin.
	 */
	private function getSkinData() : array {
		$skin = $this->getSkin();
		$out = $skin->getOutput();
		$title = $out->getTitle();

		// Naming conventions for Mustache parameters:
		// - Prefix "is" for boolean values.
		// - Prefix "msg-" for interface messages.
		// - Prefix "html-" for raw HTML (in front of other keys, if applicable).
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
		// From Skin::getNewtalks(). Always returns string, cast to null if empty.
		$newTalksHtml = $skin->getNewtalks() ?: null;

		$skinData = $skin->getTemplateData() + [
			'html-headelement' => $out->headElement( $skin ),

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

			'html-prebodyhtml' => $this->get( 'prebodyhtml', '' ),
			'msg-tagline' => $skin->msg( 'tagline' )->text(),

			'data-pagelinks' => $this->buildPageLinks(),

			'html-categories' => $skin->getCategories(),

			'data-footer' => [
				'html-lastmodified' => $this->getLastMod(),
				'msg-citizen-footer-desc' => $skin->msg( 'citizen-footer-desc' )->text(),
				'array-footer-rows' => $this->getFooterRows(),
				'msg-citizen-footer-tagline' => $skin->msg( 'citizen-footer-tagline' )->text(),
				'array-footer-icons' => $this->getFooterIconsRow(),
			],
		];

		return $skinData;
	}

	/**
	 * Renders the entire contents of the HTML page.
	 */
	public function execute() {
		$tp = new TemplateParser( __DIR__ . '/templates' );
		echo $tp->processTemplate( 'skin', $this->getSkinData() );
	}

	/**
	 * Render the navigation drawer
	 * Based on Vector (be3843e)
	 * @return array
	 * @throws MWException
	 * @throws Exception
	 */
	private function buildDrawer() : array {
		$skin = $this->getSkin();
		$portals = $skin->buildSidebar();
		$props = [];

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
					$portal = $this->getMenuData( 'tb',  $this->getToolbox() );
					$props[] = $portal;
					break;
				case 'LANGUAGES':
					$languages = $skin->getLanguages();
					$portal = $this->getMenuData( 'lang', $languages );
					// The language portal will be added provided either
					// languages exist or there is a value in html-after-portal
					// for example to show the add language wikidata link (T252800)
					if ( $portal['html-after-portal'] || count( $languages ) ) {
						$props[] = $portal;
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

		$personalTools = $this->getPersonalTools();
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
			'msg-citizen-drawer-toggle' => $this->getMsg( 'citizen-drawer-toggle' )->text(),
			'data-logo' => $this->buildLogo(),
			'data-portals-first' => $firstPortal,
			'array-portals-rest' => array_slice( $props, 1 ),
			'data-personal-menu' => $personalToolsPortal,
		];
	}

	/**
	 * Render the logo
	 * TODO: Use standardize classes and IDs
	 * TODO: Rebuild icon function based on Desktop Improvement Project
	 * @return array
	 * @throws MWException
	 */
	private function buildLogo() : array {
		return [
			'msg-sitetitle' => $this->getMsg( 'sitetitle' )->text(),
			'html-mainpage-attributes' => Xml::expandAttributes(
				Linker::tooltipAndAccesskeyAttribs( 'p-logo' ) + [
					'href' => Skin::makeMainPageUrl(),
				]
			),
		];
	}

	/**
	 * Echo notification badges and ULS button
	 * @return array
	 */
	private function getExtratools(): array {
		$personalTools = $this->getPersonalTools();

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
	 * @return array
	 * @throws MWException
	 */
	private function buildSearchProps() : array {
		$config = $this->getConfig();
		$skin = $this->getSkin();

		$toggleMsg = $skin->msg( 'citizen-search-toggle' )->text();
		$accessKey = Linker::accesskey( 'search' );

		return [
			'msg-citizen-search-toggle' => $toggleMsg,
			'msg-citizen-search-toggle-shortcut' => $toggleMsg . ' [alt-shift-' . $accessKey . ']',
			'form-action' => $config->get( 'Script' ),
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
	 * @return array html
	 */
	protected function buildPageTools(): array {
		$config = $this->getConfig();
		$skin = $this->getSkin();
		$condition = $config->get( 'CitizenShowPageTools' );
		$contentNavigation = $this->data['content_navigation'];
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
	 * @return array html
	 */
	private function buildPageLinks() : array {
		$contentNavigation = $this->data['content_navigation'];

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
	 * Get last modified message
	 * @return string html
	 */
	private function getLastMod() {
		$lastMod = null;
		$footerLinks = $this->getFooterLinks();

		if ( isset( $footerLinks['info'] ) && in_array( 'lastmod', $footerLinks['info'], true ) ) {
			$key = array_search( 'lastmod', $footerLinks['info'], true );
			$lastMod = $this->get( $footerLinks['info'][$key], '' );
		}

		return $lastMod;
	}

	/**
	 * Get rows that make up the footer
	 * @return array for use in Mustache template describing the footer elements.
	 */
	private function getFooterRows() : array {
		$footerRows = [];
		$footerLinks = $this->getFooterLinks();

		foreach ( $footerLinks as $category => $links ) {
			$items = [];
			$rowId = "footer-$category";

			// Unset footer-info
			if ( $category !== 'info' ) {
				foreach ( $links as $link ) {
					$items[] = [
						'id' => "$rowId-$link",
						'html' => $this->get( $link, '' ),
					];
				}

				$footerRows[] = [
					'id' => $rowId,
					'className' => '',
					'array-items' => $items
				];
			}
		}

		// Append footer-info after links
		if ( isset( $footerLinks['info'] ) ) {
			$items = [];
			$rowId = "footer-info";

			foreach ( $footerLinks['info'] as $link ) {
				// Unset lastmod from footer link
				if ( $link !== 'lastmod' ) {
					$items[] = [
						'id' => "$rowId-$link",
						'html' => $this->get( $link, '' ),
					];
				}
			}

			$footerRows[] = [
				'id' => $rowId,
				'className' => '',
				'array-items' => $items
			];
		}

		return $footerRows;
	}

	/**
	 * Get footer icons
	 * @return array for use in Mustache template describing the footer icons.
	 */
	private function getFooterIconsRow() : array {
		$footerRows = [];

		// If footer icons are enabled append to the end of the rows
		$footerIcons = $this->getFooterIcons( 'icononly' );
		if ( count( $footerIcons ) > 0 ) {
			$items = [];
			foreach ( $footerIcons as $blockName => $blockIcons ) {
				$html = '';
				foreach ( $blockIcons as $icon ) {
					$html .= $this->getSkin()->makeFooterIcon( $icon );
				}
				$items[] = [
					'id' => 'footer-' . htmlspecialchars( $blockName ) . 'ico',
					'html' => $html,
				];
			}

			$footerRows[] = [
				'id' => 'footer-icons',
				'className' => 'noprint',
				'array-items' => $items,
			];
		}

		return $footerRows;
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
		// For some menu items, there is no language key corresponding with its menu key.
		// These inconsitencies are captured in MENU_LABEL_KEYS
		$msgObj = $this->getMsg( self::MENU_LABEL_KEYS[ $label ] ?? $label );
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
}
