const { CommandPaletteItem } = require( '../types.js' );
const { cdxIconCode } = require( '../icons.json' );

// Registry for slash command handlers
const commandRegistry = {
	ns: require( '../commands/namespace.js' )
	// Add other commands like 'user', 'template' here by requiring their modules
	// e.g., user: require( '../commands/user.js' )
};

module.exports = {
	/**
	 * Determines if this provider should handle the current query.
	 *
	 * @param {string} query The search query.
	 * @return {boolean}
	 */
	canProvide( query ) {
		// Handles queries starting with /
		return query.startsWith( '/' );
	},

	/**
	 * Gets command suggestions or results, adapted to the CommandPaletteItem format.
	 *
	 * @param {string} query The slash command query (e.g., "/", "/ns", "/ns Talk").
	 * @return {Promise<Array<CommandPaletteItem>>} A promise resolving to command or suggestion items.
	 */
	// eslint-disable-next-line es-x/no-async-functions
	async getResults( query ) {
		// Case 1: Root query "/" - Show available commands
		if ( query === '/' ) {
			return Object.entries( commandRegistry ).map( ( [ cmdName, handler ] ) => ( {
				id: `command-${ cmdName }`,
				type: 'command',
				label: handler.label,
				description: handler.description,
				thumbnailIcon: cdxIconCode,
				value: '/' + cmdName
			} ) );
		}

		// Case 2: Specific command query (e.g., "/ns Talk")
		let commandName = '';
		let subQuery = '';
		// Remove leading '/' and split into command name and the rest (subQuery)
		const queryParts = query.slice( 1 ).split( /\s+/ );

		if ( queryParts.length > 0 && queryParts[ 0 ] ) {
			commandName = queryParts[ 0 ].toLowerCase();
			subQuery = queryParts.slice( 1 ).join( ' ' ).trim();
		}

		// Look up command handler in registry
		if ( commandName && commandRegistry[ commandName ] ) {
			const commandHandler = commandRegistry[ commandName ];
			// Check if the handler has the required methods
			if ( typeof commandHandler.getResults !== 'function' || typeof commandHandler.adaptResult !== 'function' ) {
				mw.log.error( `[SlashCommandProvider] Command handler for "${ commandName }" is missing required getResults or adaptResult function.` );
				return [];
			}
			// Delegate fetching and adapting results to the specific command handler
			const rawResults = await commandHandler.getResults( subQuery );
			// Ensure results are an array before mapping
			return Array.isArray( rawResults ) ? rawResults.map( commandHandler.adaptResult ) : [];
		}

		// If no matching command found, return empty
		return [];
	}
};
