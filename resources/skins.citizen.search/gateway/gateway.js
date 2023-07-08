/**
 * @typedef {Object} Results
 * @property {string} id The page ID of the page
 * @property {string} title The title of the page.
 * @property {string} desc The description of the page.
 * @property {string} thumbnail The url of the thumbnail of the page.
 *
 * @global
 */

const defaultGatewayName = require( '../config.json' ).wgCitizenSearchGateway;

/**
 * Setup the gateway based on the name provided
 *
 * @param {string} gatewayName
 * @return {module}
 */
function getGateway( gatewayName ) {
	switch ( gatewayName ) {
		case 'mwActionApi':
			return require( './mwActionApi.js' );
		case 'mwRestApi':
			return require( './mwRestApi.js' );
		case 'smwAskApi':
			return require( './smwAskApi.js' );
		default:
			throw new Error( 'Unknown search gateway' );
	}
}

/**
 * Fetch suggestion from gateway and return the results object
 *
 * @param {string} searchQuery
 * @param {AbortController} controller
 * @return {Object} Results
 */
async function getResults( searchQuery, controller ) {
	let gateway = getGateway( defaultGatewayName );

	/*
	 * Multi-gateway search experiment
	 * This is a rough proof of concept for allowing multiple search gateway
	 * We are using SMW Ask as an experiment
	 *
	 * TODO:
	 * - Clean up gateway into JSON data perhaps
	 * - Implement UI support (initial states, search syntax suggestions)
	 * - Search query needs to be trimmed earlier so that query in the UI does not show the command
	 */
	const gatewayMap = new Map( [
		[ 'action', 'mwActionApi' ],
		[ 'ask', 'smwAskApi' ],
		[ 'rest', 'mwRestApi' ]
	] );

	for ( const [ command, gatewayName ] of gatewayMap ) {
		if ( searchQuery.startsWith( `/${command}` ) ) {
			gateway = getGateway( gatewayName );
			/* Remove command (e.g. /smw) from query */
			searchQuery = searchQuery.slice( command.length + 1 );
			break;
		}
	}

	/* Abort early if there are no search query */
	if ( searchQuery === '' ) {
		return {};
	}

	const signal = controller.signal;

	const response = await fetch( gateway.getUrl( searchQuery ), { signal } );

	if ( !response.ok ) {
		const message = 'Uh oh, a wild error appears! ' + response.status;
		throw new Error( message );
	}

	const data = await response.json();
	return gateway.convertDataToResults( data );
}

module.exports = {
	getResults: getResults
};
