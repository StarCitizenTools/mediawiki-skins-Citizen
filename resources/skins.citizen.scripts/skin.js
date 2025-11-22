/**
 * @return {void}
 */
function deferredTasks() {
	const speculationRules = require( './speculationRules.js' );
	const serviceWorker = require( './serviceWorker.js' );

	speculationRules.init();
	serviceWorker.register();

	window.addEventListener( 'beforeunload', () => {
		// Set up loading indicator
		document.documentElement.classList.add( 'citizen-loading' );
	}, false );

	// Remove loading indicator once the page is unloaded/hidden
	window.addEventListener( 'pagehide', () => {
		document.documentElement.classList.remove( 'citizen-loading' );
	} );

	document.documentElement.classList.add( 'citizen-animations-ready' );
}

/**
 * Initialize scripts related to wiki page content
 *
 * @param {HTMLElement} bodyContent
 * @return {void}
 */
function initBodyContent( bodyContent ) {
	const
		sections = require( './sections.js' ),
		overflowElements = require( './overflowElements.js' ),
		contentEnhancements = require( './contentEnhancements.js' );

	// Collapsable sections
	sections.init( bodyContent );
	// Overflow element enhancements
	overflowElements.init( bodyContent );
	// Content enhancements
	contentEnhancements.init();
}

/**
 * Initialize preferences module when the preferences button is first clicked
 *
 * @return {void}
 */
function initPreferences() {
	document.getElementById( 'citizen-preferences-details' ).addEventListener( 'toggle', () => {
		mw.loader.load( 'skins.citizen.preferences' );
	},
	{
		once: true
	} );
}

/**
 * @param {Window} window
 * @return {void}
 */
function main( window ) {
	const
		config = require( './config.json' ),
		echo = require( './echo.js' ),
		search = require( './search.js' ),
		dropdown = require( './dropdown.js' ),
		lastModified = require( './lastModified.js' ),
		share = require( './share.js' ),
		setupObservers = require( './setupObservers.js' ),
		performance = require( './performance.js' );

	search.init( window );
	echo();
	setupObservers.main();
	dropdown.init();
	lastModified.init();
	share.init();
	performance.init();

	mw.hook( 'wikipage.content' ).add( ( content ) => {
		// content is a jQuery object
		// note that this refers to .mw-body-content, not #bodyContent
		initBodyContent( content[ 0 ] );
	} );

	// Preferences module
	if ( config.wgCitizenEnablePreferences === true ) {
		initPreferences();
	}

	// Defer non-essential tasks
	mw.requestIdleCallback( deferredTasks, { timeout: 3000 } );
}

if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
	main( window );
} else {
	document.addEventListener( 'DOMContentLoaded', () => {
		main( window );
	} );
}
