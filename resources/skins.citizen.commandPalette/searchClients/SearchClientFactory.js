/**
 * Factory for creating search clients
 *
 * @module SearchClientFactory
 */

const MwRestSearchClient = require( './MwRestSearchClient.js' );

/**
 * Factory function to create search clients
 *
 * @param {string} type Type of search client to create
 * @param {MwMap} config
 * @return {ISearchClient}
 */
function createSearchClient( type, config ) {
	switch ( type ) {
		case 'rest':
			return new MwRestSearchClient( config );
		// Add more search client types here
		default:
			throw new Error( `Unknown search client type: ${ type }` );
	}
}

module.exports = {
	createSearchClient
};
