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
		this.onScroll = this.onScroll.bind( this );
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

		const areWidthsInvalid = Number.isNaN( wrapperWidth ) || Number.isNaN( elementWidth );
		if ( areWidthsInvalid ) {
			mw.log.error( '[Citizen] Invalid width values. Cannot calculate overflow state.' );
			return;
		}

		// State. State never changes.
		if (
			elementWidth === this.elementWidth &&
			wrapperScrollLeft === this.wrapperScrollLeft &&
			wrapperWidth === this.wrapperWidth
		) {
			return;
		}

		// State has changed. Save it to cache.
		this.elementWidth = elementWidth;
		this.wrapperScrollLeft = wrapperScrollLeft;
		this.wrapperWidth = wrapperWidth;

		const updateClasses = [
			[ this.wrapperScrollLeft > 0, 'citizen-overflow--left' ],
			[ this.wrapperScrollLeft + this.wrapperWidth < this.elementWidth, 'citizen-overflow--right' ]
		];
		this.toggleClasses( updateClasses );
	}

	/**
	 * Wraps the element in a div container with the class 'citizen-overflow-wrapper'.
	 * Checks if the element or its parent node is null or undefined, logs an error if so.
	 * Verifies the existence of $wgCitizenOverflowNowrapClasses in the config and if it is an array, logs an error if not.
	 * Skips wrapping if the element contains any of the ignored classes specified in $wgCitizenOverflowNowrapClasses.
	 * Creates a wrapper div element, adds the class 'citizen-overflow-wrapper' to it.
	 * Filters and adds inherited classes ('floatleft', 'floatright') from the element to the wrapper.
	 * Inserts the wrapper before the element in the DOM and appends the element to the wrapper.
	 * Sets the wrapper element as a property of the class instance.
	 * Logs an error if an exception occurs during the wrapping process.
	 *
	 * @return {void}
	 */
	wrap() {
		if ( !this.element || !this.element.parentNode ) {
			mw.log.error( '[Citizen] Element or element.parentNode is null or undefined. Please check if the element or element.parentNode is null or undefined.' );
			return;
		}
		try {
			if (
				!config.wgCitizenOverflowNowrapClasses ||
				!Array.isArray( config.wgCitizenOverflowNowrapClasses )
			) {
				mw.log.error( '[Citizen] Invalid or missing $wgCitizenOverflowNowrapClasses. Cannot proceed with wrapping element.' );
				return;
			}

			const parentNode = this.element.parentNode;

			const ignoredClasses = config.wgCitizenOverflowNowrapClasses;

			if ( ignoredClasses.some( ( cls ) => this.element.classList.contains( cls ) ) ) {
				return;
			}

			const wrapper = document.createElement( 'div' );
			wrapper.className = 'citizen-overflow-wrapper';

			const inheritedClasses = [
				'floatleft',
				'floatright'
			];

			const filteredClasses = inheritedClasses.filter( ( cls ) => this.element.classList.contains( cls ) );

			filteredClasses.forEach( ( cls ) => {
				if ( !wrapper.classList.contains( cls ) ) {
					wrapper.classList.add( cls );
				}
				if ( this.element.classList.contains( cls ) ) {
					this.element.classList.remove( cls );
				}
			} );

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
		window.requestAnimationFrame( this.updateState );
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
	// Do not wrap nested tables
	const tables = bodyContent.querySelectorAll( 'table:not( table table )' );

	// Wrap tables
	if ( tables.length > 0 ) {
		tables.forEach( ( table ) => {
			const overflowElement = new OverflowElement( table );
			overflowElement.init();
		} );
	}
}

module.exports = {
	init: init
};
