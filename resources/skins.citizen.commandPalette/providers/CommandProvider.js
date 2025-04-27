const { CommandPaletteItem, CommandPaletteProvider, CommandPaletteCommand, CommandPaletteActionResult } = require( '../types.js' );
const { cdxIconCode } = require( '../icons.json' );

// TODO: Make this configurable
/** @constant {number} */
const MAX_COMMAND_RESULTS = 10;

// Registry for slash command handlers
/** @type {Map<string, CommandPaletteCommand>} */
const commandRegistry = new Map(); // Initialize empty, will be populated below

// Define and load built-in commands
const builtInCommands = {
	namespace: require( '../commands/namespace.js' ),
	action: require( '../commands/action.js' )
};

/** @type {Array<{trigger: string, id: string, lowerTrigger: string}>} */
let flatTriggerList = [];

/**
 * Recomputes the flat trigger list from the commandRegistry.
 * This optimizes prefix searching by creating a single list of all triggers,
 * including their lowercase versions.
 * Should be called after registering or unregistering commands.
 *
 * @modifies {flatTriggerList}
 */
function updateFlatTriggerList() {
	// Use flatMap as requested for conciseness
	flatTriggerList = Array.from( commandRegistry.entries() ).flatMap(
		( [ id, handler ] ) => ( handler?.triggers ?? [] ).map(
			( trigger ) => ( { trigger, id, lowerTrigger: trigger.toLowerCase() } )
		)
	);
}

/**
 * Registers a new command handler.
 *
 * @param {CommandPaletteCommand} handler The command handler object (must include an 'id' property)
 * @return {boolean} True if registration was successful, false otherwise.
 */
function registerCommand( handler ) {
	if ( typeof handler !== 'object' || handler === null ) {
		mw.log.warn( '[skins.citizen.commandPalette|CommandProvider] Invalid handler provided for registration: not an object.' );
		return false;
	}
	const commandId = handler.id;
	if ( !commandId || typeof commandId !== 'string' || commandId.trim() === '' ) {
		mw.log.warn( `[skins.citizen.commandPalette|CommandProvider] Invalid or missing command ID in handler: ${ commandId }` );
		return false;
	}

	if ( commandRegistry.has( commandId ) ) {
		mw.log.warn( `[skins.citizen.commandPalette|CommandProvider] Command "${ commandId }" is already registered. Overwriting.` );
	}

	commandRegistry.set( commandId, handler );

	// Update the flat list whenever a command is successfully registered
	// We have to update flatTriggerList immediately after registration rather than
	// relying on the hook callback timing, as mw.hook() might delay execution,
	// causing race conditions with subsequent lookups
	updateFlatTriggerList();

	return true;
}

/**
 * Generates the list of command items based on the commandRegistry.
 *
 * @param {string} [filterPrefix] Optional prefix to filter command triggers.
 * @return {Array<CommandPaletteItem>}
 */
function getCommandListItems( filterPrefix ) {
	let entries;

	if ( filterPrefix ) {
		// Use the precomputed flat list and its lowercase triggers for efficient filtering
		const filteredTriggers = flatTriggerList.filter( ( { lowerTrigger } ) => lowerTrigger.startsWith( filterPrefix.toLowerCase() ) );
		// Get unique command IDs from the filtered triggers
		const uniqueIds = [ ...new Set( filteredTriggers.map( ( { id } ) => id ) ) ];
		// Retrieve the full command entries based on the unique IDs
		entries = uniqueIds.map( ( id ) => [ id, commandRegistry.get( id ) ] ).filter( ( entry ) => entry[ 1 ] ); // Filter out potential undefined handlers
	} else {
		// No filter, get all entries
		entries = Array.from( commandRegistry.entries() );
	}

	try {
		const mappedResults = entries.map( ( [ id, handler ] ) => {
			let metadata = [];
			if ( handler.triggers?.length > 0 ) {
				metadata = handler.triggers.map( ( trigger, index ) => ( {
					label: trigger,
					highlightQuery: index === 0 // Highlight only the first trigger
				} ) );
			} else {
				// Fallback if no triggers are defined
				metadata.push( {
					label: `/${ id }`,
					highlightQuery: true
				} );
			}

			const item = {
				id: `citizen-command-palette-item-command-${ id }`,
				type: 'command',
				label: handler.label ?? id,
				description: handler.description,
				thumbnailIcon: cdxIconCode,
				value: handler.triggers?.[ 0 ] ?? `/${ id }`,
				metadata: metadata,
				source: `command:${ id }`
			};
			return item;
		} );

		return mappedResults;
	} catch ( error ) {
		mw.log.error( '[skins.citizen.commandPalette|CommandProvider|getCommandListItems] Error during mapping:', error );
		return []; // Return empty array in case of error
	}
}

// Register built-in commands
Object.values( builtInCommands ).forEach( registerCommand );

// Fire hook to allow extensions to register commands
// Pass the registration function as data
mw.hook( 'skins.citizen.commandPalette.registerCommand' ).fire( { registerCommand } );

/** @type {CommandPaletteProvider} */
module.exports = {
	id: 'command',
	isAsync: true, // Although some commands might be sync, the handler resolution can be async
	debounceMs: 0,

	/**
	 * Determines if this provider should handle the current query.
	 *
	 * @param {string} query The search query.
	 * @return {boolean}
	 */
	canProvide( query ) {
		// Handle if the query starts with '/' (for root query and prefix search)
		const startsWithSlash = query.startsWith( '/' );

		// Handle if the query starts with any registered trigger
		// Use the precomputed flat list and lowercase query for efficiency
		const startsWithTrigger = flatTriggerList.some( ( { lowerTrigger } ) => query.toLowerCase().startsWith( lowerTrigger ) );

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
		let commandId = null; // Store the matched command ID

		// Find the handler and trigger that match the query start using the flatTriggerList and lowerQuery
		const matchingTriggers = flatTriggerList.filter( ( { lowerTrigger } ) => query.toLowerCase().startsWith( lowerTrigger ) );

		if ( matchingTriggers.length > 0 ) {
			// Sort by trigger length descending to find the longest match
			matchingTriggers.sort( ( a, b ) => b.trigger.length - a.trigger.length );
			const bestMatch = matchingTriggers[ 0 ];
			matchedTrigger = bestMatch.trigger;
			commandId = bestMatch.id;
			matchedHandler = commandRegistry.get( commandId ); // Get the handler from the map

			// Basic check if handler was found (it should be, given flatTriggerList is derived from it)
			if ( !matchedHandler ) {
				mw.log.warn( `[skins.citizen.commandPalette|CommandProvider] Handler for command "${ commandId }" (matched via trigger "${ matchedTrigger }") not found in registry. This indicates an inconsistency.` );
				// Reset matched state if handler is unexpectedly missing
				matchedHandler = null;
				matchedTrigger = null;
				commandId = null;
			}
		}

		// Query Handling Logic - remains the same, but uses the matchedHandler/matchedTrigger found above
		// Case 1: Root query "/" - Show all available commands
		if ( query === '/' ) {
			const commandItems = getCommandListItems(); // Get all command items
			if ( !Array.isArray( commandItems ) ) {
				mw.log.error( '[skins.citizen.commandPalette|CommandProvider] getCommandListItems did not return an array for query "/"!' );
				return []; // Return empty array defensively
			}
			return commandItems.slice( 0, MAX_COMMAND_RESULTS );
		}

		// Case 2: A specific command trigger is fully matched (e.g., query starts with "/ns" or ":")
		if ( matchedHandler && matchedTrigger ) {
			// Subquery commands
			if ( typeof matchedHandler.getResults === 'function' ) {
				// It's a sub-query command, process the sub-query
				const subQuery = query.slice( matchedTrigger.length ).trim();
				const actualSubQuery = subQuery.startsWith( ':' ) ? subQuery.slice( 1 ).trim() : subQuery;

				try {
					// Pass the actual sub-query to the handler
					const results = await matchedHandler.getResults( actualSubQuery );
					const processedResults = ( Array.isArray( results ) ? results : [] ).map( ( item ) => {
						if ( item.highlightQuery ) {
							return { ...item, highlightTerm: actualSubQuery };
						}
						return item;
					} );

					// Tag results with the structured source: provider:handlerId
					return processedResults.map( ( item ) => ( {
						...item,
						source: `command:${ commandId }` // Structured source
					} ) ).slice( 0, MAX_COMMAND_RESULTS );
				} catch ( err ) {
					mw.log.error( `[skins.citizen.commandPalette|CommandProvider] Handler getResults for "${ commandId }" failed:`, err );
					return [];
				}
			// Simple commands
			} else {
				const thisCommandItem = getCommandListItems().find( ( item ) => item.source === `command:${ commandId }` );
				return thisCommandItem ? [ thisCommandItem ] : [];
			}
		}

		// Case 3: No specific trigger matched, but query starts with '/' (e.g., "/n" or "/unknown")
		if ( !matchedTrigger && query.startsWith( '/' ) ) {
			return getCommandListItems( query ).slice( 0, MAX_COMMAND_RESULTS ); // Filter commands by original query prefix
		}

		// Case 4: Query doesn't match any command pattern - return empty array
		return [];
	},

	/**
	 * Handles the selection of an item provided by this command provider.
	 * Finds the responsible handler based on item.source and delegates.
	 *
	 * @param {CommandPaletteItem} item The selected item.
	 * @return {CommandPaletteActionResult} Action result for the UI.
	 */
	async onResultSelect( item ) {
		// Extract handler ID from structured source (e.g., 'command:namespace')
		const sourceParts = item.source?.split( ':' );
		if ( sourceParts?.[ 0 ] !== 'command' || sourceParts.length < 2 ) {
			mw.log.warn( `[skins.citizen.commandPalette|CommandProvider] Invalid source format for item: ${ item.source }` );
			return { action: 'none' };
		}

		const handlerId = sourceParts[ 1 ];
		const handler = commandRegistry.get( handlerId );

		if ( !handler ) {
			mw.log.warn( `[skins.citizen.commandPalette|CommandProvider] Could not find handler for source "${ item.source }". Item:`, item );
			return { action: 'none' };
		}

		try {
			// Delegate based on item type: command item vs result item
			if ( item.type === 'command' ) {
				// Check if it's a command that expects a sub-query
				if ( typeof handler.getResults === 'function' ) {
					return { action: 'updateQuery', payload: item.value };
				// It's a simple command (no getResults), delegate to its specific handler if defined
				} else if ( typeof handler.onCommandSelect === 'function' ) {
					return handler.onCommandSelect( item );
				} else {
					return { action: 'none' };
				}
			} else {
				// Delegate to the specific handler's result selection logic
				if ( typeof handler.onResultSelect === 'function' ) {
					return handler.onResultSelect( item );
				} else {
					return { action: 'none' };
				}
			}
		} catch ( err ) {
			mw.log.error( `[skins.citizen.commandPalette|CommandProvider] Error during selection delegation for command handler "${ handlerId }":`, err, 'Item:', item );
			return { action: 'none' };
		}
	}
};
