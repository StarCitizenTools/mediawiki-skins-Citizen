/**
 * @return {void}
 */
function deferredTasks() {
	const
		setupObservers = require( './setupObservers.js' ),
		speculationRules = require( './speculationRules.js' );

	setupObservers.main();
	speculationRules.init();
	registerServiceWorker();

	window.addEventListener( 'beforeunload', () => {
		// Set up loading indicator
		document.documentElement.classList.add( 'citizen-loading' );
	}, false );

	// Remove loading indicator once the page is unloaded/hidden
	window.addEventListener( 'pagehide', () => {
		document.documentElement.classList.remove( 'citizen-loading' );
	} );
}

/**
 * Register service worker
 *
 * @return {void}
 */
function registerServiceWorker() {
	const scriptPath = mw.config.get( 'wgScriptPath' );
	// Only allow serviceWorker when the scriptPath is at root because of its scope
	// I can't figure out how to add the Service-Worker-Allowed HTTP header
	// to change the default scope
	if ( scriptPath !== '' ) {
		return;
	}

	if ( 'serviceWorker' in navigator ) {
		const SW_MODULE_NAME = 'skins.citizen.serviceWorker',
			version = mw.loader.moduleRegistry[ SW_MODULE_NAME ].version,
			// HACK: Faking a RL link
			swUrl = scriptPath +
				'/load.php?modules=' + SW_MODULE_NAME +
				'&only=scripts&raw=true&skin=citizen&version=' + version;
		navigator.serviceWorker.register( swUrl, { scope: '/' } );
	}
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
		overflowElements = require( './overflowElements.js' );

	// Collapsable sections
	sections.init( bodyContent );
	// Overflow element enhancements
	overflowElements.init( bodyContent );
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
		share = require( './share.js' );

	dropdown.init();
	search.init( window );
	echo();
	lastModified.init();
	share.init();

	mw.hook( 'wikipage.content' ).add( ( content ) => {
		// content is a jQuery object
		// note that this refers to .mw-body-content, not #bodyContent
		initBodyContent( content[ 0 ] );
	} );

	// Preference module
	if ( config.wgCitizenEnablePreferences === true ) {
		mw.loader.load( 'skins.citizen.preferences' );
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
