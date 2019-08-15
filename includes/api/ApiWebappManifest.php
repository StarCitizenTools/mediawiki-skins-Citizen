<?php

/**
 * Extract and modified from MobileFrontend extension
 * Return the webapp manifest for this wiki
 */
class ApiWebappManifest extends ApiBase {

	/**
	 * Execute the requested Api actions.
	 */
	public function execute() {
		$config = $this->getConfig();
		$resultObj = $this->getResult();
		$resultObj->addValue( null, 'name', $config->get( 'Sitename' ) );
		$resultObj->addValue( null, 'short_name', $config->get( 'Sitename' ) ); // Might as well add shortname
		$resultObj->addValue( null, 'orientation', 'portrait' );
		$resultObj->addValue( null, 'dir', $config->get( 'ContLang' )->getDir() );
		$resultObj->addValue( null, 'lang', $config->get( 'LanguageCode' ) );
		$resultObj->addValue( null, 'display', 'standalone' ); // Changed to standalone to provide better experience
		$resultObj->addValue( null, 'theme_color', $config->get( 'CitizenManifestThemeColor' ) );
		$resultObj->addValue( null, 'background_color', $config->get( 'CitizenManifestBackgroundColor' ) );
		$resultObj->addValue( null, 'start_url', Title::newMainPage()->getLocalUrl() );

		$icons = [];

		$appleTouchIcon = $config->get( 'AppleTouchIcon' );
		if ( $appleTouchIcon !== false ) {
			$appleTouchIconUrl = wfExpandUrl( $appleTouchIcon, PROTO_CURRENT );
			$request = MWHttpRequest::factory( $appleTouchIconUrl );
			$request->execute();
			$appleTouchIconContent = $request->getContent();
			if ( !empty( $appleTouchIconContent ) ) {
				$appleTouchIconSize = getimagesizefromstring( $appleTouchIconContent );
			}
			$icon = [
				'src' => $appleTouchIcon
			];
			if ( isset( $appleTouchIconSize ) && $appleTouchIconSize !== false ) {
				$icon['sizes'] = $appleTouchIconSize[0].'x'.$appleTouchIconSize[1];
				$icon['type'] = $appleTouchIconSize['mime'];
			}
			$icons[] = $icon;
		}

		$resultObj->addValue( null, 'icons', $icons );

		$main = $this->getMain();
		$main->setCacheControl( [ 's-maxage' => 86400, 'max-age' => 86400 ] );
		$main->setCacheMode( 'public' );
	}

	/**
	 * Get the JSON printer
	 *
	 * @return ApiFormatJson
	 */
	public function getCustomPrinter() {
		return new ApiFormatJson( $this->getMain(), 'json' );
	}

}
