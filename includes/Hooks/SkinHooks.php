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

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Hooks;

use ExtensionRegistry;
use Html;
use Language;
use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Hook\SidebarBeforeOutputHook;
use MediaWiki\Hook\SkinBuildSidebarHook;
use MediaWiki\Hook\SkinEditSectionLinksHook;
use MediaWiki\ResourceLoader as RL;
use MediaWiki\Skins\Citizen\GetConfigTrait;
use MediaWiki\Skins\Hook\SkinPageReadyConfigHook;
use MediaWiki\Title\Title;
use OutputPage;
use Skin;
use SkinTemplate;
use SpecialPage;

/**
 * Hooks to run relating the skin
 */
class SkinHooks implements
	BeforePageDisplayHook,
	SidebarBeforeOutputHook,
	SkinBuildSidebarHook,
	SkinEditSectionLinksHook,
	SkinPageReadyConfigHook
{
	use GetConfigTrait;

	/**
	 * Adds the inline theme switcher script to the page
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public function onBeforePageDisplay( $out, $skin ): void {
		// It's better to exit before any additional check
		if ( $skin->getSkinName() !== 'citizen' ) {
			return;
		}

		if ( $this->getConfigValue( 'CitizenEnablePreferences', $out ) === true ) {
			$script = file_get_contents( MW_INSTALL_PATH . '/skins/Citizen/resources/skins.citizen.scripts/inline.js' );
			$script = Html::inlineScript( $script );
			$script = RL\ResourceLoader::filter( 'minify-js', $script );
			$out->addHeadItem( 'skin.citizen.inline', $script );
		}
	}

	/**
	 * Modify toolbox links
	 * For some reason onSkinBuildSidebar was not able to get toolbox
	 * So we need to use this hook instead
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SidebarBeforeOutput
	 * @param Skin $skin
	 * @param array &$sidebar
	 */
	public function onSidebarBeforeOutput( $skin, &$sidebar ): void {
		// Be extra safe because it might be active on other skins with caching
		if ( $skin->getSkinName() === 'citizen' && $sidebar ) {
			if ( isset( $sidebar['TOOLBOX'] ) ) {
				self::updateToolboxMenu( $sidebar );
			}
		}
	}

	/**
	 * Modify sidebar links
	 * This is cached compared to onSidebarBeforeOutput
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinBuildSidebar
	 * @param Skin $skin
	 * @param array &$bar
	 */
	public function onSkinBuildSidebar( $skin, &$bar ): void {
		// Be extra safe because it might be active on other skins with caching
		if ( $skin->getSkinName() !== 'citizen' || !$bar ) {
			return;
		}

		$out = $skin->getOutput();
		$globalToolsId = $this->getConfigValue( 'CitizenGlobalToolsPortlet', $out );
		// remove initial p- for backward compatibility
		$name = empty( $globalToolsId ) ? 'navigation' : preg_replace( '/^p-/', '', $globalToolsId );
		$bar[$name]['specialpages'] = [
			'text'  => $skin->msg( 'specialpages' ),
			'href'  => Skin::makeSpecialUrl( 'Specialpages' ),
			'title' => $skin->msg( 'tooltip-t-specialpages' ),
			'icon'  => 'specialPages',
			'id'    => 't-specialpages',
		];

		if ( $this->getConfigValue( 'EnableUploads', $out ) === true ) {
			if ( ExtensionRegistry::getInstance()->isLoaded( 'Upload Wizard' ) ) {
				// Link to Upload Wizard if present
				$uploadHref = SpecialPage::getTitleFor( 'UploadWizard' )->getLocalURL();
			} else {
				// Link to old upload form
				$uploadHref = Skin::makeSpecialUrl( 'Upload' );
			}
			$bar[$name]['upload'] = [
				'text'  => $skin->msg( 'upload' ),
				'href'  => $uploadHref,
				'title' => $skin->msg( 'tooltip-t-upload' ),
				'icon'  => 'upload',
				'id'    => 't-upload',
			];
		}

		foreach ( $bar as $key => $item ) {
			self::addIconsToMenuItems( $bar, $key );
		}
	}

	/**
	 * Modify editsection links
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinEditSectionLinks
	 * @param Skin $skin
	 * @param Title $title
	 * @param string $section
	 * @param string $sectionTitle
	 * @param array &$result
	 * @param Language $lang
	 */
	public function onSkinEditSectionLinks( $skin, $title, $section, $sectionTitle, &$result, $lang ) {
		// Be extra safe because it might be active on other skins with caching
		if ( $skin->getSkinName() !== 'citizen' || !$result ) {
			return;
		}

		// Add icon to edit section link
		// If VE button is present, use wikiText icon
		if ( isset( $result['veeditsection'] ) ) {
			self::appendClassToItem(
				$result['veeditsection']['attribs']['class'],
				'citizen-editsection-icon mw-ui-icon-wikimedia-edit'
			);
			self::appendClassToItem(
				$result['editsection']['attribs']['class'],
				'citizen-editsection-icon mw-ui-icon-wikimedia-wikiText'
			);
		} elseif ( isset( $result['editsection'] ) ) {
			self::appendClassToItem(
				$result['editsection']['attribs']['class'],
				'citizen-editsection-icon mw-ui-icon-wikimedia-edit'
			);
		}
	}

	/**
	 * SkinPageReadyConfig hook handler
	 *
	 * Replace searchModule provided by skin.
	 *
	 * @since 1.36
	 * @param RL\Context $context
	 * @param mixed[] &$config Associative array of configurable options
	 * @return void This hook must not abort, it must return no value
	 */
	public function onSkinPageReadyConfig( $context, array &$config ): void {
		// It's better to exit before any additional check
		if ( $context->getSkin() !== 'citizen' ) {
			return;
		}

		// Tell the `mediawiki.page.ready` module not to wire up search.
		$config['search'] = false;
	}

	/**
	 * Modify navigation links
	 *
	 * TODO: Update to a proper hook when T287622 is resolved
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinTemplateNavigation::Universal
	 * @param SkinTemplate $sktemplate
	 * @param array &$links
	 */
	public static function onSkinTemplateNavigation( $sktemplate, &$links ): void {
		// Be extra safe because it might be active on other skins with caching
		if ( $sktemplate->getSkinName() !== 'citizen' ) {
			return;
		}

		if ( isset( $links['actions'] ) ) {
			self::updateActionsMenu( $links );
		}

		if ( isset( $links['associated-pages'] ) ) {
			self::updateAssociatedPagesMenu( $links );
		}

		if ( isset( $links['notifications'] ) ) {
			self::updateNotificationsMenu( $links );
		}

		if ( isset( $links['user-menu'] ) ) {
			self::updateUserMenu( $sktemplate, $links );
		}

		if ( isset( $links['user-interface-preferences'] ) ) {
			self::updateUserInterfacePreferencesMenu( $sktemplate, $links );
		}

		if ( isset( $links['views'] ) ) {
			self::updateViewsMenu( $links );
		}
	}

	/**
	 * Update actions menu items
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 * @param array &$links
	 */
	private static function updateActionsMenu( &$links ) {
		// Most icons are not mapped yet in the actions menu
		$iconMap = [
			'delete' => 'trash',
			'move' => 'move',
			'protect' => 'lock',
			'unprotect' => 'unLock',
			// Extension:Purge
			// Extension:SemanticMediaWiki
			'purge' => 'reload',
			// Extension:Cargo
			'cargo-purge'  => 'reload',
			// Extension:DiscussionTools
			'dt-page-subscribe' => 'bell'
		];

		self::mapIconsToMenuItems( $links, 'actions', $iconMap );
		self::addIconsToMenuItems( $links, 'actions' );
	}

	/**
	 * Update associated pages menu items
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 * @param array &$links
	 */
	private static function updateAssociatedPagesMenu( &$links ) {
		// Most icons are not mapped yet in the associated pages menu
		$iconMap = [
			'main' => 'article',
			'file' => 'image',
			'talk' => 'speechBubbles',
			'user' => 'userAvatar'
		];

		// Special handling for talk pages
		// Since talk keys have namespace as prefix
		foreach ( $links['associated-pages'] as $key => $item ) {
			$keyStr = (string)$key;
			// TODO: use str_ends_with when we drop PHP 7.X
			if ( substr( $keyStr, -5 ) === '_talk' ) {
				// Extract the namespace key from the talk key (e.g. Project from Project_talk)
				// TODO: use str_starts_with when we drop PHP 7.X
				$namespace = substr( $keyStr, 0, -5 );
				$links['associated-pages'][$key]['icon'] = 'speechBubbles';
				$links['associated-pages'][$namespace]['icon'] = 'arrowPrevious';
			}
		}

		self::mapIconsToMenuItems( $links, 'associated-pages', $iconMap );
		self::addIconsToMenuItems( $links, 'associated-pages' );
	}

	/**
	 * Update toolbox menu items
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 * @param array &$links
	 */
	private static function updateToolboxMenu( &$links ) {
		// Most icons are not mapped yet in the toolbox menu
		$iconMap = [
			'whatlinkshere' => 'articleRedirect',
			'recentchangeslinked' => 'recentChanges',
			'print' => 'printer',
			'permalink' => 'link',
			'info' => 'infoFilled',
			'contributions' => 'userContributions',
			'log' => 'history',
			'blockip' => 'block',
			'emailuser' => 'message',
			'userrights' => 'userGroup',
			// Extension:Cargo
			'cargo-pagevalues' => 'database',
			// Extension:CiteThisPage
			'citethispage' => 'quotes',
			// Extension:CreateRedirect
			'createredirect' => 'articleRedirect',
			// Extension:SemanticMediaWiki
			'smwbrowselink' => 'database',
			// Extension:UrlShortener
			'urlshortener' => 'link',
			'urlshortener-qrcode' => 'qrCode',
			// Extension:Wikibase
			'wikibase' => 'logoWikidata'
		];

		self::mapIconsToMenuItems( $links, 'TOOLBOX', $iconMap );
		self::addIconsToMenuItems( $links, 'TOOLBOX' );
	}

	/**
	 * Update notifications menu
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 * @param array &$links
	 */
	private static function updateNotificationsMenu( &$links ) {
		$iconMap = [
			'notifications-alert' => 'bell',
			'notifications-notice' => 'tray'
		];

		self::mapIconsToMenuItems( $links, 'notifications', $iconMap );
		self::addIconsToMenuItems( $links, 'notifications' );

		/**
		 * Echo has styles that control icons rendering in places we don't want them.
		 * Based on fixEcho() from Vector, see T343838
		 */
		foreach ( $links['notifications'] as &$item ) {
			$icon = $item['icon'] ?? null;
			if ( $icon ) {
				$linkClass = $item['link-class'] ?? [];
				$newLinkClass = [
					// Allows Echo to react to clicks
					'citizen-echo-notification-badge',
					'citizen-header__button',
					'mw-echo-notification-badge-nojs'
				];
				if ( in_array( 'mw-echo-unseen-notifications', $linkClass ) ) {
					$newLinkClass[] = 'mw-echo-unseen-notifications';
				}
				$item['link-class'] = $newLinkClass;
			}
		}
	}

	/**
	 * Update user menu
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 * @param SkinTemplate $sktemplate
	 * @param array &$links
	 */
	private static function updateUserMenu( $sktemplate, &$links ) {
		$user = $sktemplate->getUser();
		$isRegistered = $user->isRegistered();
		$isTemp = $user->isTemp();

		if ( $isTemp ) {
			// Remove temporary user page text from user menu and recreate it in user info
			unset( $links['user-menu']['tmpuserpage'] );
			// Remove links as they are added to the bottom of user menu later
			// unset( $links['user-menu']['logout'] );
		} elseif ( $isRegistered ) {
			// Remove user page link from user menu and recreate it in user info
			unset( $links['user-menu']['userpage'] );
		} else {
			// Remove anon user page text from user menu and recreate it in user info
			unset( $links['user-menu']['anonuserpage'] );
		}

		self::addIconsToMenuItems( $links, 'user-menu' );
	}

	/**
	 * Update user interface preferences menu
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 * @param SkinTemplate $sktemplate
	 * @param array &$links
	 */
	private static function updateUserInterfacePreferencesMenu( $sktemplate, &$links ) {
		self::addIconsToMenuItems( $links, 'user-interface-preferences' );
	}

	/**
	 * Update views menu items
	 *
	 * @internal used inside Hooks\SkinHooks::onSkinTemplateNavigation
	 * @param array &$links
	 */
	private static function updateViewsMenu( &$links ) {
		// Most icons are not mapped yet in the views menu
		$iconMap = [
			'view' => 'article',
			// View source button only appears when the user do not have permission
			'viewsource' => 'editLock',
			'history' => 'history',
			'edit' => 'edit',
			'view-foreign' => 'linkExternal',
			// Extension:VisualEditor
			've-edit' => 'edit',
			// Extension:DiscussionTools
			'addsection' => 'speechBubbleAdd'
		];

		// If both visual edit and source edit buttons are present
		if ( isset( $links['views']['ve-edit'] ) && isset( $links['views']['edit'] ) ) {
			// Add a class so that we can make a merged button through CSS
			self::appendClassToItem( $links['views']['ve-edit']['class'], [ 'citizen-ve-edit-merged' ] );
			self::appendClassToItem( $links['views']['edit']['class'], [ 'citizen-ve-edit-merged' ] );
			// Use wikiText icon instead of edit icon for source edit
			$iconMap['edit'] = 'wikiText';
		}

		self::mapIconsToMenuItems( $links, 'views', $iconMap );
		self::addIconsToMenuItems( $links, 'views' );
	}

	/**
	 * Set the icon parameter of the menu item based on the mapping
	 *
	 * @param array &$links
	 * @param string $menu identifier
	 * @param array $map icon mapping
	 */
	private static function mapIconsToMenuItems( &$links, $menu, $map ) {
		foreach ( $map as $key => $icon ) {
			if ( isset( $links[$menu][$key] ) ) {
				$links[$menu][$key]['icon'] ??= $icon;
			}
		}
	}

	/**
	 * Add the HTML needed for icons to menu items
	 *
	 * @param array &$links
	 * @param string $menu identifier
	 */
	private static function addIconsToMenuItems( &$links, $menu ) {
		// Loop through each menu to check/append its link classes.
		foreach ( $links[$menu] as $key => $item ) {
			$icon = $item['icon'] ?? '';

			if ( $icon ) {
				// Html::makeLink will pass this through rawElement
				// Avoid using mw-ui-icon in case its styles get loaded
				// Sometimes extension includes the "wikimedia-" part in the icon key (e.g. ULS),
				// so we apply both classes just to be safe
				$links[$menu][$key]['link-html'] = '<span class="citizen-ui-icon mw-ui-icon-' . $icon . ' mw-ui-icon-wikimedia-' . $icon . '"></span>';
			}
		}
	}

	/**
	 * Adds class to a property
	 * Based on Vector
	 *
	 * @param array|string &$item to update
	 * @param array|string $classes to add to the item
	 */
	private static function appendClassToItem( &$item, $classes ) {
		$existingClasses = $item;

		if ( is_array( $existingClasses ) ) {
			// Treat as array
			$newArrayClasses = is_array( $classes ) ? $classes : [ trim( $classes ) ];
			$item = array_merge( $existingClasses, $newArrayClasses );
		} elseif ( is_string( $existingClasses ) ) {
			// Treat as string
			$newStrClasses = is_string( $classes ) ? trim( $classes ) : implode( ' ', $classes );
			$item .= ' ' . $newStrClasses;
		} else {
			// Treat as whatever $classes is
			$item = $classes;
		}

		if ( is_string( $item ) ) {
			$item = trim( $item );
		}
	}
}
