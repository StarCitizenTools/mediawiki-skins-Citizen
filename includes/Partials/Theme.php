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

namespace Citizen\Partials;

use MediaWiki\MediaWikiServices;

/**
 * Theme switcher partial of Skin Citizen
 */
final class Theme extends Partial {

	/**
	 * Sets the corresponding theme class on the <html> element
	 * If the theme is set to auto, the theme switcher script will be added
	 *
	 * @param array &$options
	 */
	public function setSkinTheme( array &$options ) {
		// Set theme to site theme
		$theme = $this->getConfigValue( 'CitizenThemeDefault' ) ?? 'auto';

		// Set theme to user theme if registered
		if ( $this->out->getUser()->isRegistered() ) {
			$theme = MediaWikiServices::getInstance()->getUserOptionsLookup()->getOption(
				$this->out->getUser(),
				'CitizenThemeUser',
				'auto'
			);
		}

		// Add HTML class based on theme set
		$this->out->addHtmlClasses( 'skin-citizen-' . $theme );
	}
}
