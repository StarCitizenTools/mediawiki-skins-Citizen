/**
 * Factory for creating search clients
 *
 * @module SearchClientFactory
 */

const { CitizenCommandPaletteSearchClient } = require( '../types.js' );
const MwRestSearchClient = require( './MwRestSearchClient.js' );
const SmwAskApiSearchClient = require( './SmwAskApiSearchClient.js' );

const config = require( '../config.json' );

/**
 * Registry of available search client factory functions.
 * Each factory returns a client instance.
 *
 * @type {Object.<string, function(mw.Map): CitizenCommandPaletteSearchClient>}
 */
const searchClientRegistry = {
	MwRestSearchClient: () => new MwRestSearchClient(),
	SmwAskApiSearchClient: () => new SmwAskApiSearchClient()
};

/**
 * Maps gateway config values to search client registry keys.
 *
 * @type {Object.<string, string>}
 */
const gatewayToClientMap = {
	smwAskApi: 'SmwAskApiSearchClient',
	mwRestApi: 'MwRestSearchClient',
	mwActionApi: 'MwRestSearchClient'
};

/**
 * Create a search client instance based on the configuration.
 *
 * @return {CitizenCommandPaletteSearchClient}
 * @throws {Error} If the configured type is not registered or config is missing.
 */
function create() {
	const gateway = config.wgCitizenSearchGateway || 'mwRestApi';
	const clientType = gatewayToClientMap[ gateway ] || 'MwRestSearchClient';

	const factory = searchClientRegistry[ clientType ];
	if ( !factory ) {
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
