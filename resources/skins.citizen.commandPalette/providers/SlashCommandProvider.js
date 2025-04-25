const { CommandPaletteItem, CommandPaletteProvider } = require( '../types.js' );
const { cdxIconCode } = require( '../icons.json' );

// Registry for slash command handlers
// TODO: Allow extensions to register their own commands
const commandRegistry = {
	ns: require( '../commands/namespace.js' )
};

/**
 * Generates the list of command items based on the commandRegistry.
 *
 * @param {string} [filterPrefix] Optional prefix to filter command names.
 * @return {Array<CommandPaletteItem>}
 */
function getCommandListItems( filterPrefix ) {
	let entries = Object.entries( commandRegistry );

	if ( filterPrefix ) {
		entries = entries.filter( ( [ cmdName ] ) => cmdName.toLowerCase().startsWith( filterPrefix.toLowerCase() ) );
	}

	return entries.map( ( [ cmdName, handler ] ) => ( {
		id: `citizen-command-palette-item-command-${ cmdName }`,
		type: 'command',
		label: handler.label ?? cmdName,
		description: handler.description,
		thumbnailIcon: cdxIconCode,
		value: `/${ cmdName }:`,
		metadata: [
			{
				label: `/${ cmdName }`,
				highlightQuery: true
			}
		]
	} ) );
}

/** @type {CommandPaletteProvider} */
module.exports = {
	/** Whether this provider returns results asynchronously */
	isAsync: true, // Although some commands might be sync, the handler resolution can be async
	/** Debounce time in milliseconds for async providers */
	debounceMs: 0, // No debounce for commands for responsiveness
	/** Whether the first result from this provider should be automatically selected */
	shouldAutoSelectFirst: true,

	/**
	 * Determines if this provider should handle the current query.
	 *
	 * @param {string} query The search query.
	 * @return {boolean}
	 */
	canProvide( query ) {
		return query.startsWith( '/' );
	},

	/**
	 * Gets command suggestions or results, adapted to the CommandPaletteItem format.
	 *
	 * @param {string} query
	 * @return {Promise<Array<CommandPaletteItem>>}
	 */
	// eslint-disable-next-line es-x/no-async-functions
	async getResults( query ) {
		// Case 1: Root query "/" - Show available commands
		if ( query === '/' ) {
			return getCommandListItems();
		}

		// Case 2: Specific command query (e.g., "/ns:Talk")
		// Remove leading '/' and find the first colon, if any
		const commandString = query.slice( 1 ).trim();
		const colonIndex = commandString.indexOf( ':' );
		const hasSubquery = colonIndex !== -1;

		const commandName = ( hasSubquery ? commandString.slice( 0, colonIndex ) : commandString ).toLowerCase();
		const subQuery = hasSubquery ? commandString.slice( colonIndex + 1 ).trim() : '';

		if ( commandName && commandRegistry[ commandName ] ) {
			const commandHandler = commandRegistry[ commandName ];

			if ( typeof commandHandler.getResults !== 'function' ) {
				mw.log.error( `[SlashCommandProvider] Command handler for "${ commandName }" is missing required getResults function.` );
				return [];
			}

			try {
				const results = await commandHandler.getResults( subQuery );
				return Array.isArray( results ) ? results : [];
			} catch ( err ) {
				mw.log.error( `[SlashCommandProvider] "${ commandName }" failed:`, err );
				return [];
			}
		} else {
			// If the command name doesn't match any registered command, show the list again,
			// filtered by the typed prefix.
			return getCommandListItems( commandName );
		}
	}
};
