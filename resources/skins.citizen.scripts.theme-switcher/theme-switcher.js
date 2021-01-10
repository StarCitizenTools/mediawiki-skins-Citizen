/*
 * Citizen - Theme Switcher JS
 * https://starcitizen.tools
 */

( function () {
	var isGlobalAutoSet,
		isUserPreferenceAuto,
		enableAutoSwitcher,
		switchColorScheme,
		useDarkTheme,
		prefersColorSchemeDarkQuery;

	if ( typeof window.mw === 'undefined' ) {
		return;
	}

	isGlobalAutoSet = window.mw.config.get( 'wgCitizenColorScheme' ) === 'auto' ||
        window.mw.config.get( 'wgCitizenColorScheme' ) === null;

	isUserPreferenceAuto = window.mw.user.options.get( 'citizen-color-scheme' ) === 'auto';

	enableAutoSwitcher = isGlobalAutoSet || isUserPreferenceAuto;

	if ( !enableAutoSwitcher ) {
		return;
	}

	switchColorScheme = function ( useDark ) {
		var dark;

		if ( useDark ) {
			document.documentElement.classList.add( 'skin-citizen-dark' );
			document.documentElement.classList.remove( 'skin-citizen-light' );
			dark = true;
		} else {
			document.documentElement.classList.add( 'skin-citizen-light' );
			document.documentElement.classList.remove( 'skin-citizen-dark' );
			dark = false;
		}

		try {
			localStorage.setItem( 'skin-citizen-dark', dark );
		} catch ( e ) {}
	};

	try {
		useDarkTheme = localStorage.getItem( 'skin-citizen-dark' );
	} catch ( e ) {}

	prefersColorSchemeDarkQuery = window.matchMedia( '(prefers-color-scheme: dark)' );

	if ( useDarkTheme || prefersColorSchemeDarkQuery.matches ) {
		switchColorScheme( true );
	}
}() );
