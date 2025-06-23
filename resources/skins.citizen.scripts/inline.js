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
	const storage = localStorage.getItem( 'mwclientpreferences' );
	if ( storage ) {
		// TODO: Just use array for localStorage
		storage.split( ',' ).forEach( ( pref ) => {
			className = className.replace(

				new RegExp( '(^| )' + pref.replace( /-clientpref-\w+$|[^\w-]+/g, '' ) + '-clientpref-\\w+( |$)' ),
				'$1' + pref + '$2'
			);
		} );
		document.documentElement.className = className;
	}
};

( () => {
	window.clientPrefs();
} )();
