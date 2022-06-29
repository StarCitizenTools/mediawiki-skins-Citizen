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
		// phpcs:disable Generic.Files.LineLength.TooLong
		$script = sprintf(
			'<script%s>%s</script>',
			$nonce !== false ? sprintf( ' nonce="%s"', $nonce ) : '',
			'window.applyPref=()=>{const a="skin-citizen-",b="skin-citizen-theme",c=a=>window.localStorage.getItem(a),d=c("skin-citizen-theme"),e=()=>{const d={fontsize:"font-size",pagewidth:"--width-layout",lineheight:"--line-height"},e=()=>["auto","dark","light"].map(b=>a+b),f=a=>{let b=document.getElementById("citizen-style");null===b&&(b=document.createElement("style"),b.setAttribute("id","citizen-style"),document.head.appendChild(b)),b.textContent=`:root{${a}}`};try{const g=c(b);let h="";if(null!==g){const b=document.documentElement;b.classList.remove(...e(a)),b.classList.add(a+g)}for(const[b,e]of Object.entries(d)){const d=c(a+b);null!==d&&(h+=`${e}:${d};`)}h&&f(h)}catch(a){}};if("auto"===d){const a=window.matchMedia("(prefers-color-scheme: dark)"),c=a.matches?"dark":"light",d=(a,b)=>window.localStorage.setItem(a,b);d(b,c),e(),a.addEventListener("change",()=>{e()}),d(b,"auto")}else e()},(()=>{window.applyPref()})();'
		);
		// phpcs:enable Generic.Files.LineLength.TooLong

		$out->addHeadItem( 'skin.citizen.inline', $script );
	}
}
