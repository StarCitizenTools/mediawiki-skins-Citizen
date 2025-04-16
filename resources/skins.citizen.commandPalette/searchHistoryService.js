/**
 * Service for managing search history in the command palette
 */
const { cdxIconHistory } = require( './icons.json' );
const RECENT_ITEMS_KEY = 'skin-citizen-command-palette-recent-items';
const MAX_RECENT_ITEMS = 5;

/**
 * Creates a search history service
 *
 * @return {Object} Search history service
 */
function createSearchHistoryService() {
	/**
	 * Saves an item to recent history
	 *
	 * @param {Object} item - The item to save
	 */
	function saveRecentItem( item ) {
		const recentItems = mw.storage.getObject( RECENT_ITEMS_KEY ) || [];
		// Remove if already exists
		const existingIndex = recentItems.findIndex( ( i ) => i.id === item.id );
		if ( existingIndex !== -1 ) {
			recentItems.splice( existingIndex, 1 );
		}
		// Add to beginning
		recentItems.unshift( item );
		// Keep only MAX_RECENT_ITEMS
		if ( recentItems.length > MAX_RECENT_ITEMS ) {
			recentItems.pop();
		}
		mw.storage.setObject( RECENT_ITEMS_KEY, recentItems );
	}

	/**
	 * Saves a search query to recent history
	 *
	 * @param {string} query - The search query to save
	 * @param {string} searchUrl - The URL to the search page
	 */
	function saveSearchQuery( query, searchUrl ) {
		saveRecentItem( {
			type: 'fulltext-search',
			id: `citizen-command-palette-result-search-${ mw.util.escapeIdForAttribute( query ) }`,
			label: query,
			url: searchUrl,
			thumbnailIcon: cdxIconHistory
		} );
	}

	/**
	 * Gets recent items from history
	 *
	 * @return {Object} Recent items in the format expected by the command palette
	 */
	function getRecentItems() {
		const recentItems = mw.storage.getObject( RECENT_ITEMS_KEY ) || [];
		return {
			pages: {
				items: recentItems,
				showThumbnail: true
			}
		};
	}

	/**
	 * Clears all search history
	 */
	function clearHistory() {
		mw.storage.remove( RECENT_ITEMS_KEY );
	}

	return {
		saveRecentItem,
		saveSearchQuery,
		getRecentItems,
		clearHistory
	};
}

module.exports = createSearchHistoryService;
