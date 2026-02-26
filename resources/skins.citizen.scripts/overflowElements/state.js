/**
 * Manages overflow state detection and class toggling for an overflow element.
 * Tracks element dimensions and scroll position, toggling left/right overflow
 * indicator classes and syncing sticky header scroll position.
 *
 * @param {Object} params
 * @param {Window} params.window
 * @param {HTMLElement} params.element
 * @param {HTMLElement} params.content
 * @param {HTMLElement} params.wrapper
 * @param {HTMLElement|null} params.stickyHeader
 * @return {{updateState: Function, hasOverflowed: Function}}
 */
function createOverflowState( { window, element, content, wrapper, stickyHeader } ) {
	let elementWidth = 0;
	let contentScrollLeft = 0;
	let contentWidth = 0;

	function hasStateChanged() {
		return (
			element.scrollWidth !== elementWidth ||
			Math.round( content.scrollLeft ) !== contentScrollLeft ||
			content.offsetWidth !== contentWidth
		);
	}

	function hasOverflowed() {
		return element.scrollWidth > content.offsetWidth;
	}

	function toggleClasses( classes ) {
		classes.forEach( ( [ condition, className ] ) => {
			const hasClass = wrapper.classList.contains( className );
			if ( condition && !hasClass ) {
				wrapper.classList.add( className );
			} else if ( !condition && hasClass ) {
				wrapper.classList.remove( className );
			}
		} );
	}

	function updateState() {
		if ( !hasStateChanged() ) {
			return;
		}

		elementWidth = element.scrollWidth;
		contentScrollLeft = Math.round( content.scrollLeft );
		contentWidth = content.offsetWidth;

		let isLeftOverflowing, isRightOverflowing;

		if ( !hasOverflowed() ) {
			isLeftOverflowing = false;
			isRightOverflowing = false;
		} else {
			isLeftOverflowing = contentScrollLeft > 0;
			isRightOverflowing =
				contentScrollLeft + contentWidth < elementWidth;
		}

		window.requestAnimationFrame( () => {
			toggleClasses( [
				[ isLeftOverflowing, 'citizen-overflow--left' ],
				[ isRightOverflowing, 'citizen-overflow--right' ]
			] );
			if ( stickyHeader ) {
				stickyHeader.style.setProperty( '--citizen-overflow-scroll-x', contentScrollLeft + 'px' );
			}
		} );
	}

	return { updateState, hasOverflowed };
}

module.exports = { createOverflowState };
