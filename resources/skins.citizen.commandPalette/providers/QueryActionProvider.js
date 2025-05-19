const { CommandPaletteProvider, CommandPaletteItem, CommandPaletteActionResult } = require( '../types.js' );
const { cdxIconArticleSearch, cdxIconImageGallery, cdxIconEdit } = require( '../icons.json' );
const config = require( '../config.json' );
const { getNavigationAction } = require( '../utils/providerActions.js' );

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
		showItem: !!mw.config.get( 'wgRelevantPageIsProbablyEditable' ), // Guessing if the page is editable, because it's too expensive to do for every query
		getUrl: ( query ) => mw.util.getUrl( query, { action: 'edit' } )
	}
];

/** @type {CommandPaletteProvider} */
const QueryActionProvider = {
	id: 'queryAction',
	isAsync: false,
	debounceMs: 0,
	keepStaleResultsOnQueryChange: false,

	canProvide: ( query ) => !!query,

	getResults( query ) {
		const results = [];
		if ( !query ) {
			return results;
		}

		queryActionDefinitions.forEach( ( itemConfig ) => {
			if ( itemConfig.showItem ) {
				results.push( {
					id: `citizen-command-palette-item-${ itemConfig.id }`,
					type: 'action',
					label: query,
					description: itemConfig.description,
					url: itemConfig.getUrl( query ),
					thumbnailIcon: itemConfig.icon,
					actions: [],
					source: `${ this.id }:${ itemConfig.id }`
				} );
			}
		} );

		return results;
	},

	/**
	 * Handles the selection of a query action item.
	 *
	 * @param {CommandPaletteItem} item The selected item (which includes eventDetails if applicable).
	 * @return {Promise<CommandPaletteActionResult>} Action result for the UI.
	 */
	async onResultSelect( item ) {
		return getNavigationAction( item );
	}
};

module.exports = QueryActionProvider;
