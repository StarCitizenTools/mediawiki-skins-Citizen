<?php
/**
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 */

use MediaWiki\MediaWikiServices;

/**
 * Hook handlers for Citizen skin.
 *
 * Hook handler method names should be in the form of:
 *	on<HookName>()
 */
class CitizenHooks {

	public static function BeforePageDisplay($out, $skin) {
		$out->addModules( 'skins.citizen.bpd' );
		return true;
	}

	/**
	 * ResourceLoaderGetConfigVars hook handler for setting a config variable
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetConfigVars
	 *
	 * @param array &$vars Array of variables to be added into the output of the startup module.
	 * @return bool
	 */
	public static function onResourceLoaderGetConfigVars( &$vars ) {
		$config = MediaWikiServices::getInstance()->getConfigFactory()
			->makeConfig( 'Citizen' );

		$vars['wgCitizenEnablePreconnect'] = $config->get( 'CitizenEnablePreconnect' );
		$vars['wgCitizenPreconnectOrigin'] = $config->get( 'CitizenPreconnectOrigin' );

		return true;
	}

	/**
	 * Lazyload images
	 * Modified from the Lazyload extension
	 * Looks for thumbnail and swap src to data-src
	 */
	public static function ThumbnailBeforeProduceHTML($thumb, &$attribs, &$linkAttribs) {

		$file = $thumb->getFile();

		if ( $file ) {
			global $wgRequest, $wgTitle;
			if (defined('MW_API') && $wgRequest->getVal('action') === 'parse') return true;
			if (isset($wgTitle) && $wgTitle->getNamespace() === NS_FILE) return true;

			// Set lazy class for the img
			$attribs['class'] = 'lazy';

			// Native API
			$attribs['loading'] = 'lazy';

			$attribs['data-src'] = $attribs['src'];
			$attribs['data-width'] = $attribs['width'];
			$attribs['data-height'] = $attribs['height'];

			// Replace src with small size image
			$attribs['src'] = preg_replace('#/\d+px-#', '/10px-', $attribs['src']);
			// $attribs['src'] = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

			// So that the 10px thumbnail is enlarged to the right size
			$attribs['width'] = $attribs['data-width'];
			$attribs['height'] = $attribs['data-height'];

			// Clean up
			unset($attribs['data-width']);
			unset($attribs['data-height']);

			if (isset($attribs['srcset'])) {
					$attribs['data-srcset'] = $attribs['srcset'];
					unset($attribs['srcset']);
			}
		}
		return true;
	}
}
