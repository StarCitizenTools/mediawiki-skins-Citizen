/**
 * Initialize a direction observer based on scroll behavior.
 *
 * @param {Function} onScrollDown - Function to be called when scrolling down.
 * @param {Function} onScrollUp - Function to be called when scrolling up.
 * @param {number} threshold - The threshold for significant scroll position change.
 */
function initDirectionObserver( onScrollDown, onScrollUp, threshold ) {
	let lastScrollTop = 0;
	let lastScrollDirection = '';
	let isScrolling = false;

	window.addEventListener( 'scroll', () => {
		if ( !isScrolling ) {
			window.requestAnimationFrame( () => {
				const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

				if ( Math.abs( currentScrollTop - lastScrollTop ) < threshold ) {
					isScrolling = false;
					return;
				}

				if ( currentScrollTop > lastScrollTop && lastScrollDirection !== 'down' ) {
					lastScrollDirection = 'down';
					onScrollDown();
				} else if ( currentScrollTop < lastScrollTop && lastScrollDirection !== 'up' ) {
					lastScrollDirection = 'up';
					onScrollUp();
				}
				// For Mobile or negative scrolling
				lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
				isScrolling = false;
			} );
			isScrolling = true;
		}
	} );
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
