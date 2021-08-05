/**
 * Based on Vector
 * Wait for first paint before calling this function. That's its whole purpose.
 *
 * Some CSS animations and transitions are "disabled" by default as a workaround to this old Chrome
 * bug, https://bugs.chromium.org/p/chromium/issues/detail?id=332189, which otherwise causes them to
 * render in their terminal state on page load. By adding the `vector-animations-ready` class to the
 * `html` root element **after** first paint, the animation selectors suddenly match causing the
 * animations to become "enabled" when they will work properly. A similar pattern is used in Minerva
 * (see T234570#5779890, T246419).
 *
 * Example usage in Less:
 *
 * ```less
 * .foo {
 *     color: #f00;
 *     .transform( translateX( -100% ) );
 * }
 *
 * // This transition will be disabled initially for JavaScript users. It will never be enabled for
 * // no-JS users.
 * .citizen-animations-ready .foo {
 *     .transition( transform 100ms ease-out; );
 * }
 * ```
 *
 * @param {Document} document
 * @return {void}
 */
function enableCssAnimations( document ) {
	document.documentElement.classList.add( 'citizen-animations-ready' );
}

/**
 * Initialize checkboxHacks
 * TODO: Maybe ToC should init checkboxHack in its own RL module?
 *
 * @param {Window} window
 * @return {void}
 */
function initCheckboxHack( window ) {
	const checkboxHack = require( './checkboxHack.js' ),
		drawer = {
			button: document.getElementById( 'mw-drawer-button' ),
			checkbox: document.getElementById( 'mw-drawer-checkbox' ),
			target: document.getElementById( 'mw-drawer' )
		},
		personalMenu = {
			button: document.getElementById( 'personalmenu-button' ),
			checkbox: document.getElementById( 'personalmenu-checkbox' ),
			target: document.getElementById( 'p-personal' )
		},
		checkboxObjs = [ drawer, personalMenu ];

	// This should be in ToC script
	// And the media query needs to be synced with the less variable
	// Also this does not monitor screen size changes
	if ( document.body.classList.contains( 'skin-citizen-has-toc' ) &&
		window.matchMedia( 'screen and (max-width: 1300px)' ) ) {
		const tocContainer = document.getElementById( 'toc' );
		if ( tocContainer ) {
			const toc = {
				button: tocContainer.querySelector( '.toctogglelabel' ),
				checkbox: document.getElementById( 'toctogglecheckbox' ),
				target: tocContainer.querySelector( 'ul' )
			};
			checkboxObjs.push( toc );
		}
	}

	checkboxObjs.forEach( ( checkboxObj ) => {
		if ( checkboxObj.checkbox instanceof HTMLInputElement && checkboxObj.button ) {
			checkboxHack.bindToggleOnClick( checkboxObj.checkbox, checkboxObj.button );
			checkboxHack.bindUpdateAriaExpandedOnInput( checkboxObj.checkbox, checkboxObj.button );
			checkboxHack.updateAriaExpanded( checkboxObj.checkbox, checkboxObj.button );
			checkboxHack.bindToggleOnSpaceEnter( checkboxObj.checkbox, checkboxObj.button );
			checkboxHack.bindDismissOnClickOutside(
				window, checkboxObj.checkbox, checkboxObj.button, checkboxObj.target
			);
			checkboxHack.bindDismissOnEscape( window, checkboxObj.checkbox );
		}
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
		const observer = new IntersectionObserver( ( entries ) => {
			if ( !entries[ 0 ].isIntersecting ) {
				document.body.classList.add( 'skin-citizen--titlehidden' );
			} else {
				document.body.classList.remove( 'skin-citizen--titlehidden' );
			}
		} );
		observer.observe( title );
	}
}

/**
 * @param {Window} window
 * @return {void}
 */
function main( window ) {
	const theme = require( './theme.js' ),
		search = require( './search.js' );

	enableCssAnimations( window.document );
	theme.init( window );
	search.init( window );
	initCheckboxHack( window );
	onTitleHidden( window.document );

	window.addEventListener( 'beforeunload', () => {
		document.documentElement.classList.add( 'citizen-loading' );
	}, false );

	mw.loader.load( 'skins.citizen.preferences' );

	// Depreciation messages
	// TODO: Remove when hard depreciated
	mw.log.warn( 'CITIZEN: --background-color-dp-XX is depreciated; use --color-surface-X instead.' );
	mw.log.warn( 'CITIZEN: Security headers will be depreciated in the next version.' );
}

main( window );
