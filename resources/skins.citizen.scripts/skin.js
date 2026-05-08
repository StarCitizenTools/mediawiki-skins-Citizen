/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {Object} deps.navigator
 * @param {Object} deps.HTMLScriptElement
 * @return {void}
 */
function deferredTasks( { document, window, mw, navigator, HTMLScriptElement } ) {
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
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {typeof IntersectionObserver} deps.IntersectionObserver
 * @param {typeof ResizeObserver} deps.ResizeObserver
 * @return {void}
 */
function initBodyContent(
	bodyContent, { document, window, mw, IntersectionObserver, ResizeObserver }
) {
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
		{ createPerformanceMode } = require( './performance.js' ),
		{ createPreferences } = require( './preferences.js' );

	search.init( { window, document, mw } );
	createEchoUpgrade( { document, mw } ).init();
	setupObservers.init( { document, window, mw, IntersectionObserver } );
	dropdown.init( { document, window } );
	createLastModified( { document, Intl } ).init();
	createShare( { document, window, mw, navigator } ).init();
	createPerformanceMode( { document, mw } ).init();

	mw.hook( 'wikipage.content' ).add( ( content ) => {
		// content is a jQuery object
		// note that this refers to .mw-body-content, not #bodyContent
		initBodyContent(
			content[ 0 ], { document, window, mw, IntersectionObserver, ResizeObserver }
		);
	} );

	// Preferences module
	if ( config.wgCitizenEnablePreferences === true ) {
		createPreferences( { document, mw } ).init();
	}

	// Defer non-essential tasks
	mw.requestIdleCallback(
		() => deferredTasks( { document, window, mw, navigator, HTMLScriptElement } ),
		{ timeout: 3000 }
	);
}

if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
	main( window );
} else {
	document.addEventListener( 'DOMContentLoaded', () => {
		main( window );
	} );
}
