const VUE_MODULE = 'vue';

/**
 * Request Vue as its own ResourceLoader batch.
 *
 * `mw.loader` batches a module together with every dependency still in state
 * `registered`, so a bare `using( panel )` mints a load.php URL carrying its
 * own copy of Vue. The browser caches by full URL, and Vue's serialised form is
 * far past `mw.loader.store`'s 100 kB per-module cap, so those copies are
 * reusable by neither cache: each Vue-backed panel re-downloads Vue on every
 * page view that opens it first. Claiming Vue separately moves it to `loading`,
 * which excludes it from the panel's batch and leaves `modules=vue` as a single
 * URL shared by every panel and stable across releases.
 *
 * Two constraints keep this free, and both are load-bearing:
 * Vue must be requested *before* the panel, and it must not be awaited —
 * `mw.loader.work()` runs synchronously inside `using()`, so the two requests
 * are issued back to back and travel in parallel. Awaiting would serialise them
 * and cost a round trip.
 *
 * When Vue is already loading or ready — an earlier panel, or an extension that
 * pulled it in — this is a no-op and issues no request.
 *
 * @param {Object} mw MediaWiki global
 */
function claimVueBatch( mw ) {
	// Speculative, so failure stays silent: the caller's own load owns error
	// surfacing, and an unhandled rejection here would surface twice.
	mw.loader.using( VUE_MODULE ).catch( () => {} );
}

/**
 * `mw.loader.using` for a Vue-backed module, keeping Vue in its own request.
 *
 * @param {string} moduleName
 * @param {Object} mw MediaWiki global
 * @return {jQuery.Promise} With a `require` function
 */
function usingWithVue( moduleName, mw ) {
	claimVueBatch( mw );
	return mw.loader.using( moduleName );
}

module.exports = { claimVueBatch, usingWithVue };
