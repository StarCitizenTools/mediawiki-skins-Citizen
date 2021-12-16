/**
 * @param {Window} window
 * @return {void}
 */
function initThemeSettings( window ) {
	const userTheme = window.mw.user.options.get( 'CitizenThemeUser' ),
		setLocalStorage = ( themeName ) => {
			try {
				localStorage.setItem( 'skin-citizen-theme', themeName );
			} catch ( e ) {}
		};

	let theme = ( userTheme !== null ) ? userTheme : 'auto';

	if ( theme === 'auto' ) {
		const prefersDark = window.matchMedia( '(prefers-color-scheme: dark)' ),
			applyTheme = () => {
				window.applyPref();
				// So that theme is applied but localStorage keeps the auto config
				setLocalStorage( 'auto' );
			};

		theme = prefersDark.matches ? 'dark' : 'light';

		// Monitor prefers-color-scheme changes
		prefersDark.addEventListener( 'change', ( event ) => {
			setLocalStorage( event.matches ? 'dark' : 'light' );
			applyTheme();
		} );

		setLocalStorage( theme );
		applyTheme();
	} else {
		setLocalStorage( theme );
		window.applyPref();
	}
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
