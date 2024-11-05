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
use Exception;
use MediaWiki\MainConfigNames;
use MediaWiki\MediaWikiServices;
use MediaWiki\Title\Title;
use SpecialPage;

/**
 * Based on the MobileFrontend extension
 * Return the webapp manifest for this wiki
 *
 * T282500
 * TODO: This should be merged to core
 */
class ApiWebappManifest extends ApiBase {
	/* 1 week */
	private const CACHE_MAX_AGE = 604800;

	/**
	 * Execute the requested Api actions.
	 */
	public function execute(): void {
		$services = MediaWikiServices::getInstance();

		$main = $this->getMain();
		$main->setCacheMaxAge( self::CACHE_MAX_AGE );
		$main->setCacheMode( 'public' );

		$config = $this->getConfig();
		$resultObj = $this->getResult();
		$resultObj->addValue( null, 'dir', $services->getContentLanguage()->getDir() );
		$resultObj->addValue( null, 'lang', $config->get( MainConfigNames::LanguageCode ) );
		$resultObj->addValue( null, 'name', $config->get( MainConfigNames::Sitename ) );
		// Need to set it manually because the default from start_url does not include script namespace
		// E.g. index.php URLs will be thrown out of the PWA
		$resultObj->addValue( null, 'scope', $config->get( MainConfigNames::Server ) . '/' );
		$resultObj->addValue( null, 'icons', $this->getIcons( $config, $services ) );
		$resultObj->addValue( null, 'display', 'standalone' );
		$resultObj->addValue( null, 'orientation', 'natural' );
		$resultObj->addValue( null, 'start_url', Title::newMainPage()->getLocalURL() );
		$resultObj->addValue( null, 'theme_color', $config->get( 'CitizenManifestThemeColor' ) );
		$resultObj->addValue( null, 'background_color', $config->get( 'CitizenManifestBackgroundColor' ) );
		$resultObj->addValue( null, 'shortcuts', $this->getShortcuts() );
	}

	/**
	 * Get icons for manifest
	 *
	 * @param Config $config
	 * @param MediaWikiServices $services
	 * @return array
	 */
	private function getIcons( $config, $services ): array {
		$icons = [];
		$logos = $config->get( MainConfigNames::Logos );

		if ( !$logos ) {
			return $icons;
		}

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

			$logoPath = (string)$logos[$logoKey];

			$logoUrl = $services->getUrlUtils()->expand( $logoPath, PROTO_CURRENT );
			$request = $services->getHttpRequestFactory()->create( $logoUrl, [], __METHOD__ );
			try {
				$request->execute();
				$logoContent = $request->getContent();
			} catch ( Exception $e ) {
				// Log the error or handle it appropriately
				$logoContent = null;
			}

			$icon = $this->getIconData( $logoPath, $logoContent );
			if ( !$icon ) {
				continue;
			}
			$icons[] = $icon;
		}

		return $icons;
	}

	/**
	 * Get src, sizes, and type for each icon for the manifest
	 *
	 * @param string $logoPath
	 * @param string $logoContent
	 * @return array|null
	 */
	private function getIconData( $logoPath, $logoContent ) {
		$imageSize = getimagesizefromstring( $logoContent );
		if ( $imageSize !== false ) {
			return [
				'src' => $logoPath,
				'sizes' => $imageSize[0] . 'x' . $imageSize[1],
				'type' => $imageSize['mime']
			];
		}

		// getimagesizefromstring does not handle SVGs
		if ( mime_content_type( $logoContent ) !== 'image/svg+xml' ) {
			return null;
		}

		return [
			'src' => $logoPath,
			'sizes' => 'any',
			'type' => $logoContent
		];
	}

	/**
	 * Get shortcuts for manifest
	 *
	 * @return array
	 */
	private function getShortcuts(): array {
		$specialPages = [ 'Search', 'Randompage', 'RecentChanges' ];

		return array_map( static function ( $specialPage ) {
			$title = SpecialPage::getSafeTitleFor( $specialPage );
			return [
				'name' => $title->getBaseText(),
				'url' => $title->getLocalURL()
			];
		}, $specialPages );
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
