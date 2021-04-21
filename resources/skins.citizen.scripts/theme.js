/**
 * @param {window} window
 * @return {void}
 */
function setThemeToggle( window ) {
	let theme = localStorage.getItem( 'skin-citizen-theme' );
	const toggleButton = document.getElementById( 'theme-toggle' ),
		toggleClass = ( element ) => {
			element.classList.remove( 'theme-toggle-light', 'theme-toggle-dark', 'theme-toggle-auto' );
			// * theme-toggle-light
			// * theme-toggle-dark
			element.classList.add( 'theme-toggle-' + theme );
		};

	// Initalize button state
	toggleClass( toggleButton );

	toggleButton.addEventListener( 'click', function ( event ) {
		// Don't judge, it works -___-"
		theme = ( theme === 'dark' ) ? 'light' : 'dark';

		toggleClass( event.target );

		try {
			localStorage.setItem( 'skin-citizen-theme', theme );
		} catch ( e ) {}

		// Global function defined in the inline script
		/* eslint-disable no-undef */
		switchTheme();
		/* eslint-enable no-undef */
	} );
}

/**
 * @param {window} window
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

	// Only set up theme toggle after localStorage is set
	setThemeToggle( window );
}

/**
 * @param {window} window
 * @return {void}
 */
function initTheme( window ) {
	if ( typeof window.mw !== 'undefined' ) {
		if ( window.localStorage.getItem( 'skin-citizen-theme' ) === null ) {
			initThemeSettings( window );
		} else {
			setThemeToggle();
		}
	}
}

module.exports = {
	init: initTheme
};
