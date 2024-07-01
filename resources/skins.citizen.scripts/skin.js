/**
 * Wait for first paint before calling this function.
 * (see T234570#5779890, T246419).
 *
 * @param {Document} document
 * @return {void}
 */
function enableCssAnimations( document ) {
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
	if ( scriptPath === '' ) {
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
		toc = require( './tableOfContents.js' );

	// Collapsable sections
	sections.init( bodyContent );
	// Overflow element enhancements
	overflowElements.init( bodyContent );
	// Table of contents
	toc.init( bodyContent );
}

/**
 * @param {Window} window
 * @return {void}
 */
function main( window ) {
	const
		config = require( './config.json' ),
		search = require( './search.js' ),
		share = require( './share.js' ),
		stickyHeader = require( './stickyHeader.js' ),
		lastModified = require( './lastModified.js' ),
		checkbox = require( './checkbox.js' ),
		dropdown = require( './dropdown.js' );

	enableCssAnimations( window.document );
	search.init( window );
	share.init();
	lastModified.init();
	stickyHeader.init();

	// Set up checkbox hacks
	checkbox.bind();
	dropdown.init();

	mw.hook( 'wikipage.content' ).add( ( content ) => {
		// content is a jQuery object
		// note that this refers to .mw-body-content, not #bodyContent
		initBodyContent( content[ 0 ] );
	} );

	// Preference module
	if ( config.wgCitizenEnablePreferences === true && typeof document.createElement( 'div' ).prepend === 'function' ) {
		mw.loader.load( 'skins.citizen.preferences' );
	}

	registerServiceWorker();

	window.addEventListener( 'beforeunload', () => {
		// T295085: Close all dropdown menus when page is unloaded to prevent them
		// from being open when navigating back to a page.
		checkbox.uncheckCheckboxHacks();
		// Set up loading indicator
		document.documentElement.classList.add( 'citizen-loading' );
	}, false );

	// Remove loading indicator once the page is unloaded/hidden
	window.addEventListener( 'pagehide', () => {
		document.documentElement.classList.remove( 'citizen-loading' );
	} );
}

if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
	main( window );
} else {
	document.addEventListener( 'DOMContentLoaded', () => {
		main( window );
	} );
}
