const Vue = require( 'vue' );
const App = require( './components/App.vue' );
const config = require( './config.json' );

// Services
const createRecentItems = require( './services/recentItems.js' );
const createRestSearchClient = require( './services/searchClient.js' );
const createPaletteRegistry = require( './services/paletteRegistry.js' );

// Provider factories
const createSearchProvider = require( './providers/SearchProvider.js' );
const createPaletteCommandProvider = require( './providers/PaletteCommandProvider.js' );
const createRecentItemsProvider = require( './providers/RecentItemsProvider.js' );
const createRelatedArticlesProvider = require( './providers/RelatedArticlesProvider.js' );

// Modes
const namespaceMode = require( './modes/namespace.js' );
const createActionMode = require( './modes/action.js' );
const createUserMode = require( './modes/user.js' );
const createCategoryMode = require( './modes/category.js' );
const createHistoryMode = require( './modes/history.js' );
const createFileMode = require( './modes/file.js' );
const helpMode = require( './modes/help.js' );

// Result decorator
const createAppendQueryActions = require( './utils/appendQueryActions.js' );

/**
 * Mount the command palette into the provided overlay element.
 *
 * Caller (commandPalette.js) owns the trigger lifecycle: this function
 * only mounts. Opening is the caller's responsibility — calling
 * `open()` after mount lets Vue's standard enter transition play, so
 * the first trigger on every fresh page gets a real open animation
 * rather than a snap-in.
 *
 * @param {HTMLElement} overlayEl
 * @param {Object} [options]
 * @param {Function} [options.onClose] Called when the palette is dismissed from inside (Esc, backdrop).
 * @return {Object} mounted palette instance with `open(prefill?)` and `close()`
 */
function initApp( overlayEl, options ) {
	const opts = options || {};

	const recentItemsService = createRecentItems();
	const searchClient = createRestSearchClient( mw.config.get( 'wgScriptPath' ) );
	const paletteRegistry = createPaletteRegistry();

	paletteRegistry.register( namespaceMode );
	paletteRegistry.register( createActionMode( document, mw.Api ) );
	paletteRegistry.register( createUserMode( mw.Api ) );
	paletteRegistry.register( createCategoryMode( mw.Api ) );
	paletteRegistry.register( createHistoryMode( mw.Api ) );
	paletteRegistry.register( createFileMode( mw.Api ) );
	paletteRegistry.register( helpMode );

	const hookData = { register: paletteRegistry.register };
	mw.hook( 'citizen.commandPalette.register' ).fire( hookData );

	mw.hook( 'skins.citizen.commandPalette.registerCommand' ).fire( {
		registerCommand: function ( command ) {
			mw.log.warn(
				'[Citizen] The "skins.citizen.commandPalette.registerCommand" hook is deprecated. ' +
				'Use "citizen.commandPalette.register" instead.'
			);
			paletteRegistry.register( command );
		}
	} );

	if ( config.isSemanticMediaWikiEnabled ) {
		mw.loader.using( 'skins.citizen.commandPalette.smw' ).then( ( req ) => {
			const smwMode = req( 'skins.citizen.commandPalette.smw' );
			paletteRegistry.register( smwMode );
		} ).catch( ( e ) => {
			mw.log.error( '[commandPalette] Failed to load SMW mode:', e );
		} );
	}

	const recentItemsProvider = createRecentItemsProvider( recentItemsService );
	const relatedArticlesProvider = createRelatedArticlesProvider( mw.loader );
	const providers = [
		createPaletteCommandProvider( paletteRegistry ),
		createSearchProvider( searchClient )
	];

	const appendQueryActions = createAppendQueryActions( config );

	const app = Vue.createMwApp( App, {}, config );
	app.provide( 'providers', providers );
	app.provide( 'recentItemsService', recentItemsService );
	app.provide( 'resultDecorator', appendQueryActions );
	app.provide( 'recentItemsProvider', recentItemsProvider );
	app.provide( 'relatedArticlesProvider', relatedArticlesProvider );
	app.provide( 'findModeByTrigger', paletteRegistry.findModeByTrigger );
	app.provide( 'findModeByQuery', paletteRegistry.findModeByQuery );
	app.provide( 'getTokenPatterns', paletteRegistry.getTokenPatterns );
	app.provide( 'getHandler', paletteRegistry.getHandler );
	app.provide( 'getHelpCatalogItems', () => paletteRegistry.getCommandListItems()
		.filter( ( item ) => item.source !== 'command:help' ) );
	// Called from App.vue's close() so the orchestrator can hide its
	// overlay wrapper and reset the trigger's `<details>` open state when
	// the palette is dismissed from inside (Esc, backdrop click). Falls
	// back to just hiding the wrapper if no callback was supplied.
	const externalClose = ( typeof opts.onClose === 'function' ) ?
		opts.onClose :
		() => {
			overlayEl.hidden = true;
		};
	app.provide( 'paletteExternalClose', externalClose );

	return app.mount( overlayEl );
}

module.exports = { initApp };
