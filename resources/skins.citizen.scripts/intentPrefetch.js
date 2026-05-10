const INTENT_EVENTS = [ 'pointerenter', 'focus', 'touchstart' ];

/**
 * Bind hover/focus/touch intent listeners that prefetch a ResourceLoader module.
 *
 * Each listener fires at most once via `{ once: true }`. The first event calls
 * `mw.loader.load(moduleName)`; an internal `fired` flag short-circuits the
 * remaining listeners so the second and third events don't re-call. Returns a
 * `cancel` function that flips the flag and explicitly removes any listeners
 * that haven't yet auto-removed themselves.
 *
 * @param {HTMLElement} trigger
 * @param {string} moduleName ResourceLoader module name
 * @param {Object} mw MediaWiki global
 * @return {Function} cancel
 */
function bindIntentPrefetch( trigger, moduleName, mw ) {
	let fired = false;

	function fire() {
		if ( fired ) {
			return;
		}
		fired = true;
		mw.loader.load( moduleName );
	}

	INTENT_EVENTS.forEach( ( evt ) => {
		trigger.addEventListener( evt, fire, { once: true, passive: true } );
	} );

	return function cancel() {
		fired = true;
		INTENT_EVENTS.forEach( ( evt ) => {
			trigger.removeEventListener( evt, fire );
		} );
	};
}

module.exports = { bindIntentPrefetch };
