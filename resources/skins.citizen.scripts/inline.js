/*
 * Citizen
 *
 * Inline script used in includes/Hooks/SkinHooks.php
 */
const LEGACY_PREFIX = 'skin-citizen-';

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

			// Legacy support
			if ( pref.startsWith( 'skin-theme-clientpref-' ) ) {
				const CLIENTPREFS_THEME_MAP = {
					os: 'auto',
					day: 'light',
					night: 'dark'
				};
				const matchedKey = CLIENTPREFS_THEME_MAP[ pref.replace( 'skin-theme-clientpref-', '' ) ];
				if ( matchedKey ) {
					// eslint-disable-next-line max-len, es-x/no-object-values
					const classesToRemove = Object.values( CLIENTPREFS_THEME_MAP ).map( ( theme ) => LEGACY_PREFIX + theme );
					className = className.replace(

						new RegExp( classesToRemove.join( '|' ), 'g' ),
						''
					);
					className += ` ${ LEGACY_PREFIX }${ matchedKey }`;
				}
			}
		} );
		document.documentElement.className = className;
	}
};

( () => {
	window.clientPrefs();
} )();
