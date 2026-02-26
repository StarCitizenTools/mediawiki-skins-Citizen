/**
 * @return {void}
 */
function deferredTasks() {
	const { createSpeculationRules } = require( './speculationRules.js' );
	const { createServiceWorker } = require( './serviceWorker.js' );

	createSpeculationRules( { document, mw, HTMLScriptElement } ).init();
	createServiceWorker( { mw, navigator } ).register();

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
		{ createSections } = require( './sections.js' ),
		overflowElements = require( './overflowElements/index.js' ),
		{ createContentEnhancements } = require( './contentEnhancements.js' ),
		config = require( './config.json' );

	// Collapsable sections
	createSections( { document, bodyContent } ).init();
	// Overflow element enhancements
	overflowElements.init( {
		document, window, mw, IntersectionObserver, ResizeObserver,
		bodyContent, config
	} );
	// Content enhancements
	createContentEnhancements( { document, bodyContent } ).init();
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
		{ createEchoUpgrade } = require( './echo.js' ),
		search = require( './search.js' ),
		dropdown = require( './dropdown.js' ),
		{ createLastModified } = require( './lastModified.js' ),
		{ createShare } = require( './share.js' ),
		setupObservers = require( './setupObservers.js' ),
		{ createPerformanceMode } = require( './performance.js' );

	search.init( window );
	createEchoUpgrade( { document, mw, MutationObserver } ).init();
	setupObservers.main();
	dropdown.init( { document, window } );
	createLastModified( { document, Intl } ).init();
	createShare( { document, window, mw, navigator } ).init();
	createPerformanceMode( { document, mw } ).init();

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
