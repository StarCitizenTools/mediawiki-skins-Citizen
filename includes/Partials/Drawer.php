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

namespace Citizen\Partials;

use Exception;
use ResourceLoaderSkinModule;
use Skin;

/**
 * Drawer partial of Skin Citizen
 * Generates the following partials:
 * - Logo
 * - Drawer
 *   + Special Pages Link
 *   + Upload Link
 */
final class Drawer extends Partial {
	/**
	 * Get and pick the correct logo based on types and variants
	 * Based on getLogoData() in MW 1.36
	 *
	 * @return array
	 */
	public function getLogoData() : array {
		$logoData = ResourceLoaderSkinModule::getAvailableLogos( $this->skin->getConfig() );

		// check if the logo supports variants
		$variantsLogos = $logoData['variants'] ?? null;

		if ( $variantsLogos ) {
			$preferred = $this->skin->getOutput()->getTitle()
				->getPageViewLanguage()->getCode();
			$variantOverrides = $variantsLogos[$preferred] ?? null;
			// Overrides the logo
			if ( $variantOverrides ) {
				foreach ( $variantOverrides as $key => $val ) {
					$logoData[$key] = $val;
				}
			}
		}

		return $logoData;
	}

	/**
	 * Render the navigation drawer
	 * Based on buildSidebar()
	 *
	 * @return array
	 * @throws Exception
	 */
	public function buildDrawer() {
		$portals = $this->skin->buildSidebar();
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
				case 'TOOLBOX':
					break;
				case 'LANGUAGES':
					$languages = $this->skin->getLanguages();
					$portal = $this->skin->getMenuData( 'lang', $content );
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
					$portal = $this->skin->getMenuData( $name, $content );
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

			if ( isset( $firstPortal['html-items'] ) ) {
				$this->addToolboxLinksToDrawer( $firstPortal['html-items'] );
			}
		}

		return [
			'msg-citizen-drawer-toggle' => $this->skin->msg( 'citizen-drawer-toggle' )->text(),
			'data-portals-first' => $firstPortal,
			'array-portals-rest' => array_slice( $props, 1 ),
			'data-portals-languages' => $languages,
		];
	}

	/**
	 * Add a link to special pages and the upload form to the first portal in the drawer
	 *
	 * @param string &$htmlItems
	 *
	 * @return void
	 */
	private function addToolboxLinksToDrawer( &$htmlItems ) {
		// First add a link to special pages
		$htmlItems .= $this->skin->makeListItem( 'specialpages', [
			'href' => Skin::makeSpecialUrl( 'Specialpages' ),
			'id' => 't-specialpages'
		] );

		// Then add a link to the upload form
		$htmlItems .= $this->skin->makeListItem( 'upload', [
			'href' => Skin::makeSpecialUrl( 'Upload' ),
			'id' => 't-upload'
		] );
	}
}
