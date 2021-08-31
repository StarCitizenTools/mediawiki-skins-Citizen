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

final class Metadata extends Partial {

	/**
	 * Adds metadata to the output page
	 */
	public function addMetadata() {
		// Responsive layout
		// Replace with core responsive option if it is implemented in 1.36+
		$this->out->addMeta( 'viewport', 'width=device-width, initial-scale=1.0' );

		// Theme color
		$this->out->addMeta( 'theme-color', $this->getConfigValue( 'CitizenThemeColor' ) ?? '' );

		// Generate webapp manifest
		$this->addManifest();

		// Preconnect origin
		$this->addPreConnect();
	}

	/**
	 * Adds the manifest if enabled in 'CitizenEnableManifest'.
	 * Manifest link will be empty if wfExpandUrl throws an exception.
	 */
	private function addManifest() {
		if ( $this->getConfigValue( 'CitizenEnableManifest' ) !== true ) {
			return;
		}

		try {
			$href =
				wfExpandUrl( wfAppendQuery( wfScript( 'api' ),
					[ 'action' => 'webapp-manifest' ] ), PROTO_RELATIVE );
		} catch ( Exception $e ) {
			$href = '';
		}

		$this->out->addLink( [
			'rel' => 'manifest',
			'href' => $href,
		] );
	}

	/**
	 * Adds a preconnect header if enabled in 'CitizenEnablePreconnect'
	 */
	private function addPreConnect() {
		if ( $this->getConfigValue( 'CitizenEnablePreconnect' ) !== true ) {
			return;
		}

		$this->out->addLink( [
			'rel' => 'preconnect',
			'href' => $this->getConfigValue( 'CitizenPreconnectURL' ),
		] );
	}
}
