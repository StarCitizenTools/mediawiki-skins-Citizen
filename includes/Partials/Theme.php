<?php

declare( strict_types=1 );

namespace MediaWiki\Skins\Citizen\Partials;

const CLIENTPREFS_THEME_MAP = [
	'auto' => 'os',
	'light' => 'day',
	'dark' => 'night'
];

/**
 * Theme switcher partial of Skin Citizen
 */
final class Theme extends Partial {

	/**
	 * Sets the corresponding theme class on the <html> element
	 * If the theme is set to auto, the theme switcher script will be added
	 */
	public function setSkinTheme(): void {
		// Set theme to site theme
		$theme = $this->getConfigValue( 'CitizenThemeDefault' ) ?? 'auto';
		// Add HTML class based on theme set
		if ( CLIENTPREFS_THEME_MAP[ $theme ] ) {
			$this->out->addHtmlClasses( 'skin-theme-clientpref-' . CLIENTPREFS_THEME_MAP[ $theme ] );
		}
	}
}
