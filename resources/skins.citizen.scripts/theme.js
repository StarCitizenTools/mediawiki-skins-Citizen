/**
 * @param {window} window
 * @return {void}
 */
function setThemeToggle( window ) {
	document.getElementById( 'theme-toggle' ).addEventListener( 'click', ( event ) => {
		let theme = localStorage.getItem( 'skin-citizen-theme' );

		// Don't judge, it works -___-"
		theme = ( theme === 'dark' ) ? 'light' : 'dark';

		event.target.classList.remove( 'theme-toggle-light', 'theme-toggle-dark', 'theme-toggle-auto' );
		// * theme-toggle-light
		// * theme-toggle-dark
		event.target.classList.add( 'theme-toggle-' + theme );

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
