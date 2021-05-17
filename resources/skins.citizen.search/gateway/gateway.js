/**
 * @typedef {Object} Results
 * @property {string} id The page ID of the page
 * @property {string} title The title of the page.
 * @property {string} description The description of the page.
 * @property {string} thumbnail The url of the thumbnail of the page.
 *
 * @global
 */

const gatewayConfig = require( '../config.json' ).wgCitizenSearchGateway;

/**
 * Setup the gateway based on wiki configuration
 *
 * @return {module}
 */
function getGateway() {
	switch ( gatewayConfig ) {
		case 'mwActionApi':
			return require( './mwActionApi.js' );
		case 'mwRestApi':
			return require( './mwRestApi.js' );
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
	const gateway = getGateway();

	const signal = controller.signal;

	/* eslint-disable-next-line compat/compat */
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
