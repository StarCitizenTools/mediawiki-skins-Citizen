/**
 * Initialize a direction observer based on scroll behavior.
 *
 * @param {Function} onScrollDown - Function to be called when scrolling down.
 * @param {Function} onScrollUp - Function to be called when scrolling up.
 * @param {number} threshold - The threshold for significant scroll position change.
 * @return {Object}
 */
function initDirectionObserver( onScrollDown, onScrollUp, threshold = 0 ) {
	let lastScrollPosition = 0;
	let lastScrollDirection = '';

	const onScroll = () => {
		const currentScrollPosition = window.scrollY;
		const scrollDiff = currentScrollPosition - lastScrollPosition;

		if ( Math.abs( scrollDiff ) < threshold ) {
			return;
		}

		if ( scrollDiff > 0 && lastScrollDirection !== 'down' ) {
			lastScrollDirection = 'down';
			onScrollDown();
		} else if ( scrollDiff < 0 && lastScrollDirection !== 'up' ) {
			lastScrollDirection = 'up';
			onScrollUp();
		}
		lastScrollPosition = currentScrollPosition <= 0 ? 0 : currentScrollPosition;
	};

	return {
		resume: () => {
			window.addEventListener( 'scroll', mw.util.throttle( onScroll, 100 ) );
		},
		pause: () => {
			window.removeEventListener( 'scroll', mw.util.throttle( onScroll, 100 ) );
		}
	};
}

/**
 * Create an observer for showing/hiding feature and for firing scroll event hooks.
 *
 * @param {Function} show functionality for when feature is visible
 * @param {Function} hide functionality for when feature is hidden
 * @return {IntersectionObserver}
 */
function initScrollObserver( show, hide ) {
	/* eslint-disable-next-line compat/compat */
	return new IntersectionObserver( ( entries ) => {
		if ( !entries[ 0 ].isIntersecting && entries[ 0 ].boundingClientRect.top < 0 ) {
			// Viewport has crossed the bottom edge of the target element.
			show();
		} else {
			// Viewport is above the bottom edge of the target element.
			hide();
		}
	} );
}

module.exports = {
	initDirectionObserver,
	initScrollObserver
};
