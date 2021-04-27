/**
 * @param {Window} window
 * @return {void}
 */
function initThemeSettings( window ) {
	const userTheme = window.mw.user.options.get( 'CitizenThemeUser' ),
		setLocalStorage = ( theme ) => {
			try {
				localStorage.setItem( 'skin-citizen-theme', theme );
			} catch ( e ) {}
		};

	let theme = ( userTheme !== null ) ? userTheme : 'auto';

	if ( theme === 'auto' ) {
		const prefersDark = window.matchMedia( '(prefers-color-scheme: dark)' );
		theme = prefersDark.matches ? 'dark' : 'light';

		// Monitor prefers-color-scheme changes
		prefersDark.addEventListener( 'change', ( event ) => {
			setLocalStorage( event.matches ? 'dark' : 'light' );
		} );
	}

	setLocalStorage( theme );
}

/**
 * @param {Window} window
 * @return {void}
 */
function initTheme( window ) {
	if ( typeof window.mw !== 'undefined' ) {
		if ( window.localStorage.getItem( 'skin-citizen-theme' ) === null ) {
			initThemeSettings( window );
		}
	}
}

module.exports = {
	init: initTheme
};
