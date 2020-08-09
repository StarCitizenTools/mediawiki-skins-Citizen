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
 */

namespace Citizen;

use ApiBase;
use ApiFormatJson;
use MediaWiki\MediaWikiServices;
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
		$services = MediaWikiServices::getInstance();

		$config = $this->getConfig();
		$resultObj = $this->getResult();
		$resultObj->addValue( null, 'name', $config->get( 'Sitename' ) );
		$resultObj->addValue( null, 'orientation', 'portrait' );
		$resultObj->addValue( null, 'dir', $services->getContentLanguage()->getDir() );
		$resultObj->addValue( null, 'lang', $config->get( 'LanguageCode' ) );
		$resultObj->addValue( null, 'display', 'standalone' );
		$resultObj->addValue( null, 'theme_color', $config->get( 'CitizenManifestThemeColor' ) );
		$resultObj->addValue( null, 'background_color', $config->get( 'CitizenManifestBackgroundColor' ) );
		$resultObj->addValue( null, 'start_url', Title::newMainPage()->getLocalURL() );

		$icons = [];

		$appleTouchIcon = $config->get( 'AppleTouchIcon' );
		if ( $appleTouchIcon !== false ) {
			$appleTouchIconUrl = wfExpandUrl( $appleTouchIcon, PROTO_CURRENT );
			$request = $services->getHttpRequestFactory()->create( $appleTouchIconUrl, [], __METHOD__ );
			$request->execute();
			$appleTouchIconContent = $request->getContent();
			if ( !empty( $appleTouchIconContent ) ) {
				$appleTouchIconSize = getimagesizefromstring( $appleTouchIconContent );
			}
			$icon = [
				'src' => $appleTouchIcon
			];
			if ( isset( $appleTouchIconSize ) && $appleTouchIconSize !== false ) {
				$icon['sizes'] = $appleTouchIconSize[0] . 'x' . $appleTouchIconSize[1];
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
