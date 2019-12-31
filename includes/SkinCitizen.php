<?php

/**
 * SkinTemplate class for the Citizen skin
 *
 * @ingroup Skins
 */
class SkinCitizen extends SkinTemplate {
	public $skinname = 'citizen';
	public $stylename = 'Citizen';
	public $template = 'CitizenTemplate';

	/**
	 * @var OutputPage
	 */
	private $out;

	/**
	 * ResourceLoader
	 *
	 * @param OutputPage $out
	 */
	public function initPage( OutputPage $out ) {
		$this->out = $out;
		// Responsive layout
		$out->addMeta( 'viewport', 'width=device-width, initial-scale=1.0' );

		// Theme color
		$out->addMeta( 'theme-color', $this->getConfigValue( 'CitizenThemeColor' ) ?? '' );

		// Preconnect origin
		$this->addPreConnect();

		// Generate manifest
		$this->addManifest();

		// HTTP headers
		// CSP
		$this->addCSP();

		// HSTS
		$this->addHSTS();

		// Deny X-Frame-Options
		$this->addXFrameOptions();

		// Feature policy
		$this->addFeaturePolicy();

		$this->addModules();
	}

	/**
	 * getConfig() wrapper to catch exceptions.
	 * Returns null on exception
	 *
	 * @param string $key
	 * @return mixed|null
	 * @see SkinTemplate::getConfig()
	 */
	private function getConfigValue( $key ) {
		try {
			$value = $this->getConfig()->get( $key );
		} catch ( ConfigException $e ) {
			$value = null;
		}

		return $value;
	}

	/**
	 * Adds a preconnect header if enabled in 'CitizenEnablePreconnect'
	 */
	private function addPreConnect() {
		if ( $this->getConfigValue( 'CitizenEnablePreconnect' ) === true ) {
			$this->out->addLink( [
				'rel' => 'preconnect',
				'href' => $this->getConfigValue( 'CitizenPreconnectURL' ),
			] );
		}
	}

	/**
	 * Adds the manifest if enabled in 'CitizenEnableManifest'.
	 * Manifest link will be empty if wfExpandUrl throws an exception.
	 */
	private function addManifest() {
		if ( $this->getConfigValue( 'CitizenEnableManifest' ) === true ) {
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
	}

	/**
	 * Adds the csp directive if enabled in 'CitizenEnableCSP'.
	 * Directive holds the content of 'CitizenCSPDirective'.
	 */
	private function addCSP() {
		if ( $this->getConfigValue( 'CitizenEnableCSP' ) === true ) {

			$cspDirective = $this->getConfigValue( 'CitizenCSPDirective' ) ?? '';
			$cspMode = 'Content-Security-Policy';

			// Check if report mode is enabled
			if ( $this->getConfigValue( 'CitizenEnableCSPReportMode' ) === true ) {
				$cspMode = 'Content-Security-Policy-Report-Only';
			}

			$this->out->getRequest()->response()->header( sprintf( '%s: %s', $cspMode,
				$cspDirective ) );
		}
	}

	/**
	 * Adds the HSTS Header. If no max age or an invalid max age is set a default of 300 will be
	 * applied.
	 * Preload and Include Subdomains can be enabled by setting 'CitizenHSTSIncludeSubdomains'
	 * and/or 'CitizenHSTSPreload' to true.
	 */
	private function addHSTS() {
		if ( $this->getConfigValue( 'CitizenEnableHSTS' ) === true ) {

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
	 * Adds the Feature policy header to the response if enabled in 'CitizenFeaturePolicyDirective'
	 */
	private function addFeaturePolicy() {
		if ( $this->getConfigValue( 'CitizenEnableFeaturePolicy' ) === true ) {

			$featurePolicy = $this->getConfigValue( 'CitizenFeaturePolicyDirective' ) ?? '';

			$this->out->getRequest()->response()->header( sprintf( 'Feature-Policy: %s',
				$featurePolicy ) );
		}
	}

	/**
	 * Returns the javascript entry modules to load. Only modules that need to
	 * be overriden or added conditionally should be placed here.
	 * @return array
	 */
	public function getDefaultModules() {
		$modules = parent::getDefaultModules();
		
		// disable default skin search modules
		$modules['search'] = [];

		return $modules;
	}

	/**
	 * Adds all needed skin modules
	 */
	private function addModules() {
		$this->out->addModuleStyles( [
			'mediawiki.skinning.content.externallinks',
			'skins.citizen',
			'skins.citizen.icons',
			'skins.citizen.icons.ca',
			'skins.citizen.icons.p',
			'skins.citizen.icons.toc',
			'skins.citizen.icons.es',
			'skins.citizen.icons.n',
			'skins.citizen.icons.t',
			'skins.citizen.icons.pt',
			'skins.citizen.icons.footer',
			'skins.citizen.icons.badges',
			'skins.citizen.icons.search',
		] );

		$this->out->addModules( [
			'skins.citizen.js',
			'skins.citizen.search',
		] );
	}
}
