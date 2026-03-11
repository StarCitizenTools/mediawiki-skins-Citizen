/*
 * Citizen
 *
 * Inline script used in includes/Hooks/SkinHooks.php
 */

/**
 * Backported from MW 1.42
 * Modified to use localStorage only
 */
window.clientPrefs = () => {
	let className = document.documentElement.className;
	let storage;
	try {
		// mw.storage is not available in this context
		// eslint-disable-next-line mediawiki/no-storage
		storage = localStorage.getItem( 'mwclientpreferences' );
	} catch ( e ) {
		// localStorage is not available, ignore
	}
	if ( storage ) {
		// TODO: Just use array for localStorage
		storage.split( ',' ).forEach( ( pref ) => {
			const pattern = new RegExp(
				'(^| )' + pref.replace( /-clientpref-\w+$|[^\w-]+/g, '' ) + '-clientpref-\\w+( |$)'
			);
			if ( pattern.test( className ) ) {
				// Replace existing class (built-in prefs rendered by PHP)
				className = className.replace( pattern, '$1' + pref + '$2' );
			} else {
				// Append class (custom prefs not rendered server-side)
				className += ' ' + pref;
			}
		} );
		document.documentElement.className = className;
	}
};

( () => {
	window.clientPrefs();
} )();
