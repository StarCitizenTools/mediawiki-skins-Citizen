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

/**
 * Footer partial of Skin Citizen
 */
final class Footer extends Partial {

	/**
	 * Get rows that make up the footer
	 * @return array for use in Mustache template describing the footer elements.
	 */
	public function getFooterData(): array {
		$skin = $this->skin;

		$data = [];
		$footerLinks = $skin->getFooterLinksPublic();

		// Based on SkinMustache
		// Backported because of 1.35 support
		foreach ( $footerLinks as $category => $links ) {
			$items = [];
			$rowId = "footer-$category";

			foreach ( $links as $key => $link ) {
				if ( $link ) {
					$items[] = [
						'id' => "$rowId-$key",
						'html' => $link,
						// This is not great, need to reimplemented when we move to 1.39
						'label' => $skin->msg( "citizen-page-info-$key" )
					];
				}
			}

			$data['data-citizen-' . $category] = [
				'id' => $rowId,
				'className' => null,
				'array-items' => $items
			];
		}

		return $data;
	}
}
