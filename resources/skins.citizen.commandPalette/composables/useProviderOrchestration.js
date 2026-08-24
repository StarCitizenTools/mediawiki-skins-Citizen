const { ref, shallowRef, computed } = require( 'vue' );
const useOperationLifecycle = require( './useOperationLifecycle.js' );
const { DEFAULT_DEBOUNCE_MS } = require( '../providers/createProvider.js' );

const SHOW_PENDING_DELAY_MS = 300;

// Per-item detail fetches fire on focus changes (arrow keys, hover).
// Lower than the query debounce because the user expects detail to settle
// faster than they expect search results, and aborts handle rapid
// scrubbing — a settled focus of ~80ms is the threshold beyond which the
// fetch is worth running.
const DETAIL_DEBOUNCE_MS = 80;

const DEFAULT_STATE_CONFIG = {
	emptyState: {
		title: mw.message( 'searchsuggest-search' ).text(),
		description: mw.message( 'citizen-search-empty-desc' ).text(),
		icon: null
	},
	noResults( query ) {
		return {
			title: mw.message( 'citizen-search-noresults-title', query ).text(),
			description: mw.message( 'search-nonefound' ).text(),
			icon: null
		};
	}
};

/**
 * Normalizes a provider result into an array of items.
 * Providers may return { items: [...] }, a raw array, or something else.
 *
 * @param {*} result The raw provider result.
 * @return {Array} The normalized items array.
 */
function normalizeProviderResult( result ) {
	if ( result && result.items ) {
		return result.items;
	}
	return Array.isArray( result ) ? result : [];
}

/**
 * Composable that orchestrates provider selection, dispatching, debouncing,
 * abort coordination, and result assembly.
 *
 * Replaces the Pinia searchStore.
 *
 * @param {Array<Object>} providers Array of validated provider objects.
 * @param {{leadActions: ( query: string ) => Array<Object>, trailActions: ( query: string ) => Array<Object>}} resultDecorator
 *   `createAppendQueryActions()`'s return. Only its two attached action
 *   builders are used here; the decorator itself is applied by the caller.
 * @param {Object} [deps={}] Optional dependencies for presults.
 * @param {Object} [deps.recentItemsProvider] Provider for recent items (presults).
 * @param {Object} [deps.relatedArticlesProvider] Provider for related articles (presults).
 * @param {Object} [deps.recentItemsService] Service for dismissing recent items.
 * @param {import('vue').Ref<Array>} [deps.tokens] Ref containing the current token array.
 * @param {Function} [deps.getHelpCatalogItems] Returns the list of registered modes/commands shown in the help overlay's mode catalog at root.
 * @return {Object} Orchestration state and methods.
 */
function useProviderOrchestration( providers, resultDecorator, deps = {} ) {

	const query = ref( '' );
	const isPending = ref( false );
	const showPending = ref( false );
	/** @type {import('vue').ShallowRef<import('../types.js').PaletteMode|null>} */
	const activeMode = shallowRef( null );
	/** @type {import('vue').Ref<Object[]>} */
	const activeModeContext = ref( [] );
	const helpVisible = ref( false );

	// Identifies the surface a request belongs to. Every staleness decision
	// keys off this one value, so a surface change cannot be half-honoured.
	const surfaceKey = computed( () => JSON.stringify( [
		query.value,
		activeMode.value ? activeMode.value.id : null,
		activeModeContext.value,
		helpVisible.value
	] ) );

	// Every surface has at most one asynchronous group. `forSurface` is the
	// staleness test: items are stale until a landing stamps them with the
	// surface that is current when they arrive.
	/** @type {import('vue').Ref<{ items: import('../types.js').CommandPaletteItem[], forSurface: string|null, providerId: string|null }>} */
	const content = ref( { items: [], forSurface: null, providerId: null } );
	/** @type {import('vue').Ref<{ items: import('../types.js').CommandPaletteItem[], settled: boolean }>} */
	const related = ref( { items: [], settled: false } );
	/** @type {import('vue').Ref<import('../types.js').CommandPaletteItem[]>} */
	const recents = ref( [] );
	/** @type {import('vue').Ref<import('../types.js').CommandPaletteItem[]>} */
	const helpItems = ref( [] );

	const isPresultsSurface = computed(
		() => !query.value && !activeMode.value && !helpVisible.value
	);
	const isContentCurrent = computed(
		() => content.value.forSurface === surfaceKey.value
	);

	// The lead action restates the typed query as a search, so it only leads
	// when the query IS a search. A trigger-prefixed query (`#cat`) means
	// something else, and its own results keep the lead. An empty query here
	// is how modes, help and presults opt out of query actions entirely.
	const queryActionQuery = computed(
		() => ( activeMode.value || helpVisible.value ) ? '' : query.value
	);
	const leadActions = computed( () => content.value.providerId === 'search' ?
		resultDecorator.leadActions( queryActionQuery.value ) :
		[] );
	const trailActions = computed( () => content.value.providerId === 'search' ?
		resultDecorator.trailActions( queryActionQuery.value ) :
		resultDecorator.leadActions( queryActionQuery.value )
			.concat( resultDecorator.trailActions( queryActionQuery.value ) ) );

	/**
	 * @param {?string} heading
	 * @param {Array} items
	 * @return {?Object} Section, or null when there is nothing to render.
	 */
	function section( heading, items ) {
		return items.length > 0 ? { heading: heading, items: items } : null;
	}

	// Each surface names its own groups, in render order. A group therefore
	// cannot survive into a surface that does not mention it.
	const displayedItems = computed( () => {
		if ( helpVisible.value ) {
			return activeMode.value ? [] : [ section(
				'citizen-command-palette-help-section-modes', helpItems.value
			) ].filter( Boolean );
		}

		if ( isPresultsSurface.value ) {
			const relatedUrls = new Set(
				related.value.items.map( ( item ) => item.url ).filter( Boolean )
			);
			return [
				section(
					'citizen-command-palette-heading-related', related.value.items
				),
				section(
					'citizen-command-palette-heading-recent',
					recents.value.filter(
						( item ) => !item.url || !relatedUrls.has( item.url )
					)
				)
			].filter( Boolean );
		}

		return [
			section( null, leadActions.value ),
			section( null, content.value.items ),
			section( null, trailActions.value )
		].filter( Boolean );
	} );

	const flatItems = computed(
		() => displayedItems.value.flatMap( ( s ) => s.items )
	);
	const hasDisplayedItems = computed( () => flatItems.value.length > 0 );

	// The lead group owns the default highlight: the synchronous fulltext row
	// when there is one, otherwise the async content group.
	const isLeadReady = computed( () => {
		if ( helpVisible.value ) {
			return true;
		}
		if ( isPresultsSurface.value ) {
			return related.value.settled;
		}
		return leadActions.value.length > 0 || isContentCurrent.value;
	} );

	const isLoading = computed( () => {
		if ( helpVisible.value ) {
			return false;
		}
		if ( isPresultsSurface.value ) {
			return !related.value.settled;
		}
		return !isContentCurrent.value;
	} );

	const defaultHighlightIndex = computed( () => {
		// Presults are the only list shown without being asked for, so they
		// get no default highlight and Enter does nothing. The help catalog
		// and a mode's root listing also render at an empty query, but the
		// user elicited those, so they keep theirs.
		if ( isPresultsSurface.value ) {
			return -1;
		}
		return ( isLeadReady.value && flatItems.value.length > 0 ) ? 0 : -1;
	} );

	const stateConfig = computed( () => {
		const mode = activeMode.value;
		if ( !mode ) {
			return DEFAULT_STATE_CONFIG;
		}
		return {
			emptyState: mode.emptyState || DEFAULT_STATE_CONFIG.emptyState,
			noResults: mode.noResults || DEFAULT_STATE_CONFIG.noResults
		};
	} );

	const lifecycle = useOperationLifecycle( {
		isPending,
		showPending,
		pendingDelayMs: SHOW_PENDING_DELAY_MS
	} );
	const resetOperationState = lifecycle.reset;

	// Detail fetches run in their own abort domain so a focus change does
	// not cancel an in-flight list fetch and a list refresh does not cancel
	// a settled detail fetch. Pending state is internal — the UI today does
	// not need a detail-specific spinner.
	const detailPending = ref( false );
	const detailShowPending = ref( false );
	const detailLifecycle = useOperationLifecycle( {
		isPending: detailPending,
		showPending: detailShowPending,
		pendingDelayMs: SHOW_PENDING_DELAY_MS
	} );
	const resetDetailState = detailLifecycle.reset;

	/**
	 * Lands provider output on the content group, but only if the surface it
	 * was dispatched for is still the current one. This is the single
	 * staleness gate — it replaces the per-call combinations of query, mode
	 * and mode-context checks that each covered a different subset.
	 *
	 * @param {Array} items Items from the content provider.
	 * @param {string} dispatchSurface surfaceKey captured when the request was issued.
	 * @param {string|null} [providerId] Id of the provider that produced the items,
	 *   or null when none did.
	 */
	function applyContent( items, dispatchSurface, providerId ) {
		if ( surfaceKey.value !== dispatchSurface ) {
			return;
		}
		content.value = {
			items: Array.isArray( items ) ? items : [],
			forSurface: dispatchSurface,
			providerId: providerId !== undefined ?
				providerId :
				content.value.providerId
		};
	}

	/**
	 * Empties the content group. Used where a new level genuinely replaces the
	 * old one (mode entry, drilling in or out) rather than refining it.
	 */
	function resetContent() {
		content.value = { items: [], forSurface: null, providerId: null };
	}

	/**
	 * Dispatches a provider with debouncing, abort and pending state.
	 *
	 * A provider declaring `debounceMs: 0` still comes through here: it skips
	 * the wait, not the cancellation. Resolving that 0 with `||` would silently
	 * promote it to the default and was why a no-debounce provider previously
	 * had to bypass abort and pending state altogether.
	 *
	 * @param {Object} provider The provider.
	 * @param {string} currentQuery The query at dispatch time.
	 * @param {string} dispatchSurface surfaceKey at dispatch time.
	 */
	function dispatchProvider( provider, currentQuery, dispatchSurface ) {
		const isStale = () => surfaceKey.value !== dispatchSurface;
		lifecycle.runDebouncedAbortable( {
			debounceMs: provider.debounceMs ?? DEFAULT_DEBOUNCE_MS,
			isStale,
			run: ( signal ) => provider.getResults( currentQuery, signal ),
			onResult: ( result ) => applyContent(
				normalizeProviderResult( result ), dispatchSurface, provider.id
			),
			onError: ( error ) => {
				mw.log.error(
					'[commandPalette] Async provider "' + provider.id + '" failed:', error
				);
				applyContent( [], dispatchSurface, provider.id );
			}
		} );
	}

	/**
	 * Clears the search and populates presults.
	 *
	 * Related outranks recents because navigation intent is higher. That
	 * ranking is structural — it is the order the two appear in the presults
	 * branch of `displayedItems` — so however late related arrives it lands
	 * above recents. This surface has no default highlight, and an explicit
	 * selection is restored by item id, so the list settling underneath the
	 * user cannot redirect them.
	 */
	async function clearSearch() {
		query.value = '';
		resetOperationState();
		resetDetailState();
		resetContent();

		let recentItems = [];
		if ( deps.recentItemsProvider ) {
			try {
				recentItems = normalizeProviderResult(
					deps.recentItemsProvider.getResults( '' )
				);
			} catch ( e ) {
				mw.log.error( '[commandPalette] Failed to get recent items:', e );
			}
		}
		recents.value = recentItems;
		related.value = { items: [], settled: !deps.relatedArticlesProvider };

		if ( !deps.relatedArticlesProvider ) {
			return;
		}

		const dispatchSurface = surfaceKey.value;
		let relatedItems = [];
		try {
			relatedItems = normalizeProviderResult(
				await deps.relatedArticlesProvider.getResults( '' )
			);
		} catch ( e ) {
			mw.log.error( '[commandPalette] Failed to get related articles:', e );
		}

		// The provider takes no AbortSignal, so this is the only gate standing
		// between a slow related fetch and a surface that has moved on.
		if ( surfaceKey.value !== dispatchSurface ) {
			return;
		}
		related.value = { items: relatedItems, settled: true };
	}

	/**
	 * Handles a query routed through the active mode's getResults.
	 *
	 * Previous results stay on screen while a refinement runs — they are
	 * stamped with the surface that produced them, so they render but cannot
	 * be the default Enter target.
	 *
	 * @param {Object} mode The active mode object.
	 * @param {string} currentQuery The query string.
	 */
	function handleModeQuery( mode, currentQuery ) {
		const tokens = deps.tokens ? deps.tokens.value : [];
		const dispatchSurface = surfaceKey.value;

		// Empty query: fire immediately. No debounce, no abort — modes
		// load their root state on entry and the user expects no delay.
		// Uncancellable, so `dispatchSurface` is the only thing stopping a
		// late landing from overwriting a level the user has left.
		if ( !currentQuery ) {
			isPending.value = true;
			( async () => {
				try {
					const result = await mode.getResults(
						'', undefined, tokens, activeModeContext.value
					);
					applyContent(
						normalizeProviderResult( result ), dispatchSurface
					);
				} catch ( error ) {
					mw.log.error(
						'[commandPalette] Mode "' + mode.id + '" failed:', error
					);
					applyContent( [], dispatchSurface );
				} finally {
					if ( surfaceKey.value === dispatchSurface ) {
						isPending.value = false;
					}
				}
			} )();
			return;
		}

		const isStale = () => surfaceKey.value !== dispatchSurface;
		lifecycle.runDebouncedAbortable( {
			debounceMs: mode.debounceMs ?? DEFAULT_DEBOUNCE_MS,
			isStale,
			run: ( signal ) => mode.getResults( currentQuery, signal, tokens, activeModeContext.value ),
			onResult: ( result ) => applyContent(
				normalizeProviderResult( result ), dispatchSurface
			),
			onError: ( error ) => {
				mw.log.error(
					'[commandPalette] Mode "' + mode.id + '" failed:', error
				);
				applyContent( [], dispatchSurface );
			}
		} );
	}

	/**
	 * Enters a mode, clearing query and displayed items.
	 *
	 * @param {Object} mode The mode to enter.
	 */
	function enterMode( mode ) {
		resetOperationState();
		resetDetailState();
		activeMode.value = mode;
		activeModeContext.value = [];
		query.value = '';
		resetContent();
		handleModeQuery( mode, '' );
	}

	/**
	 * Exits the current mode and reloads initial results.
	 *
	 * @return {Promise} Resolves when initial results are loaded.
	 */
	function exitMode() {
		activeMode.value = null;
		activeModeContext.value = [];
		// clearSearch() also calls resetDetailState(), but the direct call
		// here keeps exitMode's contract self-evident — every navigation
		// function explicitly resets both lifecycles.
		resetDetailState();
		return clearSearch();
	}

	/**
	 * Pushes a value onto the active mode's context stack and re-runs
	 * the mode's getResults with an empty query. Cancels any in-flight
	 * fetch and clears the displayed list so the previous level's
	 * results don't bleed into the new one.
	 *
	 * @param {*} value Value to append to activeModeContext.
	 */
	function pushModeContext( value ) {
		if ( !activeMode.value ) {
			return;
		}
		activeModeContext.value = activeModeContext.value.concat( [ value ] );
		resetOperationState();
		resetDetailState();
		query.value = '';
		resetContent();
		handleModeQuery( activeMode.value, '' );
	}

	/**
	 * Pops the last entry from the active mode's context stack.
	 * No-op when the stack is empty or no mode is active. Cancels any
	 * in-flight fetch and clears the displayed list so the deeper
	 * level's results don't bleed into the parent.
	 */
	function popModeContext() {
		if ( !activeMode.value || activeModeContext.value.length === 0 ) {
			return;
		}
		activeModeContext.value = activeModeContext.value.slice( 0, -1 );
		resetOperationState();
		resetDetailState();
		query.value = '';
		resetContent();
		handleModeQuery( activeMode.value, '' );
	}

	/**
	 * Updates the search query and triggers the appropriate provider.
	 *
	 * @param {string} newQuery The new search query.
	 */
	function updateQuery( newQuery ) {
		query.value = newQuery;
		resetOperationState();
		resetDetailState();

		// Help layers over the underlying state and owns displayedItems while
		// visible. Skip the provider pipeline so input clears that fire after
		// openHelp (e.g. selecting `/help`) don't overwrite the catalog.
		if ( helpVisible.value ) {
			return;
		}

		if ( activeMode.value ) {
			handleModeQuery( activeMode.value, newQuery );
			return;
		}

		if ( !newQuery ) {
			clearSearch();
			return;
		}

		const contentProvider = providers.find(
			( p ) => p.canProvide( newQuery )
		);
		const dispatchSurface = surfaceKey.value;

		if ( !contentProvider ) {
			applyContent( [], dispatchSurface, null );
			return;
		}

		// Keep the previous fetch's rows on screen while the new one runs, when
		// the provider opts in. They keep the surface stamp they were produced
		// for, so they render without becoming a valid activation target.
		content.value = {
			items: contentProvider.keepStaleResults ?
				content.value.items.filter(
					( item ) => item.source && (
						item.source.startsWith( contentProvider.id + ':' ) ||
						item.source === contentProvider.id
					)
				) :
				[],
			forSurface: content.value.forSurface,
			providerId: contentProvider.id
		};

		dispatchProvider( contentProvider, newQuery, dispatchSurface );
	}

	/**
	 * Processes a provider action result.
	 *
	 * @param {Object} actionResult The action from the provider.
	 * @param {Object} result The original selected item.
	 * @return {Object} The processed action result.
	 */
	function processAction( actionResult, result ) {
		if ( !actionResult ) {
			return { action: 'none' };
		}

		if ( actionResult.action === 'navigate' && result.type !== 'command' ) {
			if ( deps.recentItemsService ) {
				deps.recentItemsService.saveRecentItem( result );
			}
		}

		return actionResult;
	}

	/**
	 * Handles selection of a result item.
	 *
	 * @param {Object} result The selected item.
	 * @return {Promise<Object>} Action result for the UI.
	 */
	async function handleSelection( result ) {
		if ( !result ) {
			return { action: 'none' };
		}

		// If in a mode, delegate to the mode's onResultSelect
		if ( activeMode.value &&
			typeof activeMode.value.onResultSelect === 'function' ) {
			try {
				const actionResult =
					await activeMode.value.onResultSelect( result );
				return processAction( actionResult, result );
			} catch ( error ) {
				mw.log.error(
					'[commandPalette] Mode selection handler failed:', error
				);
				return { action: 'none' };
			}
		}

		const sourceMatch = ( /^([^:]+)(?::.*)?$/ ).exec(
			result.source ?? ''
		);
		const providerId = sourceMatch ? sourceMatch[ 1 ] : result.source;
		const sourceProvider = providers.find(
			( p ) => p.id === providerId
		);

		if ( sourceProvider && typeof sourceProvider.onResultSelect === 'function' ) {
			try {
				const actionResult =
					await sourceProvider.onResultSelect( result );
				return processAction( actionResult, result );
			} catch ( error ) {
				mw.log.error(
					'[commandPalette] Selection handler failed:', error
				);
				return { action: 'none' };
			}
		}

		// Fallback
		const fallback = result.url ?
			{ action: 'navigate', payload: result.url } : { action: 'none' };
		return processAction( fallback, result );
	}

	/**
	 * Lazy-load detail data for a focused item. Modes that opt in by
	 * declaring `getItemDetail` (validated by defineMode) get this hook
	 * called when the highlighted item changes. The mode owns the API
	 * call and any per-item caching; the orchestration provides debounce,
	 * abort, and reactive mutation.
	 *
	 * On result, `item.detail.header.description` and `item.detail.pairs`
	 * are mutated in place — Vue 3 deep reactivity propagates through
	 * displayedItems so App.vue's highlightedItemDetail computed picks
	 * up the new fields without explicit invalidation.
	 *
	 * `isStale` checks both the mode (rejects results from a mode swap)
	 * and item identity in `flatItems` (rejects results for items that
	 * have been replaced by a list refresh). A focus change to a new item
	 * before this resolves aborts via the lifecycle on the next call.
	 *
	 * @param {Object} item Highlighted palette item.
	 */
	function requestItemDetail( item ) {
		const mode = activeMode.value;
		if ( !mode || typeof mode.getItemDetail !== 'function' || !item ) {
			return;
		}
		const capturedItem = item;
		// Captured after the guard above; the narrowing does not survive into the
		// closure that runs it.
		const getItemDetail = mode.getItemDetail;
		const isStale = () => activeMode.value !== mode ||
			!flatItems.value.includes( capturedItem );
		detailLifecycle.runDebouncedAbortable( {
			debounceMs: DETAIL_DEBOUNCE_MS,
			isStale,
			run: ( signal ) => getItemDetail( capturedItem, signal ),
			onResult: ( result ) => {
				if ( !result || !capturedItem.detail ) {
					return;
				}
				if ( !capturedItem.detail.header ) {
					capturedItem.detail.header = {};
				}
				if ( result.description !== undefined ) {
					capturedItem.detail.header.description = result.description;
				}
				if ( result.pairs !== undefined ) {
					capturedItem.detail.pairs = result.pairs;
				}
			},
			onError: ( error ) => {
				mw.log.error(
					'[commandPalette] Mode "' + mode.id + '" item detail failed:', error
				);
			}
		} );
	}

	/**
	 * Loads the registered-modes catalog into displayedItems so listNav can
	 * navigate it. Only meaningful at root (no active mode).
	 */
	function loadHelpCatalog() {
		if ( !deps.getHelpCatalogItems ) {
			return;
		}
		resetOperationState();
		resetDetailState();
		helpItems.value = deps.getHelpCatalogItems() || [];
	}

	/**
	 * Opens the help overlay. Help is layered on top of the active mode and
	 * mode context — opening it does not modify query, activeMode, or
	 * activeModeContext, so users can peek at help and return to where they
	 * were without losing in-progress state.
	 *
	 * At root, the mode catalog is loaded into displayedItems so listNav can
	 * navigate it. Inside a mode, displayedItems is cleared so that pressing
	 * Enter while help shows a static view does not select an invisible
	 * result underneath.
	 */
	function openHelp() {
		if ( helpVisible.value ) {
			return;
		}
		helpVisible.value = true;
		if ( activeMode.value ) {
			resetOperationState();
			resetDetailState();
			helpItems.value = [];
		} else {
			loadHelpCatalog();
		}
	}

	/**
	 * Closes the help overlay. At root, restores recents/related results that
	 * were displaced by the mode catalog. Inside a mode, re-runs the mode's
	 * getResults so the list that was hidden under help comes back.
	 */
	function closeHelp() {
		if ( !helpVisible.value ) {
			return;
		}
		helpVisible.value = false;
		helpItems.value = [];
		if ( activeMode.value ) {
			handleModeQuery( activeMode.value, query.value );
		} else if ( query.value ) {
			// updateQuery records a query typed while help is up but skips
			// dispatch, so the surface underneath is rebuilt on the way out.
			updateQuery( query.value );
		} else {
			clearSearch();
		}
	}

	/**
	 * Toggles the help overlay.
	 */
	function toggleHelp() {
		if ( helpVisible.value ) {
			closeHelp();
		} else {
			openHelp();
		}
	}

	/**
	 * Dismisses a recent item and refreshes presults.
	 *
	 * @param {string|number} itemId The ID of the item to dismiss.
	 */
	function dismissRecentItem( itemId ) {
		const itemToRemove = flatItems.value.find(
			( item ) => String( item.id ) === String( itemId ) &&
				item.source === 'recent'
		);

		if ( itemToRemove && deps.recentItemsService ) {
			deps.recentItemsService.removeRecentItem( itemToRemove );
			clearSearch();
		}
	}

	return {
		query,
		displayedItems,
		flatItems,
		isPending,
		showPending,
		hasDisplayedItems,
		isLoading,
		surfaceKey,
		isLeadReady,
		defaultHighlightIndex,
		stateConfig,
		activeMode,
		activeModeContext,
		helpVisible,
		updateQuery,
		clearSearch,
		enterMode,
		exitMode,
		pushModeContext,
		popModeContext,
		toggleHelp,
		openHelp,
		closeHelp,
		handleSelection,
		requestItemDetail,
		dismissRecentItem
	};
}

module.exports = useProviderOrchestration;
