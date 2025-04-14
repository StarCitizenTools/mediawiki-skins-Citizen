/**
 * Search service that manages search clients
 *
 * @module searchService
 */

const SearchClientFactory = require( './searchClients/SearchClientFactory.js' );

/**
 * Create a search service instance
 *
 * @param {MwMap} config MediaWiki configuration
 * @return {Object} Search service instance
 */
function createSearchService( config ) {
	const searchClient = SearchClientFactory.createSearchClient( 'rest', config );

	/**
	 * Search for pages by title
	 *
	 * @param {string} query Search query
	 * @param {number} [limit=10] Maximum number of results
	 * @return {Promise<SearchResponse>} Search results
	 */
	// eslint-disable-next-line es-x/no-async-functions
	async function search( query, limit = 10 ) {
		const { fetch } = searchClient.fetchByQuery( query, limit );
		try {
			const response = await fetch;
			return response.results;
		} catch ( error ) {
			if ( error.name === 'AbortError' ) {
				// Search was aborted, ignore
				return [];
			}
			throw error;
		}
	}

	return {
		search
	};
}

module.exports = createSearchService;
