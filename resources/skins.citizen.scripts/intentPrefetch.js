const INTENT_EVENTS = [ 'pointerenter', 'focus', 'touchstart' ];

/**
 * Bind hover/focus/touch intent listeners that prefetch a ResourceLoader module.
 *
 * Each listener fires at most once via `{ once: true }`. The first event starts
 * the module load; an internal `fired` flag short-circuits the remaining
 * listeners so the second and third events don't re-call. Returns a `cancel`
 * function that flips the flag and explicitly removes any listeners that
 * haven't yet auto-removed themselves.
 *
 * With `options.onReady`, the load goes through `mw.loader.using` and the
 * callback receives the module require function plus the intent event type
 * once the module is ready — callers can use it to do follow-up work (e.g.
 * pre-mounting UI) and decide per event type. A failed load stays silent:
 * prefetching is speculative, so the user never asked for anything that an
 * error toast could refer to; the caller's real load path owns error surfacing.
 * `cancel()` also suppresses a not-yet-delivered `onReady`.
 *
 * @param {HTMLElement} trigger
 * @param {string} moduleName ResourceLoader module name
 * @param {Object} mw MediaWiki global
 * @param {Object} [options]
 * @param {Function} [options.onReady] Called with `( require, eventType )` when the module is ready
 * @return {Function} cancel
 */
function bindIntentPrefetch( trigger, moduleName, mw, options ) {
	const onReady = options && options.onReady;
	let fired = false;
	let suppressOnReady = false;

	function fire( event ) {
		if ( fired ) {
			return;
		}
		fired = true;
		if ( !onReady ) {
			mw.loader.load( moduleName );
			return;
		}
		mw.loader.using( moduleName ).then(
			( req ) => {
				if ( !suppressOnReady ) {
					onReady( req, event.type );
				}
			},
			() => {}
		);
	}

	INTENT_EVENTS.forEach( ( evt ) => {
		trigger.addEventListener( evt, fire, { once: true, passive: true } );
	} );

	return function cancel() {
		fired = true;
		suppressOnReady = true;
		INTENT_EVENTS.forEach( ( evt ) => {
			trigger.removeEventListener( evt, fire );
		} );
	};
}

module.exports = { bindIntentPrefetch };
