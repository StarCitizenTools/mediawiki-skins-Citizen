const { CommandPaletteItem, CommandPaletteProvider, CommandPaletteActionResult } = require( '../types.js' );
const SearchClientFactory = require( '../searchClients/SearchClientFactory.js' );

/** @type {CommandPaletteProvider} */
module.exports = {
	id: 'search',
	isAsync: true,
	debounceMs: 250,

	/**
	 * Determines if this provider should handle the current query.
	 *
	 * @param {string} query The search query.
	 * @return {boolean}
	 */
	canProvide( query ) {
		// Handles non-empty queries that are not slash commands
		return !!query && !query.startsWith( '/' );
	},

	/**
	 * Performs the search using the configured SearchClient and returns results.
	 *
	 * @param {string} query The search query.
	 * @return {Promise<Array<CommandPaletteItem>>} A promise resolving to search results.
	 */
	async getResults( query ) {
		const searchClient = SearchClientFactory.create();

		try {
			const { fetch } = searchClient.fetchByQuery( query );
			const searchResponse = await fetch;
			const results = searchResponse.results ?? [];
			// Ensure source is added by the provider
			return Array.isArray( results ) ? results.map( ( item ) => ( { ...item, source: this.id } ) ) : [];
		} catch ( error ) {
			if ( error.name === 'AbortError' ) {
				// Search was aborted, ignore
				return [];
			}
			throw error;
		}
	},

	/**
	 * Handles the selection of a search result item.
	 * Default action is to navigate to the item's URL.
	 *
	 * @param {CommandPaletteItem} item The selected item.
	 * @return {CommandPaletteActionResult} Action result for the UI.
	 */
	async onResultSelect( item ) {
		// Default behavior for search results is navigation
		if ( item.url ) {
			return { action: 'navigate', payload: item.url };
		}
		return { action: 'none' }; // Fallback if no URL
	}
};
