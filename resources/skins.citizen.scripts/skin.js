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
 * Add a class to indicate that sticky header is active
 *
 * @param {Document} document
 * @return {void}
 */
function initStickyHeader( document ) {
	const scrollObserver = require( './scrollObserver.js' );

	// Detect scroll direction and add the right class
	scrollObserver.initDirectionObserver(
		() => {
			document.body.classList.remove( 'citizen-scroll--up' );
			document.body.classList.add( 'citizen-scroll--down' );
		},
		() => {
			document.body.classList.remove( 'citizen-scroll--down' );
			document.body.classList.add( 'citizen-scroll--up' );
		},
		10
	);

	const sentinel = document.getElementById( 'citizen-body-header-sticky-sentinel' );

	// In some pages we use display:none to disable the sticky header
	// Do not start observer if it is set to display:none
	if ( sentinel && getComputedStyle( sentinel ).getPropertyValue( 'display' ) !== 'none' ) {
		const observer = scrollObserver.initIntersectionObserver(
			() => {
				document.body.classList.add( 'citizen-body-header--sticky' );
			},
			() => {
				document.body.classList.remove( 'citizen-body-header--sticky' );
			}
		);
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
 * @param {Window} window
 * @return {void}
 */
function main( window ) {
	const
		search = require( './search.js' ),
		checkbox = require( './checkbox.js' );

	enableCssAnimations( window.document );
	search.init( window );
	initStickyHeader( window.document );

	// Set up checkbox hacks
	checkbox.bind();

	// Table of Contents
	const tocContainer = document.getElementById( 'mw-panel-toc' );
	if ( tocContainer ) {
		const toc = require( './tableOfContents.js' );
		toc.init();
	}

	// Collapsible sections
	if ( document.body.classList.contains( 'citizen-sections-enabled' ) ) {
		const sections = require( './sections.js' );
		sections.init();
	}

	mw.loader.load( 'skins.citizen.preferences' );
	registerServiceWorker();

	window.addEventListener( 'beforeunload', () => {
		// T295085: Close all dropdown menus when page is unloaded to prevent them
		// from being open when navigating back to a page.
		checkbox.uncheckCheckboxHacks();
		// Set up loading indicator
		document.documentElement.classList.add( 'citizen-loading' );
	}, false );
}

if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
	main( window );
} else {
	document.addEventListener( 'DOMContentLoaded', function () {
		main( window );
	} );
}
