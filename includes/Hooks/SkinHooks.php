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
			'window.applyPref=()=>{var e;try{const t=document.documentElement,i=window.localStorage.getItem("skin-citizen-theme"),n=window.localStorage.getItem("skin-citizen-fontsize"),l=window.localStorage.getItem("skin-citizen-pagewidth"),o=window.localStorage.getItem("skin-citizen-lineheight");null!==i&&(t.classList.remove(...(e="skin-citizen-",["auto","dark","light"].map(t=>e+t))),t.classList.add("skin-citizen-"+i)),null!==n&&t.style.setProperty("font-size",n),null!==l&&t.style.setProperty("--width-layout",l),null!==o&&t.style.setProperty("--line-height",o)}catch(t){}},window.applyPref();'
		);

		$out->addHeadItem( 'skin.citizen.inline', $script );
	}
}
