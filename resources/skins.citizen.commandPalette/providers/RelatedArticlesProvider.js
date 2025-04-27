const { CommandPaletteItem, CommandPaletteProvider, CommandPaletteActionResult } = require( '../types.js' );
const { cdxIconArticle } = require( '../icons.json' );
const urlGeneratorFactory = require( '../utils/urlGenerator.js' );
const urlGenerator = urlGeneratorFactory();

// Cache variables
let cachedResults = null;
let fetchPromise = null;
let cachedArticleId = null;

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
		const currentArticleId = mw.config.get( 'wgArticleId' );

		// Return cached results if available and for the current article
		if ( cachedResults !== null && cachedArticleId === currentArticleId ) {
			return Promise.resolve( cachedResults );
		}

		// Return existing promise if a fetch is already in progress for the current article
		if ( fetchPromise !== null && cachedArticleId === currentArticleId ) {
			return fetchPromise;
		}

		// If cache is invalid or for a different article, reset (promise/results cleared below)
		if ( cachedArticleId !== currentArticleId ) {
			cachedResults = null;
			fetchPromise = null;
			// Let the new fetch proceed, cachedArticleId will be set
		}

		// Start a new fetch
		// Store the article ID for which the fetch is initiated
		cachedArticleId = currentArticleId;
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
						description: page.description || page.extract,
						type: 'page',
						url: urlGenerator.generateUrl( page ),
						thumbnail: page.thumbnail ? {
							url: page.thumbnail.source
						} : null,
						thumbnailIcon: cdxIconArticle,
						actions: []
					} ) );
					// Cache the results and the article ID on success
					cachedResults = results;
					// cachedArticleId is already set to currentArticleId
					fetchPromise = null; // Reset promise ref
					// Ensure source is added by the provider
					const resultsWithSource = Array.isArray( results ) ? results.map( ( item ) => ( { ...item, source: this.id } ) ) : [];
					cachedResults = resultsWithSource; // Update cache with source added
					resolve( resultsWithSource );
				} catch ( error ) {
					mw.log.error( '[skins.citizen.commandPalette] RelatedArticlesProvider: Error inside mw.loader success callback:', error );
					// Reset cache state fully on error
					cachedResults = null;
					fetchPromise = null;
					cachedArticleId = null;
					resolve( [] );
				}
			};

			const onFailure = () => {
				// This happens if the module is not installed, so we resolve with empty array
				// Reset cache state fully on failure
				cachedResults = null;
				fetchPromise = null;
				cachedArticleId = null;
				resolve( [] );
			};

			mw.loader.using( [ 'ext.relatedArticles.readMore' ], onSuccess, onFailure );
		} );

		return fetchPromise;
	},

	isAsync: true,
	debounceMs: 0, // Results can come from a local cache

	/**
	 * Handles the selection of a related article item.
	 * Default action is to navigate to the item's URL.
	 *
	 * @param {CommandPaletteItem} item The selected item.
	 * @return {CommandPaletteActionResult} Action result for the UI.
	 */
	async onResultSelect( item ) {
		// Default behavior for related articles is navigation
		if ( item.url ) {
			return { action: 'navigate', payload: item.url };
		}
		return { action: 'none' }; // Fallback if no URL
	}
};

module.exports = RelatedArticlesProvider;
