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
use ApiMain;
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

	/** @var ApiMain */
	private $main;

	/** @var Config */
	private $config;

	/** @var MediaWikiServices */
	private $services;

	/** @var array */
	private $options;

	/**
	 * @inheritDoc
	 */
	public function __construct(
		ApiMain $main,
		$moduleName
	) {
		parent::__construct( $main, $moduleName );
		$this->main = $main;
		$this->config = $this->getConfig();
		$this->services = MediaWikiServices::getInstance();
		$this->options = $this->config->get( 'CitizenManifestOptions' );
	}

	/**
	 * Execute the requested Api actions.
	 */
	public function execute(): void {
		$config = $this->config;
		$services = $this->services;
		$resultObj = $this->getResult();
		$main = $this->main;
		$options = $this->options;

		$resultObj->addValue( null, 'dir', $services->getContentLanguage()->getDir() );
		$resultObj->addValue( null, 'lang', $config->get( MainConfigNames::LanguageCode ) );
		$resultObj->addValue( null, 'name', $config->get( MainConfigNames::Sitename ) );
		// Need to set it manually because the default from start_url does not include script namespace
		// E.g. index.php URLs will be thrown out of the PWA
		$resultObj->addValue( null, 'scope', $config->get( MainConfigNames::Server ) . '/' );
		$resultObj->addValue( null, 'icons', $this->getIcons() );
		$resultObj->addValue( null, 'display', 'standalone' );
		$resultObj->addValue( null, 'orientation', 'natural' );
		$resultObj->addValue( null, 'start_url', Title::newMainPage()->getLocalURL() );
		$resultObj->addValue( null, 'theme_color', $options['theme_color'] );
		$resultObj->addValue( null, 'background_color', $options['background_color'] );
		$resultObj->addValue( null, 'shortcuts', $this->getShortcuts() );

		if ( $options['short_name'] !== '' ) {
			$resultObj->addValue( null, 'short_name', $options['short_name'] );
		}

		if ( $options['description'] !== '' ) {
			$resultObj->addValue( null, 'description', $options['description'] );
		}

		$main->setCacheMaxAge( self::CACHE_MAX_AGE );
		$main->setCacheMode( 'public' );
	}

	/**
	 * Get icons for manifest
	 *
	 * @return array
	 */
	private function getIcons(): array {
		$iconsConfig = $this->options['icons'];
		if ( !$iconsConfig || $iconsConfig === [] ) {
			return $this->getIconsFromLogos();
		}
		$icons = [];
		$allowedKeys = [ 'src', 'sizes', 'type', 'purpose' ];
		foreach ( $iconsConfig as $iconConfig ) {
			$icon = array_intersect_key( $iconConfig, array_flip( $allowedKeys ) );
			if ( !is_array( $icon ) || empty( $icon ) ) {
				continue;
			}
			array_push( $icons, $icon );
		}
		return $icons;
	}

	/**
	 * Get icons from wgLogos
	 *
	 * @return array
	 */
	private function getIconsFromLogos(): array {
		$services = $this->services;

		$icons = [];
		$logos = $this->config->get( MainConfigNames::Logos );

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

			try {
				$logoUrl = $services->getUrlUtils()->expand( $logoPath, PROTO_CURRENT ) ?? '';
				$request = $services->getHttpRequestFactory()->create( $logoUrl, [], __METHOD__ );
				$request->execute();
				$logoContent = $request->getContent();
			} catch ( Exception $e ) {
				// Log the exception or handle it accordingly
				$logoContent = '';
			}

			if ( !empty( $logoContent ) ) {
				$logoSize = getimagesizefromstring( $logoContent );
			}

			$icon = [
				'src' => $logoPath
			];

			if ( isset( $logoSize ) && $logoSize !== false ) {
				$icon['sizes'] = $logoSize[0] . 'x' . $logoSize[1];
				$icon['type'] = $logoSize['mime'];
			}

			// Set sizes to any if it is a SVG
			if ( substr( $logoPath, -3 ) === 'svg' ) {
				$icon['sizes'] = 'any';
				$icon['type'] = 'image/svg+xml';
			}

			// Exit if not sizes are detected
			if ( !$icon['sizes'] ) {
				continue;
			}

			$icons[] = $icon;
		}

		return $icons;
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
		return new ApiWebappManifestFormatJson( $this->main, 'webmanifest' );
	}
}
