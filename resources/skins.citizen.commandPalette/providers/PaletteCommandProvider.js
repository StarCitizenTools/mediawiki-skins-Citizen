const createProvider = require( './createProvider.js' );
const isAbortError = require( '../utils/isAbortError.js' );

const MAX_COMMAND_RESULTS = 10;

/**
 * Handles a matched command trigger by delegating to its handler.
 *
 * @param {Object} paletteRegistry The palette registry service.
 * @param {Object} match The matched command { handler, trigger, id }.
 * @param {string} query The full query string.
 * @param {AbortSignal} [signal] Cancels the handler's own request.
 * @return {Promise<Object>} Provider result with items.
 */
async function getMatchedCommandResults( paletteRegistry, match, query, signal ) {
	const { handler, trigger, id } = match;
	if ( typeof handler.getResults !== 'function' ) {
		const listItems = paletteRegistry.getCommandListItems();
		const thisItem = listItems.find(
			( item ) => item.source === 'command:' + id
		);
		return { items: thisItem ? [ thisItem ] : [] };
	}

	const subQuery = query.slice( trigger.length ).trim();
	const actualSubQuery = subQuery.startsWith( ':' ) ?
		subQuery.slice( 1 ).trim() : subQuery;

	try {
		const results = await handler.getResults( actualSubQuery, signal );
		const processedResults = ( Array.isArray( results ) ? results : [] )
			.map( ( item ) => {
				if ( item.highlightQuery ) {
					return { ...item, highlightTerm: actualSubQuery };
				}
				return item;
			} )
			.map( ( item ) => ( { ...item, source: 'command:' + id } ) )
			.slice( 0, MAX_COMMAND_RESULTS );
		return { items: processedResults };
	} catch ( err ) {
		// A cancelled request is not a failure. Rethrowing lets the
		// orchestration's lifecycle swallow it, so an aborted keystroke
		// neither logs an error nor renders an empty list.
		if ( isAbortError( err ) ) {
			throw err;
		}
		mw.log.error(
			'[commandPalette] Command handler "' + id + '" failed:', err
		);
		return { items: [] };
	}
}

/**
 * Creates a command provider that delegates to a command registry.
 *
 * @param {Object} paletteRegistry The palette registry service.
 * @return {Object} A validated provider.
 */
function createPaletteCommandProvider( paletteRegistry ) {
	return createProvider( 'command', {
		canProvide( query ) {
			if ( query.startsWith( '/' ) ) {
				return true;
			}
			return paletteRegistry.hasMatchingTrigger( query );
		},

		async getResults( query, signal ) {
			// Case 1: Root "/" — show all commands
			if ( query === '/' ) {
				return {
					items: paletteRegistry.getCommandListItems()
						.slice( 0, MAX_COMMAND_RESULTS )
				};
			}

			// Case 2: Specific command trigger matched
			const match = paletteRegistry.findMatchingCommand( query );
			if ( match ) {
				return getMatchedCommandResults(
					paletteRegistry, match, query, signal
				);
			}

			// Case 3: Prefix search for "/"
			if ( query.startsWith( '/' ) ) {
				return {
					items: paletteRegistry.getCommandListItems( query )
						.slice( 0, MAX_COMMAND_RESULTS )
				};
			}

			return { items: [] };
		},

		onResultSelect: ( item ) => paletteRegistry.selectCommandListItem( item )
	}, { debounceMs: 0, keepStaleResults: true, readsTriggers: true } );
}

module.exports = createPaletteCommandProvider;
