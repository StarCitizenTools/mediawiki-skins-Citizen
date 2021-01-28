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

use HTMLForm;
use MediaWiki\MediaWikiServices;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\Preferences\Hook\PreferencesFormPreSaveHook;
use User;

/**
 * Hooks to run relating to user preferences
 */
class PreferenceHooks implements PreferencesFormPreSaveHook, GetPreferencesHook {

	/**
	 * Delete the override cookie if the theme was changed through the user preferences
	 *
	 * @param array $formData Array of user submitted data
	 * @param HTMLForm $form HTMLForm object, also a ContextSource
	 * @param User $user User with preferences to be saved
	 * @param bool &$result Boolean indicating success
	 * @param array $oldUserOptions Array with user's old options (before save)
	 * @return bool|void True or no return value to continue or false to abort
	 */
	public function onPreferencesFormPreSave( $formData, $form, $user, &$result, $oldUserOptions ) {
		if ( isset( $formData['CitizenThemeUser'] ) && $formData['CitizenThemeUser'] !== 'auto' ) {
			// Reset override cookie from theme toggle
			$form->getOutput()->getRequest()->response()->setCookie( 'skin-citizen-theme-override', null );
		}
	}

	/**
	 * Add Citizen preferences to the user's Special:Preferences page directly underneath skins.
	 * Based on Vector's implementation
	 *
	 * @param User $user User whose preferences are being modified.
	 * @param array[] &$preferences Preferences description array, to be fed to a HTMLForm object.
	 */
	public function onGetPreferences( $user, &$preferences ) {
		// Preferences to add.
		$citizenPrefs = [
			'CitizenThemeUser' => [
				'type' => 'select',
				// Droptown title
				'label-message' => 'prefs-citizen-theme-label',
				// The tab location and title of the section to insert the checkbox. The bit after the slash
				// indicates that a prefs-skin-prefs string will be provided.
				'section' => 'rendering/skin/skin-prefs',
				'options' => [
					wfMessage( 'prefs-citizen-theme-option-auto' )->escaped() => 'auto',
					wfMessage( 'prefs-citizen-theme-option-light' )->escaped() => 'light',
					wfMessage( 'prefs-citizen-theme-option-dark' )->escaped() => 'dark',
				],
				'default' => MediaWikiServices::getInstance()->getUserOptionsLookup()->getOption(
						$user,
						'CitizenThemeUser'
					) ?? 'auto',
				// Only show this section when the Citizen skin is checked. The JavaScript client also uses
				// this state to determine whether to show or hide the whole section.
				'hide-if' => [ '!==', 'wpskin', 'citizen' ],
			],
		];

		// Seek the skin preference section to add Citizen preferences just below it.
		$skinSectionIndex = array_search( 'skin', array_keys( $preferences ) );
		if ( $skinSectionIndex !== false ) {
			// Skin preference section found. Inject Citizen skin-specific preferences just below it.
			// This pattern can be found in Popups too. See T246162.
			$citizenSectionIndex = $skinSectionIndex + 1;
			$preferences = array_slice( $preferences, 0, $citizenSectionIndex, true )
				+ $citizenPrefs
				+ array_slice( $preferences, $citizenSectionIndex, null, true );
		} else {
			// Skin preference section not found. Just append Citizen skin-specific preferences.
			$preferences += $citizenPrefs;
		}
	}
}
