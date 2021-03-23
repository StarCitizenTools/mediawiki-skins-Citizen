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
use ExtensionRegistry;
use MWException;
use Skin;
use SpecialPage;

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

		$portalLabel = $this->getConfigValue( 'CitizenPortalAttach' ) ?? 'first';

		$firstPortal = array_shift( $props );

		if ( $portalLabel === 'first' && $firstPortal !== null && isset( $firstPortal['html-items'] ) ) {
			$this->addToolboxLinksToDrawer( $firstPortal['html-items'] );
		} else {
			for ( $i = 0, $portalCount = count( $props ); $i < $portalCount; $i++ ) {
				if ( isset( $props[$i]['label'] ) && $props[$i]['label'] === $portalLabel ) {
					$this->addToolboxLinksToDrawer( $props[$i]['html-items'] );
					break;
				}
			}
		}

		$portals = [
			'msg-citizen-drawer-toggle' => $this->skin->msg( 'citizen-drawer-toggle' )->text(),
			'msg-citizen-drawer-search' => $this->skin->msg( 'citizen-drawer-search' )->text(),
			'data-portals-first' => $firstPortal,
			'array-portals-rest' => $props,
			'data-portals-languages' => $languages,
			'data-drawer-sitestats' => $this->getSiteStats(),
			'data-drawer-subsearch' => false,
		];

		// Drawer subsearch
		if ( $this->getConfigValue( 'CitizenEnableDrawerSubSearch' ) ) {
			$portals['data-drawer-subsearch'] = true;
		}

		return $portals;
	}

	/**
	 * Get messages used for site stats in the drawer
	 *
	 * @return array for use in Mustache template.
	 */
	private function getSiteStats() {
		$props = [];

		if ( $this->getConfigValue( 'CitizenEnableDrawerSiteStats' ) ) {
			$stats = [ 'articles', 'images', 'users', 'edits' ];
			$items = [];

			foreach ( $stats as &$stat ) {
				$items[] = [
					'id' => $stat,
					'value' => number_format( call_user_func( 'SiteStats::' . $stat ) ),
					'label' => $this->skin->msg( "citizen-sitestats-$stat-label" )->text(),
				];
			}
		}

		$props['array-drawer-sitestats-item'] = $items;
		return $props;
	}

	/**
	 * Add a link to special pages and the upload form to the first portal in the drawer
	 *
	 * @param string &$htmlItems
	 *
	 * @return void
	 * @throws MWException
	 */
	private function addToolboxLinksToDrawer( &$htmlItems ) {
		// First add a link to special pages
		$htmlItems .= $this->skin->makeListItem( 'specialpages', [
			'href' => Skin::makeSpecialUrl( 'Specialpages' ),
			'id' => 't-specialpages'
		] );

		$uploadHref = Skin::makeSpecialUrl( 'Upload' );

		if ( ExtensionRegistry::getInstance()->isLoaded( 'Upload Wizard' ) ) {
			$uploadHref = SpecialPage::getTitleFor( 'UploadWizard' )->getLocalURL();
		}

		// Then add a link to the upload form
		$htmlItems .= $this->skin->makeListItem( 'upload', [
			'href' => $uploadHref,
			'id' => 't-upload'
		] );
	}
}
