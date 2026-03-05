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

// Result decorator
const createAppendQueryActions = require( './utils/appendQueryActions.js' );

/**
 * Initialize the command palette
 *
 * @return {void}
 */
function initApp() {
	const teleportTarget = require( 'mediawiki.page.ready' ).teleportTarget;

	// We can't mount directly to the teleportTarget or it will break OOUI overlays
	const overlay = document.createElement( 'div' );
	overlay.classList.add( 'citizen-command-palette-overlay' );
	teleportTarget.appendChild( overlay );

	// 1. Create services
	const recentItemsService = createRecentItems();
	const searchClient = createRestSearchClient( mw.config.get( 'wgScriptPath' ) );
	const paletteRegistry = createPaletteRegistry();

	// 2. Register built-in modes
	paletteRegistry.register( namespaceMode );
	paletteRegistry.register( createActionMode( document, mw.Api ) );
	paletteRegistry.register( createUserMode( mw.Api ) );

	// 3. Fire hook for extension commands
	const hookData = { register: paletteRegistry.register };
	mw.hook( 'citizen.commandPalette.register' ).fire( hookData );

	// Backward-compat: fire old hook with deprecation notice
	mw.hook( 'skins.citizen.commandPalette.registerCommand' ).fire( {
		registerCommand: function ( command ) {
			mw.log.warn(
				'[Citizen] The "skins.citizen.commandPalette.registerCommand" hook is deprecated. ' +
				'Use "citizen.commandPalette.register" instead.'
			);
			paletteRegistry.register( command );
		}
	} );

	// Conditionally load extension-specific modes
	if ( config.isSemanticMediaWikiEnabled ) {
		mw.loader.using( 'skins.citizen.commandPalette.smw' ).then( ( req ) => {
			const smwMode = req( 'skins.citizen.commandPalette.smw' );
			paletteRegistry.register( smwMode );
		} ).catch( ( e ) => {
			mw.log.error( '[commandPalette] Failed to load SMW mode:', e );
		} );
	}

	// 4. Create providers
	const recentItemsProvider = createRecentItemsProvider( recentItemsService );
	const relatedArticlesProvider = createRelatedArticlesProvider( mw.loader );
	const providers = [
		createPaletteCommandProvider( paletteRegistry ),
		createSearchProvider( searchClient )
	];

	// 5. Create result decorator
	const appendQueryActions = createAppendQueryActions( config );

	// 6. Mount Vue app with provide
	const app = Vue.createMwApp( App, {}, config );
	app.provide( 'providers', providers );
	app.provide( 'recentItemsService', recentItemsService );
	app.provide( 'resultDecorator', appendQueryActions );
	app.provide( 'recentItemsProvider', recentItemsProvider );
	app.provide( 'relatedArticlesProvider', relatedArticlesProvider );
	app.provide( 'findModeByTrigger', paletteRegistry.findModeByTrigger );
	app.provide( 'findModeByQuery', paletteRegistry.findModeByQuery );
	app.provide( 'getTokenPatterns', paletteRegistry.getTokenPatterns );

	const commandPalette = app.mount( overlay );

	// 7. Wire up trigger button
	setupTrigger( commandPalette );
}

/**
 * Setup the button to open the command palette
 *
 * @param {Object} commandPalette The mounted Vue app instance.
 * @return {void}
 */
function setupTrigger( commandPalette ) {
	const details = document.getElementById( 'citizen-search-details' );
	if ( !details ) {
		return;
	}

	// Remove the search card from the DOM so it won't be triggered by the button
	document.getElementById( 'citizen-search__card' )?.remove();

	// Remove aria-details since citizen-search__card no longer exists
	document.getElementById( 'citizen-search-summary' )?.removeAttribute( 'aria-details' );

	details.open = false;
	details.addEventListener( 'click', () => {
		commandPalette.open();
	} );
}

initApp();
