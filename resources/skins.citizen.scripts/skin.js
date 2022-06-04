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
 * Add a class to indicate that page title is outside of viewport
 *
 * @param {Document} document
 * @return {void}
 */
function onTitleHidden( document ) {
	const title = document.getElementById( 'firstHeading' );

	if ( title ) {
		const scrollObserver = require( './scrollObserver.js' );

		const observer = scrollObserver.initScrollObserver(
			() => {
				document.body.classList.add( 'citizen-title--hidden' );
			},
			() => {
				document.body.classList.remove( 'citizen-title--hidden' );
			}
		);
		observer.observe( title );
	}
}

/**
 * @param {Window} window
 * @return {void}
 */
function main( window ) {
	const search = require( './search.js' );

	const tocContainer = document.getElementById( 'toc' );

	enableCssAnimations( window.document );
	search.init( window );
	onTitleHidden( window.document );

	window.addEventListener( 'beforeunload', () => {
		document.documentElement.classList.add( 'citizen-loading' );
	}, false );

	bind();
	bindCloseOnUnload();

	// Handle ToC
	// TODO: There must be a cleaner way to do this
	if ( tocContainer ) {
		const toc = require( './tableOfContents.js' );
		toc.init();

		checkboxHack.bind(
			window,
			document.getElementById( 'toctogglecheckbox' ),
			tocContainer.querySelector( '.toctogglelabel' ),
			tocContainer.querySelector( 'ul' )
		);
	}

	mw.loader.load( 'skins.citizen.preferences' );
}

if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
	main( window );
} else {
	document.addEventListener( 'DOMContentLoaded', function () {
		main( window );
	} );
}
