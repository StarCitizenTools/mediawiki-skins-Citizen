const { CommandPaletteItem, CommandPaletteProvider, CommandPaletteActionResult } = require( '../types.js' );
const createRecentItems = require( '../services/recentItems.js' );

const recentItemsService = createRecentItems();

/** @type {CommandPaletteProvider} */
module.exports = {
	id: 'recent',
	isAsync: false, // We load from localStorage, so no need to debounce
	debounceMs: 0,

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
		const items = recentItemsService.getRecentItems();
		// Ensure source is added by the provider
		return Array.isArray( items ) ? items.map( ( item ) => ( { ...item, source: this.id } ) ) : [];
	},

	/**
	 * Handles the selection of a recent item.
	 * Default action is to navigate to the item's URL.
	 *
	 * @param {CommandPaletteItem} item The selected item.
	 * @return {CommandPaletteActionResult} Action result for the UI.
	 */
	async onResultSelect( item ) {
		// Default behavior for recent items is navigation
		if ( item.url ) {
			return { action: 'navigate', payload: item.url };
		}
		// If no URL, do nothing (should ideally not happen for saved items)
		return { action: 'none' };
	}
};
