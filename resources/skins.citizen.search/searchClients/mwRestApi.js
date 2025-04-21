/** @module mwRestApiSearchClient */

const fetchJson = require( '../fetch.js' );
const urlGenerator = require( '../urlGenerator.js' );

/**
 * @typedef {Object} RestResponse
 * @property {RestResult[]} pages
 */

/**
 * @typedef {Object} RestResult
 * @property {number} id
 * @property {string} key
 * @property {string} title
 * @property {string | null } matched_title
 * @property {string} [description]
 * @property {RestThumbnail | null} [thumbnail]
 */

/**
 * @typedef {Object} RestThumbnail
 * @property {string} url
 * @property {number | null} [width]
 * @property {number | null} [height]
 */

/**
 * @typedef {Object} SearchResponse
 * @property {string} query
 * @property {SearchResult[]} results
 */

/**
 * @param {mw.Map} config
 * @param {string} query
 * @param {Object} response
 * @param {boolean} showDescription
 * @return {SearchResponse}
 */
function adaptApiResponse( config, query, response, showDescription ) {
	const urlGeneratorInstance = urlGenerator( config );
	return {
		query,
		results: response.pages.map( ( page ) => {
			const thumbnail = page.thumbnail;
			return {
				id: page.id,
				label: page.matched_title || page.title,
				key: page.key,
				title: page.title,
				description: showDescription ? page.description : undefined,
				url: urlGeneratorInstance.generateUrl( page ),
				thumbnail: thumbnail ? {
					url: thumbnail.url,
					width: thumbnail.width ?? undefined,
					height: thumbnail.height ?? undefined
				} : undefined
			};
		} )
	};
}

/**
 * @typedef {Object} AbortableSearchFetch
 * @property {Promise<SearchResponse>} fetch
 * @property {Function} abort
 */

/**
 * @callback fetchByTitle
 * @param {string} query The search term.
 * @param {number} [limit] Maximum number of results.
 * @return {AbortableSearchFetch}
 */

/**
 * @callback loadMore
 * @param {string} query The search term.
 * @param {number} offset The number of search results that were already loaded.
 * @param {number} [limit] How many further search results to load (at most).
 * @return {AbortableSearchFetch}
 */

/**
 * @typedef {Object} SearchClient
 * @property {fetchByTitle} fetchByTitle
 * @property {loadMore} [loadMore]
 */

/**
 * @param {mw.Map} config
 * @return {SearchClient}
 */
function mwRestApiSearchClient( config ) {
	return {
		/**
		 * @type {fetchByTitle}
		 */
		fetchByTitle: ( q, limit = config.wgCitizenMaxSearchResults, showDescription = true ) => {
			const searchApiUrl = config.wgScriptPath + '/rest.php';
			const params = { q, limit: limit.toString() };
			const search = new URLSearchParams( params );
			const url = `${ searchApiUrl }/v1/search/title?${ search.toString() }`;
			const result = fetchJson( url, {
				headers: {
					accept: 'application/json'
				}
			} );
			const searchResponsePromise = result.fetch
				.then( ( /** @type {RestResponse} */ res ) => adaptApiResponse( config, q, res, showDescription ) );
			return {
				abort: result.abort,
				fetch: searchResponsePromise
			};
		}
	};
}

module.exports = mwRestApiSearchClient;
