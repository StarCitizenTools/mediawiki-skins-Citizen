const MODULE = 'skins.citizen.commandPalette';
const LOAD_TIMEOUT_MS = 10000;
const { bindIntentPrefetch } = require( './intentPrefetch.js' );
const { usingWithVue } = require( './vueBatch.js' );

/**
 * Create the command palette trigger orchestrator.
 *
 * Owns the lifecycle: intent prefetch on hover/focus/touch, a silent
 * idle-time mount once a hover/focus prefetch completes, lazy
 * `mw.loader.using` on click/keyboard, prefill queueing, and dispatch
 * to the mounted Vue app once it is ready. On cold cache the user
 * sees nothing for the duration of the load (typically <300ms on
 * broadband; longer on slow connections); on rejection or timeout we
 * surface an `mw.notify` toast so the click is not silently lost.
 *
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Object} deps.mw
 * @return {{init: Function, triggerOpen: Function, close: Function}}
 */
function createCommandPalette( { document, mw } ) {
	let state = 'idle'; // 'idle' | 'loading' | 'mounted'
	let paletteApp = null;
	let pendingPrefill = null;
	// Set to true if the user dismisses (Esc) while state is 'loading'.
	// The in-flight load still completes — we mount Vue silently so the
	// next trigger is instant — but we suppress the auto-open and the
	// failure toast that would otherwise fire after a dismissal.
	let cancelled = false;

	let detailsEl = null;
	let summaryEl = null;
	let overlay = null;
	let cancelPrefetch = null;
	// Whether the palette is on screen. Distinct from `state`, which tracks
	// whether the bundle has loaded — the palette can be closed and reopened
	// any number of times while `state` stays 'mounted'.
	let isOpen = false;

	/**
	 * Mirror palette open/closed state onto the `<details>` element. The
	 * `[ open ]` attribute drives the search-trigger CSS that morphs the
	 * magnifier glyph into an X icon (Search__button.less). `triggerOpen`
	 * and `close` are the canonical paths and may be invoked from
	 * keyboard shortcuts or external triggers, so the toggle has to be
	 * driven from code rather than the browser's auto-toggle.
	 *
	 * @param {boolean} open
	 */
	function setOpenState( open ) {
		if ( detailsEl ) {
			detailsEl.open = open;
		}
	}

	function notifyClosed() {
		// Do not hide the overlay wrapper here. Vue's `<Transition>` runs
		// the leave animation on the backdrop and palette card after
		// `isOpen` flips to false; setting `display: none` on the wrapper
		// synchronously would cut the leave short and visually snap the
		// palette closed. The wrapper is harmless when empty (zero-height
		// block with no styles), so we just let Vue's `v-if` clean up the
		// inner DOM after the leave transition completes.
		setOpenState( false );
		pendingPrefill = null;
		// Hand focus back to the control that opened the palette. Without
		// this it lands on <body>, so the next Tab restarts from the top of
		// the document — the palette's own dismissal keys (Esc, Tab) would
		// otherwise cost a keyboard user their place on the page.
		const wasOpen = isOpen;
		isOpen = false;
		if ( wasOpen && summaryEl ) {
			summaryEl.focus();
		}
	}

	/**
	 * Lazily create the overlay element on first mount. We do not render
	 * a server-side placeholder; the overlay only enters the DOM when
	 * Vue is actually about to mount inside it.
	 *
	 * Appended to `mediawiki.page.ready`'s teleport target (rather than
	 * `document.body`) so it inherits `#mw-teleport-target`'s
	 * `z-index: @z-index-overlay`, which is what places it above
	 * positioned page chrome like the skin header.
	 *
	 * @return {HTMLElement}
	 */
	function ensureOverlay() {
		if ( overlay ) {
			return overlay;
		}
		const teleportTarget = require( 'mediawiki.page.ready' ).teleportTarget;
		overlay = document.createElement( 'div' );
		overlay.id = 'citizen-command-palette-overlay';
		overlay.className = 'citizen-command-palette-overlay';
		teleportTarget.appendChild( overlay );
		return overlay;
	}

	/**
	 * Mount the Vue app into the overlay without opening it. Shared by the
	 * click-driven load path and the idle mount after an intent prefetch —
	 * both end in the same 'mounted' state that `triggerOpen` treats as
	 * ready-to-open.
	 *
	 * @param {Function} req Module require function from `mw.loader.using`
	 */
	function mountApp( req ) {
		const mod = req( MODULE );
		const overlayEl = ensureOverlay();
		paletteApp = mod.initApp( overlayEl, {
			onClose: notifyClosed
		} );
		state = 'mounted';
		// Once mounted, the intent listeners have nothing left to prefetch.
		if ( cancelPrefetch ) {
			cancelPrefetch();
			cancelPrefetch = null;
		}
	}

	function load() {
		state = 'loading';
		cancelled = false;

		let timeoutId = null;
		const timeoutPromise = new Promise( ( _resolve, reject ) => {
			timeoutId = setTimeout( () => reject( new Error( 'timeout' ) ), LOAD_TIMEOUT_MS );
		} );

		Promise.race( [ usingWithVue( MODULE, mw ), timeoutPromise ] ).then(
			( req ) => {
				clearTimeout( timeoutId );
				mountApp( req );
				if ( !cancelled ) {
					paletteApp.open( pendingPrefill );
					isOpen = true;
				}
				pendingPrefill = null;
				cancelled = false;
			},
			() => {
				clearTimeout( timeoutId );
				state = 'idle';
				if ( cancelled ) {
					// User already dismissed — no toast, just settle.
					cancelled = false;
					return;
				}
				setOpenState( false );
				mw.notify(
					mw.message( 'citizen-command-palette-load-error' ).text(),
					{ type: 'error' }
				);
			}
		);
	}

	function triggerOpen( prefillText ) {
		const text = ( typeof prefillText === 'string' && prefillText.length > 0 ) ?
			prefillText :
			null;
		setOpenState( true );
		// Re-trigger after Esc-during-loading: clear the dismissal so the
		// in-flight load opens the palette when it completes.
		cancelled = false;

		if ( state === 'mounted' ) {
			// `open()` is unconditionally a reset — it closes help, exits the
			// active mode and clears the query and token chips. Running it on
			// a palette that is already on screen would throw away what the
			// user has typed. The shortcuts stay reachable while the palette
			// is open (focus only has to be off the input for `isFormField`
			// to let them through), so a repeat trigger just restores focus.
			// A prefill is an explicit request to replace the query, so it
			// still goes through.
			if ( isOpen && text === null ) {
				paletteApp.focus();
				return;
			}
			paletteApp.open( text );
			isOpen = true;
			return;
		}
		if ( state === 'loading' ) {
			pendingPrefill = text;
			return;
		}
		pendingPrefill = text;
		load();
	}

	function close() {
		if ( state === 'mounted' && paletteApp && typeof paletteApp.close === 'function' ) {
			// Vue's close path will call `notifyClosed` via the injected
			// onClose callback, so the overlay/details state updates only
			// happen once.
			paletteApp.close();
			return;
		}
		notifyClosed();
	}

	function init() {
		const summary = document.getElementById( 'citizen-search-summary' );
		if ( !summary ) {
			return;
		}
		summaryEl = summary;
		detailsEl = document.getElementById( 'citizen-search-details' );

		// `templates/Search.mustache` renders a `<div id="citizen-search__card">`
		// as a no-JS fallback search form (revealed by Search.less when the
		// `<details>` opens), and `Search__button.mustache` carries an
		// `aria-details="citizen-search__card"` attribute pointing at it.
		// With JS active the palette supplants the fallback, so we strip
		// both — the card prevents the trigger from receiving palette
		// clicks, and the aria-details would point at a removed node.
		const oldCard = document.getElementById( 'citizen-search__card' );
		if ( oldCard ) {
			oldCard.remove();
		}
		summary.removeAttribute( 'aria-details' );

		// The prefetch fetches and evaluates the bundle, but mounting
		// would otherwise still land on the click. Mount silently at idle
		// so a hover-then-click open only pays for the first render.
		// Touch is excluded: touchstart precedes the tap's click by too
		// little for an idle mount to win the race.
		cancelPrefetch = bindIntentPrefetch( summary, MODULE, mw, {
			vue: true,
			onReady: ( req, eventType ) => {
				if ( eventType === 'touchstart' ) {
					return;
				}
				mw.requestIdleCallback( () => {
					// A click may have beaten this callback — `load()` owns
					// the mount from there, and mounting is synchronous, so
					// the two paths cannot interleave. This also catches a
					// module that resolves after a click-driven load timed
					// out (the reject handler resets state to 'idle'): it
					// mounts silently, so the next trigger opens instantly
					// instead of reloading.
					if ( state === 'idle' ) {
						mountApp( req );
					}
				} );
			}
		} );

		summary.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			triggerOpen();
		} );

		// Cancel-during-loading affordance: Vue isn't mounted yet, so Esc
		// can't be handled by App.vue's keyboard composable. Mark the
		// load as cancelled — the in-flight bundle still completes (we
		// keep the bytes for next time and mount Vue silently) but the
		// palette won't auto-open and the failure toast is suppressed.
		document.addEventListener( 'keydown', ( event ) => {
			if ( event.key === 'Escape' && state === 'loading' ) {
				cancelled = true;
				setOpenState( false );
				pendingPrefill = null;
			}
		} );
	}

	return { init, triggerOpen, close };
}

module.exports = { createCommandPalette };
