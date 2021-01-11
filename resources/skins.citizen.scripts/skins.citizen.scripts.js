/*
 * Citizen - Core JS
 * https://starcitizen.tools
 */

var searchToggle = document.getElementById( 'search-toggle' ),
	searchInput = document.getElementById( 'searchInput' ),
	pageReady = require( ( 'mediawiki.page.ready' ) );

/**
 * Focus in search box when search toggle checkbox is checked.
 *
 * @constructor
 */
function searchInputFocus() {
	if ( searchToggle.checked !== false ) {
		searchInput.focus();
	}
}

/**
 * Check search toggle checkbox when search box is in focus.
 *
 * @constructor
 */
function searchToggleCheck() {
	if ( searchToggle.checked === false ) {
		searchToggle.checked = true;
	}
}

function main() {
	searchToggle.addEventListener( 'click', searchInputFocus );
	searchInput.addEventListener( 'focus', searchToggleCheck );
	pageReady.loadSearchModule(
		// Decide between new Citizen implementation or core
		mw.config.get( 'wgCitizenEnableSearch' ) ?
			'skins.citizen.scripts.search' : 'mediawiki.searchSuggest'
	);
}

main();

( function () {
	var theme = window.mw.cookie.get( 'skin-citizen-theme' );
	var toggleBtn = document.getElementById( 'theme-toggle' );

	// * theme-toggle-light
	// * theme-toggle-dark
	toggleBtn.classList.add( 'theme-toggle-' + theme );

	toggleBtn.addEventListener( 'click', function ( clickEvent ) {
		try {

			theme = theme === 'dark' ? 'light' : 'dark';

			clickEvent.target.classList.remove( 'theme-toggle-light', 'theme-toggle-dark' );
			// * theme-toggle-light
			// * theme-toggle-dark
			clickEvent.target.classList.add( 'theme-toggle-' + theme );

			try {
				window.mw.cookie.set( 'skin-citizen-theme', null );
				window.mw.cookie.set( 'skin-citizen-theme', theme );
				window.mw.cookie.set( 'skin-citizen-theme-override', '1' );
			} catch ( e ) {
			}

			[ 'auto', 'dark', 'light' ].map( function ( themeSuffix ) {
				// * skin-citizen-auto
				// * skin-citizen-dark
				// * skin-citizen-light
				return 'skin-citizen-' + themeSuffix;
			} ).forEach( function ( cssClass ) {
				// * skin-citizen-auto
				// * skin-citizen-dark
				// * skin-citizen-light
				document.documentElement.classList.remove( cssClass );
			} );
			// * skin-citizen-auto
			// * skin-citizen-dark
			// * skin-citizen-light
			document.documentElement.classList.add( 'skin-citizen-' + theme );
		} catch ( e ) {
		}
	} );
}() );
