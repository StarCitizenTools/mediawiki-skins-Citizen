const { CommandPaletteProvider } = require( '../types.js' );
const urlGeneratorFactory = require( '../utils/urlGenerator.js' );
const { cdxIconArticleSearch, cdxIconImageGallery } = require( '../icons.json' );
const config = require( '../config.json' );

const urlGenerator = urlGeneratorFactory();

const queryActionDefinitions = [
	{
		id: 'fulltext-search',
		description: mw.message( 'citizen-command-palette-queryaction-fulltext-search-description' ).text(),
		icon: cdxIconArticleSearch,
		showItem: true,
		getUrl: ( query ) => urlGenerator.generateUrl( 'Special:Search', { search: query } )
	},
	{
		id: 'media-search',
		description: mw.message( 'citizen-command-palette-queryaction-media-search-description' ).text(),
		icon: cdxIconImageGallery,
		showItem: config.isMediaSearchExtensionEnabled,
		getUrl: ( query ) => urlGenerator.generateUrl( 'Special:MediaSearch', { search: query } )
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

	async onResultSelect( item ) {
		if ( item.url ) {
			return { action: 'navigate', payload: item.url };
		}
		return { action: 'none' };
	}
};

module.exports = QueryActionProvider;
