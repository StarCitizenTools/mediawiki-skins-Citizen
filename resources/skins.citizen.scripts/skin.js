/**
 * @return {void}
 */
function deferredTasks() {
	const speculationRules = require( './speculationRules.js' );

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

	document.documentElement.classList.add( 'citizen-animations-ready' );
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
 * Turn off performance mode if GPU acceleration is available
 * Skip the check if a user preference is already set.
 *
 * @return {void}
 */
function initPerformanceMode() {
	const prefName = 'citizen-feature-performance-mode-clientpref-';
	const clientPrefs = localStorage.getItem( 'mwclientpreferences' );

	if ( clientPrefs && ( clientPrefs.includes( prefName + '0' ) || clientPrefs.includes( prefName + '1' ) ) ) {
		return;
	}

	const canvas = document.createElement( 'canvas' );
	const contextNames = [ 'webgl', 'experimental-webgl', 'webgl2' ];
	const hasGpu = contextNames.some( ( name ) => {
		try {
			const gl = canvas.getContext( name );
			return !!( gl && typeof gl.getParameter === 'function' );
		} catch ( e ) {
			return false;
		}
	} );

	if ( !hasGpu ) {
		// Performance mode ON is default, so we don't need to do anything
		return;
	}

	document.documentElement.classList.remove( prefName + '1' );
	document.documentElement.classList.add( prefName + '0' );
	localStorage.setItem( 'mwclientpreferences', clientPrefs ? `${ clientPrefs },${ prefName }0` : `${ prefName }0` );
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
		setupObservers = require( './setupObservers.js' );

	search.init( window );
	echo();
	setupObservers.main();
	dropdown.init();
	lastModified.init();
	share.init();
	initPerformanceMode();

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
