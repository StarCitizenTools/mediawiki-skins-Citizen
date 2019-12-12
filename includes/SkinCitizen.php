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
			'width=device-width, initial-scale=1'
		);
		// Edge compatibility
		$out->addMeta( 'http:X-UA-Compatible',
			'IE=edge'
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
					'href' => $this->getConfig()->get( 'CitizenPreconnectOrigin' )
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
