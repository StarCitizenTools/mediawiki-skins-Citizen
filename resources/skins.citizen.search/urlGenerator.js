/*
 * Adapted from Vector
 * All credits go to the developers behind Vector
 * @see https://github.com/wikimedia/mediawiki-skins-Vector/blob/master/resources/skins.vector.search/urlGenerator.js
*/

/**
 * @typedef {Record<string,string>} UrlParams
 * @param {string} title
 * @param {string} fulltext
 */

/**
 * @callback generateUrl
 * @param {SearchResult|string} searchResult
 * @param {UrlParams} [params]
 * @param {string} [articlePath]
 * @return {string}
 */

/**
 * @typedef {Object} UrlGenerator
 * @property {generateUrl} generateUrl
 */

/**
 * Generates URLs for suggestions like those in MediaWiki's mediawiki.searchSuggest implementation.
 *
 * @param {MwMap} config
 * @return {UrlGenerator}
 */
function urlGenerator( config ) {
	return {
		/**
		 * @param {SearchResult|string} suggestion
		 * @param {UrlParams} params
		 * @param {string} articlePath
		 * @return {string}
		 */
		generateUrl(
			suggestion,
			params = {
				title: 'Special:Search'
			},
			articlePath = config.wgScript
		) {
			if ( typeof suggestion !== 'string' ) {
				suggestion = suggestion.title;
			} else {
				// Add `fulltext` query param to search within pages and for navigation
				// to the search results page (prevents being redirected to a certain
				// article).
				params = Object.assign( {}, params, {
					fulltext: '1'
				} );
			}

			const searchParams = new URLSearchParams(
				Object.assign( {}, params, { search: suggestion } )
			);
			return `${ articlePath }?${ searchParams.toString() }`;
		}
	};
}

/** @module urlGenerator */
module.exports = urlGenerator;
