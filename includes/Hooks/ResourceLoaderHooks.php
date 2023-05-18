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

namespace MediaWiki\Skins\Citizen\Hooks;

use Config;
use ExtensionRegistry;
use MediaWiki\ResourceLoader as RL;

/**
 * Hooks to run relating to the resource loader
 */
class ResourceLoaderHooks {

	/**
	 * Passes config variables to skins.citizen.scripts ResourceLoader module.
	 * @param RL\Context $context
	 * @param Config $config
	 * @return array
	 */
	public static function getCitizenResourceLoaderConfig(
		RL\Context $context,
		Config $config
	) {
		return [
			'wgCitizenEnablePreferences' => $config->get( 'CitizenEnablePreferences' ),
			'wgCitizenSearchModule' => $config->get( 'CitizenSearchModule' ),
			'wgCitizenTableNowrapClasses' => $config->get( 'CitizenTableNowrapClasses' ),
		];
	}

	/**
	 * Passes config variables to skins.citizen.preferences ResourceLoader module.
	 * @param RL\Context $context
	 * @param Config $config
	 * @return array
	 */
	public static function getCitizenPreferencesResourceLoaderConfig(
		RL\Context $context,
		Config $config
	) {
		return [
			'wgCitizenThemeDefault' => $config->get( 'CitizenThemeDefault' ),
		];
	}

	/**
	 * Passes config variables to skins.citizen.search ResourceLoader module.
	 * @param RL\Context $context
	 * @param Config $config
	 * @return array
	 */
	public static function getCitizenSearchResourceLoaderConfig(
		RL\Context $context,
		Config $config
	) {
		return [
			'wgCitizenSearchGateway' => $config->get( 'CitizenSearchGateway' ),
			'wgCitizenSearchDescriptionSource' => $config->get( 'CitizenSearchDescriptionSource' ),
			'wgCitizenMaxSearchResults' => $config->get( 'CitizenMaxSearchResults' ),
			'wgCitizenSearchSmwAskApiQueryTemplate' => $config->get( 'CitizenSearchSmwAskApiQueryTemplate' ),
			'wgScriptPath' => $config->get( 'ScriptPath' ),
			'wgSearchSuggestCacheExpiry' => $config->get( 'SearchSuggestCacheExpiry' ),
			'isMediaSearchExtensionEnabled' => ExtensionRegistry::getInstance()->isLoaded( 'MediaSearch' ),
		];
	}
}
