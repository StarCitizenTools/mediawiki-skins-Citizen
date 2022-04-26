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

namespace Citizen\Hooks;

use MediaWiki\Hook\BeforePageDisplayHook;
use MediaWiki\Skins\Hook\SkinPageReadyConfigHook;
use OutputPage;
use ResourceLoaderContext;
use Skin;

/**
 * Hooks to run relating the skin
 */
class SkinHooks implements SkinPageReadyConfigHook, BeforePageDisplayHook {

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
	public function onSkinPageReadyConfig( ResourceLoaderContext $context, array &$config ): void {
		// It's better to exit before any additional check
		if ( $context->getSkin() !== 'citizen' ) {
			return;
		}

		// Tell the `mediawiki.page.ready` module not to wire up search.
		$config['search'] = false;
	}

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
		// @phpcs:ignore Generic.Files.LineLength.TooLong
		$script = sprintf(
			'<script%s>%s</script>',
			$nonce !== false ? sprintf( ' nonce="%s"', $nonce ) : '',
			'window.applyPref=()=>{const a="skin-citizen-",b={fontsize:"font-size",pagewidth:"--width-layout",lineheight:"--line-height"},c=()=>["auto","dark","light"].map(b=>a+b),d=a=>{let b=document.getElementById("citizen-style");null===b&&(b=document.createElement("style"),b.setAttribute("id","citizen-style"),document.head.appendChild(b)),b.textContent=`:root{${a}}`};try{const e=window.localStorage.getItem("skin-citizen-theme");let f="";if(null!==e){const b=document.documentElement;b.classList.remove(...c(a)),b.classList.add(a+e)}for(const[c,d]of Object.entries(b)){const b=window.localStorage.getItem(a+c);null!==b&&(f+=`${d}:${b};`)}f&&d(f)}catch(a){}},(()=>{const a="skin-citizen-theme";if("auto"===window.localStorage.getItem("skin-citizen-theme")){const b=window.matchMedia("(prefers-color-scheme: dark)")?"dark":"light";window.localStorage.setItem(a,b),window.applyPref(),window.localStorage.setItem(a,"auto")}else window.applyPref()})();'
		);

		$out->addHeadItem( 'skin.citizen.inline', $script );
	}
}
