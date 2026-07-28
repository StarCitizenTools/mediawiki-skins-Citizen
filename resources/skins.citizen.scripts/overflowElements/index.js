const { createOverflowWrapper } = require( './wrapper.js' );
const { detectFloatDirection } = require( './float.js' );
const { createOverflowState } = require( './state.js' );
const {
	createStickyRows, hasScrollContainerAncestor, MODE_CSS, MODE_JS
} = require( './stickyRows.js' );

const STICKY_MARKER_SELECTOR = '.citizen-overflow-sticky-header';

/**
 * Manages the lifecycle of a single overflow element, composing wrapper,
 * state, and optional sticky band sub-modules. Observation is shared:
 * init() only builds DOM, and all measurement is driven by the shared
 * observers so off-screen elements are never measured.
 */
class OverflowElement {
	constructor( {
		document, window, mw, element, isPointerDevice,
		floatDirection, stickyMode, stickyRegistry, config
	} ) {
		this.document = document;
		this.window = window;
		this.mw = mw;
		this.element = element;
		this.isPointerDevice = isPointerDevice;
		this.floatDirection = floatDirection;
		this.stickyMode = stickyMode;
		this.stickyRegistry = stickyRegistry;
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
	 * Measures the sticky band geometry. Geometry reads only.
	 *
	 * @return {{bandHeight: number, travel: number}|null}
	 */
	measureSticky() {
		return this.sticky ? this.sticky.measure() : null;
	}

	/**
	 * Applies previously measured sticky band geometry. Writes only.
	 *
	 * @param {{bandHeight: number, travel: number}|null} measurement
	 */
	applySticky( measurement ) {
		if ( this.sticky ) {
			this.sticky.apply( measurement );
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
		if ( this.sticky && this.sticky.mode === MODE_JS ) {
			this.stickyRegistry.add( this );
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
		if ( this.sticky && this.sticky.mode === MODE_JS ) {
			this.stickyRegistry.remove( this );
		}
	}

	/**
	 * Initialize the overflow element DOM: wrapper, sticky band, state.
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

		this.sticky = this.stickyMode ?
			createStickyRows( {
				element: this.element,
				wrapper: this.wrapper,
				mode: this.stickyMode
			} ) :
			null;

		this.state = createOverflowState( {
			window: this.window,
			element: this.element,
			content: this.content,
			wrapper: this.wrapper
		} );

		return true;
	}
}

/**
 * The observers and sticky registry serving the current content
 * generation. Held so a re-init can disconnect them — the observers
 * otherwise keep the replaced generation's elements (and through them
 * the detached DOM) alive, and the registry's scroll listener would
 * keep driving stale instances.
 *
 * @type {?Object}
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
		activeObservers.stickyRegistry.disconnect();
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

	// Both probes are required: a browser with view() but without
	// exit-crossing would silently animate over the wrong range.
	const supportsViewTimeline = !!( window.CSS &&
		typeof window.CSS.supports === 'function' &&
		window.CSS.supports( 'animation-timeline: view()' ) &&
		window.CSS.supports( 'animation-range: exit-crossing 0%' ) );

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
		// The marker probe is cheap detection only — band membership is
		// resolved strictly from the element's own rows/children by
		// createStickyRows, so a marker inside a nested table selects a
		// mode but resolves no band.
		let stickyMode = null;
		if ( el.querySelector( STICKY_MARKER_SELECTOR ) ) {
			stickyMode = ( supportsViewTimeline && !hasScrollContainerAncestor( el, window ) ) ?
				MODE_CSS : MODE_JS;
		}
		candidates.push( { element: el, floatDirection, stickyMode } );
	} );

	// Shared drive for JS-mode sticky bands: one passive scroll listener
	// (attached only while the registry is non-empty), one rAF per scroll
	// burst, all rect reads batched ahead of all custom-property writes.
	// Capture phase is required: scroll events do not bubble, so a
	// bubble-phase window listener would never hear scrolls from nested
	// scroll containers — the exact contexts that route a band to JS mode.
	const jsStickyInstances = new Set();
	let stickyFrame = null;
	const driveJsSticky = () => {
		if ( stickyFrame !== null ) {
			return;
		}
		stickyFrame = window.requestAnimationFrame( () => {
			stickyFrame = null;
			const tops = [];
			jsStickyInstances.forEach( ( instance ) => {
				tops.push( [ instance, instance.wrapper.getBoundingClientRect().top ] );
			} );
			tops.forEach( ( [ instance, top ] ) => {
				instance.wrapper.style.setProperty( '--citizen-overflow-sticky-top', top + 'px' );
			} );
		} );
	};
	const stickyRegistry = {
		add( instance ) {
			if ( jsStickyInstances.size === 0 ) {
				window.addEventListener( 'scroll', driveJsSticky, { passive: true, capture: true } );
			}
			jsStickyInstances.add( instance );
			driveJsSticky();
		},
		remove( instance ) {
			jsStickyInstances.delete( instance );
			if ( jsStickyInstances.size === 0 ) {
				window.removeEventListener( 'scroll', driveJsSticky, { capture: true } );
			}
		},
		disconnect() {
			jsStickyInstances.clear();
			window.removeEventListener( 'scroll', driveJsSticky, { capture: true } );
		}
	};

	const initialized = [];
	candidates.forEach( ( { element, floatDirection, stickyMode } ) => {
		const instance = new OverflowElement( {
			document, window, mw, element, isPointerDevice,
			floatDirection, stickyMode, stickyRegistry, config
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
		const measurements = affected.map( ( instance ) => instance.measureSticky() );
		// ... then all style writes
		affected.forEach( ( instance, index ) => {
			instance.applySticky( measurements[ index ] );
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

	activeObservers = { intersectionObserver, resizeObserver, stickyRegistry };
}

module.exports = {
	init
};
