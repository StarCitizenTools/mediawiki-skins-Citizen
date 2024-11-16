/**
 * Clientprefs names theme differently from Citizen, we will need to translate it
 * TODO: Migrate to clientprefs fully on MW 1.43
 */
const CLIENTPREFS_THEME_MAP = {
	auto: 'os',
	light: 'day',
	dark: 'night'
};

const clientPrefs = require( './clientPrefs.polyfill.js' )();

/**
 * Load client preferences based on the existence of 'citizen-preferences__card' element.
 */
function loadClientPreferences() {
	const clientPreferenceId = 'citizen-preferences-content';
	const clientPreferenceExists = document.getElementById( clientPreferenceId ) !== null;
	if ( clientPreferenceExists ) {
		const clientPreferences = require( /** @type {string} */( './clientPreferences.js' ) );
		const clientPreferenceConfig = ( require( './clientPreferences.json' ) );

		clientPreferenceConfig[ 'skin-theme' ].callback = () => {
			const LEGACY_THEME_CLASSES = [
				'skin-citizen-auto',
				'skin-citizen-light',
				'skin-citizen-dark'
			];
			const legacyThemeKey = Object.keys( CLIENTPREFS_THEME_MAP ).find( ( key ) => CLIENTPREFS_THEME_MAP[ key ] === clientPrefs.get( 'skin-theme' ) );
			document.documentElement.classList.remove( ...LEGACY_THEME_CLASSES );
			document.documentElement.classList.add( `skin-citizen-${ legacyThemeKey }` );
		};

		clientPreferences.render( `#${ clientPreferenceId }`, clientPreferenceConfig );
	}
}

/**
 * Set up the listen for preferences button
 *
 * @return {void}
 */
function listenForButtonClick() {
	const details = document.getElementById( 'citizen-preferences-details' );
	if ( !details ) {
		return;
	}
	details.addEventListener( 'click', loadClientPreferences, { once: true } );
}

listenForButtonClick();
