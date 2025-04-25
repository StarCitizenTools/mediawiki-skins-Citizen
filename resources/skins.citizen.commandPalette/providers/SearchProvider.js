const { CommandPaletteItem, CommandPaletteProvider } = require( '../types.js' );
const SearchClientFactory = require( '../searchClients/SearchClientFactory.js' );

/** @type {CommandPaletteProvider} */
module.exports = {
	/** Whether this provider returns results asynchronously */
	isAsync: true,
	/** Debounce time in milliseconds for async providers */
	debounceMs: 250,
	/** Whether the first result from this provider should be automatically selected */
	shouldAutoSelectFirst: false,

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
	// eslint-disable-next-line es-x/no-async-functions
	async getResults( query ) {
		const searchClient = SearchClientFactory.create();

		try {
			const { fetch } = searchClient.fetchByQuery( query );
			const searchResponse = await fetch;
			return searchResponse.results ?? [];
		} catch ( error ) {
			if ( error.name === 'AbortError' ) {
				// Search was aborted, ignore
				return [];
			}
			throw error;
		}
	}
};
