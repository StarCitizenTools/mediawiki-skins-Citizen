const { createOverflowWrapper } = require( './wrapper.js' );
const { detectFloatDirection } = require( './float.js' );
const { createOverflowState } = require( './state.js' );
const { createOverflowStickyHeader } = require( './stickyHeader.js' );

/**
 * Manages the lifecycle of a single overflow element, composing wrapper,
 * state, and optional sticky header sub-modules. Observation is shared:
 * init() only builds DOM, and all measurement is driven by the shared
 * observers so off-screen elements are never measured.
 */
class OverflowElement {
	constructor( {
		document, window, mw,
		element, isPointerDevice, floatDirection, config
	} ) {
		this.document = document;
		this.window = window;
		this.mw = mw;
		this.element = element;
		this.isPointerDevice = isPointerDevice;
		this.floatDirection = floatDirection;
		this.config = config;
		// Assigned by the module init() after a successful element init
		this.resizeObserver = null;
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
	 * Measures sticky header column widths. Geometry reads only.
	 *
	 * @return {number[]|null}
	 */
	measureColumns() {
		return this.sticky && this.sticky.measureColumns ?
			this.sticky.measureColumns() :
			null;
	}

	/**
	 * Applies previously measured sticky header column widths. Writes only.
	 *
	 * @param {number[]|null} widths
	 */
	applyColumns( widths ) {
		if ( widths && this.sticky && this.sticky.applyColumns ) {
			this.sticky.applyColumns( widths );
		}
	}

	/**
	 * Resumes functionality: add listeners, observe resize.
	 * Measurement is deliberately left to the shared ResizeObserver —
	 * observe() always delivers an initial notification.
	 */
	resume() {
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
	 * Initialize the overflow element DOM: wrapper, sticky header, state.
	 * DOM writes only — no geometry is read here.
	 *
	 * @return {boolean} Whether initialization succeeded
	 */
	init() {
		const refs = createOverflowWrapper( {
			document: this.document,
			mw: this.mw,
			element: this.element,
			isPointerDevice: this.isPointerDevice,
			inheritedClasses: this.config.wgCitizenOverflowInheritedClasses,
			floatDirection: this.floatDirection
		} );
		if ( !refs ) {
			return false;
		}

		this.wrapper = refs.wrapper;
		this.content = refs.content;
		this.nav = refs.nav;

		const headerRow = this.element.querySelector( '.citizen-overflow-sticky-header' );
		this.sticky = headerRow ?
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
			stickyHeader: this.sticky ? this.sticky.stickyHeader : null
		} );

		return true;
	}
}

/**
 * The observer pair serving the current content generation. Held so a
 * re-init can disconnect it — the observers otherwise keep the replaced
 * generation's elements (and through them the detached DOM) alive.
 *
 * @type {{intersectionObserver: IntersectionObserver, resizeObserver: ResizeObserver}|null}
 */
let activeObservers = null;

/**
 * Initialize overflow element enhancements for all matching elements.
 *
 * Runs once per wikipage.content fire — content is replaced (e.g. after a
 * VisualEditor save), so the previous generation's observers are
 * disconnected before the new content is processed.
 *
 * All elements share a single IntersectionObserver and a single
 * ResizeObserver. Entries arrive batched, so the resize callback can group
 * every geometry read ahead of every style write instead of forcing one
 * reflow per element.
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
	if ( activeObservers ) {
		activeObservers.intersectionObserver.disconnect();
		activeObservers.resizeObserver.disconnect();
		activeObservers = null;
	}

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

	const inheritedClasses = config.wgCitizenOverflowInheritedClasses || [];

	// Batched read pass before any wrapping: computed-style reads must not
	// interleave with the DOM writes done by init(). Elements whose float
	// comes from an inherited class are skipped — the class itself migrates
	// to the wrapper and stays viewport-correct, unlike a computed snapshot.
	const candidates = [];
	overflowElements.forEach( ( el ) => {
		if ( nowrapClasses.some( ( cls ) => el.classList.contains( cls ) ) ) {
			return;
		}
		const hasInheritedClass = inheritedClasses.some(
			( cls ) => el.classList.contains( cls )
		);
		// Fault-isolate the detection: a throw (e.g. a monkey-patched
		// getComputedStyle) degrades this one element to no modifier
		// instead of aborting the wrapping of every element on the page
		let floatDirection = null;
		if ( !hasInheritedClass ) {
			try {
				floatDirection = detectFloatDirection( el, window );
			} catch ( error ) {
				mw.log.error(
					`[Citizen] Error occurred while detecting float direction: ${ error.message }`
				);
			}
		}
		candidates.push( { element: el, floatDirection } );
	} );

	const initialized = [];
	candidates.forEach( ( { element, floatDirection } ) => {
		const instance = new OverflowElement( {
			document, window, mw,
			element, isPointerDevice, floatDirection, config
		} );
		if ( instance.init() ) {
			initialized.push( instance );
		}
	} );

	if ( !initialized.length ) {
		return;
	}

	const instances = new WeakMap();

	const resizeObserver = new ResizeObserver( ( entries ) => {
		const affected = [];
		entries.forEach( ( entry ) => {
			const instance = instances.get( entry.target );
			if ( instance ) {
				affected.push( instance );
			}
		} );
		// All geometry reads first (overflow state class writes are
		// rAF-deferred inside updateState) ...
		affected.forEach( ( instance ) => {
			instance.state.updateState();
		} );
		const measurements = affected.map( ( instance ) => instance.measureColumns() );
		// ... then all style writes
		affected.forEach( ( instance, index ) => {
			instance.applyColumns( measurements[ index ] );
		} );
	} );

	const intersectionObserver = new IntersectionObserver( ( entries ) => {
		entries.forEach( ( entry ) => {
			const instance = instances.get( entry.target );
			if ( !instance ) {
				return;
			}
			if ( entry.isIntersecting ) {
				instance.resume();
			} else {
				instance.pause();
			}
		} );
	} );

	initialized.forEach( ( instance ) => {
		instance.resizeObserver = resizeObserver;
		instances.set( instance.element, instance );
		intersectionObserver.observe( instance.element );
	} );

	activeObservers = { intersectionObserver, resizeObserver };
}

module.exports = {
	init
};
