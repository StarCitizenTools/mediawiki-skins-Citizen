const { ref, shallowRef, computed } = require( 'vue' );

const SHOW_PENDING_DELAY_MS = 300;

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
 * @param {Function} resultDecorator Function (items, query) => decoratedItems.
 * @param {Object} [deps] Optional dependencies for presults.
 * @param {Object} [deps.recentItemsProvider] Provider for recent items (presults).
 * @param {Object} [deps.relatedArticlesProvider] Provider for related articles (presults).
 * @param {Object} [deps.recentItemsService] Service for dismissing recent items.
 * @param {import('vue').Ref<Array>} [deps.tokens] Ref containing the current token array.
 * @return {Object} Orchestration state and methods.
 */
function useProviderOrchestration( providers, resultDecorator, deps ) {
	deps = deps || {};

	const query = ref( '' );
	const displayedItems = ref( [] );
	const isPending = ref( false );
	const showPending = ref( false );
	const activeMode = shallowRef( null );
	const flatItems = computed( () => displayedItems.value.flatMap( ( s ) => s.items ) );
	const hasDisplayedItems = computed( () => flatItems.value.length > 0 );

	let debounceTimeout = null;
	let pendingDelayTimeout = null;
	let abortController = null;

	/**
	 * Resets all operation state.
	 */
	function resetOperationState() {
		clearTimeout( debounceTimeout );
		debounceTimeout = null;
		clearTimeout( pendingDelayTimeout );
		pendingDelayTimeout = null;
		isPending.value = false;
		showPending.value = false;

		if ( abortController ) {
			abortController.abort();
			abortController = null;
		}
	}

	/**
	 * Applies the result decorator and updates displayedItems.
	 *
	 * @param {Array} contentItems Items from the content provider.
	 */
	function setResults( contentItems ) {
		const items = Array.isArray( contentItems ) ? contentItems : [];
		const decorated = resultDecorator( items, query.value );
		displayedItems.value = decorated.length > 0 ?
			[ { heading: null, items: decorated } ] : [];
	}

	/**
	 * Handles a synchronous provider.
	 *
	 * @param {Object} provider The provider.
	 * @param {string} currentQuery The query at dispatch time.
	 */
	async function handleSyncProvider( provider, currentQuery ) {
		try {
			const result = await provider.getResults( currentQuery, undefined );
			const items = normalizeProviderResult( result );
			if ( query.value === currentQuery ) {
				setResults( items );
			}
		} catch ( error ) {
			mw.log.error(
				'[commandPalette] Sync provider "' + provider.id + '" failed:', error
			);
			if ( query.value === currentQuery ) {
				setResults( [] );
			}
		}
	}

	/**
	 * Handles an asynchronous provider with debouncing and abort.
	 *
	 * @param {Object} provider The provider.
	 * @param {string} currentQuery The query at dispatch time.
	 */
	function handleAsyncProvider( provider, currentQuery ) {
		isPending.value = true;

		clearTimeout( pendingDelayTimeout );
		pendingDelayTimeout = setTimeout( () => {
			if ( isPending.value && query.value === currentQuery ) {
				showPending.value = true;
			}
		}, SHOW_PENDING_DELAY_MS );

		clearTimeout( debounceTimeout );

		if ( abortController ) {
			abortController.abort();
		}
		abortController = new AbortController();
		const signal = abortController.signal;

		debounceTimeout = setTimeout( async () => {
			if ( query.value !== currentQuery ) {
				isPending.value = false;
				showPending.value = false;
				return;
			}

			try {
				const result = await provider.getResults( currentQuery, signal );
				const items = normalizeProviderResult( result );
				if ( query.value === currentQuery ) {
					setResults( items );
				}
			} catch ( error ) {
				if ( error.name !== 'AbortError' ) {
					mw.log.error(
						'[commandPalette] Async provider "' +
						provider.id + '" failed:', error
					);
					if ( query.value === currentQuery ) {
						setResults( [] );
					}
				}
			} finally {
				if ( query.value === currentQuery ) {
					isPending.value = false;
					showPending.value = false;
					clearTimeout( pendingDelayTimeout );
					pendingDelayTimeout = null;
				}
			}
		}, provider.debounceMs || 250 );
	}

	/**
	 * Builds presult sections from related and recent items.
	 * Deduplicates recent items that already appear in related results.
	 *
	 * @param {Array} relatedItems Related article items.
	 * @param {Array} recentItems Recent items.
	 * @return {Array} Sections array for displayedItems.
	 */
	function buildPresultSections( relatedItems, recentItems ) {
		const relatedUrls = new Set(
			relatedItems.map( ( item ) => item.url ).filter( Boolean )
		);
		const filteredRecent = recentItems.filter(
			( item ) => !item.url || !relatedUrls.has( item.url )
		);

		const sections = [];
		if ( relatedItems.length > 0 ) {
			sections.push( {
				heading: 'citizen-command-palette-heading-related',
				items: relatedItems
			} );
		}
		if ( filteredRecent.length > 0 ) {
			sections.push( {
				heading: 'citizen-command-palette-heading-recent',
				items: filteredRecent
			} );
		}
		return sections;
	}

	/**
	 * Clears the search and populates presults.
	 */
	async function clearSearch() {
		query.value = '';
		resetOperationState();

		let recentItems = [];
		if ( deps.recentItemsProvider ) {
			try {
				const recentResult = deps.recentItemsProvider.getResults( '' );
				recentItems = normalizeProviderResult( recentResult );
			} catch ( e ) {
				mw.log.error( '[commandPalette] Failed to get recent items:', e );
			}
		}

		// Show recent section immediately while related loads
		displayedItems.value = recentItems.length > 0 ?
			[ { heading: 'citizen-command-palette-heading-recent', items: recentItems } ] :
			[];

		if ( deps.relatedArticlesProvider ) {
			try {
				const relatedResult =
					await deps.relatedArticlesProvider.getResults( '' );
				const relatedItems = normalizeProviderResult( relatedResult );

				if ( query.value === '' ) {
					displayedItems.value =
						buildPresultSections( relatedItems, recentItems );
				}
			} catch ( e ) {
				mw.log.error(
					'[commandPalette] Failed to get related articles:', e
				);
			}
		}
	}

	/**
	 * Handles a query routed through the active mode's getResults.
	 *
	 * @param {Object} mode The active mode object.
	 * @param {string} currentQuery The query string.
	 */
	function handleModeQuery( mode, currentQuery ) {
		const tokens = deps.tokens ? deps.tokens.value : [];
		if ( !currentQuery ) {
			Promise.resolve( mode.getResults( '', undefined, tokens ) ).then( ( result ) => {
				const items = normalizeProviderResult( result );
				if ( query.value === currentQuery && activeMode.value === mode ) {
					displayedItems.value = items.length > 0 ?
						[ { heading: null, items: items } ] : [];
				}
			} ).catch( ( error ) => {
				mw.log.error(
					'[commandPalette] Mode "' + mode.id + '" failed:', error
				);
			} );
			return;
		}

		isPending.value = true;

		clearTimeout( pendingDelayTimeout );
		pendingDelayTimeout = setTimeout( () => {
			if ( isPending.value && query.value === currentQuery ) {
				showPending.value = true;
			}
		}, SHOW_PENDING_DELAY_MS );

		clearTimeout( debounceTimeout );

		if ( abortController ) {
			abortController.abort();
		}
		abortController = new AbortController();

		debounceTimeout = setTimeout( async () => {
			if ( query.value !== currentQuery || activeMode.value !== mode ) {
				isPending.value = false;
				showPending.value = false;
				return;
			}

			try {
				const signal = abortController ? abortController.signal : undefined;
				const result = await mode.getResults( currentQuery, signal, tokens );
				const items = normalizeProviderResult( result );
				if ( query.value === currentQuery && activeMode.value === mode ) {
					displayedItems.value = items.length > 0 ?
						[ { heading: null, items: items } ] : [];
				}
			} catch ( error ) {
				if ( error.name !== 'AbortError' ) {
					mw.log.error(
						'[commandPalette] Mode "' + mode.id + '" failed:', error
					);
					if ( query.value === currentQuery && activeMode.value === mode ) {
						displayedItems.value = [];
					}
				}
			} finally {
				if ( query.value === currentQuery ) {
					isPending.value = false;
					showPending.value = false;
					clearTimeout( pendingDelayTimeout );
					pendingDelayTimeout = null;
				}
			}
		}, mode.debounceMs ?? 250 );
	}

	/**
	 * Enters a mode, clearing query and displayed items.
	 *
	 * @param {Object} mode The mode to enter.
	 */
	function enterMode( mode ) {
		resetOperationState();
		activeMode.value = mode;
		query.value = '';
		displayedItems.value = [];
		handleModeQuery( mode, '' );
	}

	/**
	 * Exits the current mode and reloads initial results.
	 *
	 * @return {Promise} Resolves when initial results are loaded.
	 */
	function exitMode() {
		activeMode.value = null;
		return clearSearch();
	}

	/**
	 * Updates the search query and triggers the appropriate provider.
	 *
	 * @param {string} newQuery The new search query.
	 */
	function updateQuery( newQuery ) {
		query.value = newQuery;
		resetOperationState();

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

		if ( !contentProvider ) {
			setResults( [] );
			return;
		}

		// Show stale results while loading if configured
		if ( contentProvider.keepStaleResults && flatItems.value.length > 0 ) {
			const staleItems = flatItems.value.filter(
				( item ) => item.source && (
					item.source.startsWith( contentProvider.id + ':' ) ||
					item.source === contentProvider.id
				)
			);
			setResults( staleItems );
		} else {
			setResults( [] );
		}

		if ( contentProvider.debounceMs > 0 ) {
			handleAsyncProvider( contentProvider, newQuery );
		} else {
			handleSyncProvider( contentProvider, newQuery );
		}
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
		activeMode,
		updateQuery,
		clearSearch,
		enterMode,
		exitMode,
		handleSelection,
		dismissRecentItem
	};
}

module.exports = useProviderOrchestration;
