/**
 * Interface for search clients
 *
 * @interface SearchClient
 */

const { AbortableSearchFetch } = require( '../types.js' );

/**
 * Search for pages by title
 *
 * @method SearchClient#fetchByQuery
 * @param {string} query The search term
 * @param {number} [limit] Maximum number of results
 * @param {boolean} [showDescription] Whether to show descriptions
 * @return {AbortableSearchFetch}
 */

/**
 * Load more search results
 * TODO: Load more is not implemented yet in REST API, we need to wait for MediaWiki upstream
 *
 * @method SearchClient#loadMore
 * @param {string} query The search term
 * @param {number} offset The number of search results that were already loaded
 * @param {number} [limit] How many further search results to load
 * @return {AbortableSearchFetch}
 */
