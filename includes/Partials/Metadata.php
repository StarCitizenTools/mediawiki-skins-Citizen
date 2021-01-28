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

		// HTTP headers
		// CSP
		$this->addCSP();

		// HSTS
		$this->addHSTS();

		// Deny X-Frame-Options
		$this->addXFrameOptions();

		// X-XSS-Protection
		$this->addXXSSProtection();

		// Referrer policy
		$this->addStrictReferrerPolicy();

		// Feature policy
		$this->addFeaturePolicy();
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

	/**
	 * Adds the csp directive if enabled in 'CitizenEnableCSP'.
	 * Directive holds the content of 'CitizenCSPDirective'.
	 */
	private function addCSP() {
		if ( $this->getConfigValue( 'CitizenEnableCSP' ) !== true ) {
			return;
		}

		$cspDirective = $this->getConfigValue( 'CitizenCSPDirective' ) ?? '';
		$cspMode = 'Content-Security-Policy';

		// Check if report mode is enabled
		if ( $this->getConfigValue( 'CitizenEnableCSPReportMode' ) === true ) {
			$cspMode = 'Content-Security-Policy-Report-Only';
		}

		$this->out->getRequest()->response()->header( sprintf( '%s: %s', $cspMode, $cspDirective ) );
	}

	/**
	 * Adds the HSTS Header. If no max age or an invalid max age is set a default of 300 will be
	 * applied.
	 * Preload and Include Subdomains can be enabled by setting 'CitizenHSTSIncludeSubdomains'
	 * and/or 'CitizenHSTSPreload' to true.
	 */
	private function addHSTS() {
		if ( $this->getConfigValue( 'CitizenEnableHSTS' ) !== true ) {
			return;
		}

		$maxAge = $this->getConfigValue( 'CitizenHSTSMaxAge' );
		$includeSubdomains = $this->getConfigValue( 'CitizenHSTSIncludeSubdomains' ) ?? false;
		$preload = $this->getConfigValue( 'CitizenHSTSPreload' ) ?? false;

		// HSTS max age
		if ( is_int( $maxAge ) ) {
			$maxAge = max( $maxAge, 0 );
		} else {
			// Default to 5 mins if input is invalid
			$maxAge = 300;
		}

		$hstsHeader = 'Strict-Transport-Security: max-age=' . $maxAge;

		if ( $includeSubdomains ) {
			$hstsHeader .= '; includeSubDomains';
		}

		if ( $preload ) {
			$hstsHeader .= '; preload';
		}

		$this->out->getRequest()->response()->header( $hstsHeader );
	}

	/**
	 * Adds the X-Frame-Options header if set in 'CitizenEnableDenyXFrameOptions'
	 */
	private function addXFrameOptions() {
		if ( $this->getConfigValue( 'CitizenEnableDenyXFrameOptions' ) === true ) {
			$this->out->getRequest()->response()->header( 'X-Frame-Options: deny' );
		}
	}

	/**
	 * Adds the X-XSS-Protection header if set in 'CitizenEnableXXSSProtection'
	 */
	private function addXXSSProtection() {
		if ( $this->getConfigValue( 'CitizenEnableXXSSProtection' ) === true ) {
			$this->out->getRequest()->response()->header( 'X-XSS-Protection: 1; mode=block' );
		}
	}

	/**
	 * Adds the referrer header if enabled in 'CitizenEnableStrictReferrerPolicy'
	 */
	private function addStrictReferrerPolicy() {
		if ( $this->getConfigValue( 'CitizenEnableStrictReferrerPolicy' ) === true ) {
			// iOS Safari, IE, Edge compatiblity
			$this->out->getRequest()->response()->header( 'Referrer-Policy: strict-origin' );
			$this->out->getRequest()->response()->header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		}
	}

	/**
	 * Adds the Feature policy header to the response if enabled in 'CitizenFeaturePolicyDirective'
	 */
	private function addFeaturePolicy() {
		if ( $this->getConfigValue( 'CitizenEnableFeaturePolicy' ) === true ) {

			$featurePolicy = $this->getConfigValue( 'CitizenFeaturePolicyDirective' ) ?? '';

			$this->out->getRequest()->response()->header( sprintf( 'Feature-Policy: %s',
				$featurePolicy ) );
		}
	}
}
