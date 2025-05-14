const { CommandPaletteProvider } = require( '../types.js' );
const urlGeneratorFactory = require( '../utils/urlGenerator.js' );
const { cdxIconArticleSearch } = require( '../icons.json' );

const urlGenerator = urlGeneratorFactory();

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

		results.push( {
			id: 'citizen-command-palette-item-fulltext-search',
			type: 'action',
			label: query,
			description: mw.message( 'citizen-command-palette-type-fulltext-search-description' ).text(),
			url: urlGenerator.generateUrl( 'Special:Search', { search: query } ),
			thumbnailIcon: cdxIconArticleSearch,
			actions: [],
			source: `${ this.id }:fulltext-search`
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
