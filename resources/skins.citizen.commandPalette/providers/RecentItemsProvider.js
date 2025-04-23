const { CommandPaletteItem } = require( '../types.js' );
const createSearchHistory = require( '../services/searchHistory.js' );

const searchHistoryService = createSearchHistory();

module.exports = {
	/**
	 * Determines if this provider should handle the current query.
	 *
	 * @param {string} query The search query.
	 * @return {boolean}
	 */
	canProvide( query ) {
		// Provides results only when the query is empty
		return !query;
	},

	/**
	 * Gets the recent items.
	 * Items are expected to conform to the CommandPaletteItem structure
	 * as they were saved in that format or a compatible subset (like fulltext-search).
	 *
	 * @return {Array<CommandPaletteItem>} An array of recent items.
	 */
	getResults() {
		// Directly return the recent items from the history service.
		// These items should conform to CommandPaletteItem due to optional properties.
		const rawItems = searchHistoryService.getRecentItems();
		return Array.isArray( rawItems ) ? rawItems : [];
	}
};
