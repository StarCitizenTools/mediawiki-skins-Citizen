/**
 * Interface for search clients
 *
 * @interface ISearchClient
 */

/**
 * Search for pages by title
 *
 * @function ISearchClient#fetchByQuery
 * @param {string} query The search term
 * @param {number} [limit] Maximum number of results
 * @param {boolean} [showDescription] Whether to show descriptions
 * @return {AbortableSearchFetch}
 */

/**
 * Load more search results
 *
 * @function ISearchClient#loadMore
 * @param {string} query The search term
 * @param {number} offset The number of search results that were already loaded
 * @param {number} [limit] How many further search results to load
 * @return {AbortableSearchFetch}
 */
