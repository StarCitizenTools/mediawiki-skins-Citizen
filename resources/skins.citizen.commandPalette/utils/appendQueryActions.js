const { cdxIconArticleSearch, cdxIconEdit } = require( '../icons.json' );

/**
 * Creates the query actions: rows that act on the typed query as a whole
 * rather than on one result (full-text search, page edit).
 *
 * @return {{leadActions: Function, trailActions: Function}}
 */
function createAppendQueryActions() {
	const isPageEditable = !!mw.config.get( 'wgRelevantPageIsProbablyEditable' );

	const queryActionDefinitions = [
		{
			id: 'fulltext-search',
			description: mw.message( 'citizen-command-palette-queryaction-fulltext-search-description' ).text(),
			icon: cdxIconArticleSearch,
			showItem: true,
			// Without `fulltext`, Special:Search does a near-match "go" and
			// redirects whenever the query is an exact title, so this row
			// would sometimes navigate rather than search. That page is
			// already listed as a result directly below.
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
	 * The action that restates the typed query as a search. It is derived
	 * synchronously from the query, so unlike fetched results it always
	 * matches what is currently in the input — which is what lets it be the
	 * one row Enter can commit to without waiting.
	 *
	 * @param {string} query The current search query.
	 * @return {Array} Lead action items.
	 */
	function leadActions( query ) {
		return buildActions( query, [ 'fulltext-search' ] );
	}

	/**
	 * Actions that belong after the results.
	 *
	 * @param {string} query The current search query.
	 * @return {Array} Trailing action items.
	 */
	function trailActions( query ) {
		return buildActions( query, [ 'page-edit' ] );
	}

	return { leadActions, trailActions };
}

module.exports = createAppendQueryActions;
