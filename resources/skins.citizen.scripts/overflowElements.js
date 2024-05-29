const config = require( './config.json' );

/**
 * Class representing an OverflowElement.
 *
 * @class
 */
class OverflowElement {
	constructor( element ) {
		this.element = element;
		this.elementWidth = 0;
		this.wrapperScrollLeft = 0;
		this.wrapperWidth = 0;
		this.onScroll = mw.util.throttle( this.onScroll.bind( this ), 250 );
		this.updateState = this.updateState.bind( this );
	}

	/**
	 * Toggles classes on the wrapper element based on the provided conditions.
	 *
	 * @param {Array} classes - An array of conditions and class names to toggle.
	 * Each element in the array should be a tuple where the first element is a boolean condition
	 * and the second element is the class name to toggle.
	 *
	 * @return {void}
	 */
	toggleClasses( classes ) {
		classes.forEach( ( [ condition, className ] ) => {
			const hasClass = this.wrapper.classList.contains( className );
			if ( condition && !hasClass ) {
				this.wrapper.classList.add( className );
			} else if ( !condition && hasClass ) {
				this.wrapper.classList.remove( className );
			}
		} );
	}

	/**
	 * Checks if the state of the overflow element has changed by comparing the current element width, wrapper scroll left,
	 * and wrapper width with the cached values. Returns true if any of the values have changed, otherwise returns false.
	 *
	 * @return {boolean} - True if the state has changed, false otherwise.
	 */
	hasStateChanged() {
		return (
			this.element.scrollWidth !== this.elementWidth ||
			Math.round( this.wrapper.scrollLeft ) !== this.wrapperScrollLeft ||
			this.wrapper.offsetWidth !== this.wrapperWidth
		);
	}

	/**
	 * Checks if the element has overflowed horizontally by comparing the element width with the wrapper width.
	 *
	 * @return {boolean} - True if the element has overflowed, false otherwise.
	 */
	hasOverflowed() {
		return this.elementWidth > this.wrapperWidth;
	}

	/**
	 * Updates the state of the overflow element by calculating the element width, wrapper scroll left, and wrapper width.
	 * If the width values are invalid, logs an error and returns.
	 * Compares the current state with the previous state and updates the cache if there is a change.
	 * Toggles classes on the wrapper element based on the overflow state (left or right).
	 *
	 * @return {void}
	 */
	updateState() {
		const elementWidth = this.element.scrollWidth;
		const wrapperScrollLeft = Math.round( this.wrapper.scrollLeft );
		const wrapperWidth = this.wrapper.offsetWidth;

		if ( !this.hasStateChanged() ) {
			return;
		}

		this.elementWidth = elementWidth;
		this.wrapperScrollLeft = wrapperScrollLeft;
		this.wrapperWidth = wrapperWidth;

		let isLeftOverflowing, isRightOverflowing;

		if ( !this.hasOverflowed() ) {
			isLeftOverflowing = false;
			isRightOverflowing = false;
		} else {
			isLeftOverflowing = this.wrapperScrollLeft > 0;
			isRightOverflowing = this.wrapperScrollLeft + this.wrapperWidth < this.elementWidth;
		}

		window.requestAnimationFrame( () => {
			const updateClasses = [
				[ isLeftOverflowing, 'citizen-overflow--left' ],
				[ isRightOverflowing, 'citizen-overflow--right' ]
			];
			this.toggleClasses( updateClasses );
		} );
	}

	/**
	 * Filters and adds inherited classes to the wrapper element.
	 *
	 * @return {void}
	 */
	handleInheritedClasses() {
		const inheritedClasses = config.wgCitizenOverflowInheritedClasses;
		const filteredClasses = inheritedClasses.filter( ( cls ) => this.element.classList.contains( cls ) );

		filteredClasses.forEach( ( cls ) => {
			if ( !this.wrapper.classList.contains( cls ) ) {
				this.wrapper.classList.add( cls );
			}
			if ( this.element.classList.contains( cls ) ) {
				this.element.classList.remove( cls );
			}
		} );
	}

	/**
	 * Wraps the element in a div container with the class 'citizen-overflow-wrapper'.
	 * Checks if the element or its parent node is null or undefined, and logs an error if so.
	 * Verifies the existence of the necessary configuration classes for wrapping and logs an error if missing.
	 * Creates a new div wrapper element, adds the class 'citizen-overflow-wrapper', and appends it to the parent node before the element.
	 * Moves the element inside the wrapper.
	 * Handles inherited classes such as 'floatleft' and 'floatright' by adding them to the wrapper and removing them from the element.
	 * Logs any errors that occur during the wrapping process.
	 *
	 * @return {void}
	 */
	wrap() {
		if ( !this.element || !this.element.parentNode ) {
			mw.log.error( '[Citizen] Element or element.parentNode is null or undefined. Please check if the element or element.parentNode is null or undefined.' );
			return;
		}
		try {
			const parentNode = this.element.parentNode;
			const wrapper = document.createElement( 'div' );
			wrapper.className = 'citizen-overflow-wrapper';

			this.handleInheritedClasses();

			parentNode.insertBefore( wrapper, this.element );
			wrapper.appendChild( this.element );
			this.wrapper = wrapper;
		} catch ( error ) {
			mw.log.error( `[Citizen] Error occurred while wrapping element: ${ error.message }` );
		}
	}

	/**
	 * Handles the scroll event by requesting an animation frame to update the state of the overflow element.
	 *
	 * @return {void}
	 */
	onScroll() {
		this.updateState();
	}

	/**
	 * Resumes the functionality of the overflow element by updating its state, adding a scroll event listener, and observing element resize.
	 * Calls the 'updateState' method to update the state of the overflow element.
	 * Adds a scroll event listener to the wrapper element to handle scroll events by calling the 'onScroll' method.
	 * Observes the element for resize changes using the 'resizeObserver'.
	 *
	 * @return {void}
	 */
	resume() {
		this.updateState();
		this.wrapper.addEventListener( 'scroll', this.onScroll );
		this.resizeObserver.observe( this.element );
	}

	/**
	 * Pauses the functionality of the overflow element by removing the scroll event listener and stopping observation of element resize.
	 * Removes the scroll event listener from the wrapper element that triggers the 'onScroll' method.
	 * Stops observing resize changes of the element using the 'resizeObserver'.
	 *
	 * @return {void}
	 */
	pause() {
		this.wrapper.removeEventListener( 'scroll', this.onScroll );
		this.resizeObserver.unobserve( this.element );
	}

	/**
	 * Sets up an IntersectionObserver to handle intersection changes for the overflow element.
	 * When the element intersects with the viewport, resumes the functionality by calling the 'resume' method.
	 * When the element is not intersecting with the viewport, pauses the functionality by calling the 'pause' method.
	 * Observes the intersection changes for the element using the IntersectionObserver.
	 *
	 * @return {void}
	 */
	setupIntersectionObserver() {
		// eslint-disable-next-line compat/compat
		this.intersectionObserver = new IntersectionObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					this.resume();
				} else {
					this.pause();
				}
			} );
		} );
		this.intersectionObserver.observe( this.element );
	}

	/**
	 * Sets up a ResizeObserver to monitor changes in the size of the element and triggers the 'updateState' method accordingly.
	 *
	 * @return {void}
	 */
	setupResizeObserver() {
		// eslint-disable-next-line compat/compat
		this.resizeObserver = new ResizeObserver( this.updateState );
	}

	/**
	 * Initializes the OverflowElement by wrapping the element, setting up a ResizeObserver to monitor size changes,
	 * setting up an IntersectionObserver to handle intersection changes, and resuming the functionality of the overflow element.
	 *
	 * @return {void}
	 */
	init() {
		this.wrap();
		this.setupResizeObserver();
		this.setupIntersectionObserver();
		this.resume();
	}
}

/**
 * Initializes the process of wrapping overflow elements within the given body content.
 *
 * @param {HTMLElement} bodyContent - The body content element containing elements to be wrapped.
 * @return {void}
 */
function init( bodyContent ) {
	const nowrapClasses = config.wgCitizenOverflowNowrapClasses;
	if ( !nowrapClasses || !Array.isArray( nowrapClasses ) ) {
		mw.log.error( '[Citizen] Invalid or missing $wgCitizenOverflowNowrapClasses. Cannot proceed with wrapping element.' );
		return;
	}

	const overflowElements = bodyContent.querySelectorAll( '.citizen-overflow, .wikitable:not( .wikitable .wikitable )' );
	if ( !overflowElements.length ) {
		return;
	}

	overflowElements.forEach( ( el ) => {
		if ( nowrapClasses.some( ( cls ) => el.classList.contains( cls ) ) ) {
			return;
		}

		const overflowElement = new OverflowElement( el );
		overflowElement.init();
	} );
}

module.exports = {
	init: init
};
