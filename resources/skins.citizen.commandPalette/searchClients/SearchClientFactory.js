/**
 * Factory for creating search clients
 *
 * @module SearchClientFactory
 */

const { CitizenCommandPaletteSearchClient } = require( '../types.js' );
const MwRestSearchClient = require( './MwRestSearchClient.js' );

/**
 * Registry of available search client factory functions.
 * Each factory returns a client instance.
 *
 * @type {Object.<string, function(mw.Map): CitizenCommandPaletteSearchClient>}
 */
const searchClientRegistry = {
	MwRestSearchClient: () => new MwRestSearchClient()
};

/**
 * Create a search client instance based on the configuration.
 *
 * @return {CitizenCommandPaletteSearchClient}
 * @throws {Error} If the configured type is not registered or config is missing.
 */
function create() {
	// We don't have any other client type yet
	const clientType = 'MwRestSearchClient';

	const factory = searchClientRegistry[ clientType ];
	if ( !factory ) {
		// Use mw.log.error in production? Throwing for now.
		throw new Error( `Unknown or unregistered search client type configured: ${ clientType }` );
	}

	return factory();
}

/**
 * Register a new search client type dynamically.
 * Useful for extensions adding their own search clients.
 *
 * @param {string} type Unique identifier for the search client type.
 * @param {function(mw.Map): CitizenCommandPaletteSearchClient} factory Function that creates the search client instance.
 * @throws {Error} If the type is already registered.
 */
function registerSearchClient( type, factory ) {
	if ( searchClientRegistry[ type ] ) {
		throw new Error( `Search client type "${ type }" is already registered.` );
	}
	searchClientRegistry[ type ] = factory;
}

module.exports = {
	create,
	registerSearchClient
};
