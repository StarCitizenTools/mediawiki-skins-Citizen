const SCROLL_DOWN_CLASS = 'citizen-scroll--down';
const SCROLL_UP_CLASS = 'citizen-scroll--up';
const STICKY_CLASS = 'citizen-page-header--sticky';
const { initDirectionObserver, initScrollObserver } = require( './scrollObserver.js' );

/**
 * Observes the scroll direction and adds/removes corresponding classes to the body element.
 *
 * @return {void}
 */
function observeScrollDirection() {
	const toggleScrollClass = ( removeClass, addClass ) => () => {
		window.requestAnimationFrame( () => {
			document.body.classList.remove( removeClass );
			document.body.classList.add( addClass );
		} );
	};
	const addScrollDownClass = toggleScrollClass( SCROLL_UP_CLASS, SCROLL_DOWN_CLASS );
	const addScrollUpClass = toggleScrollClass( SCROLL_DOWN_CLASS, SCROLL_UP_CLASS );

	initDirectionObserver( addScrollDownClass, addScrollUpClass, 50 );
}

/**
 * Initializes the sticky header functionality for Citizen
 *
 * @return {void}
 */
function init() {
	const sentinel = document.getElementById( 'citizen-page-header-sticky-sentinel' );
	const shouldStickyHeader = getComputedStyle( sentinel ).getPropertyValue( 'display' ) !== 'none';
	if ( !shouldStickyHeader ) {
		return;
	}

	observeScrollDirection();
	let shouldRecalcHeight = true;

	const toggleStickyHeader = ( isSticky ) => {
		window.requestAnimationFrame( () => {
			if ( !shouldRecalcHeight ) {
				// The previous height is valid, set the height first
				document.body.classList.toggle( STICKY_CLASS, isSticky );
			} else {
				// The previous height is invalid, need to set to sticky to get the sticky height
				document.body.classList.toggle( STICKY_CLASS, isSticky );
				if ( isSticky ) {
					shouldRecalcHeight = false;
				}
			}
		} );
	};

	const onResize = () => {
		toggleStickyHeader( false );
	};

	const onResizeEnd = mw.util.debounce( () => {
		// Refresh static header height after resize
		shouldRecalcHeight = true;
		toggleStickyHeader( true );
	}, 250 );

	const observer = initScrollObserver(
		() => {
			toggleStickyHeader( true );
			window.addEventListener( 'resize', onResize );
			window.addEventListener( 'resize', onResizeEnd );
		},
		() => {
			toggleStickyHeader( false );
			window.removeEventListener( 'resize', onResize );
			window.removeEventListener( 'resize', onResizeEnd );
		}
	);
	observer.observe( sentinel );
}

module.exports = {
	init: init
};
