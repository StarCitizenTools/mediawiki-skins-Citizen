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

namespace MediaWiki\Skins\Citizen\Api;

use ApiBase;
use MediaWiki\MediaWikiServices;
use SpecialPage;
use Title;

/**
 * Based on the MobileFrontend extension
 * Return the webapp manifest for this wiki
 *
 * T282500
 * TODO: This should be merged to core
 */
class ApiWebappManifest extends ApiBase {
	/**
	 * Execute the requested Api actions.
	 */
	public function execute() {
		$services = MediaWikiServices::getInstance();

		$config = $this->getConfig();
		$resultObj = $this->getResult();
		$resultObj->addValue( null, 'dir', $services->getContentLanguage()->getDir() );
		$resultObj->addValue( null, 'lang', $config->get( 'LanguageCode' ) );
		$resultObj->addValue( null, 'name', $config->get( 'Sitename' ) );
		// Need to set it manually because the default from start_url does not include script namespace
		// E.g. index.php URLs will be thrown out of the PWA
		$resultObj->addValue( null, 'scope', $config->get( 'Server' ) . '/' );
		$resultObj->addValue( null, 'icons', $this->getIcons( $config, $services ) );
		$resultObj->addValue( null, 'display', 'standalone' );
		$resultObj->addValue( null, 'orientation', 'portrait' );
		$resultObj->addValue( null, 'start_url', Title::newMainPage()->getLocalURL() );
		$resultObj->addValue( null, 'theme_color', $config->get( 'CitizenManifestThemeColor' ) );
		$resultObj->addValue( null, 'background_color', $config->get( 'CitizenManifestBackgroundColor' ) );
		$resultObj->addValue( null, 'shortcuts', $this->getShortcuts() );

		$main = $this->getMain();
		$main->setCacheMaxAge( 604800 );
		$main->setCacheMode( 'public' );
	}

	/**
	 * Get icons for manifest
	 *
	 * @param Config $config
	 * @param MediaWikiServices $services
	 * @return array
	 */
	private function getIcons( $config, $services ) {
		$icons = [];
		$logos = $config->get( 'Logos' );

		// That really shouldn't happen
		if ( $logos !== false ) {
			$logoKeys = [
				'1x',
				'1.5x',
				'2x',
				'icon',
				'svg'
			];

			foreach ( $logoKeys as $logoKey ) {
				// Avoid undefined index
				if ( !isset( $logos[$logoKey] ) ) {
					continue;
				}

				$logo = (string)$logos[$logoKey];

				if ( !empty( $logo ) ) {
					$logoUrl = $services->getUrlUtils()->expand( $logo, PROTO_CURRENT );
					$request = $services->getHttpRequestFactory()->create( $logoUrl, [], __METHOD__ );
					$request->execute();
					$logoContent = $request->getContent();

					if ( !empty( $logoContent ) ) {
						$logoSize = getimagesizefromstring( $logoContent );
					}
					$icon = [
						'src' => $logo
					];

					if ( isset( $logoSize ) && $logoSize !== false ) {
						$icon['sizes'] = $logoSize[0] . 'x' . $logoSize[1];
						$icon['type'] = $logoSize['mime'];
					}

					// Set sizes to any if it is a SVG
					if ( substr( $logo, -3 ) === 'svg' ) {
						$icon['sizes'] = 'any';
						$icon['type'] = 'image/svg+xml';
					}

					$icons[] = $icon;
				}
			}
		}

		return $icons;
	}

	/**
	 * Get shortcuts for manifest
	 *
	 * @return array
	 */
	private function getShortcuts() {
		$shortcuts = [];
		$specialPages = [ 'Search', 'Randompage', 'RecentChanges' ];

		foreach ( $specialPages as $specialPage ) {
			$shortcut = [];
			$title = SpecialPage::getSafeTitleFor( $specialPage );
			$shortcut['name'] = $title->getBaseText();
			$shortcut['url'] = $title->getLocalURL();
			$shortcuts[] = $shortcut;
		}

		return $shortcuts;
	}

	/**
	 * Get the JSON printer
	 *
	 * @return ApiWebappManifestFormatJson
	 */
	public function getCustomPrinter() {
		return new ApiWebappManifestFormatJson( $this->getMain(), 'webmanifest' );
	}
}
