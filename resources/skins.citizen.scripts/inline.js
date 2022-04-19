/* eslint-disable */
/*
 * Citizen - Inline script used in SkinCitizen.php
 *
 * https://starcitizen.tools
 *
 * Mangle using https://jscompress.com/
 */
window.applyPref = () => {
	// Generates an array of prefix-(auto|dark|light) strings
	const classNames = ( prefix ) => {
		return [ 'auto', 'dark', 'light' ].map( themeType => {
			return prefix + themeType;
		});
	}

	try {
		const htmlElement = document.documentElement,
			theme = window.localStorage.getItem( 'skin-citizen-theme' ),
			fontsize = window.localStorage.getItem( 'skin-citizen-fontsize' ),
			pagewidth = window.localStorage.getItem( 'skin-citizen-pagewidth' ),
			lineheight = window.localStorage.getItem( 'skin-citizen-lineheight' );
		if ( theme !== null ) {
			// First remove all theme classes
			htmlElement.classList.remove(...classNames('skin-citizen-' ) );
			// Then add the right one
			htmlElement.classList.add( 'skin-citizen-' + theme );
		}
		if ( fontsize !== null ) {
			htmlElement.style.setProperty( 'font-size', fontsize );
		}
		if( pagewidth !== null ) {
			htmlElement.style.setProperty( '--width-layout', pagewidth );
		}
		if( lineheight !== null ) {
			htmlElement.style.setProperty( '--line-height', lineheight );
		}
	} catch ( e ) {
	}
}

(() => {
	// Set up auto theme based on prefers-color-scheme
	if ( window.localStorage.getItem( 'skin-citizen-theme' ) === 'auto' ) {
		const autoTheme = window.matchMedia( '(prefers-color-scheme: dark)' ) ? 'dark' : 'light';
		// Set to the right theme temporarily
		window.localStorage.setItem( 'skin-citizen-theme', autoTheme );
		window.applyPref();
		// Reset back to auto
		window.localStorage.setItem( 'skin-citizen-theme', 'auto' );
	} else {
		window.applyPref();
	}
})();
