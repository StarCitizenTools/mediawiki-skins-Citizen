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

namespace MediaWiki\Skins\Citizen\Partials;

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
		$skin = $this->skin;

		$drawer = [];
		$drawerData = $skin->buildSidebar();
		$portletCount = 0;

		// Render portlets
		foreach ( $drawerData as $name => $items ) {
			if ( is_array( $items ) ) {
				// Numeric strings gets an integer when set as key, cast back - T73639
				$name = (string)$name;
				switch ( $name ) {
					// Ignore search
					// Handled by Header
					case 'SEARCH':
						break;
					// Ignore toolbox
					// Handled by PageTools
					case 'TOOLBOX':
						break;
					// Ignore language
					// Handled by PageTools
					case 'LANGUAGES':
						break;
					default:
						$drawer[] = $skin->getPortletData( $name, $items );
						// All portlets within the drawer should have a label
						// to ensure it is layout nicely
						$drawer[$portletCount]['has-label'] = true;
						$portletCount++;
						break;
				}
			}
		}

		$drawer = $this->addSiteTools( $drawer, $portletCount );

		$drawerData = [
			'array-portlets' => $drawer,
			'data-drawer-sitestats' => $this->getSiteStatsData(),
		];

		return $drawerData;
	}

	/**
	 * Add site-wide tools to portlet
	 *
	 * TODO: Remove this hack when Desktop Improvements separate page and site tools
	 * FIXME: There are no error handling if the ID does not match any existing portlet
	 *
	 * @param array $drawer
	 * @param int $portletCount
	 * @return array
	 */
	private function addSiteTools( $drawer, $portletCount ): array {
		$id = $this->getConfigValue( 'CitizenSiteToolsPortlet' );
		$html = $this->getSiteToolsHTML();

		// Attach to first portlet if empty
		if ( empty( $id ) ) {
			$drawer[0]['html-items'] .= $html;
			return $drawer;
		}

		// Find the portlet with the right ID, then add to it
		for ( $i = 0; $i < $portletCount; $i++ ) {
			if ( isset( $drawer[$i]['id'] ) && $drawer[$i]['id'] === $id ) {
				$drawer[$i]['html-items'] .= $html;
				break;
			}
		}

		return $drawer;
	}

	/**
	 * Build site-wide tools HTML
	 * We removed some site-wide tools from TOOLBOX, now add it back
	 *
	 * TODO: Remove this hack when Desktop Improvements separate page and site tools
	 *
	 * @return string RawHTML
	 * @throws MWException
	 */
	private function getSiteToolsHTML(): string {
		$skin = $this->skin;

		$html = '';

		// Special pages
		$html .= $skin->makeListItem( 'specialpages', [
			'href' => Skin::makeSpecialUrl( 'Specialpages' ),
			'id' => 't-specialpages'
		] );

		// Upload file
		if ( ExtensionRegistry::getInstance()->isLoaded( 'Upload Wizard' ) ) {
			// Link to Upload Wizard if present
			$uploadHref = SpecialPage::getTitleFor( 'UploadWizard' )->getLocalURL();
		} else {
			// Link to old upload form
			$uploadHref = Skin::makeSpecialUrl( 'Upload' );
		}
		$html .= $skin->makeListItem( 'upload', [
			'href' => $uploadHref,
			'id' => 't-upload'
		] );

		return $html;
	}

	/**
	 * Get messages used for site stats in the drawer
	 *
	 * @return array for use in Mustache template.
	 */
	private function getSiteStatsData(): array {
		$props = [];

		if ( $this->getConfigValue( 'CitizenEnableDrawerSiteStats' ) ) {
			$skin = $this->skin;
			$stats = [ 'articles', 'images', 'users', 'edits' ];
			$items = [];
			$fmt = null;

			// Get NumberFormatter here so that we don't have to call it for every stats
			if ( $this->getConfigValue( 'CitizenUseNumberFormatter' ) && class_exists( \NumberFormatter::class ) ) {
				$locale = $skin->getLanguage()->getHtmlCode() ?? 'en_US';
				$fmt = new \NumberFormatter( $locale, \NumberFormatter::PADDING_POSITION );
				$fmt->setAttribute( \NumberFormatter::ROUNDING_MODE, \NumberFormatter::ROUND_DOWN );
				$fmt->setAttribute( \NumberFormatter::MAX_FRACTION_DIGITS, 1 );
			}

			foreach ( $stats as &$stat ) {
				$items[] = [
					'id' => $stat,
					'value' => $this->getSiteStatValue( $stat, $fmt ),
					'label' => $skin->msg( "citizen-sitestats-$stat-label" )->text(),
				];
			}
		}

		$props['array-drawer-sitestats-item'] = $items;
		return $props;
	}

	/**
	 * Get and format sitestat value
	 *
	 * @param string $key
	 * @param NumberFormatter|null $fmt
	 * @return string
	 */
	private function getSiteStatValue( $key, $fmt ): string {
		$value = call_user_func( 'SiteStats::' . $key ) ?? '';

		if ( $fmt ) {
			return $fmt->format( $value );
		} else {
			return number_format( $value );
		}
	}
}
