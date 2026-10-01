/**
 * REST API search client service.
 *
 * Factory function that creates a search client for the MediaWiki REST API.
 * Replaces the former MwRestSearchClient class and SearchClientFactory registry.
 *
 * @module searchClient
 */

const { cdxIconArticle, cdxIconArticleRedirect, cdxIconEdit } = require( '../icons.json' );
const resolveSpecialPage = require( '../utils/resolveSpecialPage.js' );

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
 * Whether showing the redirect a result was matched through tells the reader
 * anything the page title has not already told them.
 *
 * A redirect is usually one of two shapes: an alias that looks nothing like its
 * target ("NYC" for "New York City"), or a longer variant of it ("'One Meal'
 * Nutrition Bar (Grilled Steak)"). Only the first is worth the row's space —
 * the second restates the title with an affix and pushes the title itself out
 * of a narrow row.
 *
 * Spaces and dashes are stripped before comparing so that punctuation variants
 * of the same title count as a restatement.
 *
 * @param {string} title The page the result leads to
 * @param {string} matchedTitle The redirect the query matched
 * @return {boolean}
 */
function isRedirectUseful( title, matchedTitle ) {
	const cleanup = ( text ) => text.toLowerCase().replace( /-|\s/g, '' );
	const cleanTitle = cleanup( title );
	const cleanMatchedTitle = cleanup( matchedTitle );

	return !( cleanTitle.includes( cleanMatchedTitle ) ||
		cleanMatchedTitle.includes( cleanTitle ) );
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
	 * The actions offered on a result row.
	 *
	 * The REST handler reports a page id of 0 for any title that cannot be a
	 * real page — a virtual namespace such as `Special:` or `Media:`, or an
	 * interwiki target. Such a title holds no wikitext, so `action=edit` is
	 * ignored and merely renders the page.
	 *
	 * @param {RestResult} page
	 * @return {import('../types.js').CommandPaletteItemAction[]}
	 */
	function buildActions( page ) {
		if ( !page.id ) {
			return [];
		}

		return [
			{
				id: 'edit',
				label: editMessage,
				icon: cdxIconEdit,
				url: mw.util.getUrl( page.title, { action: 'edit' } )
			}
		];
	}

	/**
	 * Adapt the REST API response to CommandPaletteSearchResponse format.
	 *
	 * @param {string} query Original (unprocessed) query for highlight matching
	 * @param {RestResponse} response
	 * @param {boolean} showDescription
	 * @return {import('../types.js').CommandPaletteSearchResponse}
	 */
	function adaptApiResponse( query, response, showDescription ) {
		const results = [];
		const ids = new Set();
		for ( const page of response.pages ) {
			// A special page comes back under whichever of its names matched
			// the query, not the local name the wiki opens it under. It is
			// shown under the local name, matched through the other as a
			// redirect is, so two of its names matching make one result.
			const parsed = mw.Title.newFromText( page.title );
			const special = parsed && resolveSpecialPage( parsed );
			const title = special ? special.title.getPrefixedText() : page.title;
			const id = `citizen-command-palette-item-page-${ special ? special.title.getPrefixedDb() : page.key }`;
			if ( ids.has( id ) ) {
				continue;
			}
			ids.add( id );

			const thumbnail = page.thumbnail;
			// Bound to a local so the null check narrows for the metadata
			// label below; `showRedirect` alone is just a boolean.
			const matchedTitle = page.matched_title ?? ( title !== page.title ? page.title : null );
			const showRedirect = !!matchedTitle &&
				isRedirectUseful( title, matchedTitle );
			results.push( {
				id,
				type: 'page',
				label: title,
				description: showDescription ? page.description : undefined,
				url: mw.util.getUrl( page.matched_title ?? title ),
				thumbnail: thumbnail ? {
					url: thumbnail.url,
					width: thumbnail.width ?? undefined,
					height: thumbnail.height ?? undefined
				} : undefined,
				thumbnailIcon: cdxIconArticle,
				metadata: showRedirect && matchedTitle ? [
					{
						icon: cdxIconArticleRedirect,
						label: matchedTitle,
						highlightQuery: true
					}
				] : undefined,
				actions: buildActions( page ),
				highlightQuery: true
			} );
		}
		return { query, results };
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
