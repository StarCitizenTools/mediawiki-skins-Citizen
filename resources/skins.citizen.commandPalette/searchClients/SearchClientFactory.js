/**
 * Factory for creating search clients
 *
 * @module SearchClientFactory
 */

const MwRestSearchClient = require( './MwRestSearchClient.js' );

/**
 * Registry of available search clients
 *
 * @type {Object.<string, function(MwMap): SearchClient>}
 */
const searchClientRegistry = {
	rest: ( config ) => new MwRestSearchClient( config )
};

/**
 * Register a new search client type
 *
 * @param {string} type Unique identifier for the search client type
 * @param {function(MwMap): SearchClient} factory Function that creates the search client
 * @throws {Error} If the type is already registered
 */
function registerSearchClient( type, factory ) {
	if ( searchClientRegistry[ type ] ) {
		throw new Error( `Search client type "${ type }" is already registered` );
	}
	searchClientRegistry[ type ] = factory;
}

/**
 * Create a search client instance
 *
 * @param {string} type Type of search client to create
 * @param {MwMap} config MediaWiki configuration
 * @return {SearchClient}
 * @throws {Error} If the type is not registered
 */
function createSearchClient( type, config ) {
	const factory = searchClientRegistry[ type ];
	if ( !factory ) {
		throw new Error( `Unknown search client type: ${ type }` );
	}
	return factory( config );
}

module.exports = {
	createSearchClient,
	registerSearchClient
};
