/**
 * Search history composable for the Command Palette
 * Handles operations related to search history management
 */

module.exports = function useSearchHistory( { services, state } ) {
	const { searchHistoryService, urlGenerator } = services;

	/**
	 * Generate search URL for a query
	 *
	 * @return {string} URL for the search page with query parameter
	 */
	const getSearchUrl = () => urlGenerator.generateUrl( 'Special:Search', {
		search: state.searchQuery.value
	} );

	/**
	 * Load recent items from search history
	 */
	const loadRecentItems = () => {
		state.currentItems.value = searchHistoryService.getRecentItems();
	};

	/**
	 * Save search query to history
	 *
	 * @param {string} query The search query to save
	 * @param {string} url The URL associated with the query
	 */
	const saveSearchQuery = ( query, url ) => {
		if ( query.trim() !== '' ) {
			searchHistoryService.saveSearchQuery( query, url );
		}
	};

	/**
	 * Save an item to recent history
	 *
	 * @param {Object} item The item to save to history
	 */
	const saveRecentItem = ( item ) => {
		if ( item && typeof item === 'object' ) {
			searchHistoryService.saveRecentItem( item );
		}
	};

	return {
		getSearchUrl,
		loadRecentItems,
		saveSearchQuery,
		saveRecentItem
	};
};
