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
	 * @param OutputPage $out OutputPage
	 * @return string
	 */
	public function getTagline( $out ) {
		$title = $out->getTitle();
		$shortdesc = $out->getProperty( 'shortdesc' );

		if ( $title ) {
			// Use short description if there is any
			// from Extension:ShortDescription
			if ( $shortdesc ) {
				$tagline = $shortdesc;
			} else {
				switch ( $title->getNamespace() ) {
					// Default MW namespaces
					// Special
					// Don't show tagline for special pages
					case -1:
						$tagline = '';
						break;
					// Talk pages
					case 1:
					case 3:
					case 5:
					case 7:
					case 9:
					case 11:
					case 13:
					case 15:
						$tagline = $this->skin->msg( 'citizen-tagline-ns-talk' )->text();
						break;
					/*
					// User pages
					case 2:
						$tagline = $this->buildUserTagline( $title );
						break;
					*/
					// Project pages
					case 4:
						$tagline = $this->skin->msg( 'citizen-tagline-ns-project' )->text();
						break;
					// File pages
					case 6:
						$tagline = $this->skin->msg( 'citizen-tagline-ns-file' )->text();
						break;
					// MediaWiki namespace
					case 8:
						$tagline = $this->skin->msg( 'citizen-tagline-ns-mediawiki' )->text();
						break;
					// Template page
					case 10:
						$tagline = $this->skin->msg( 'citizen-tagline-ns-template' )->text();
						break;
					// Help page
					case 12:
						$tagline = $this->skin->msg( 'citizen-tagline-ns-help' )->text();
						break;
					// Category page
					case 14:
						$tagline = $this->skin->msg( 'citizen-tagline-ns-category' )->text();
						break;
					default:
						$tagline = $this->skin->msg( 'tagline' )->text();
				}
			}
		}

		return $tagline;
	}
}
