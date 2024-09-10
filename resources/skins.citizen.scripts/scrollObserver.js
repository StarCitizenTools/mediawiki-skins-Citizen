/**
 * Initialize a direction observer based on scroll behavior.
 *
 * @param {Function} onScrollDown - Function to be called when scrolling down.
 * @param {Function} onScrollUp - Function to be called when scrolling up.
 * @param {number} threshold - The threshold for significant scroll position change.
 */
function initDirectionObserver( onScrollDown, onScrollUp, threshold ) {
	let lastScrollTop = window.scrollY;

	const onScroll = () => {
		// Check if the scroll position has changed significantly
		const scrollTop = window.scrollY;

		if ( Math.abs( scrollTop - lastScrollTop ) < threshold ) {
			return;
		}

		// Determine scroll direction and trigger appropriate functions
		if ( scrollTop > lastScrollTop ) {
			onScrollDown();
		} else {
			onScrollUp();
		}
		lastScrollTop = scrollTop;
	};

	const throttledOnScroll = mw.util.throttle( onScroll, 100 );
	window.addEventListener( 'scroll', throttledOnScroll );
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
