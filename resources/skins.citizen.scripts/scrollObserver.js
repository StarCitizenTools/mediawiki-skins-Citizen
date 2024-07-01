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
 * Create an observer based on element visiblity.
 * Based on Vector
 *
 * @param {Function} onHidden functionality for when the element is visible
 * @param {Function} onVisible functionality for when the element is hidden
 * @return {IntersectionObserver}
 */
function initIntersectionObserver( onHidden, onVisible ) {
	/* eslint-disable-next-line compat/compat */
	return new IntersectionObserver( ( [ entry ] ) => {
		if ( entry.isIntersecting ) {
			// Viewport is within the target element.
			onVisible();
		} else if ( entry.boundingClientRect.top < 0 ) {
			// Viewport has crossed the bottom edge of the target element.
			onHidden();
		}
	} );
}

module.exports = {
	initDirectionObserver,
	initIntersectionObserver
};
