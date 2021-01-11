/*
 * Citizen - Theme Switcher JS
 * https://starcitizen.tools
 */

( function () {
	var prefersColorSchemeDarkQuery,
		userTheme,
		theme;

	if ( typeof window.mw === 'undefined' ) {
		return;
	}

	theme = window.mw.config.get( 'wgCitizenThemeDefault' );
	if ( theme === null ) {
		theme = 'auto';
	}

	userTheme = window.mw.user.options.get( 'CitizenThemeUser' );

	if ( userTheme !== null ) {
		theme = userTheme;
	}

	if ( theme !== 'auto' ) {
		return;
	}
	try {
		if ( window.mw.cookie.get( 'skin-citizen-theme-override' ) === '1' ) {
			return;
		}
	} catch ( e ) {}

	prefersColorSchemeDarkQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
	if ( prefersColorSchemeDarkQuery.matches ) {
		theme = 'dark';
	}

	prefersColorSchemeDarkQuery.addEventListener( 'change', function ( e ) {
		if ( e.matches ) {
			theme = 'dark';
		} else {
			theme = 'light';
		}
	} );

	try {
		window.mw.cookie.set( 'skin-citizen-theme', null );
		window.mw.cookie.set( 'skin-citizen-theme', theme );
	} catch ( e ) {
	}
}() );
