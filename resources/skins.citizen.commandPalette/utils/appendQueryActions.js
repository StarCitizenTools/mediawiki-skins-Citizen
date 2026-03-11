const { cdxIconArticleSearch, cdxIconImageGallery, cdxIconEdit } = require( '../icons.json' );

/**
 * Creates a decorator function that appends query action items to search results.
 *
 * This replaces the former QueryActionProvider by converting its logic from a
 * provider into a pure result decorator. The returned function can be applied
 * to any items array to append contextual action items (fulltext search,
 * media search, page edit) based on the current query.
 *
 * @param {Object} config
 * @param {boolean} config.isMediaSearchExtensionEnabled Whether the MediaSearch extension is active.
 * @return {Function} A decorator function `(items, query) => decoratedItems`.
 */
function createAppendQueryActions( config ) {
	const isPageEditable = !!mw.config.get( 'wgRelevantPageIsProbablyEditable' );

	const queryActionDefinitions = [
		{
			id: 'fulltext-search',
			description: mw.message( 'citizen-command-palette-queryaction-fulltext-search-description' ).text(),
			icon: cdxIconArticleSearch,
			showItem: true,
			getUrl: ( query ) => mw.util.getUrl( 'Special:Search', { search: query } )
		},
		{
			id: 'media-search',
			description: mw.message( 'citizen-command-palette-queryaction-media-search-description' ).text(),
			icon: cdxIconImageGallery,
			showItem: config.isMediaSearchExtensionEnabled,
			getUrl: ( query ) => mw.util.getUrl( 'Special:MediaSearch', { search: query, type: 'image' } )
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
	 * Appends query action items to the given results array.
	 *
	 * @param {Array} items The existing result items.
	 * @param {string} query The current search query.
	 * @return {Array} A new array with action items appended after the original items.
	 */
	function appendQueryActions( items, query ) {
		if ( !query ) {
			return items;
		}

		const actionItems = [];
		queryActionDefinitions.forEach( ( def ) => {
			if ( def.showItem ) {
				actionItems.push( {
					id: `citizen-command-palette-item-${ def.id }`,
					type: 'action',
					label: query,
					description: def.description,
					url: def.getUrl( query ),
					thumbnailIcon: def.icon,
					actions: [],
					source: `queryAction:${ def.id }`
				} );
			}
		} );

		return [ ...items, ...actionItems ];
	}

	return appendQueryActions;
}

module.exports = createAppendQueryActions;
