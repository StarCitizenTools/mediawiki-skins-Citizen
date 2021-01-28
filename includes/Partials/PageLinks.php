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

final class PageLinks extends Partial {

	/**
	 * Render page-related links at the bottom
	 *
	 * @return array html
	 */
	public function buildPageLinks() : array {
		$contentNavigation = $this->skin->buildContentNavigationUrlsPublic();

		$namespaceshtml = $this->skin->getMenuData( 'namespaces', $contentNavigation[ 'namespaces' ] ?? [] );
		$variantshtml = $this->skin->getMenuData( 'variants', $contentNavigation[ 'variants' ] ?? [] );

		if ( $namespaceshtml ) {
			$namespaceshtml[ 'label-class' ] .= 'screen-reader-text';
		}

		if ( $variantshtml ) {
			$variantshtml[ 'label-class' ] .= 'screen-reader-text';
		}

		return [
			'data-namespaces' => $namespaceshtml,
			'data-variants' => $variantshtml,
		];
	}
}
