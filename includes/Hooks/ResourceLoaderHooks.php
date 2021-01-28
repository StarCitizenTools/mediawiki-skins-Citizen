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
 * @ingroup Skins
 */

declare( strict_types=1 );

namespace Citizen\Hooks;

use Config;
use ConfigException;
use MediaWiki\MediaWikiServices;
use MediaWiki\ResourceLoader\Hook\ResourceLoaderGetConfigVarsHook;
use Skin;

/**
 * Hooks to run relating to the resource loader
 */
class ResourceLoaderHooks implements ResourceLoaderGetConfigVarsHook {

	/**
	 * ResourceLoaderGetConfigVars hook handler for setting a config variable
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ResourceLoaderGetConfigVars
	 * @param array &$vars
	 * @param Skin $skin
	 * @param Config $config
	 */
	public function onResourceLoaderGetConfigVars( array &$vars, $skin, Config $config ): void {
		try {
			$vars['wgCitizenSearchDescriptionSource'] = self::getSkinConfig( 'CitizenSearchDescriptionSource' );
		} catch ( ConfigException $e ) {
			// Should not happen
			$vars['wgCitizenSearchDescriptionSource'] = 'textextracts';
		}

		try {
			$vars['wgCitizenMaxSearchResults'] = self::getSkinConfig( 'CitizenMaxSearchResults' );
		} catch ( ConfigException $e ) {
			// Should not happen
			$vars['wgCitizenMaxSearchResults'] = 6;
		}

		try {
			$vars['wgCitizenEnableSearch'] = self::getSkinConfig( 'CitizenEnableSearch' );
		} catch ( ConfigException $e ) {
			// Should not happen
			$vars['wgCitizenEnableSearch'] = true;
		}
	}

	/**
	 * Get a skin configuration variable.
	 *
	 * @param string $name Name of configuration option.
	 * @return mixed Value configured.
	 * @throws ConfigException
	 */
	private static function getSkinConfig( $name ) {
		return MediaWikiServices::getInstance()->getConfigFactory()->makeConfig( 'Citizen' )->get( $name );
	}
}
