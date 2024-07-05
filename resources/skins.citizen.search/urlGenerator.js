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
 * Generates URLs for suggestions.
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
			}

			params.title = suggestion;

			const searchParams = new URLSearchParams( params );
			return `${ articlePath }?${ searchParams.toString() }`;
		}
	};
}

/** @module urlGenerator */
module.exports = urlGenerator;
