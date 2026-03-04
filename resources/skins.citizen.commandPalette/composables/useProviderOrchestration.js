const { ref, computed } = require( 'vue' );

const SHOW_PENDING_DELAY_MS = 300;

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
 * @return {Object} Orchestration state and methods.
 */
function useProviderOrchestration( providers, resultDecorator, deps ) {
	deps = deps || {};

	const query = ref( '' );
	const displayedItems = ref( [] );
	const isPending = ref( false );
	const showPending = ref( false );
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
			const items = result && result.items ?
				result.items : ( Array.isArray( result ) ? result : [] );
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
				const items = result && result.items ?
					result.items : ( Array.isArray( result ) ? result : [] );
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
	 * Clears the search and populates presults.
	 */
	async function clearSearch() {
		query.value = '';
		resetOperationState();

		let recentItems = [];
		if ( deps.recentItemsProvider ) {
			try {
				const recentResult = deps.recentItemsProvider.getResults( '' );
				recentItems = recentResult && recentResult.items ?
					recentResult.items :
					( Array.isArray( recentResult ) ? recentResult : [] );
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
				const relatedItems = relatedResult && relatedResult.items ?
					relatedResult.items :
					( Array.isArray( relatedResult ) ? relatedResult : [] );

				if ( query.value === '' ) {
					const relatedUrls = new Set(
						relatedItems
							.map( ( item ) => item.url )
							.filter( Boolean )
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
					displayedItems.value = sections;
				}
			} catch ( e ) {
				mw.log.error(
					'[commandPalette] Failed to get related articles:', e
				);
			}
		}
	}

	/**
	 * Updates the search query and triggers the appropriate provider.
	 *
	 * @param {string} newQuery The new search query.
	 */
	function updateQuery( newQuery ) {
		query.value = newQuery;
		resetOperationState();

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

		if ( actionResult.action === 'updateQuery' &&
			actionResult.payload !== undefined ) {
			updateQuery( actionResult.payload );
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
		updateQuery,
		clearSearch,
		handleSelection,
		dismissRecentItem
	};
}

module.exports = useProviderOrchestration;
