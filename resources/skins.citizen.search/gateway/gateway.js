/**
 * @typedef {Object} Results
 * @property {string} id The page ID of the page
 * @property {string} title The title of the page.
 * @property {string} desc The description of the page.
 * @property {string} thumbnail The url of the thumbnail of the page.
 *
 * @global
 */

const gatewayConfig = require( '../config.json' ).wgCitizenSearchGateway;

/**
 * Setup the default gateway based on wiki configuration
 *
 * @return {module}
 */
function getDefaultGateway() {
	switch ( gatewayConfig ) {
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
	let gateway = getDefaultGateway();

	/*
	 * Multi-gateway search experiment
	 * This is a rough proof of concept for allowing multiple search gateway
	 * We are using SMW Ask as an experiment
	 *
	 * TODO:
	 * - Clean up gateway into JSON data perhaps
	 * - Implement UI support (initial states, search syntax suggestions)
	 */
	const smwSearchCommand = '/ask ';

	if ( searchQuery.startsWith( smwSearchCommand ) ) {
		gateway = require( './smwAskApi.js' );
		searchQuery = searchQuery.slice( smwSearchCommand.length );
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
