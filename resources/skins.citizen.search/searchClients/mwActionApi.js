/** @module mwActionApiSearchClient */

const fetchJson = require( '../fetch.js' );
const urlGenerator = require( '../urlGenerator.js' );

// Based on mediawiki.searchSuggest
// eslint-disable-next-line array-callback-return
const searchNS = Object.entries( mw.config.get( 'wgFormattedNamespaces' ) ).map( ( [ nsID ] ) => {
	if ( nsID >= 0 && mw.user.options.get( 'searchNs' + nsID ) ) {
		// Cast string key to number
		return Number( nsID );
	}
} ).filter( ( item ) => item !== undefined ).join( '|' );

/**
 * @typedef {Object} ActionResponse
 * @property {ActionQuery[]} query
 */

/**
 * @typedef {Object} ActionQuery
 * @property {ActionRedirects[] | null} redirects
 * @property {ActionResult[]} pages
 */

/**
 * @typedef {Object} ActionRedirects
 * @property {string} from
 */

/**
 * @typedef {Object} ActionResult
 * @property {number} pageid
 * @property {number} index
 * @property {string} title
 * @property {ActionThumbnail | null} [thumbnail]
 */

/**
 * @typedef {Object} ActionThumbnail
 * @property {string} source
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
	const getDescription = ( page ) => {
		switch ( config.wgCitizenSearchDescriptionSource ) {
			case 'wikidata':
				return page?.description;
			case 'textextracts':
				return page?.extract;
			case 'pagedescription':
				return page?.pageprops?.description?.slice( 0, 100 );
		}
	};

	// Early exit with there are no query
	if ( !response.query ) {
		return { query, results: {} };
	}

	response = response.query;

	// Merge redirects array into pages array if avaliable
	// So the from key can be used for matched title
	if ( response.redirects ) {
		const pageCount = response.pages.length;

		response.pages = Object.values(
			[ ...response.redirects, ...response.pages ].reduce( ( acc, curr ) => {
				const index = curr.index;
				acc[ index ] = { ...acc[ index ], ...curr };
				return acc;
			}, [] )
		);

		// Sometimes there can be multiple redirect object for the same page, only take the one with lower index
		if ( response.pages.length !== pageCount ) {
			response.pages = response.pages.filter( ( obj ) => Object.prototype.hasOwnProperty.call( obj, 'title' ) );
		}
	}

	// Sort pages by index key instead of page id
	response.pages.sort( ( a, b ) => a.index - b.index );

	return {
		query,
		results: response.pages.map( ( page ) => {
			const thumbnail = page.thumbnail;
			return {
				id: page.pageid,
				label: page.from || page.title,
				key: page.title.replace( / /g, '_' ),
				title: page.title,
				description: showDescription ? getDescription( page ) : undefined,
				url: urlGeneratorInstance.generateUrl( page ),
				thumbnail: thumbnail ? {
					url: thumbnail.source,
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
function mwActionApiSearchClient( config ) {
	return {
		/**
		 * @type {fetchByTitle}
		 */
		fetchByTitle: ( q, limit = config.wgCitizenMaxSearchResults, showDescription = true ) => {
			const cacheExpiry = config.wgSearchSuggestCacheExpiry;
			const descriptionSource = config.wgCitizenSearchDescriptionSource;

			const searchApiUrl = config.wgScriptPath + '/api.php';

			const params = {
				format: 'json',
				formatversion: '2',
				action: 'query',
				smaxage: cacheExpiry,
				maxage: cacheExpiry,
				generator: 'prefixsearch',
				gpssearch: q,
				gpsnamespace: searchNS,
				gpslimit: limit.toString(),
				redirects: '',
				prop: 'pageprops|pageimages',
				ppprop: 'displaytitle',
				piprop: 'thumbnail',
				pilicense: 'any',
				pithumbsize: 220,
				pilimit: limit.toString()
			};
			switch ( descriptionSource ) {
				case 'wikidata':
					params.prop += '|description';
					params.descprefersource = 'local';
					break;
				case 'textextracts':
					params.prop += '|extracts';
					params.exchars = '100';
					params.exintro = '1';
					params.exlimit = limit.toString();
					params.explaintext = '1';
					break;
				case 'pagedescription':
					params.prop += '|pageprops';
					params.ppprop = 'description';
					break;
			}
			const search = new URLSearchParams( params );
			const url = `${ searchApiUrl }?${ search.toString() }`;
			const result = fetchJson( url, {
				headers: {
					accept: 'application/json'
				}
			} );
			const searchResponsePromise = result.fetch
				.then( ( /** @type {ActionResponse} */ res ) => adaptApiResponse( config, q, res, showDescription ) );
			return {
				abort: result.abort,
				fetch: searchResponsePromise
			};
		}
	};
}

module.exports = mwActionApiSearchClient;
