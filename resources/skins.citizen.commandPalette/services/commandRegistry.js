const { cdxIconCode } = require( '../icons.json' );

/**
 * Creates a command registry service that manages command registration,
 * trigger matching, and command list generation.
 *
 * @return {Object} Command registry service
 */
function createCommandRegistry() {
	/** @type {Map<string, import('../types.js').CommandPaletteCommand>} */
	const commands = new Map();

	/** @type {Array<{trigger: string, id: string, lowerTrigger: string}>} */
	let flatTriggerList = [];

	/**
	 * Recomputes the flat trigger list from the commands map.
	 * This optimizes prefix searching by creating a single list of all triggers,
	 * including their lowercase versions.
	 */
	function rebuildTriggerList() {
		flatTriggerList = Array.from( commands.entries() ).flatMap(
			( [ id, handler ] ) => ( handler?.triggers ?? [] ).map(
				( trigger ) => ( { trigger, id, lowerTrigger: trigger.toLowerCase() } )
			)
		);
	}

	/**
	 * Registers a new command handler.
	 *
	 * @param {import('../types.js').CommandPaletteCommand} handler The command handler object (must include an 'id' property)
	 * @return {boolean} True if registration was successful, false otherwise.
	 */
	function register( handler ) {
		if ( typeof handler !== 'object' || handler === null ) {
			mw.log.warn( '[commandRegistry] Invalid handler provided for registration: not an object.' );
			return false;
		}
		const commandId = handler.id;
		if ( !commandId || typeof commandId !== 'string' || commandId.trim() === '' ) {
			mw.log.warn( `[commandRegistry] Invalid or missing command ID in handler: ${ commandId }` );
			return false;
		}

		if ( commands.has( commandId ) ) {
			mw.log.warn( `[commandRegistry] Command "${ commandId }" is already registered. Overwriting.` );
		}

		commands.set( commandId, handler );
		rebuildTriggerList();

		return true;
	}

	/**
	 * Finds the command handler that best matches the start of the query.
	 * It searches through registered command triggers and returns the longest match.
	 *
	 * @param {string} query The search query.
	 * @return {{handler: import('../types.js').CommandPaletteCommand, trigger: string, id: string}|null}
	 */
	function findMatchingCommand( query ) {
		const lowerQuery = query.toLowerCase();
		const matchingTriggers = flatTriggerList.filter(
			( { lowerTrigger } ) => lowerQuery.startsWith( lowerTrigger )
		);

		if ( matchingTriggers.length === 0 ) {
			return null;
		}

		// Sort by trigger length descending to find the longest match
		matchingTriggers.sort( ( a, b ) => b.trigger.length - a.trigger.length );
		const bestMatch = matchingTriggers[ 0 ];
		const { trigger, id } = bestMatch;
		const handler = commands.get( id );

		if ( !handler ) {
			mw.log.warn( `[commandRegistry] Handler for command "${ id }" (matched via trigger "${ trigger }") not found in registry.` );
			return null;
		}

		return { handler, trigger, id };
	}

	/**
	 * Generates the list of command items based on the registry.
	 *
	 * @param {string} [filterPrefix] Optional prefix to filter command triggers.
	 * @return {Array<import('../types.js').CommandPaletteItem>}
	 */
	function getCommandListItems( filterPrefix ) {
		let entries;

		if ( filterPrefix ) {
			const lowerPrefix = filterPrefix.toLowerCase();
			const filteredTriggers = flatTriggerList.filter(
				( { lowerTrigger } ) => lowerTrigger.startsWith( lowerPrefix )
			);
			const uniqueIds = [ ...new Set( filteredTriggers.map( ( { id } ) => id ) ) ];
			entries = uniqueIds
				.map( ( id ) => [ id, commands.get( id ) ] )
				.filter( ( entry ) => entry[ 1 ] );
		} else {
			entries = Array.from( commands.entries() );
		}

		try {
			return entries.map( ( [ id, handler ] ) => ( {
				id: `citizen-command-palette-item-command-${ id }`,
				type: 'command',
				label: handler.triggers[ 0 ],
				description: handler.description,
				thumbnailIcon: cdxIconCode,
				value: handler.triggers[ 0 ],
				metadata: handler.triggers.length > 1 ?
					handler.triggers.slice( 1 ).map( ( trigger ) => ( { label: trigger } ) ) :
					undefined,
				source: `command:${ id }`,
				highlightQuery: true
			} ) );
		} catch ( error ) {
			mw.log.error( '[commandRegistry|getCommandListItems] Error during mapping:', error );
			return [];
		}
	}

	/**
	 * Returns the handler for a registered command.
	 *
	 * @param {string} id The command ID.
	 * @return {import('../types.js').CommandPaletteCommand|undefined}
	 */
	function getHandler( id ) {
		return commands.get( id );
	}

	/**
	 * Checks whether any registered trigger matches the start of the query.
	 *
	 * @param {string} query The search query.
	 * @return {boolean}
	 */
	function hasMatchingTrigger( query ) {
		const lowerQuery = query.toLowerCase();
		return flatTriggerList.some(
			( { lowerTrigger } ) => lowerQuery.startsWith( lowerTrigger )
		);
	}

	return {
		register,
		findMatchingCommand,
		getCommandListItems,
		getHandler,
		hasMatchingTrigger
	};
}

module.exports = createCommandRegistry;
