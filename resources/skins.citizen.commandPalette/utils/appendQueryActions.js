const { cdxIconArticleSearch, cdxIconEdit, cdxIconSearch } = require( '../icons.json' );

/**
 * Creates the query actions: rows that act on the typed query as a whole
 * rather than on one result (go to the page, full-text search, page edit).
 *
 * @return {{queryActions: Function}}
 */
function createAppendQueryActions() {
	const isPageEditable = !!mw.config.get( 'wgRelevantPageIsProbablyEditable' );
	// Whether Special:Search sends a query that names an existing page straight
	// to it. Off when the wiki or the reader has turned that off.
	const goesToExactMatch = !!mw.user.options.get( 'search-match-redirect' );

	const queryActionDefinitions = [
		{
			id: 'go',
			description: mw.message( 'citizen-command-palette-queryaction-go-description' ).text(),
			icon: cdxIconSearch,
			showItem: goesToExactMatch,
			// Special:Search decides on the server whether the query names a
			// page, from the query alone, so this row leads to the same place
			// whether or not the results have arrived.
			getUrl: ( query ) => mw.util.getUrl( 'Special:Search', { search: query } )
		},
		{
			id: 'fulltext-search',
			description: mw.message( 'citizen-command-palette-queryaction-fulltext-search-description' ).text(),
			icon: cdxIconArticleSearch,
			showItem: true,
			// Without `fulltext`, Special:Search does a near-match "go" and
			// redirects whenever the query is an exact title, so this row
			// would sometimes navigate rather than search.
			getUrl: ( query ) => mw.util.getUrl(
				'Special:Search', { search: query, fulltext: 1 }
			)
		},
		{
			id: 'page-edit',
			description: mw.message( 'citizen-command-palette-queryaction-page-edit-description' ).text(),
			icon: cdxIconEdit,
			showItem: isPageEditable,
			getUrl: ( query ) => mw.util.getUrl( query, { action: 'edit' } )
		}
	];

	/**
	 * Builds the action rows whose ids appear in `ids`, preserving the order
	 * declared in `queryActionDefinitions`.
	 *
	 * @param {string} query The current search query.
	 * @param {string[]} ids Definition ids to include.
	 * @return {Array} Action items.
	 */
	function buildActions( query, ids ) {
		if ( !query ) {
			return [];
		}

		return queryActionDefinitions
			.filter( ( def ) => def.showItem && ids.includes( def.id ) )
			.map( ( def ) => ( {
				id: `citizen-command-palette-item-${ def.id }`,
				type: 'action',
				label: query,
				description: def.description,
				url: def.getUrl( query ),
				thumbnailIcon: def.icon,
				actions: [],
				source: `queryAction:${ def.id }`
			} ) );
	}

	/**
	 * The result that is the page the query names, if there is one.
	 *
	 * Results are compared by link: a result reached through a redirect links
	 * to the redirect, so this finds the page whether the query names it
	 * directly or through one of its redirects.
	 *
	 * @param {string} query The current search query.
	 * @param {Array} results Rows shown below the lead.
	 * @return {Object|undefined} The matching result.
	 */
	function findNamedPage( query, results ) {
		const title = mw.Title.newFromText( query );
		if ( !title ) {
			return undefined;
		}
		const url = mw.util.getUrl( title.getPrefixedText() );
		return results.find( ( item ) => item.url === url );
	}

	/**
	 * Splits the query actions into the row that leads the list and the rows
	 * that trail the results.
	 *
	 * The lead is derived synchronously from the query, so unlike fetched
	 * results it always matches what is currently in the input — which is
	 * what lets it be the one row Enter can commit to without waiting. When a
	 * result is the page the query names, the lead takes that result's place
	 * and presentation but keeps its own link, so Enter still goes where it
	 * would have gone before the results arrived. The lead then carries the
	 * result's id, which is how the caller knows not to repeat it.
	 *
	 * @param {string} query The current search query.
	 * @param {Object} [options]
	 * @param {boolean} [options.leads=false] Whether the query is a search, and so
	 *   gets a lead row. A query some other provider claimed only gets the trail.
	 * @param {Array} [options.results=[]] Rows shown below the lead.
	 * @return {{lead: Array, trail: Array}}
	 */
	function queryActions( query, { leads = false, results = [] } = {} ) {
		if ( !query ) {
			return { lead: [], trail: [] };
		}
		if ( !leads ) {
			return {
				lead: [],
				trail: buildActions( query, [ 'fulltext-search', 'page-edit' ] )
			};
		}

		const [ lead, ...trail ] = buildActions(
			query, [ 'go', 'fulltext-search', 'page-edit' ]
		);
		const namedPage = lead.source === 'queryAction:go' ?
			findNamedPage( query, results ) :
			undefined;
		return {
			lead: [ namedPage ? Object.assign( {}, namedPage, { url: lead.url } ) : lead ],
			trail
		};
	}

	return { queryActions };
}

module.exports = createAppendQueryActions;
