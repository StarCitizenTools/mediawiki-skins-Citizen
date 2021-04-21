/**
 * @param {window} window
 * @return {void}
 */
function switchTheme( window ) {
	const userTheme = window.mw.user.options.get( 'CitizenThemeUser' ),
		setLocalStorage = ( theme ) => {
			try {
				window.localStorage.setItem( 'skin-citizen-theme', theme );
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
 * @param {window} window
 * @return {void}
 */
function initThemeSwitcher( window ) {
	if ( typeof window.mw !== 'undefined' ) {
		switchTheme( window );
	}
}

initThemeSwitcher( window );
