const createProvider = require( './createProvider.js' );
const { cdxIconArticle } = require( '../icons.json' );
const { getNavigationAction } = require( '../utils/providerActions.js' );

/**
 * Creates a related articles provider.
 *
 * @param {Object} loader The mw.loader object.
 * @return {Object} A validated provider.
 */
function createRelatedArticlesProvider( loader ) {
	let cachedResults = null;
	let fetchPromise = null;
	let cachedArticleId = null;

	return createProvider( 'related', {
		canProvide( query ) {
			return !query;
		},

		async getResults() {
			const currentArticleId = mw.config.get( 'wgArticleId' );

			if ( cachedResults !== null && cachedArticleId === currentArticleId ) {
				return { items: cachedResults };
			}

			if ( fetchPromise !== null && cachedArticleId === currentArticleId ) {
				return fetchPromise;
			}

			if ( cachedArticleId !== currentArticleId ) {
				cachedResults = null;
				fetchPromise = null;
			}

			cachedArticleId = currentArticleId;
			fetchPromise = new Promise( ( resolve ) => {
				const onSuccess = async ( require ) => {
					try {
						const gateway = require( 'ext.relatedArticles.readMore' ).test.relatedPages;
						const relatedPages = await gateway.getForCurrentPage( 3 );

						if ( relatedPages.length === 0 ) {
							resolve( { items: [] } );
							return;
						}

						const results = relatedPages.map( ( page ) => ( {
							id: page.pageid,
							label: page.title,
							description: page.description || page.extract,
							type: 'page',
							url: mw.util.getUrl( page.title ),
							thumbnail: page.thumbnail ? { url: page.thumbnail.source } : null,
							thumbnailIcon: cdxIconArticle,
							actions: [],
							source: 'related'
						} ) );

						cachedResults = results;
						fetchPromise = null;
						resolve( { items: results } );
					} catch ( error ) {
						mw.log.error( '[skins.citizen.commandPalette] RelatedArticlesProvider error:', error );
						cachedResults = null;
						fetchPromise = null;
						cachedArticleId = null;
						resolve( { items: [] } );
					}
				};

				const onFailure = () => {
					cachedResults = null;
					fetchPromise = null;
					cachedArticleId = null;
					resolve( { items: [] } );
				};

				loader.using( [ 'ext.relatedArticles.readMore' ], onSuccess, onFailure );
			} );

			return fetchPromise;
		},

		onResultSelect( item ) {
			return getNavigationAction( item );
		}
	}, { debounceMs: 0, keepStaleResults: false } );
}

module.exports = createRelatedArticlesProvider;
