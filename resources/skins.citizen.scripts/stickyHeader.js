const SCROLL_DOWN_CLASS = 'citizen-scroll--down';
const SCROLL_UP_CLASS = 'citizen-scroll--up';
const STICKY_CLASS = 'citizen-page-header--sticky';
const { initDirectionObserver, initIntersectionObserver } = require( './scrollObserver.js' );

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
	observeScrollDirection();

	const header = document.querySelector( '.citizen-page-header' );
	const sentinel = document.createElement( 'div' );
	sentinel.id = 'citizen-page-header-sticky-sentinel';
	header.insertAdjacentElement( 'afterend', sentinel );

	const shouldStickyHeader = getComputedStyle( sentinel ).getPropertyValue( 'display' ) !== 'none';
	if ( !shouldStickyHeader ) {
		return;
	}

	const toggleStickyClass = ( state ) => () => {
		window.requestAnimationFrame( () => {
			document.body.classList.toggle( STICKY_CLASS, state );
		} );
	};

	const observer = initIntersectionObserver(
		toggleStickyClass( true ),
		toggleStickyClass( false )
	);
	observer.observe( sentinel );
}

module.exports = {
	init: init
};
