/*
 * Citizen - Theme Switcher JS
 * https://starcitizen.tools
 */

( function () {
	var prefersColorSchemeDarkQuery,
		userTheme,
		theme,
		setStorageChangeTheme;

	setStorageChangeTheme = function ( themeName ) {
		try {
			window.localStorage.setItem( 'skin-citizen-theme', themeName );
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

	setStorageChangeTheme( theme );

	prefersColorSchemeDarkQuery.addEventListener( 'change', function ( e ) {
		setStorageChangeTheme( e.matches ? 'dark' : 'light' );
	} );
}() );
