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

use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Hook\SkinTemplateNavigation__UniversalHook;
use MediaWiki\Skins\Hook\SkinPageReadyConfigHook;
use OutputPage;
use Skin;

/**
 * Hooks to run relating the skin
 */
class SkinHooks implements
	BeforePageDisplayHook,
	SkinPageReadyConfigHook,
	SkinTemplateNavigation__UniversalHook
{
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

		$nonce = $out->getCSP()->getNonce();

		// Script content at 'skins.citizen.scripts.theme/inline.js
		// phpcs:disable Generic.Files.LineLength.TooLong
		$script = sprintf(
			'<script%s>%s</script>',
			$nonce !== false ? sprintf( ' nonce="%s"', $nonce ) : '',
			'window.applyPref=()=>{const a="skin-citizen-",b="skin-citizen-theme",c=a=>window.localStorage.getItem(a),d=c("skin-citizen-theme"),e=()=>{const d={fontsize:"font-size",pagewidth:"--width-layout",lineheight:"--line-height"},e=()=>["auto","dark","light"].map(b=>a+b),f=a=>{let b=document.getElementById("citizen-style");null===b&&(b=document.createElement("style"),b.setAttribute("id","citizen-style"),document.head.appendChild(b)),b.textContent=`:root{${a}}`};try{const g=c(b);let h="";if(null!==g){const b=document.documentElement;b.classList.remove(...e(a)),b.classList.add(a+g)}for(const[b,e]of Object.entries(d)){const d=c(a+b);null!==d&&(h+=`${e}:${d};`)}h&&f(h)}catch(a){}};if("auto"===d){const a=window.matchMedia("(prefers-color-scheme: dark)"),c=a.matches?"dark":"light",d=(a,b)=>window.localStorage.setItem(a,b);d(b,c),e(),a.addEventListener("change",()=>{e()}),d(b,"auto")}else e()},(()=>{window.applyPref()})();'
		);
		// phpcs:enable Generic.Files.LineLength.TooLong

		$out->addHeadItem( 'skin.citizen.inline', $script );
	}

	/**
	 * SkinPageReadyConfig hook handler
	 *
	 * Replace searchModule provided by skin.
	 *
	 * @since 1.35
	 * @param ResourceLoaderContext $context
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
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/SkinTemplateNavigation::Universal
	 * @param SkinTemplate $sktemplate
	 * @param array &$links
	 */
	public function onSkinTemplateNavigation__Universal( $sktemplate, &$links ): void {
		// Be extra safe because it might be active on other skins with caching
		if ( $sktemplate->getSkinName() === 'citizen' ) {
			if ( isset( $links['actions'] ) ) {
				self::updateActionsMenu( $sktemplate, $links );
			}

			if ( isset( $links['user-menu'] ) ) {
				self::updateUserMenu( $sktemplate, $links );
			}
		}
	}

	/**
	 * Update actions menu items
	 *
	 * @param SkinTemplate $sktemplate
	 * @param array &$links
	 */
	private static function updateActionsMenu( $sktemplate, &$links ) {
		// Most icons are not mapped yet in the actions menu
		$iconMap = [
			'delete' => 'trash',
			'move' => 'move',
			'protect' => 'lock',
			'unprotect' => 'unLock'
		];

		foreach( $iconMap as $key => $icon ) {
			if ( isset( $links['actions'][$key] ) ) {
				$links['actions'][$key]['icon'] ??= $icon;
			}
		}

		self::addIconsToMenuItems( $links, 'actions' );
	}

	/**
	 * Update user menu
	 *
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
			// Remove links as they are added to the bottom of user menu later
			// unset( $links['user-menu']['createaccount'] );
			// unset( $links['user-menu']['login'] );
			// unset( $links['user-menu']['login-private'] );
		}

		self::addIconsToMenuItems( $links, 'user-menu' );
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

			if( $icon ) {
				// Html::makeLink will pass this through rawElement
				// Avoid using mw-ui-icon in case its styles get loaded
				$links[$menu][$key]['link-html'] = '<span class="citizen-ui-icon mw-ui-icon-' . $icon . ' mw-ui-icon-wikimedia-' . $icon . '"></span>';
			}
		}
	}
}
