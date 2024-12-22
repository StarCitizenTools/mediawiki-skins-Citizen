const config = require( './config.json' );

/**
 * Class representing an OverflowElement.
 *
 * @class
 */
class OverflowElement {
	constructor( element, isPointerDevice ) {
		this.element = element;
		this.isPointerDevice = isPointerDevice;
		this.elementWidth = 0;
		this.contentScrollLeft = 0;
		this.contentWidth = 0;
		this.onScroll = mw.util.throttle( this.onScroll.bind( this ), 250 );
		this.updateState = this.updateState.bind( this );
		this.headerToSticky = this.element.querySelector( '.citizen-overflow-sticky-header' );
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
	 * Checks if the state of the overflow element has changed by comparing the current element width, content scroll left,
	 * and content width with the cached values. Returns true if any of the values have changed, otherwise returns false.
	 *
	 * @return {boolean} - True if the state has changed, false otherwise.
	 */
	hasStateChanged() {
		return (
			this.element.scrollWidth !== this.elementWidth ||
			Math.round( this.content.scrollLeft ) !== this.contentScrollLeft ||
			this.content.offsetWidth !== this.contentWidth
		);
	}

	/**
	 * Checks if the element has overflowed horizontally by comparing the element width with the content width.
	 *
	 * @return {boolean} - True if the element has overflowed, false otherwise.
	 */
	hasOverflowed() {
		return this.elementWidth > this.contentWidth;
	}

	/**
	 * Updates the state of the overflow element by calculating the element width, content scroll left, and content width.
	 * If the width values are invalid, logs an error and returns.
	 * Compares the current state with the previous state and updates the cache if there is a change.
	 * Toggles classes on the content element based on the overflow state (left or right).
	 *
	 * @return {void}
	 */
	updateState() {
		const elementWidth = this.element.scrollWidth;
		const contentScrollLeft = Math.round( this.content.scrollLeft );
		const contentWidth = this.content.offsetWidth;

		if ( !this.hasStateChanged() ) {
			return;
		}

		this.elementWidth = elementWidth;
		this.contentScrollLeft = contentScrollLeft;
		this.contentWidth = contentWidth;

		let isLeftOverflowing, isRightOverflowing;

		if ( !this.hasOverflowed() ) {
			isLeftOverflowing = false;
			isRightOverflowing = false;
		} else {
			isLeftOverflowing = this.contentScrollLeft > 0;
			isRightOverflowing =
				this.contentScrollLeft + this.contentWidth < this.elementWidth;
		}

		window.requestAnimationFrame( () => {
			const updateClasses = [
				[ isLeftOverflowing, 'citizen-overflow--left' ],
				[ isRightOverflowing, 'citizen-overflow--right' ]
			];
			this.toggleClasses( updateClasses );
			if ( this.stickyHeader ) {
				this.stickyHeader.style.setProperty( '--citizen-overflow-scroll-x', this.contentScrollLeft + 'px' );
			}
		} );
	}

	/**
	 * Filters and adds inherited classes to the wrapper element.
	 *
	 * @return {void}
	 */
	handleInheritedClasses() {
		const inheritedClasses = config.wgCitizenOverflowInheritedClasses;
		const filteredClasses = inheritedClasses.filter( ( cls ) => this.element.classList.contains( cls )
		);

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
			mw.log.error(
				'[Citizen] Element or element.parentNode is null or undefined. Please check if the element or element.parentNode is null or undefined.'
			);
			return;
		}
		try {
			const fragment = document.createDocumentFragment();

			const wrapper = document.createElement( 'div' );
			wrapper.className = 'citizen-overflow-wrapper';
			fragment.appendChild( wrapper );
			this.wrapper = wrapper;
			this.handleInheritedClasses();

			if ( this.isPointerDevice ) {
				const createButton = ( type ) => {
					const button = document.createElement( 'button' );
					button.className = `citizen-overflow-navButton citizen-overflow-navButton-${ type } citizen-ui-icon mw-ui-icon-wikimedia-collapse`;
					button.setAttribute( 'aria-hidden', 'true' );
					button.setAttribute( 'tabindex', '-1' );
					return button;
				};

				const nav = document.createElement( 'div' );
				nav.className = 'citizen-overflow-nav';

				nav.appendChild( createButton( 'left' ) );
				nav.appendChild( createButton( 'right' ) );

				wrapper.appendChild( nav );
				this.nav = nav;
			}

			const content = document.createElement( 'div' );
			content.className = 'citizen-overflow-content';
			wrapper.appendChild( content );

			const parentNode = this.element.parentNode;
			parentNode.insertBefore( fragment, this.element );
			content.appendChild( this.element );

			this.content = content;
		} catch ( error ) {
			mw.log.error(
				`[Citizen] Error occurred while wrapping element: ${ error.message }`
			);
		}
	}

	/**
	 * Sync table columns width between sticky header with original table columns.
	 *
	 * @return {void}
	 */
	syncStickyHeaderColumns() {
		const stickyCols = this.colgroup.querySelectorAll( 'col' );

		this.originalTh.forEach( ( col, index ) => {
			stickyCols[ index ].style.minWidth = col.getBoundingClientRect().width + 'px';
		} );
	}

	/**
	 * Creates a sticky header for a table element.
	 *
	 * @return {void}
	 */
	getStickyHeaderForTable() {
		// If overflow content is a table, we need to create a proper table element
		// for the sticky header, so that the styles are applied correctly
		const stickyHeader = document.createElement( 'table' );
		const thead = document.createElement( 'thead' );

		// Copy attributes from original table to sticky header
		for ( const { name, value } of this.element.attributes ) {
			stickyHeader.setAttribute( name, value );
		}
		for ( const className of this.element.classList ) {
			stickyHeader.classList.add( className );
		}

		// Create colgroup and columns so that we can align the column widths
		this.colgroup = document.createElement( 'colgroup' );
		this.originalTh = this.headerToSticky.querySelectorAll( 'th' );
		for ( let i = 0; i < this.originalTh.length; i++ ) {
			const colEl = document.createElement( 'col' );
			this.colgroup.append( colEl );
		}
		this.syncStickyHeaderColumns();

		thead.append( this.headerToSticky.cloneNode( true ) );
		stickyHeader.append( thead, this.colgroup );
		return stickyHeader;
	}

	/**
	 * Creates a sticky header for a non-table element.
	 *
	 * @return {void}
	 */
	getStickyHeader() {
		const stickyHeader = document.createElement( 'div' );
		stickyHeader.append( this.headerToSticky.cloneNode( true ) );
		return stickyHeader;
	}

	setupStickyHeader() {
		const isTable = this.element instanceof HTMLTableElement;
		this.stickyHeader = isTable ? this.getStickyHeaderForTable() : this.getStickyHeader();
		this.stickyHeader.classList.add( 'citizen-overflow-content-sticky-header' );
		this.stickyHeader.setAttribute( 'aria-hidden', 'true' ); // this is not useful for screen reader
		this.content.insertBefore( this.stickyHeader, this.element );
	}

	/**
	 * Scrolls the content element by the specified offset.
	 *
	 * @param {number} offset - The amount by which to scroll the content element.
	 * @return {void}
	 */
	scrollContent( offset ) {
		const delta = this.content.scrollWidth - this.content.offsetWidth;
		const scrollLeft = Math.floor( this.content.scrollLeft ) + offset;

		window.requestAnimationFrame( () => {
			this.content.scrollLeft = Math.min( Math.max( scrollLeft, 0 ), delta );
		} );
	}

	/**
	 * Handles the click event on the navigation buttons.
	 * Scrolls the content element left or right based on the button clicked.
	 *
	 * @param {Event} event - The click event object.
	 * @return {void}
	 */
	onClick( event ) {
		const target = event.target;
		if ( !target.classList.contains( 'citizen-overflow-navButton' ) ) {
			return;
		}
		// Prevent triggering the form submit action (e.g. realtime preview in WikiEditor)
		event.preventDefault();
		const offset = this.wrapper.offsetWidth / 2;
		if ( target.classList.contains( 'citizen-overflow-navButton-left' ) ) {
			this.scrollContent( -offset );
		} else if (
			target.classList.contains( 'citizen-overflow-navButton-right' )
		) {
			this.scrollContent( offset );
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
	 * Adds a scroll event listener to the content element to handle scroll events by calling the 'onScroll' method.
	 * Observes the element for resize changes using the 'resizeObserver'.
	 *
	 * @return {void}
	 */
	resume() {
		this.updateState();
		this.content.addEventListener( 'scroll', this.onScroll );
		this.resizeObserver.observe( this.element );
		if ( this.isPointerDevice ) {
			this.nav.addEventListener( 'click', this.onClick.bind( this ) );
		}
	}

	/**
	 * Pauses the functionality of the overflow element by removing the scroll event listener and stopping observation of element resize.
	 * Removes the scroll event listener from the content element that triggers the 'onScroll' method.
	 * Stops observing resize changes of the element using the 'resizeObserver'.
	 *
	 * @return {void}
	 */
	pause() {
		this.content.removeEventListener( 'scroll', this.onScroll );
		this.resizeObserver.unobserve( this.element );
		if ( this.isPointerDevice ) {
			this.nav.removeEventListener( 'click', this.onClick );
		}
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
		if ( this.headerToSticky ) {
			this.setupStickyHeader();
		}
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
		mw.log.error(
			'[Citizen] Invalid or missing $wgCitizenOverflowNowrapClasses. Cannot proceed with wrapping element.'
		);
		return;
	}

	const overflowElements = bodyContent.querySelectorAll(
		'.citizen-overflow, .wikitable:not( .wikitable .wikitable )'
	);
	if ( !overflowElements.length ) {
		return;
	}

	const isPointerDevice = window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches;

	overflowElements.forEach( ( el ) => {
		if ( nowrapClasses.some( ( cls ) => el.classList.contains( cls ) ) ) {
			return;
		}

		const overflowElement = new OverflowElement( el, isPointerDevice );
		overflowElement.init();
	} );
}

module.exports = {
	init: init
};
