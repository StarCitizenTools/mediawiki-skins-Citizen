<?php
/**
 * Citizen - A responsive skin built from ground up for Star Citizen Wiki.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 *
 * @file
 * @ingroup Skins
 */

/**
 * SkinTemplate class for Citizen skin
 * @ingroup Skins
 */
class SkinCitizen extends SkinTemplate {
	public $skinname = 'citizen', $stylename = 'Citizen',
		$template = 'CitizenTemplate', $useHeadElement = true;

	/**
	 * Initializes output page and sets up skin-specific parameters
	 * @param OutputPage $out Object to initialize
	 */
	
	public function initPage( OutputPage $out ) {
		parent::initPage( $out );
        $out->addMeta( 'viewport', 'width=device-width, initial-scale=1' );
        $out->addHeadItem( 'manifest', '<link rel="manifest" href="/skins/Citizen/manifest.json">' );
		$out->addModules( 'skins.citizen.js' );
        $out->addMeta( 'theme-color', '#0A1B2C' );
        $out->addMeta( 'apple-mobile-web-app-status-bar-style', 'black-translucent' );
	}

	/**
	 * Add CSS via ResourceLoader
	 *
	 * @param $out OutputPage
	 */
	function setupSkinUserCss( OutputPage $out ) {
		parent::setupSkinUserCss( $out );
		$out->addModuleStyles( array(
			'mediawiki.skinning.interface', 'skins.citizen'
		) );
	}
}