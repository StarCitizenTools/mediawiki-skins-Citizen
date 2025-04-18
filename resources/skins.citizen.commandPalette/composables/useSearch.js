/**
 * Search composable for the Command Palette
 * Extracts search logic from App.vue
 */

module.exports = function useSearch( { state, enhanceActionsWithHints, services } ) {
	const { searchService, searchHistoryService, urlGenerator } = services;

	// Generate search URL
	const getSearchUrl = () => urlGenerator.generateUrl( 'Special:Search', {
		search: state.searchQuery.value
	} );

	// Load recent items from history
	const loadRecentItems = () => {
		state.currentItems.value = searchHistoryService.getRecentItems();
	};

	// Save search query to history
	const saveSearchQuery = ( query, url ) => {
		if ( query.trim() !== '' ) {
			searchHistoryService.saveSearchQuery( query, url );
		}
	};

	// Save an item to recent history
	const saveRecentItem = ( item ) => {
		if ( item ) {
			searchHistoryService.saveRecentItem( item );
		}
	};

	// Select a result and navigate to it
	const selectResult = ( result ) => {
		if ( !result ) {
			window.location.href = getSearchUrl();
			// Save the search query as a recent item when there are no results
			saveSearchQuery( state.searchQuery.value, getSearchUrl() );
			return true;
		}

		// If we have a valid result with URL, navigate to it
		if ( result.url ) {
			window.location.href = result.url;
			// Save the entire result object to recent items
			saveRecentItem( result );
		} else {
			// If no URL, fall back to search and save the query
			window.location.href = getSearchUrl();
			saveSearchQuery( state.searchQuery.value, getSearchUrl() );
		}
		return true;
	};

	// Handle action click/interaction
	const handleAction = ( { actionUrl, onClick, itemId } ) => {
		// Find the item associated with this action
		const item = state.currentItems.value.find( ( result ) => result.id === itemId );

		// Process the action
		if ( onClick ) {
			onClick();

			// Save item to recent items when performing action with onClick
			saveRecentItem( item );
			return;
		}

		if ( actionUrl ) {
			// Save item to recent items before navigating
			saveRecentItem( item );

			window.location.href = actionUrl;
			return true;
		}

		return false;
	};

	// Perform search with debouncing
	// eslint-disable-next-line es-x/no-async-functions
	const search = async ( query ) => {
		state.highlightedItemIndex.value = -1;

		if ( !query ) {
			// Clear any pending state immediately
			state.isPending.value = false;
			state.showPending.value = false;
			// Load recent items synchronously
			loadRecentItems();
			return;
		}

		state.showPending.value = true;

		try {
			const results = await searchService.search( query, 10 );
			const items = results?.map( ( result ) => {
				if ( !result || typeof result !== 'object' ) {
					return null;
				}

				// Enhance actions with keyboard hints
				const enhancedActions = enhanceActionsWithHints( result.actions );

				return {
					type: 'page',
					id: `citizen-command-palette-result-page-${ result.id || result.title }`,
					label: result.label || result.title,
					description: result.description,
					url: result.url,
					thumbnail: result.thumbnail,
					thumbnailIcon: result.thumbnailIcon,
					metadata: result.metadata || [],
					actions: enhancedActions
				};
			} ).filter( Boolean ) || [];

			state.currentItems.value = items;
		} catch ( error ) {
			mw.log.error( 'Error searching:', error );
			state.currentItems.value = [];
		} finally {
			state.isPending.value = false;
			// Delay hiding the pending state to prevent flicker
			setTimeout( () => {
				state.showPending.value = false;
			}, 300 );
		}
	};

	// Set up search query watcher
	const watchSearchQuery = ( nextTick ) => ( newQuery ) => {
		if ( state.debounceTimeout.value ) {
			clearTimeout( state.debounceTimeout.value );
		}
		state.isPending.value = true;

		if ( !newQuery ) {
			// Clear items immediately when query is emptied
			state.currentItems.value = [];
			// Load recent items in next tick to prevent flash
			nextTick( () => {
				loadRecentItems();
			} );
			return;
		}

		state.debounceTimeout.value = setTimeout( () => {
			search( newQuery );
		}, 300 );
	};

	return {
		loadRecentItems,
		selectResult,
		handleAction,
		search,
		watchSearchQuery,
		getSearchUrl,
		saveSearchQuery,
		saveRecentItem
	};
};
