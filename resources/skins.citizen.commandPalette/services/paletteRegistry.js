const { cdxIconCode } = require( '../icons.json' );

/**
 * Creates a palette registry service that manages handler registration,
 * trigger matching, and command list generation.
 *
 * @return {Object} Palette registry service
 */
/**
 * A handler's triggers, or an empty list when it has none usable.
 *
 * `register` warns about a malformed `triggers` but still stores the handler,
 * and third parties register through a public hook, so neither its presence nor
 * its type can be assumed here.
 *
 * @param {import('../types.js').PaletteHandler} handler
 * @return {string[]}
 */
function triggersOf( handler ) {
	return Array.isArray( handler?.triggers ) ? handler.triggers : [];
}

/**
 * How directly a lowercased query names a handler: 0 when it begins one of
 * the triggers, 1 when it occurs in the name, 2 when it occurs in the
 * description, and -1 when it does neither.
 *
 * Triggers match only at their start, or a bare `:` would match every
 * `/x:` trigger — but a slash trigger also matches at the word after its
 * slash, which is the only place `ns` or `smw` appears. Name and
 * description match anywhere, because not every language puts spaces
 * between words.
 *
 * @param {import('../types.js').PaletteHandler} handler
 * @param {string} needle
 * @return {number}
 */
function matchRank( handler, needle ) {
	const beginsTrigger = ( trigger ) => {
		const lower = trigger.toLowerCase();
		return lower.startsWith( needle ) ||
			( lower.startsWith( '/' ) && lower.startsWith( needle, 1 ) );
	};
	if ( triggersOf( handler ).some( beginsTrigger ) ) {
		return 0;
	}
	if ( typeof handler.label === 'string' && handler.label.toLowerCase().includes( needle ) ) {
		return 1;
	}
	if ( typeof handler.description === 'string' && handler.description.toLowerCase().includes( needle ) ) {
		return 2;
	}
	return -1;
}

function createPaletteRegistry() {
	/** @type {Map<string, import('../types.js').PaletteHandler>} */
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
			( [ id, handler ] ) => triggersOf( handler ).map(
				( trigger ) => ( { trigger, id, lowerTrigger: trigger.toLowerCase() } )
			)
		);
	}

	/**
	 * Registers a new handler.
	 *
	 * @param {Object} handler Unvalidated handler object; the body checks its shape.
	 * @return {boolean} True if registration was successful, false otherwise.
	 */
	function register( handler ) {
		if ( handler === null ) {
			mw.log.warn(
				'[paletteRegistry] Invalid handler provided for registration: null. ' +
				'Likely a `defineMode` / `defineCommand` call that hard-failed validation — check earlier console errors.'
			);
			return false;
		}
		if ( typeof handler !== 'object' ) {
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

		// Defensive registration warnings — defineMode catches these at
		// build time, but raw object-literal modes (or third-party modes
		// that bypass defineMode) bottleneck through here. Cheap to check;
		// silent failures are expensive to debug.
		if ( !Array.isArray( handler.triggers ) || handler.triggers.length === 0 ) {
			mw.log.warn(
				`[paletteRegistry] Handler "${ handlerId }" has no triggers — it cannot be activated.`
			);
		} else {
			handler.triggers.forEach( ( trigger ) => {
				const conflict = flatTriggerList.find(
					( t ) => t.lowerTrigger === trigger.toLowerCase() && t.id !== handlerId
				);
				if ( conflict ) {
					mw.log.warn(
						`[paletteRegistry] Handler "${ handlerId }" trigger "${ trigger }" ` +
						`collides with existing handler "${ conflict.id }". Last registration wins.`
					);
				}
			} );
		}

		if (
			typeof handler.getResults !== 'function' &&
			typeof handler.onResultSelect !== 'function'
		) {
			mw.log.warn(
				`[paletteRegistry] Handler "${ handlerId }" has neither \`getResults\` nor \`onResultSelect\` — ` +
				'selecting it can never produce a useful action.'
			);
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
				.map( ( id ) => /** @type {[string, import('../types.js').PaletteHandler]} */ ( [ id, handlers.get( id ) ] ) )
				.filter( ( entry ) => entry[ 1 ] );
		} else {
			entries = Array.from( handlers.entries() );
		}

		return entries.flatMap( ( [ id, handler ] ) => toListItems( id, handler ) );
	}

	/**
	 * The command list narrowed to the entries a free-text query describes,
	 * ranked by how directly the query names them (see `matchRank`), in
	 * registration order within a rank.
	 *
	 * @param {string} query
	 * @return {Array<import('../types.js').CommandPaletteItem>}
	 */
	function searchCommandListItems( query ) {
		const needle = query.trim().toLowerCase();
		if ( !needle ) {
			return getCommandListItems();
		}
		/** @type {Array<Array<import('../types.js').CommandPaletteItem>>} */
		const ranks = [ [], [], [] ];
		for ( const [ id, handler ] of handlers ) {
			const rank = matchRank( handler, needle );
			if ( rank >= 0 ) {
				ranks[ rank ].push( ...toListItems( id, handler ) );
			}
		}
		return ranks.flat();
	}

	/**
	 * A handler's command list row, as a list of one — or of none, when it
	 * has no trigger to show.
	 *
	 * @param {string} id
	 * @param {import('../types.js').PaletteHandler} handler
	 * @return {Array<import('../types.js').CommandPaletteItem>}
	 */
	function toListItems( id, handler ) {
		const triggers = triggersOf( handler );
		if ( !triggers.length ) {
			return [];
		}
		return [ {
			id: `citizen-command-palette-item-command-${ id }`,
			type: 'command',
			label: triggers[ 0 ],
			description: handler.description,
			thumbnailIcon: cdxIconCode,
			value: triggers[ 0 ],
			metadata: triggers.length > 1 ?
				triggers.slice( 1 ).map( ( trigger ) => ( { label: trigger } ) ) :
				undefined,
			source: `command:${ id }`,
			highlightQuery: true
		} ];
	}

	/**
	 * What selecting a command-list row does: a mode opens with its first
	 * trigger, and a plain command runs its own selection handler.
	 *
	 * @param {import('../types.js').CommandPaletteItem} item
	 * @return {Promise<Object>} An action result.
	 */
	async function selectCommandListItem( item ) {
		const sourceParts = item.source?.split( ':' );
		if ( sourceParts?.[ 0 ] !== 'command' || sourceParts.length < 2 ) {
			return { action: 'none' };
		}

		const handlerId = sourceParts[ 1 ];
		const handler = handlers.get( handlerId );

		if ( !handler ) {
			return { action: 'none' };
		}

		try {
			// Commands with getResults expand the query on select
			if ( item.type === 'command' &&
				'getResults' in handler && typeof handler.getResults === 'function' ) {
				return { action: 'exitWithQuery', payload: item.value };
			}

			if ( typeof handler.onResultSelect === 'function' ) {
				// Awaited so an async handler's rejection lands in the catch
				// below, which names the handler, rather than escaping it.
				return await handler.onResultSelect( item );
			}
			return { action: 'none' };
		} catch ( err ) {
			mw.log.error(
				'[commandPalette] Selection handler "' + handlerId + '" failed:', err
			);
			return { action: 'none' };
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
				if ( handler && 'getResults' in handler && typeof handler.getResults === 'function' ) {
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
	 * @return {{ mode: import('../types.js').PaletteMode, trigger: string }|null}
	 */
	function findModeByQuery( query ) {
		const match = findMatchingCommand( query );
		if ( match && 'getResults' in match.handler && typeof match.handler.getResults === 'function' ) {
			return { mode: match.handler, trigger: match.trigger };
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
			if ( 'tokenPattern' in handler && handler.tokenPattern ) {
				if ( Array.isArray( handler.tokenPattern ) ) {
					patterns.push( ...handler.tokenPattern );
				} else {
					patterns.push( handler.tokenPattern );
				}
			}
		}
		return patterns;
	}

	return {
		register,
		findMatchingCommand,
		getCommandListItems,
		searchCommandListItems,
		selectCommandListItem,
		getHandler,
		getTokenPatterns,
		hasMatchingTrigger,
		findModeByTrigger,
		findModeByQuery
	};
}

module.exports = createPaletteRegistry;
