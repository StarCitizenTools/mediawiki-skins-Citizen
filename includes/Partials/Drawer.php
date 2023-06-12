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
	 * Decorate sidebar template data
	 *
	 * @return array
	 * @throws Exception
	 */
	public function decorateSidebarData( $sidebarData ) {
		for ( $i = 0; $i < count( $sidebarData['array-portlets-rest'] ); $i++ ) {
			if ( $sidebarData['array-portlets-rest'][$i]['id'] === 'p-tb' ) {
				// Remove toolbox since it is handled by page tools
				unset( $sidebarData['array-portlets-rest'][$i] );
				break;
			}
		}

		// Reset index after unsetting toolbox
		$sidebarData['array-portlets-rest'] = array_values( $sidebarData['array-portlets-rest'] );

		return $sidebarData;
	}

	/**
	 * Get messages used for site stats in the drawer
	 *
	 * @return array for use in Mustache template.
	 */
	public function getSiteStatsData(): array {
		if ( !$this->getConfigValue( 'CitizenEnableDrawerSiteStats' ) ) {
			return [];
		}

		$skin = $this->skin;
		// Key => Icon
		$map = [
			'articles' => 'article',
			'images' => 'image',
			'users' => 'userAvatar',
			'edits' => 'edit'
		];
		$items = [];
		$fmt = null;

		// Get NumberFormatter here so that we don't have to call it for every stats
		if ( $this->getConfigValue( 'CitizenUseNumberFormatter' ) && class_exists( \NumberFormatter::class ) ) {
			$locale = $skin->getLanguage()->getHtmlCode() ?? 'en_US';
			$fmt = new \NumberFormatter( $locale, \NumberFormatter::PADDING_POSITION );
			$fmt->setAttribute( \NumberFormatter::ROUNDING_MODE, \NumberFormatter::ROUND_DOWN );
			$fmt->setAttribute( \NumberFormatter::MAX_FRACTION_DIGITS, 1 );
		}

		foreach ( $map as $key => $icon ) {
			$items[] = [
				'id' => $key,
				'icon' => $icon,
				'value' => $this->getSiteStatValue( $key, $fmt ),
				'label' => $skin->msg( "citizen-sitestats-$key-label" )->text(),
			];
		}

		return [
			'array-drawer-sitestats-item' => $items
		];
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
