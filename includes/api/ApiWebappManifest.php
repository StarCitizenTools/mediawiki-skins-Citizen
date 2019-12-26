<?php

namespace Citizen;

use ApiBase;
use ApiFormatJson;
use ApiResult;
use ConfigException;
use Exception;
use MWHttpRequest;
use Title;

/**
 * Extract and modified from MobileFrontend extension
 * Return the webapp manifest for this wiki
 */
class ApiWebappManifest extends ApiBase {
	/**
	 * Execute the requested Api actions.
	 */
	public function execute() {
		$resultObj = $this->getResult();
		$resultObj->addValue( null, 'name', $this->getConfigSafe( 'Sitename' ) );
		// Might as well add shortname
		$resultObj->addValue( null, 'short_name', $this->getConfigSafe( 'Sitename' ) );

		$resultObj->addValue( null, 'orientation', 'portrait' );

		if ( $this->getConfigSafe( 'ContLang', false ) !== false ) {
			$resultObj->addValue( null, 'dir', $this->getConfigSafe( 'ContLang' )->getDir() );
		}
		$resultObj->addValue( null, 'lang', $this->getConfigSafe( 'LanguageCode' ) );

		// Changed to standalone to provide better experience
		$resultObj->addValue( null, 'display', 'standalone' );

		$resultObj->addValue( null, 'theme_color',
			$this->getConfigSafe( 'CitizenManifestThemeColor' ) );
		$resultObj->addValue( null, 'background_color',
			$this->getConfigSafe( 'CitizenManifestBackgroundColor' ) );

		$resultObj->addValue( null, 'start_url', Title::newMainPage()->getLocalUrl() );

		$this->addIcons( $resultObj );

		$main = $this->getMain();
		$main->setCacheControl( [ 's-maxage' => 86400, 'max-age' => 86400 ] );
		$main->setCacheMode( 'public' );
	}

	/**
	 * @param ApiResult $result
	 */
	// TODO: Add support for 192 and 512px icons
	private function addIcons( $result ) {
		$icons = [];

		$appleTouchIcon = $this->getConfigSafe( 'AppleTouchIcon', false );

		if ( $appleTouchIcon !== false ) {
			try {
				$appleTouchIconUrl = wfExpandUrl( $appleTouchIcon, PROTO_CURRENT );
			} catch ( Exception $e ) {
				return;
			}

			$request = MWHttpRequest::factory( $appleTouchIconUrl );
			$request->execute();
			$appleTouchIconContent = $request->getContent();

			if ( !empty( $appleTouchIconContent ) ) {
				$appleTouchIconSize = getimagesizefromstring( $appleTouchIconContent );
			}

			$icon = [
				'src' => $appleTouchIcon,
			];

			if ( isset( $appleTouchIconSize ) && $appleTouchIconSize !== false ) {
				$icon['sizes'] = $appleTouchIconSize[0] . 'x' . $appleTouchIconSize[1];
				$icon['type'] = $appleTouchIconSize['mime'];
			}

			$icons[] = $icon;
		}

		$result->addValue( null, 'icons', $icons );
	}

	/**
	 * Get the JSON printer
	 *
	 * @return ApiFormatJson
	 */
	public function getCustomPrinter() {
		return new ApiFormatJson( $this->getMain(), 'json' );
	}

	/**
	 * Calls getConfig. Returns empty string on exception or $default;
	 *
	 * @param string $key
	 * @param string|integer $default
	 * @return mixed|string
	 * @see Config::get()
	 */
	private function getConfigSafe( $key, $default = null ) {
		try {
			return $this->getConfig()->get( $key );
		} catch ( ConfigException $e ) {
			return $default ?? '';
		}
	}
}
