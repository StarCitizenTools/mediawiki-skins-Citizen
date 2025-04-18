/**
 * REST API search client implementation
 *
 * @module MwRestSearchClient
 */

const fetchJson = require( '../fetch.js' );
const urlGenerator = require( '../urlGenerator.js' );
const { cdxIconArticleRedirect, cdxIconEdit } = require( '../icons.json' );

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
 * @class
 * @implements {ISearchClient}
 */
class MwRestSearchClient {
	/**
	 * @param {MwMap} config
	 */
	constructor( config ) {
		this.config = config;
		this.urlGenerator = urlGenerator( config );
		this.editMessage = mw.msg( 'action-edit' );
	}

	/**
	 * Adapts the REST API response to the SearchResponse format
	 *
	 * @private
	 * @param {string} query
	 * @param {RestResponse} response
	 * @param {boolean} showDescription
	 * @return {SearchResponse}
	 */
	adaptApiResponse( query, response, showDescription ) {
		return {
			query,
			results: response.pages.map( ( page ) => {
				const thumbnail = page.thumbnail;
				return {
					id: page.id,
					label: page.title,
					description: showDescription ? page.description : undefined,
					url: this.urlGenerator.generateUrl( page ),
					thumbnail: thumbnail ? {
						url: thumbnail.url,
						width: thumbnail.width ?? undefined,
						height: thumbnail.height ?? undefined
					} : undefined,
					metadata: page.matched_title ? [
						{
							icon: cdxIconArticleRedirect,
							label: page.matched_title,
							highlightQuery: true
						}
					] : undefined,
					actions: [
						{
							id: 'edit',
							label: this.editMessage,
							icon: cdxIconEdit,
							url: this.urlGenerator.generateUrl( page, { action: 'edit' } )
						}
					]
				};
			} )
		};
	}

	/**
	 * @override
	 * @param {string} query The search term
	 * @param {number} [limit=10] Maximum number of results
	 * @param {boolean} [showDescription=true] Whether to show descriptions
	 * @return {AbortableSearchFetch}
	 */
	fetchByQuery( query, limit = 10, showDescription = true ) {
		const searchApiUrl = this.config.get( 'wgScriptPath' ) + '/rest.php';
		const params = { q: query, limit: limit.toString() };
		const search = new URLSearchParams( params );
		const url = `${ searchApiUrl }/v1/search/title?${ search.toString() }`;
		const result = fetchJson( url, {
			headers: {
				accept: 'application/json'
			}
		} );

		const searchResponsePromise = result.fetch.then( ( /** @type {RestResponse} */ res ) => this.adaptApiResponse( query, res, showDescription ) );

		return {
			abort: result.abort,
			fetch: searchResponsePromise
		};
	}

	/**
	 * TODO: MediaWiki upstream does not support load more yet
	 *
	 * @override
	 * @param {string} query The search term
	 * @param {number} offset The number of search results that were already loaded
	 * @param {number} [limit=10] How many further search results to load
	 * @return {AbortableSearchFetch}
	 */
	loadMore( query, offset, limit = 10 ) {
		const searchApiUrl = this.config.get( 'wgScriptPath' ) + '/rest.php';
		const params = { q: query, limit: limit.toString(), offset: offset.toString() };
		const search = new URLSearchParams( params );
		const url = `${ searchApiUrl }/v1/search/title?${ search.toString() }`;
		const result = fetchJson( url, {
			headers: {
				accept: 'application/json'
			}
		} );

		const searchResponsePromise = result.fetch.then( ( /** @type {RestResponse} */ res ) => this.adaptApiResponse( query, res, true ) );

		return {
			abort: result.abort,
			fetch: searchResponsePromise
		};
	}
}

module.exports = MwRestSearchClient;
