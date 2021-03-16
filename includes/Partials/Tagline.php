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

/**
 * Tagline partial of Skin Citizen
 */
final class Tagline extends Partial {

	/**
	 * Get tagline message
	 *
	 * @return string
	 */
	public function getTagline( $out ) {
		$title = $out->getTitle();
		$shortdesc = $out->getProperty( 'shortdesc' );

		// Use short description if there is any
		// from Extension:ShortDescription
		if ( $shortdesc ) {
			$tagline = $shortdesc;
		} else {
			$tagline = $this->skin->msg( 'tagline' )->text();
		}

		return $tagline;
	}
}
