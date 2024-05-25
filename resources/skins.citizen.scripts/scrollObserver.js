/**
 * Create an observer based vertical scroll direction with debouncing
 *
 * @param {Function} onScrollDown functionality for when viewport is scrolled down
 * @param {Function} onScrollUp functionality for when viewport is scrolled up
 * @param {number} threshold minimum scrolled px to trigger the function
 * @return {void}
 */
function initDirectionObserver( onScrollDown, onScrollUp, threshold ) {
	let lastScrollTop = window.scrollY;

	const onScroll = () => {
		const scrollTop = window.scrollY;

		if ( Math.abs( scrollTop - lastScrollTop ) < threshold ) {
			return;
		}

		if ( scrollTop > lastScrollTop ) {
			onScrollDown();
		} else {
			onScrollUp();
		}
		lastScrollTop = scrollTop;
	};

	const debouncedOnScroll = mw.util.debounce( onScroll, 100 );
	window.addEventListener( 'scroll', mw.util.throttle( debouncedOnScroll, 250 ) );
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
	return new IntersectionObserver( ( entries ) => {
		if ( !entries[ 0 ].isIntersecting && entries[ 0 ].boundingClientRect.top < 0 ) {
			// Viewport has crossed the bottom edge of the target element.
			onHidden();
		} else {
			// Viewport is above the bottom edge of the target element.
			onVisible();
		}
	} );
}

module.exports = {
	initDirectionObserver,
	initIntersectionObserver
};
