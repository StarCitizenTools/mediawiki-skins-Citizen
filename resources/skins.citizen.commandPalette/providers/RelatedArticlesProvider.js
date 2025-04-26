const { CommandPaletteItem, CommandPaletteProvider } = require( '../types.js' );
const { cdxIconArticle } = require( '../icons.json' );
const urlGeneratorFactory = require( '../utils/urlGenerator.js' );
const urlGenerator = urlGeneratorFactory();

// Cache variables
let cachedResults = null;
let fetchPromise = null;

/**
 * Placeholder provider for related articles shown when the query is empty.
 *
 * @implements {CommandPaletteProvider}
 */
const RelatedArticlesProvider = {
	id: 'related',
	// Assuming this message key will be added to i18n/en.json etc.
	label: mw.message( 'citizen-command-palette-heading-related' ).text(),

	/**
	 * Determines if this provider can supply results for the given query.
	 * Only provides results when the query is empty.
	 *
	 * @param {string} query The search query.
	 * @return {boolean}
	 */
	canProvide( query ) {
		return !query;
	},

	/**
	 * Gets the placeholder related article results.
	 *
	 * @param {string} query The search query (unused here).
	 * @return {Array<CommandPaletteItem>}
	 */
	getResults() {
		// Return cached results if available
		if ( cachedResults !== null ) {
			return Promise.resolve( cachedResults );
		}

		// Return existing promise if a fetch is already in progress
		if ( fetchPromise !== null ) {
			return fetchPromise;
		}

		// Start a new fetch
		fetchPromise = new Promise( ( resolve ) => {
			const onSuccess = async ( require ) => {
				try {
					const gateway = require( 'ext.relatedArticles.readMore' ).test.relatedPages;
					const relatedPages = await gateway.getForCurrentPage( 3 );

					if ( relatedPages.length === 0 ) {
						resolve( [] );
						return;
					}

					const results = relatedPages.map( ( page ) => ( {
						id: page.pageid,
						label: page.title,
						description: page.extract,
						type: 'page',
						url: urlGenerator.generateUrl( page.pageid ),
						thumbnail: page.thumbnail ? {
							url: page.thumbnail.source
						} : null,
						thumbnailIcon: cdxIconArticle,
						actions: []
					} ) );
					// Cache the results on success
					cachedResults = results;
					fetchPromise = null; // Reset promise ref
					resolve( results );
				} catch ( error ) {
					mw.log.error( '[skins.citizen.commandPalette] RelatedArticlesProvider: Error inside mw.loader success callback:', error );
					fetchPromise = null; // Reset promise ref on error
					resolve( [] );
				}
			};

			const onFailure = () => {
				// This happens if the module is not installed, so we resolve with empty array
				fetchPromise = null; // Reset promise ref on failure
				resolve( [] );
			};

			mw.loader.using( [ 'ext.relatedArticles.readMore' ], onSuccess, onFailure );
		} );

		return fetchPromise;
	},

	// This provider is now asynchronous
	isAsync: true,

	debounceMs: 0
};

module.exports = RelatedArticlesProvider;
