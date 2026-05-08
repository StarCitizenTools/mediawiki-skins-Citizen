const MODULE = 'skins.citizen.commandPalette';
const LOAD_TIMEOUT_MS = 10000;
const { bindIntentPrefetch } = require( './intentPrefetch.js' );

/**
 * Create the command palette trigger orchestrator.
 *
 * Owns the lifecycle: intent prefetch on hover/focus/touch, lazy
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
	let overlay = null;

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

	function load() {
		state = 'loading';
		cancelled = false;

		let timeoutId = null;
		const timeoutPromise = new Promise( ( _resolve, reject ) => {
			timeoutId = setTimeout( () => reject( new Error( 'timeout' ) ), LOAD_TIMEOUT_MS );
		} );

		Promise.race( [ mw.loader.using( MODULE ), timeoutPromise ] ).then(
			( req ) => {
				clearTimeout( timeoutId );
				const mod = req( MODULE );
				const overlayEl = ensureOverlay();
				paletteApp = mod.initApp( overlayEl, {
					prefill: pendingPrefill,
					onClose: notifyClosed
				} );
				state = 'mounted';
				if ( !cancelled ) {
					paletteApp.open( pendingPrefill );
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
			paletteApp.open( text );
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

		bindIntentPrefetch( summary, MODULE, mw );

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
