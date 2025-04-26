const { CommandPaletteItem, CommandPaletteProvider } = require( '../types.js' );
const { cdxIconCode } = require( '../icons.json' );

// TODO: Make this configurable
const MAX_COMMAND_RESULTS = 10;

// Registry for slash command handlers
// TODO: Allow extensions to register their own commands
const commandRegistry = {
	ns: require( '../commands/namespace.js' ),
	action: require( '../commands/action.js' )
};

// Precompute a flat list of { trigger: string, cmdName: string } pairs for efficient prefix filtering.
const flatTriggerList = Object.entries( commandRegistry ).reduce( ( list, [ cmdName, handler ] ) => {
	const handlerTriggers = ( handler.triggers ?? [] ).map( ( trigger ) => ( { trigger, cmdName } ) );
	return list.concat( handlerTriggers );
}, [] ); // Initial value is an empty array

/**
 * Generates the list of command items based on the commandRegistry.
 *
 * @param {string} [filterPrefix] Optional prefix to filter command names.
 * @return {Array<CommandPaletteItem>}
 */
function getCommandListItems( filterPrefix ) {
	let entries;

	if ( filterPrefix ) {
		// Use the precomputed flat list for efficient filtering
		const lowerFilterPrefix = filterPrefix.toLowerCase();
		const filteredTriggers = flatTriggerList.filter( ( { trigger } ) => trigger.toLowerCase().startsWith( lowerFilterPrefix ) );
		// Get unique command names from the filtered triggers
		const uniqueCmdNames = [ ...new Set( filteredTriggers.map( ( { cmdName } ) => cmdName ) ) ];
		// Retrieve the full command entries based on the unique names
		entries = uniqueCmdNames.map( ( cmdName ) => [ cmdName, commandRegistry[ cmdName ] ] );
	} else {
		// No filter, get all entries
		entries = Object.entries( commandRegistry );
	}

	try {
		const mappedResults = entries.map( ( [ cmdName, handler ] ) => {
			let metadata = [];
			if ( handler.triggers?.length > 0 ) {
				metadata = handler.triggers.map( ( trigger, index ) => ( {
					label: trigger,
					highlightQuery: index === 0 // Highlight only the first trigger
				} ) );
			} else {
				// Fallback if no triggers are defined
				metadata.push( {
					label: `/${ cmdName }`,
					highlightQuery: true
				} );
			}

			const item = {
				id: `citizen-command-palette-item-command-${ cmdName }`,
				type: 'command',
				label: handler.label ?? cmdName,
				description: handler.description,
				thumbnailIcon: cdxIconCode,
				// Use the first trigger as the primary value, using optional chaining
				value: handler.triggers?.[ 0 ] ?? `/${ cmdName }`,
				metadata: metadata // Use the generated metadata array
			};
			return item;
		} );

		return mappedResults;
	} catch ( error ) {
		mw.log.error( '[CommandProvider|getCommandListItems] Error during mapping:', error );
		return []; // Return empty array in case of error
	}
}

/** @type {CommandPaletteProvider} */
module.exports = {
	/** Whether this provider returns results asynchronously */
	isAsync: true, // Although some commands might be sync, the handler resolution can be async
	/** Debounce time in milliseconds for async providers */
	debounceMs: 0, // Reverted: No debounce for commands for responsiveness

	/**
	 * Determines if this provider should handle the current query.
	 *
	 * @param {string} query The search query.
	 * @return {boolean}
	 */
	canProvide( query ) {
		// Handle if the query starts with '/' (for root query and prefix search)
		const startsWithSlash = query.startsWith( '/' );

		// Handle if the query starts with any registered trigger, using optional chaining
		const startsWithTrigger = Object.values( commandRegistry ).some( ( handler ) => handler.triggers?.some( ( trigger ) => query.startsWith( trigger ) ) );

		return startsWithSlash || startsWithTrigger;
	},

	/**
	 * Gets command suggestions or results, adapted to the CommandPaletteItem format.
	 *
	 * @param {string} query
	 * @return {Promise<Array<CommandPaletteItem>>}
	 */
	async getResults( query ) {
		let matchedHandler = null;
		let matchedTrigger = null;
		let commandName = null; // Keep track of the command name for filtering later

		// Find the handler and trigger that match the query start
		for ( const [ cmd, handler ] of Object.entries( commandRegistry ) ) {
			if ( !handler ) {
				mw.log.warn( `[[skins.citizen.commandPalette] Found null or undefined handler for command: ${ cmd }` );
				continue;
			}
			if ( handler.triggers ) {
				for ( const trigger of handler.triggers ) {
					if ( query.startsWith( trigger ) ) {
						// Prioritize longer matches (e.g., "/ns" over "/")
						if ( !matchedTrigger || trigger.length > matchedTrigger.length ) {
							matchedHandler = handler;
							matchedTrigger = trigger;
							commandName = cmd; // Store the command name associated with the handler
						}
					}
				}
			}
		}

		// Query Handling Logic
		// Case 1: Root query "/" - Show all available commands
		if ( query === '/' ) {
			const commandItems = getCommandListItems();
			if ( !Array.isArray( commandItems ) ) {
				mw.log.error( '[CommandProvider] getCommandListItems did not return an array for query "/"!' );
				return []; // Return empty array defensively
			}
			return commandItems.slice( 0, MAX_COMMAND_RESULTS );
		}

		// Case 2: A specific command trigger is fully matched (e.g., query starts with "/ns" or ":")
		if ( matchedHandler && matchedTrigger ) {
			// Extract the sub-query after the trigger
			const subQuery = query.slice( matchedTrigger.length ).trim();

			// Handle cases where the trigger might end with ':' (like /ns:) vs just /ns
			// Normalize subquery by removing leading colon if present
			const actualSubQuery = subQuery.startsWith( ':' ) ? subQuery.slice( 1 ).trim() : subQuery;

			if ( typeof matchedHandler.getResults !== 'function' ) {
				mw.log.error( `[CommandProvider] Command handler for "${ commandName }" (triggered by "${ matchedTrigger }") is missing required getResults function.` );
				return [];
			}

			try {
				// Pass the actual sub-query (part after trigger and potentially colon) to the handler
				const results = await matchedHandler.getResults( actualSubQuery );
				const processedResults = ( Array.isArray( results ) ? results : [] ).map( ( item ) => {
					if ( item.highlightQuery ) {
						return { ...item, highlightTerm: actualSubQuery };
					}
					return item;
				} );
				return processedResults.slice( 0, MAX_COMMAND_RESULTS );
			} catch ( err ) {
				mw.log.error( `[CommandProvider] Handler for "${ commandName }" (triggered by "${ matchedTrigger }") failed:`, err );
				return [];
			}
		}

		// Case 3: No specific trigger matched, but query starts with '/' (e.g., "/n" or "/unknown")
		// Perform prefix search on command triggers.
		if ( !matchedTrigger && query.startsWith( '/' ) ) {
			return getCommandListItems( query ).slice( 0, MAX_COMMAND_RESULTS ); // Filter commands by query prefix
		}

		// Case 4: Query doesn't match any command pattern - return empty array
		return [];
	}
};
