const
	Vue = require( 'vue' ),
	{ createPinia } = require( 'pinia' ),
	App = require( './components/App.vue' ),
	config = require( './config.json' );

/**
 * Initialize the command palette
 *
 * @return {void}
 */
function initApp() {
	const teleportTarget = require( 'mediawiki.page.ready' ).teleportTarget;

	// We can't mount directly to the teleportTarget or it will break OOUI overlays
	const overlay = document.createElement( 'div' );
	overlay.classList.add( 'citizen-command-palette-overlay' );
	teleportTarget.appendChild( overlay );

	const app = Vue.createMwApp( App, {}, config );

	const pinia = createPinia();
	app.use( pinia );

	const commandPalette = app.mount( overlay );

	registerButton( commandPalette );
}

/**
 * Setup the button to open the command palette
 * This is very hacky, but it works for now.
 *
 * @param {Vue} commandPalette
 * @return {void}
 */
function registerButton( commandPalette ) {
	const details = document.getElementById( 'citizen-search-details' );
	// Remove the search card from the DOM so it won't be triggered by the button
	document.getElementById( 'citizen-search__card' )?.remove();

	details.open = false;
	details.addEventListener( 'click', () => {
		commandPalette.open();
	} );
}

initApp();
