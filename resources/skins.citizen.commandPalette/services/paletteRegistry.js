const { cdxIconCode } = require( '../icons.json' );

/**
 * Creates a palette registry service that manages handler registration,
 * trigger matching, and command list generation.
 *
 * @return {Object} Palette registry service
 */
function createPaletteRegistry() {
	/** @type {Map<string, import('../types.js').PaletteMode|import('../types.js').PaletteCommand>} */
	const handlers = new Map();

	/** @type {Array<{trigger: string, id: string, lowerTrigger: string}>} */
	let flatTriggerList = [];

	/**
	 * Recomputes the flat trigger list from the handlers map.
	 * This optimizes prefix searching by creating a single list of all triggers,
	 * including their lowercase versions.
	 */
	function rebuildTriggerList() {
		flatTriggerList = Array.from( handlers.entries() ).flatMap(
			( [ id, handler ] ) => ( handler?.triggers ?? [] ).map(
				( trigger ) => ( { trigger, id, lowerTrigger: trigger.toLowerCase() } )
			)
		);
	}

	/**
	 * Registers a new handler.
	 *
	 * @param {import('../types.js').PaletteMode|import('../types.js').PaletteCommand} handler The handler object (must include an 'id' property)
	 * @return {boolean} True if registration was successful, false otherwise.
	 */
	function register( handler ) {
		if ( typeof handler !== 'object' || handler === null ) {
			mw.log.warn( '[paletteRegistry] Invalid handler provided for registration: not an object.' );
			return false;
		}
		const handlerId = handler.id;
		if ( !handlerId || typeof handlerId !== 'string' || handlerId.trim() === '' ) {
			mw.log.warn( `[paletteRegistry] Invalid or missing handler ID: ${ handlerId }` );
			return false;
		}

		if ( handlers.has( handlerId ) ) {
			mw.log.warn( `[paletteRegistry] Handler "${ handlerId }" is already registered. Overwriting.` );
		}

		handlers.set( handlerId, handler );
		rebuildTriggerList();

		return true;
	}

	/**
	 * Finds the handler that best matches the start of the query.
	 * It searches through registered triggers and returns the longest match.
	 *
	 * @param {string} query The search query.
	 * @return {{handler: import('../types.js').PaletteMode|import('../types.js').PaletteCommand, trigger: string, id: string}|null}
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
		const handler = handlers.get( id );

		if ( !handler ) {
			mw.log.warn( `[paletteRegistry] Handler "${ id }" (matched via trigger "${ trigger }") not found in registry.` );
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
				.map( ( id ) => [ id, handlers.get( id ) ] )
				.filter( ( entry ) => entry[ 1 ] );
		} else {
			entries = Array.from( handlers.entries() );
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
			mw.log.error( '[paletteRegistry|getCommandListItems] Error during mapping:', error );
			return [];
		}
	}

	/**
	 * Returns the handler for a registered ID.
	 *
	 * @param {string} id The handler ID.
	 * @return {import('../types.js').PaletteMode|import('../types.js').PaletteCommand|undefined}
	 */
	function getHandler( id ) {
		return handlers.get( id );
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

	/**
	 * Finds a mode by exact single-character trigger match.
	 * Only returns entries that have getResults (modes), not commands.
	 *
	 * @param {string} key The trigger character to match.
	 * @return {import('../types.js').PaletteMode|null} The matching mode, or null.
	 */
	function findModeByTrigger( key ) {
		const lowerKey = key.toLowerCase();
		for ( const entry of flatTriggerList ) {
			if ( entry.lowerTrigger === lowerKey ) {
				const handler = handlers.get( entry.id );
				if ( handler && typeof handler.getResults === 'function' ) {
					return handler;
				}
			}
		}
		return null;
	}

	/**
	 * Finds a mode by query prefix match (for multi-character triggers like '/ns:').
	 * Only returns entries that have getResults (modes), not commands.
	 *
	 * @param {string} query The query to match against triggers.
	 * @return {import('../types.js').PaletteMode|null} The matching mode, or null.
	 */
	function findModeByQuery( query ) {
		const match = findMatchingCommand( query );
		if ( match && typeof match.handler.getResults === 'function' ) {
			return match.handler;
		}
		return null;
	}

	/**
	 * Collects token patterns from all registered handlers that define one.
	 *
	 * @return {Array<import('../types.js').TokenPattern>}
	 */
	function getTokenPatterns() {
		const patterns = [];
		for ( const handler of handlers.values() ) {
			if ( handler.tokenPattern ) {
				patterns.push( handler.tokenPattern );
			}
		}
		return patterns;
	}

	return {
		register,
		findMatchingCommand,
		getCommandListItems,
		getHandler,
		getTokenPatterns,
		hasMatchingTrigger,
		findModeByTrigger,
		findModeByQuery
	};
}

module.exports = createPaletteRegistry;
