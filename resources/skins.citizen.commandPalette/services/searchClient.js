/**
 * REST API search client service.
 *
 * Factory function that creates a search client for the MediaWiki REST API.
 * Replaces the former MwRestSearchClient class and SearchClientFactory registry.
 *
 * @module searchClient
 */

const { cdxIconArticle, cdxIconArticleRedirect, cdxIconEdit } = require( '../icons.json' );

/**
 * @typedef {Object} RestResponse
 * @property {RestResult[]} pages
 */

/**
 * @typedef {Object} RestResult
 * @property {number} id
 * @property {string} key
 * @property {string} title
 * @property {string|null} matched_title
 * @property {string} [description]
 * @property {RestThumbnail|null} [thumbnail]
 */

/**
 * @typedef {Object} RestThumbnail
 * @property {string} url
 * @property {number|null} [width]
 * @property {number|null} [height]
 */

/**
 * Process a raw query into a search term.
 *
 * - Template syntax: `{{Template}}` or `{{Template` -> `Template:Template`
 * - Wikilink syntax: `[[Article]]` or `[[Article` -> `Article`
 * - Plain text: returned unchanged
 *
 * @param {string} query
 * @return {string}
 */
function processQuery( query ) {
	const templateMatch = /^{{(.*?)(}})?$/.exec( query );
	if ( templateMatch ) {
		return `Template:${ templateMatch[ 1 ] }`;
	}

	const wikilinkMatch = /^\[\[(.*?)(]]?)?$/.exec( query );
	if ( wikilinkMatch ) {
		return wikilinkMatch[ 1 ];
	}

	return query;
}

/**
 * Create a REST search client bound to the given script path.
 *
 * @param {string} scriptPath Value of wgScriptPath (e.g. "" or "/w")
 * @return {{ fetchByQuery: Function, processQuery: Function }}
 */
function createRestSearchClient( scriptPath ) {
	const searchApiUrl = scriptPath + '/rest.php';
	const editMessage = mw.msg( 'action-edit' );

	/**
	 * Adapt the REST API response to CommandPaletteSearchResponse format.
	 *
	 * @param {string} query Original (unprocessed) query for highlight matching
	 * @param {RestResponse} response
	 * @param {boolean} showDescription
	 * @return {import('../types.js').CommandPaletteSearchResponse}
	 */
	function adaptApiResponse( query, response, showDescription ) {
		return {
			query,
			results: response.pages.map( ( page ) => {
				const thumbnail = page.thumbnail;
				return {
					id: `citizen-command-palette-item-page-${ page.key }`,
					type: 'page',
					label: page.title,
					description: showDescription ? page.description : undefined,
					url: mw.util.getUrl( page.matched_title ?? page.title ),
					thumbnail: thumbnail ? {
						url: thumbnail.url,
						width: thumbnail.width ?? undefined,
						height: thumbnail.height ?? undefined
					} : undefined,
					thumbnailIcon: cdxIconArticle,
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
							type: 'navigate',
							label: editMessage,
							icon: cdxIconEdit,
							url: mw.util.getUrl( page.title, { action: 'edit' } )
						}
					],
					highlightQuery: true
				};
			} )
		};
	}

	/**
	 * Fetch search results for the given query.
	 *
	 * @param {string} query Raw user query (template/wikilink syntax is processed internally)
	 * @param {number} limit Maximum number of results
	 * @param {AbortSignal} [signal] Optional abort signal owned by the caller
	 * @param {boolean} [showDescription=true] Whether to include descriptions
	 * @return {Promise<import('../types.js').CommandPaletteSearchResponse>}
	 */
	async function fetchByQuery( query, limit, signal, showDescription = true ) {
		const effectiveLimit = limit || 10;
		const processed = processQuery( query );
		const params = new URLSearchParams( {
			q: processed,
			limit: effectiveLimit.toString()
		} );
		const url = `${ searchApiUrl }/v1/search/title?${ params.toString() }`;

		const response = await fetch( url, {
			headers: { accept: 'application/json' },
			signal
		} );

		if ( !response.ok ) {
			throw new Error( 'Network request failed with HTTP code ' + response.status );
		}

		const data = await response.json();
		return adaptApiResponse( query, data, showDescription );
	}

	return {
		processQuery,
		fetchByQuery
	};
}

module.exports = createRestSearchClient;
