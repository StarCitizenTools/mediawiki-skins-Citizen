/**
 * @param {Window} window
 * @return {void}
 */
function initThemeSettings( window ) {
	const setLocalStorage = ( themeName ) => {
		try {
			// eslint-disable-next-line indent
				localStorage.setItem( 'skin-citizen-theme', themeName );
		} catch ( e ) {}
	};

	const prefersDark = window.matchMedia( '(prefers-color-scheme: dark)' ),
		applyTheme = () => {
			window.applyPref();
			// So that theme is applied but localStorage keeps the auto config
			setLocalStorage( 'auto' );
		};

	// Monitor prefers-color-scheme changes
	prefersDark.addEventListener( 'change', ( event ) => {
		setLocalStorage( event.matches ? 'dark' : 'light' );
		applyTheme();
	} );
}

/**
 * @param {Window} window
 * @return {void}
 */
function initTheme( window ) {
	if ( typeof window.mw !== 'undefined' ) {
		const theme = window.localStorage.getItem( 'skin-citizen-theme' );
		if ( theme === null || theme === 'auto' ) {
			initThemeSettings( window );
		}
	}
}

module.exports = {
	init: initTheme
};
