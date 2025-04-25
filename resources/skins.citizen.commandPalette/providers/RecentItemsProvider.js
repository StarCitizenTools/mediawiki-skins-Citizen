const { CommandPaletteItem, CommandPaletteProvider } = require( '../types.js' );
const createRecentItems = require( '../services/recentItems.js' );

const recentItemsService = createRecentItems();

/** @type {CommandPaletteProvider} */
module.exports = {
	/** Whether this provider returns results asynchronously */
	isAsync: false,
	/** Debounce time in milliseconds for async providers */
	debounceMs: 0,
	/** Whether the first result from this provider should be automatically selected */
	shouldAutoSelectFirst: false,

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
		return recentItemsService.getRecentItems();
	}
};
