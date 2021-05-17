/**
 * @typedef {Object} Results
 * @property {string} id The page ID of the page
 * @property {string} title The title of the page.
 * @property {string} description The description of the page.
 * @property {string} thumbnail The url of the thumbnail of the page.
 *
 * @global
 */

/* eslint-disable-next-line compat/compat */
const controller = new AbortController(),
	signal = controller.signal;

/**
 * Setup the gateway based on wiki configuration
 *
 * @return {module}
 */
function getGateway() {
	switch ( mw.config.get( 'wgCitizenSearchGateway' ) ) {
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
 * @return {Object} Results
 */
async function getResults( searchQuery ) {
	const gateway = getGateway();

	/* eslint-disable-next-line compat/compat */
	const response = await fetch( gateway.getUrl( searchQuery ), { signal } );

	if ( !response.ok ) {
		const message = 'Uh oh, a wild error appears! ' + response.status;
		throw new Error( message );
	}

	const data = await response.json();
	return gateway.convertDataToResults( data );
}

/**
 * Abort ongoing fetch request
 *
 * @return {void}
 */
function abortFetch() {
	controller.abort();
}

module.exports = {
	getResults: getResults,
	abortFetch: abortFetch
};
