const SCROLL_DOWN_CLASS = 'citizen-scroll--down';
const SCROLL_UP_CLASS = 'citizen-scroll--up';
const STICKY_SENTINEL_ID = 'citizen-page-header-sticky-sentinel';
const STICKY_CLASS = 'citizen-page-header--sticky';

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
 * Initializes the sticky header functionality by setting up scroll observers and intersection observers.
 *
 * @param {Document} document - The document object representing the webpage.
 */
function initStickyHeader( document ) {
	const { initDirectionObserver, initIntersectionObserver } = require( './scrollObserver.js' );

	const toggleScrollClass = ( removeClass, addClass ) => () => {
		window.requestAnimationFrame( () => {
			document.body.classList.remove( removeClass );
			document.body.classList.add( addClass );
		} );
	};

	const addScrollDownClass = toggleScrollClass( SCROLL_UP_CLASS, SCROLL_DOWN_CLASS );
	const addScrollUpClass = toggleScrollClass( SCROLL_DOWN_CLASS, SCROLL_UP_CLASS );

	const toggleStickyClass = ( state ) => () => {
		window.requestAnimationFrame( () => {
			document.body.classList.toggle( STICKY_CLASS, state );
		} );
	};

	initDirectionObserver( addScrollDownClass, addScrollUpClass, 10 );

	const sentinel = document.getElementById( STICKY_SENTINEL_ID );
	const shouldStickyHeader = sentinel && getComputedStyle( sentinel ).getPropertyValue( 'display' ) !== 'none';

	if ( shouldStickyHeader ) {
		const observer = initIntersectionObserver( toggleStickyClass( true ), toggleStickyClass( false ) );
		observer.observe( sentinel );
	}
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
		lastModified = require( './lastModified.js' ),
		checkbox = require( './checkbox.js' ),
		dropdown = require( './dropdown.js' );

	enableCssAnimations( window.document );
	search.init( window );
	lastModified.init();
	initStickyHeader( window.document );

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
