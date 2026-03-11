const createProvider = require( './createProvider.js' );
const { getNavigationAction } = require( '../utils/providerActions.js' );

/**
 * Creates a recent items provider.
 *
 * @param {Object} recentItemsService The shared recent items service.
 * @return {Object} A validated provider.
 */
function createRecentItemsProvider( recentItemsService ) {
	return createProvider( 'recent', {
		canProvide( query ) {
			return !query;
		},

		getResults() {
			const items = recentItemsService.getRecentItems();
			return {
				items: Array.isArray( items ) ?
					items.map( ( item ) => ( { ...item, source: 'recent' } ) ) : []
			};
		},

		onResultSelect( item ) {
			return getNavigationAction( item );
		}
	}, { debounceMs: 0, keepStaleResults: false } );
}

module.exports = createRecentItemsProvider;
