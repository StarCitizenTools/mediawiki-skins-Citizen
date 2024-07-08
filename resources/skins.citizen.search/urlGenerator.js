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
 * @param {SearchResult|string} page
 * @param {UrlParams} [params]
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
		 * @param {SearchResult|string} page
		 * @param {UrlParams} params
		 * @return {string}
		 */
		generateUrl(
			page,
			params = {}
		) {
			const getPageTitle = () => {
				let title;
				if ( !page ) {
					title = 'Special:Search';
				} else if ( typeof page !== 'string' ) {
					title = page.title;
				} else {
					title = page;
				}
				return encodeURIComponent( title );
			};

			// Use short URL if avaliable, instead of doing a bunch of 302 like mediawiki.searchSuggest does
			const articlePath = config.wgArticlePath.replace( '$1', getPageTitle() );

			if ( Object.keys( params ).length === 0 ) {
				return articlePath;
			} else {
				const searchParams = new URLSearchParams( params );
				const paramsPrefix = articlePath.includes('?') ? '&' : '?';
				return articlePath + paramsPrefix + searchParams.toString();
			}
		}
	};
}

/** @module urlGenerator */
module.exports = urlGenerator;
