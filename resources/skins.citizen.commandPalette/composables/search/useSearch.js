/**
 * Search composable for the Command Palette
 * Main entry point for search functionality
 */

const useSearchHistory = require( './useSearchHistory.js' );
const useSearchNavigation = require( './useSearchNavigation.js' );
const useSearchResultTransformer = require( './useSearchResultTransformer.js' );

module.exports = function useSearch( { state, enhanceActionsWithHints, services, onClose } ) {
	const { searchService } = services;

	// Initialize specialized composables
	const history = useSearchHistory( { services, state } );
	const transformer = useSearchResultTransformer();
	const navigation = useSearchNavigation( { state, history, onClose } );

	/**
	 * Reset the search state
	 */
	const resetSearchState = () => {
		state.isPending.value = false;
		state.showPending.value = false;
	};

	/**
	 * Perform search with the given query
	 *
	 * @param {string} query - The search query
	 */
	// eslint-disable-next-line es-x/no-async-functions
	const search = async ( query ) => {
		state.highlightedItemIndex.value = -1;

		if ( !query ) {
			resetSearchState();
			// Load recent items synchronously
			history.loadRecentItems();
			return;
		}

		state.showPending.value = true;

		try {
			const results = await searchService.search( query, 10 );
			const items = transformer.transformSearchResults( results, enhanceActionsWithHints );
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

	// Create debounced search function with MediaWiki's utility
	const debouncedSearch = mw.util.debounce( search, 300 );

	// Set up search query watcher
	const watchSearchQuery = ( nextTick ) => ( newQuery ) => {
		state.isPending.value = true;

		if ( !newQuery ) {
			// Clear items immediately when query is emptied
			state.currentItems.value = [];
			// Load recent items in next tick to prevent flash
			nextTick( () => {
				history.loadRecentItems();
				resetSearchState();
			} );
			return;
		}

		// Execute the search with debouncing handled by mw.util.debounce
		debouncedSearch( newQuery );
	};

	return {
		// Core search methods
		search,
		watchSearchQuery,

		// History methods
		loadRecentItems: history.loadRecentItems,
		getSearchUrl: history.getSearchUrl,
		saveSearchQuery: history.saveSearchQuery,
		saveRecentItem: history.saveRecentItem,

		// Navigation methods
		selectResult: navigation.selectResult,
		handleAction: navigation.handleAction
	};
};
