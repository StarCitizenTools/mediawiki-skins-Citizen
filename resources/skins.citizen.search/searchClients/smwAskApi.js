/** @module smwAskApiSearchClient */

const fetchJson = require( '../fetch.js' );
const urlGenerator = require( '../urlGenerator.js' );

/**
 * @typedef {Object} SearchResponse
 * @property {string} query
 * @property {SearchResult[]} results
 */

/**
 * Helper method to get the first string value
 * SMW return can be be empty, string, array, undefined, null
 *
 * @param {string} s
 * @return {string}
 */
function getFirstString( s ) {
	if ( s === null || s === undefined || s.length === 0 ) {
		return undefined;
	}

	if ( typeof s === 'string' ) {
		return s;
	}

	if ( Array.isArray( s ) ) {
		for ( let i = 0; i < s.length; i++ ) {
			const result = getFirstString( s[ i ] );
			if ( result !== undefined ) {
				return result;
			}
		}
	}

	return undefined;
}

/**
 * @param {mw.Map} config
 * @param {string} query
 * @param {Object} response
 * @param {boolean} showDescription
 * @return {SearchResponse}
 */
function adaptApiResponse( config, query, response, showDescription ) {
	const urlGeneratorInstance = urlGenerator( config );
	const getDescription = ( page ) => getFirstString( page?.printouts?.Description ).slice( 0, 60 );

	return {
		query,
		results: response.query.results.map( ( page ) => {
			page = Object.values( page )[ 0 ];
			const thumbnail = page.printouts.Page_Image[ 0 ];
			return {
				id: undefined,
				label: getFirstString( page.displaytitle ) || page.fulltext,
				key: page.fulltext.replace( / /g, '_' ),
				title: page.fulltext,
				description: showDescription ? getDescription( page ) : undefined,
				url: urlGeneratorInstance.generateUrl( page ),
				thumbnail: thumbnail ? {
					url: `${ config.wgScriptPath }/index.php?title=Special:Redirect/file/${ thumbnail.fulltext }&width=200&height=200`,
					width: 200,
					height: 200
				} : undefined
			};
		} ) ?? []
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
function smwAskApiSearchClient( config ) {
	return {
		/**
		 * @type {fetchByTitle}
		 */
		// FIXME: Set showDescription to false for now, the 'Description' key in printout seems to be causing issue
		fetchByTitle: ( q, limit = config.wgCitizenMaxSearchResults, showDescription = false ) => {
			const searchApiUrl = config.wgScriptPath + '/api.php';

			const getConditions = () => {
				const separateConditions = ( s ) => s.replace( /\]\]\s*\[\[/g, '|' );
				const removeSquareBrackets = ( s ) => s.replace( /\[|\]/g, '' );
				const conditions = removeSquareBrackets( separateConditions( q ) );
				return conditions;
			};

			const getPrintouts = () => {
				/*
				 * FIXME: Figure out how to assign a label to printout statement in askargs
				 * TODO: Should let user define what property is used for description and thumbnail
				 */
				const printouts = [
					/* Extension:PageImages and Extension:SemanticExtraSpecialProperties */
					'Page_Image'
				];
				if ( showDescription === true ) {
					/* Extension:Semantic Meta Tags */
					printouts.push( 'Description' );
				}
				return printouts.join( '|' );
			};

			// @see https://www.semantic-mediawiki.org/wiki/Help:API:askargs
			/* eslint-disable camelcase */
			const params = {
				format: 'json',
				formatversion: '2',
				action: 'askargs',
				api_version: '3',
				conditions: getConditions(),
				printouts: getPrintouts(),
				parameters: `limit=${ limit.toString() }`
			};
			/* eslint-enable camelcase */
			const search = new URLSearchParams( params );
			const url = `${ searchApiUrl }?${ search.toString() }`;
			const result = fetchJson( url, {
				headers: {
					accept: 'application/json'
				}
			} );
			const searchResponsePromise = result.fetch
				.then( ( /** @type {SMWAskArgResponse} */ res ) => adaptApiResponse( config, q, res, showDescription ) );
			return {
				abort: result.abort,
				fetch: searchResponsePromise
			};
		}
	};
}

module.exports = smwAskApiSearchClient;
