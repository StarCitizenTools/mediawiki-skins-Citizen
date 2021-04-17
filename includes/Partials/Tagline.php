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
		$tagline = '';

		if ( $title ) {
			// Use short description if there is any
			// from Extension:ShortDescription
			if ( $shortdesc ) {
				$tagline = $shortdesc;
			} else {
				$namespaceText = $title->getNsText();
				// Check if namespaceText exists
				// Return null if main namespace or not defined
				if ( $namespaceText ) {
					$msg = $this->skin->msg( 'citizen-tagline-ns-' . strtolower( $namespaceText ) );
					// Use custom message if exists
					if ( !$msg->isDisabled() ) {
						$tagline = $msg->text();
					} else {
						// No tagline if special page
						if ( $title->isSpecialPage() ) {
							$tagline = '';
						// Use generic talk page message if talk page
						} elseif ( $title->isTalkPage() ) {
							$tagline = $this->skin->msg( 'citizen-tagline-ns-talk' )->text();
						// Fallback to site tagline
						} else {
							$tagline = $this->skin->msg( 'tagline' )->text();
						}
					}
				} else {
					$tagline = $this->skin->msg( 'tagline' )->text();
				}
			}
		}

		return $tagline;
	}
}
