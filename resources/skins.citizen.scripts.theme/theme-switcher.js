/*
 * Citizen - Theme Switcher JS
 * https://starcitizen.tools
 */

( function () {
	var prefersColorSchemeDarkQuery,
		userTheme,
		theme,
		setCookieChangeTheme,
		hasCookieConscent,
		cookieOptions;

	setCookieChangeTheme = function ( themeName ) {
		try {
			cookieOptions = {};
			// The cookie is only used on the site
			cookieOptions.sameSite = 'Strict';
			// Check if Extension:CookieWarning is enabled
			if ( window.mw.loader.getState( 'ext.CookieWarning' ) ) {
				// Set the cookie as a session cookie if no conscent is given
				hasCookieConscent = window.mw.cookie.get( 'cookiewarning_dismissed' ) === true ||
				window.mw.user.options.get( 'cookiewarning_dismissed' ) === 1;
				if ( !hasCookieConscent ) {
					cookieOptions.expires = null;
				}
			}
			window.mw.cookie.set( 'skin-citizen-theme', themeName, cookieOptions );
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
