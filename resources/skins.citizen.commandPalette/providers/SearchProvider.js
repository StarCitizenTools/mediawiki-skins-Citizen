const createProvider = require( './createProvider.js' );
const { getNavigationAction } = require( '../utils/providerActions.js' );

/**
 * Creates a search provider with the given search client.
 *
 * @param {Object} searchClient The search client with fetchByQuery method.
 * @return {Object} A validated provider.
 */
function createSearchProvider( searchClient ) {
	return createProvider( 'search', {
		canProvide( query ) {
			return !!query && !query.startsWith( '/' );
		},

		async getResults( query, signal ) {
			try {
				const response = await searchClient.fetchByQuery( query, undefined, signal );
				const results = response.results ?? [];
				return { items: results.map( ( item ) => ( { ...item, source: 'search' } ) ) };
			} catch ( error ) {
				if ( error.name === 'AbortError' ) {
					return { items: [] };
				}
				throw error;
			}
		},

		onResultSelect( item ) {
			return getNavigationAction( item );
		}
	}, { debounceMs: 250, keepStaleResults: true } );
}

module.exports = createSearchProvider;
