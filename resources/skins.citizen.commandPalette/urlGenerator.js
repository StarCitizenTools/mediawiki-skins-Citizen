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
 * @return {UrlGenerator}
 */
function urlGenerator() {
	return {
		/**
		 * @param {SearchResult|string} page
		 * @param {UrlParams} [params]
		 * @return {string}
		 */
		generateUrl(
			page,
			params = {}
		) {
			let title;
			if ( !page ) {
				title = 'Special:Search';
			} else if ( typeof page !== 'string' ) {
				const fragment = page.fragment;
				title = page.title;
				if ( fragment ) {
					title += `#${ fragment }`;
				}
			} else {
				title = page;
			}
			return mw.util.getUrl( title, params );
		}
	};
}

/** @module urlGenerator */
module.exports = urlGenerator;
