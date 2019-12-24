<?php
/**
 * SkinTemplate class for the Citizen skin
 *
 * @ingroup Skins
 */
class SkinCitizen extends SkinTemplate {
	public $skinname = 'citizen',
		$stylename = 'Citizen',
		$template = 'CitizenTemplate';

	/**
	 * ResourceLoader
	 *
	 * @param $out OutputPage
	 */
	public function initPage( OutputPage $out ) {
		// Responsive layout
		$out->addMeta( 'viewport',
			'width=device-width, initial-scale=1.0'
		);
		// Theme color
		$out->addMeta( 'theme-color',
			$this->getConfig()->get( 'CitizenThemeColor' )
		);
		// Preconnect origin
		if ( $this->getConfig()->get( 'CitizenEnablePreconnect' ) ) {
			$out->addLink(
				[
					'rel' => 'preconnect',
					'href' => $this->getConfig()->get( 'CitizenPreconnectURL' )
				]
			);
		}
		// Generate manifest
		if ( $this->getConfig()->get( 'CitizenEnableManifest' ) ) {
			$out->addLink(
				[
					'rel' => 'manifest',
					'href' => wfExpandUrl(
						wfAppendQuery(
							wfScript( 'api' ),
							[ 'action' => 'webapp-manifest' ]
						),
						PROTO_RELATIVE
					)
				]
			);
		}
		// HSTS
		if ( $this->getConfig()->get( 'CitizenEnableHSTS' ) ) {

			$hstsmaxage = $this->getConfig()->get( 'CitizenHSTSMaxAge' );
			$hstsincludesubdomains = $this->getConfig()->get( 'CitizenHSTSIncludeSubdomains' );

			// HSTS max age
			if ( is_int( $hstsmaxage ) ) {
				$hstsmaxage = max($hstsmaxage, 0);
			} else {
				// Default to 5 mins if input is invalid
				$hstsmaxage = 300;
			}

			$out->getRequest()->response()->header( 'Strict-Transport-Security: max-age=' . $hstsmaxage . ( $hstsincludesubdomains ? '; includeSubDomains' : '' ) );
		}
		// Deny X-Frame-Options
		if ( $this->getConfig()->get( 'CitizenEnableDenyXFrameOptions' ) ) {
			$out->getRequest()->response()->header( 'X-Frame-Options: deny' );
		}
		// Strict referrer policy
		if ( $this->getConfig()->get( 'CitizenEnableStrictReferrerPolicy' ) ) {
			// iOS Safari, IE, Edge compatiblity
			$out->addMeta( 'referrer',
				'strict-origin'
			);
			$out->addMeta( 'referrer',
				'strict-origin-when-cross-origin'
			);
			$out->getRequest()->response()->header( 'Referrer-Policy: strict-origin-when-cross-origin' );
		}

		$out->addModuleStyles( [
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
			'skins.citizen.icons.search'
		] );
		$out->addModules( [
			'skins.citizen.js',
			'skins.citizen.search'
		] );
	}

	/**
	 * @param $out OutputPage
	 */
	function setupSkinUserCss( OutputPage $out ) {
		parent::setupSkinUserCss( $out );
	}
}
