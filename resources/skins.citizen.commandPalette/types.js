/**
 * @typedef {Object} SearchResult
 * @property {number} id
 * @property {string} label
 * @property {string} [description]
 * @property {SearchThumbnail} [thumbnail]
 * @property {string} url
 * @property {SearchMetadataItem[]} [metadata]
 * @property {SearchAction[]} [actions]
 */

/**
 * @typedef {Object} SearchMetadataItem
 * @property {Icon} icon
 * @property {string} label
 * @property {boolean} highlightQuery
 */

/**
 * @typedef {Object} SearchAction
 * @property {string} id
 * @property {string} label
 * @property {Icon} icon
 * @property {string} url
 */

/**
 * @typedef {Object} SearchThumbnail
 * @property {string} url
 * @property {number} [width]
 * @property {number} [height]
 */

/**
 * @typedef {Object} SearchResponse
 * @property {string} query
 * @property {SearchResult[]} results
 */

/**
 * @typedef {Object} SearchResultsGroup
 * @property {string} heading
 * @property {SearchResult[]} items
 */

/**
 * @typedef {Object} SearchResults
 * @property {Object.<string, SearchResultsGroup>} [pages]
 */

/**
 * @typedef {Object} UrlParams
 * @property {string} [search]
 * @property {string} [title]
 * @property {string} [fulltext]
 */

/**
 * @typedef {Object} AbortableFetch
 * @property {Promise<any>} fetch
 * @property {Function} abort
 */

/**
 * @typedef {Object} SearchClient
 * @property {Function} fetchByQuery
 * @property {Function} [loadMore]
 */

/**
 * @typedef {Object} SearchService
 * @property {Function} search
 */

/**
 * @typedef {Object} UrlGenerator
 * @property {Function} generateUrl
 */

/**
 * @typedef {Object} AbortableSearchFetch
 * @property {Promise<SearchResponse>} fetch
 * @property {Function} abort
 */
