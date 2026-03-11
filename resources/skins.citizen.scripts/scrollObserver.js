/**
 * Create a direction observer based on scroll behavior.
 *
 * @param {Object} deps
 * @param {Window} deps.window
 * @param {Function} deps.throttle - Throttle function (e.g. mw.util.throttle).
 * @param {Function} deps.onScrollDown - Called when scrolling down.
 * @param {Function} deps.onScrollUp - Called when scrolling up.
 * @param {number} [deps.threshold] - Minimum scroll delta to trigger a direction change.
 * @return {Object}
 */
function createDirectionObserver( { window, throttle, onScrollDown, onScrollUp, threshold = 0 } ) {
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

	const throttledOnScroll = throttle( onScroll, 100 );

	return {
		resume: () => {
			window.addEventListener( 'scroll', throttledOnScroll );
		},
		pause: () => {
			window.removeEventListener( 'scroll', throttledOnScroll );
		}
	};
}

/**
 * Create an intersection-based scroll observer for show/hide behavior.
 *
 * @param {Object} deps
 * @param {typeof IntersectionObserver} deps.IntersectionObserver
 * @return {Object}
 */
function createScrollObserver( { IntersectionObserver } ) {
	/**
	 * @param {Function} show - Called when target scrolls out of view above viewport.
	 * @param {Function} hide - Called when target is in view.
	 * @return {IntersectionObserver}
	 */
	function observe( show, hide ) {
		return new IntersectionObserver( ( entries ) => {
			if ( !entries[ 0 ].isIntersecting && entries[ 0 ].boundingClientRect.top < 0 ) {
				show();
			} else {
				hide();
			}
		} );
	}

	return { observe };
}

module.exports = {
	createDirectionObserver,
	createScrollObserver
};
