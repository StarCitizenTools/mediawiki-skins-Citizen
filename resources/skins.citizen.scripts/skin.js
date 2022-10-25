const
	checkboxHack = require( './checkboxHack.js' ),
	CHECKBOX_HACK_CONTAINER_SELECTOR = '.mw-checkbox-hack-container',
	CHECKBOX_HACK_CHECKBOX_SELECTOR = '.mw-checkbox-hack-checkbox',
	CHECKBOX_HACK_BUTTON_SELECTOR = '.mw-checkbox-hack-button',
	CHECKBOX_HACK_TARGET_SELECTOR = '.mw-checkbox-hack-target';

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
 * Add the ability for users to toggle dropdown menus using the enter key (as
 * well as space) using core's checkboxHack.
 *
 * Based on Vector
 */
function bind() {
	// Search for all dropdown containers using the CHECKBOX_HACK_CONTAINER_SELECTOR.
	const containers = document.querySelectorAll( CHECKBOX_HACK_CONTAINER_SELECTOR );

	containers.forEach( ( container ) => {
		const
			checkbox = container.querySelector( CHECKBOX_HACK_CHECKBOX_SELECTOR ),
			button = container.querySelector( CHECKBOX_HACK_BUTTON_SELECTOR ),
			target = container.querySelector( CHECKBOX_HACK_TARGET_SELECTOR );

		if ( !( checkbox && button && target ) ) {
			return;
		}

		checkboxHack.bind( window, checkbox, button, target );
	} );
}

/**
 * T295085: Close all dropdown menus when page is unloaded to prevent them from
 * being open when navigating back to a page.
 *
 * Based on Vector
 */
function bindCloseOnUnload() {
	addEventListener( 'beforeunload', () => {
		const checkboxes = document.querySelectorAll( CHECKBOX_HACK_CHECKBOX_SELECTOR + ':checked' );

		checkboxes.forEach( ( checkbox ) => {
			/** @type {HTMLInputElement} */ ( checkbox ).checked = false;
		} );
	} );
}

/**
 * Add a class to indicate that sticky header is active
 *
 * @param {Document} document
 * @return {void}
 */
function initStickyHeader( document ) {
	const sentinel = document.getElementById( 'citizen-body-header-sticky-sentinel' );

	if ( sentinel ) {
		const scrollObserver = require( './scrollObserver.js' );

		const observer = scrollObserver.initScrollObserver(
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
	// I can't figure out how to add the Service-Worker-Allowed HTTP header to change the default scope
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
	const search = require( './search.js' );

	enableCssAnimations( window.document );
	search.init( window );
	initStickyHeader( window.document );

	// Set up checkbox hacks
	bind();
	bindCloseOnUnload();

	// Table of Contents
	const tocContainer = document.getElementById( 'mw-panel-toc' );
	if ( tocContainer ) {
		const toc = require( './tableOfContents.js' );
		toc.init();
	}

	mw.loader.load( 'skins.citizen.preferences' );

	// Set up loading indicator
	window.addEventListener( 'beforeunload', () => {
		document.documentElement.classList.add( 'citizen-loading' );
	}, false );
	registerServiceWorker();
}

if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
	main( window );
} else {
	document.addEventListener( 'DOMContentLoaded', function () {
		main( window );
	} );
}
