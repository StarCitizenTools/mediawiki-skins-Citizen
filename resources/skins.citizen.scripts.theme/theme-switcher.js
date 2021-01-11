/*
 * Citizen - Theme Switcher JS
 * https://starcitizen.tools
 */

( function () {
	var prefersColorSchemeDarkQuery,
		userTheme,
		theme,
		setCookieChangeTheme;

	setCookieChangeTheme = function ( themeName ) {
		try {
			window.mw.cookie.set( 'skin-citizen-theme', themeName );
		} catch ( e ) {
		}

		window.switchTheme();
	};

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
	theme = 'light';
	if ( prefersColorSchemeDarkQuery.matches ) {
		theme = 'dark';
	}

	setCookieChangeTheme( theme );

	prefersColorSchemeDarkQuery.addEventListener( 'change', function ( e ) {
		setCookieChangeTheme( e.matches ? 'dark' : 'light' );
	} );
}() );
