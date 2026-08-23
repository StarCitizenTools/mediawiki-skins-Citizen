const { ref, watch } = require( 'vue' );

// Past the 120ms debounce plus a normal round trip, but short enough that a
// hung request releases the key rather than firing a navigation the user has
// stopped expecting.
const PENDING_ACTIVATION_TIMEOUT_MS = 2000;

/**
 * Holds an Enter press until the lead result group settles for the surface it
 * was pressed on, for surfaces where that group is asynchronous and there is
 * therefore no highlight yet when the key lands.
 *
 * The wait is bound to the whole surface, not just the query: entering a mode,
 * drilling in or out, and opening help all leave the query at `''`, so a
 * query-only binding would let an activation armed on one level fire against
 * another.
 *
 * @param {Object} options
 * @param {import('vue').Ref<string>} options.surfaceKey Identity of the current surface.
 * @param {import('vue').Ref<boolean>} options.isLeadReady Whether the lead group has settled.
 * @param {import('vue').Ref<Array>} options.items Flat item list.
 * @param {import('vue').Ref<number>} options.defaultHighlightIndex Index the highlight defaults to.
 * @param {Function} options.onActivate Called with the item to activate,
 *   carrying whatever the hold was armed with.
 * @return {{ arm: Function, cancel: Function, isActivationQueued: import('vue').Ref<boolean> }}
 */
function usePendingActivation( options ) {
	// Owned solely here. The fetch lifecycle's flags know nothing about a held
	// keystroke and would lower them on an unrelated schedule.
	const isActivationQueued = ref( false );
	let armedSurface = null;
	let armedIntent = null;
	let timeoutId = null;

	function cancel() {
		if ( !isActivationQueued.value ) {
			return;
		}
		isActivationQueued.value = false;
		armedSurface = null;
		armedIntent = null;
		clearTimeout( timeoutId );
		timeoutId = null;
	}

	/**
	 * @param {Object} [intent] Flags merged onto the item once it arrives. A
	 *   modified Enter means the same thing whether or not results had landed.
	 */
	function arm( intent ) {
		armedSurface = options.surfaceKey.value;
		armedIntent = intent || null;
		isActivationQueued.value = true;
		clearTimeout( timeoutId );
		timeoutId = setTimeout( cancel, PENDING_ACTIVATION_TIMEOUT_MS );
	}

	watch( options.surfaceKey, () => {
		cancel();
	} );

	watch( options.isLeadReady, ( ready ) => {
		if ( !ready || !isActivationQueued.value ) {
			return;
		}
		if ( options.surfaceKey.value !== armedSurface ) {
			cancel();
			return;
		}
		const index = options.defaultHighlightIndex.value;
		// Decorate before cancel(), which drops the armed intent.
		const item = index >= 0 ?
			Object.assign( {}, options.items.value[ index ], armedIntent ) :
			null;
		cancel();
		// A group that settled empty has no activation to perform.
		if ( item ) {
			options.onActivate( item );
		}
	} );

	return { arm, cancel, isActivationQueued };
}

module.exports = Object.assign( usePendingActivation, { PENDING_ACTIVATION_TIMEOUT_MS } );
