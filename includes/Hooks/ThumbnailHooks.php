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

use ConfigException;
use MediaWiki\Hook\ThumbnailBeforeProduceHTMLHook;
use MediaWiki\MediaWikiServices;
use RequestContext;
use ThumbnailImage;

/**
 * Hooks to tun relating thumbnails
 */
class ThumbnailHooks implements ThumbnailBeforeProduceHTMLHook {

	/**
	 * Lazyload images
	 * Modified from the Lazyload extension
	 * Looks for thumbnail and swap src to data-src
	 *
	 * @param ThumbnailImage $thumbnail
	 * @param array &$attribs
	 * @param array &$linkAttribs
	 * @return bool
	 */
	public function onThumbnailBeforeProduceHTML( $thumbnail, &$attribs, &$linkAttribs ) {
		try {
			$lazyloadEnabled = self::getSkinConfig( 'CitizenEnableLazyload' );
		} catch ( ConfigException $e ) {
			$lazyloadEnabled = false;
		}

		// Replace thumbnail if lazyload is enabled
		if ( $lazyloadEnabled === true ) {
			$file = $thumbnail->getFile();

			if ( $file !== null ) {
				$request = RequestContext::getMain()->getRequest();

				if ( defined( 'MW_API' ) && $request->getVal( 'action' ) === 'parse' ) {
					return true;
				}

				// Set lazy class for the img
				if ( isset( $attribs['class'] ) ) {
					$attribs['class'] .= ' lazy';
				} else {
					$attribs['class'] = 'lazy';
				}

				// Native API
				$attribs['loading'] = 'lazy';

				$attribs['data-src'] = $attribs['src'];
				$attribs['src'] = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D';

				if ( isset( $attribs['srcset'] ) ) {
					$attribs['data-srcset'] = $attribs['srcset'];
					$attribs['srcset'] = '';
				}
			}
		}

		return true;
	}

	/**
	 * Get a skin configuration variable.
	 *
	 * @param string $name Name of configuration option.
	 * @return mixed Value configured.
	 * @throws ConfigException
	 */
	private static function getSkinConfig( $name ) {
		return MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'Citizen' )->get( $name );
	}
}
