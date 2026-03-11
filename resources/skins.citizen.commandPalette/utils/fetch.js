/*
 * Adapted from Vector
 * All credits go to the developers behind Vector
 * @see https://github.com/wikimedia/mediawiki-skins-Vector/blob/master/resources/skins.vector.search/fetch.js
*/

/**
 * @typedef {Object} AbortableFetch
 * @property {Promise<any>} fetch
 * @property {Function} abort
 */

/**
 * A wrapper which combines native fetch() in browsers and the following json() call.
 *
 * @param {string} resource
 * @param {RequestInit} [init]
 * @return {AbortableFetch}
 */
function fetchJson( resource, init ) {
	// eslint-disable-next-line compat/compat -- MW 1.43+ targets modern browsers
	const controller = new AbortController();

	const getJson = fetch( resource, Object.assign( {}, init, {
		signal: controller.signal
	} ) ).then( ( response ) => {
		if ( !response.ok ) {
			throw new Error( 'Network request failed with HTTP code ' + response.status );
		}
		return response.json();
	} );

	return {
		fetch: getJson,
		abort: () => {
			controller.abort();
		}
	};
}

module.exports = fetchJson;
