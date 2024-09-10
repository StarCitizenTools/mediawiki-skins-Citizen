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
	observeScrollDirection();

	const header = document.querySelector( '.citizen-page-header' );
	const sentinel = document.createElement( 'div' );
	sentinel.id = 'citizen-page-header-sticky-sentinel';
	header.insertAdjacentElement( 'afterend', sentinel );

	const shouldStickyHeader = getComputedStyle( sentinel ).getPropertyValue( 'display' ) !== 'none';
	if ( !shouldStickyHeader ) {
		return;
	}

	const placeholder = document.createElement( 'div' );
	placeholder.id = 'citizen-page-header-sticky-placeholder';
	header.insertAdjacentElement( 'afterend', placeholder );

	let staticHeaderHeight = header.getBoundingClientRect().height;
	let stickyHeaderHeight = 0;
	let placeholderHeight = 0;
	let shouldRecalcHeight = true;

	const toggleStickyHeader = ( isSticky ) => {
		window.requestAnimationFrame( () => {
			if ( !shouldRecalcHeight ) {
				// The previous height is valid, set the height first
				placeholder.style.height = isSticky ? `${ placeholderHeight }px` : '0px';
				document.body.classList.toggle( STICKY_CLASS, isSticky );
			} else {
				// The previous height is invalid, need to set to sticky to get the sticky height
				document.body.classList.toggle( STICKY_CLASS, isSticky );
				if ( isSticky ) {
					stickyHeaderHeight = header.getBoundingClientRect().height;
					placeholderHeight = staticHeaderHeight - stickyHeaderHeight;
					placeholder.style.height = `${ placeholderHeight }px`;
					shouldRecalcHeight = false;
				}
				placeholder.style.height = `${ isSticky ? placeholderHeight : 0 }px`;
			}
			// Update sticky header CSS variable, used by other sticky elements
			document.documentElement.style.setProperty(
				'--height-sticky-header',
				`${ isSticky ? stickyHeaderHeight : 0 }px`
			);
		} );
	};

	const onResize = () => {
		toggleStickyHeader( false );
	};

	const onResizeEnd = mw.util.debounce( () => {
		// Refresh static header height after resize
		staticHeaderHeight = header.getBoundingClientRect().height;
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
