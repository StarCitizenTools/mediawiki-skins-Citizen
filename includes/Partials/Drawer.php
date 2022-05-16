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
	 * Based on getPortletsTemplateData in SkinTemplate
	 *
	 * @return array
	 * @throws Exception
	 */
	public function getDrawerTemplateData() {
		$drawer = [];
		$drawerData = $this->skin->buildSidebar();
		$languages = null;

		// Render portals
		foreach ( $drawerData as $name => $items ) {
			if ( is_array( $items ) ) {
				// Numeric strings gets an integer when set as key, cast back - T73639
				$name = (string)$name;
				switch ( $name ) {
					// ignore search
					case 'SEARCH':
					// we build in PageTools instead
					case 'TOOLBOX':
						break;
					case 'LANGUAGES':
						$languages = $this->skin->getLanguages();
						$portal = $this->skin->getPortletData( 'lang', $items );
						// The language portal will be added provided either
						// languages exist or there is a value in html-after-portal
						// for example to show the add language wikidata link (T252800)
						if ( count( $items ) || $portal['html-after-portal'] ) {
							$languages = $portal;
						}
						break;
					default:
						$drawer[] = $this->skin->getPortletData( $name, $items );
						break;
				}
			}
		}

		$portalLabel = $this->getConfigValue( 'CitizenPortalAttach' ) ?? 'first';

		$firstPortal = array_shift( $drawer );

		if ( $portalLabel === 'first' && $firstPortal !== null && isset( $firstPortal['html-items'] ) ) {
			$this->addToolboxLinksToDrawer( $firstPortal['html-items'] );
		} else {
			for ( $i = 0, $portalCount = count( $drawer ); $i < $portalCount; $i++ ) {
				if ( isset( $drawer[$i]['label'] ) && $drawer[$i]['label'] === $portalLabel ) {
					$this->addToolboxLinksToDrawer( $drawer[$i]['html-items'] );
					break;
				}
			}
		}

		$drawerData = [
			'msg-citizen-drawer-toggle' => $this->skin->msg( 'citizen-drawer-toggle' )->text(),
			'data-portals-first' => $firstPortal,
			'array-portals-rest' => $drawer,
			'data-portals-languages' => $languages,
			'data-drawer-sitestats' => $this->getSiteStats(),
		];

		return $drawerData;
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
			$fmt = new \NumberFormatter( 'en_US', \NumberFormatter::PADDING_POSITION );
			$fmt->setAttribute( \NumberFormatter::ROUNDING_MODE, \NumberFormatter::ROUND_DOWN );
			$fmt->setAttribute( \NumberFormatter::MAX_FRACTION_DIGITS, 1 );

			foreach ( $stats as &$stat ) {
				$items[] = [
					'id' => $stat,
					'value' => $this->getSiteStat( $stat ),
					'label' => $this->skin->msg( "citizen-sitestats-$stat-label" )->text(),
				];
			}
		}

		$props['array-drawer-sitestats-item'] = $items;
		return $props;
	}

	/**
	 * Get and format sitestat value
	 * TODO: Formatting should be based on user locale
	 *
	 * @param string $key
	 *
	 * @return int
	 */
	private function getSiteStat( $key ) {
		$value = call_user_func( 'SiteStats::' . $key );

		if ( $value >= 10000 ) {
			$fmt = new \NumberFormatter( 'en_US', \NumberFormatter::PADDING_POSITION );
			$fmt->setAttribute( \NumberFormatter::ROUNDING_MODE, \NumberFormatter::ROUND_DOWN );
			$fmt->setAttribute( \NumberFormatter::MAX_FRACTION_DIGITS, 1 );

			$value = $fmt->format( $value );
		} else {
			$value = number_format( $value );
		}

		return $value;
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
