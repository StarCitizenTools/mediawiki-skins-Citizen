const createProvider = require( './createProvider.js' );

const MAX_COMMAND_RESULTS = 10;

/**
 * Handles a matched command trigger by delegating to its handler.
 *
 * @param {Object} paletteRegistry The palette registry service.
 * @param {Object} match The matched command { handler, trigger, id }.
 * @param {string} query The full query string.
 * @return {Promise<Object>} Provider result with items.
 */
async function getMatchedCommandResults( paletteRegistry, match, query ) {
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
		const results = await handler.getResults( actualSubQuery );
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

		async getResults( query ) {
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
				return getMatchedCommandResults( paletteRegistry, match, query );
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

		async onResultSelect( item ) {
			const sourceParts = item.source?.split( ':' );
			if ( sourceParts?.[ 0 ] !== 'command' || sourceParts.length < 2 ) {
				return { action: 'none' };
			}

			const handlerId = sourceParts[ 1 ];
			const handler = paletteRegistry.getHandler( handlerId );

			if ( !handler ) {
				return { action: 'none' };
			}

			try {
				// Commands with getResults expand the query on select
				if ( item.type === 'command' &&
					typeof handler.getResults === 'function' ) {
					return { action: 'exitWithQuery', payload: item.value };
				}

				if ( typeof handler.onResultSelect === 'function' ) {
					return handler.onResultSelect( item );
				}
				return { action: 'none' };
			} catch ( err ) {
				mw.log.error(
					'[commandPalette] Selection handler "' + handlerId + '" failed:', err
				);
				return { action: 'none' };
			}
		}
	}, { debounceMs: 0, keepStaleResults: true } );
}

module.exports = createPaletteCommandProvider;
