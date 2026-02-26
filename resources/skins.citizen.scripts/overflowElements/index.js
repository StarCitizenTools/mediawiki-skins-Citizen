const { createOverflowWrapper } = require( './wrapper.js' );
const { createOverflowState } = require( './state.js' );
const { createOverflowStickyHeader } = require( './stickyHeader.js' );

/**
 * Manages the lifecycle of a single overflow element, composing wrapper,
 * state, and optional sticky header sub-modules. Handles observers,
 * scroll events, and resume/pause behavior.
 */
class OverflowElement {
	constructor( {
		document, window, mw, IntersectionObserver, ResizeObserver,
		element, isPointerDevice, config
	} ) {
		this.document = document;
		this.window = window;
		this.mw = mw;
		this.IntersectionObserver = IntersectionObserver;
		this.ResizeObserver = ResizeObserver;
		this.element = element;
		this.isPointerDevice = isPointerDevice;
		this.config = config;
		this.onScroll = mw.util.throttle( this.onScroll.bind( this ), 250 );
		this.onClick = this.onClick.bind( this );
	}

	/**
	 * Scrolls the content element by the specified offset.
	 *
	 * @param {number} offset
	 */
	scrollContent( offset ) {
		const delta = this.content.scrollWidth - this.content.offsetWidth;
		const scrollLeft = Math.floor( this.content.scrollLeft ) + offset;

		this.window.requestAnimationFrame( () => {
			this.content.scrollLeft = Math.min( Math.max( scrollLeft, 0 ), delta );
		} );
	}

	/**
	 * Handles click events on navigation buttons.
	 *
	 * @param {Event} event
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
		} else if ( target.classList.contains( 'citizen-overflow-navButton-right' ) ) {
			this.scrollContent( offset );
		}
	}

	/**
	 * Handles scroll events (throttled).
	 */
	onScroll() {
		this.state.updateState();
	}

	/**
	 * Resumes functionality: update state, add listeners, observe resize.
	 */
	resume() {
		this.state.updateState();
		this.content.addEventListener( 'scroll', this.onScroll );
		this.resizeObserver.observe( this.element );
		if ( this.isPointerDevice && this.nav ) {
			this.nav.addEventListener( 'click', this.onClick );
		}
	}

	/**
	 * Pauses functionality: remove listeners, unobserve resize.
	 */
	pause() {
		this.content.removeEventListener( 'scroll', this.onScroll );
		this.resizeObserver.unobserve( this.element );
		if ( this.isPointerDevice && this.nav ) {
			this.nav.removeEventListener( 'click', this.onClick );
		}
	}

	/**
	 * Initialize the overflow element: wrap, set up observers, resume.
	 */
	init() {
		const refs = createOverflowWrapper( {
			document: this.document,
			mw: this.mw,
			element: this.element,
			isPointerDevice: this.isPointerDevice,
			inheritedClasses: this.config.wgCitizenOverflowInheritedClasses
		} );
		if ( !refs ) {
			return;
		}

		this.wrapper = refs.wrapper;
		this.content = refs.content;
		this.nav = refs.nav;

		const headerRow = this.element.querySelector( '.citizen-overflow-sticky-header' );
		const sticky = headerRow ?
			createOverflowStickyHeader( {
				document: this.document,
				element: this.element,
				content: this.content,
				headerRow
			} ) :
			null;

		this.state = createOverflowState( {
			window: this.window,
			element: this.element,
			content: this.content,
			wrapper: this.wrapper,
			stickyHeader: sticky ? sticky.stickyHeader : null
		} );

		this.resizeObserver = new this.ResizeObserver( () => {
			this.state.updateState();
			if ( sticky && sticky.syncColumns ) {
				sticky.syncColumns();
			}
		} );

		this.intersectionObserver = new this.IntersectionObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				if ( entry.isIntersecting ) {
					this.resume();
				} else {
					this.pause();
				}
			} );
		} );
		this.intersectionObserver.observe( this.element );

		this.resume();
	}
}

/**
 * Initialize overflow element enhancements for all matching elements.
 *
 * @param {Object} params
 * @param {Document} params.document
 * @param {Window} params.window
 * @param {Object} params.mw
 * @param {Function} params.IntersectionObserver
 * @param {Function} params.ResizeObserver
 * @param {HTMLElement} params.bodyContent
 * @param {Object} params.config
 */
function init( {
	document, window, mw, IntersectionObserver, ResizeObserver,
	bodyContent, config
} ) {
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

		new OverflowElement( {
			document, window, mw, IntersectionObserver, ResizeObserver,
			element: el, isPointerDevice, config
		} ).init();
	} );
}

module.exports = {
	init
};
