const { CommandPaletteItem } = require( '../types.js' );
const { cdxIconCode } = require( '../icons.json' );

// Registry for slash command handlers
// TODO: Allow extensions to register their own commands
const commandRegistry = {
	ns: require( '../commands/namespace.js' )
};

module.exports = {
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
			return Object.entries( commandRegistry ).map( ( [ cmdName, handler ] ) => ( {
				id: `citizen-command-palette-item-command-${ cmdName }`,
				type: 'command',
				label: handler.label ?? cmdName,
				description: handler.description,
				thumbnailIcon: cdxIconCode,
				value: '/' + cmdName + ':'
			} ) );
		}

		// Case 2: Specific command query (e.g., "/ns:Talk")
		let commandName = '';
		let subQuery = '';
		// Remove leading '/' and find the first colon, if any
		const commandString = query.slice( 1 ).trim();
		const colonIndex = commandString.indexOf( ':' );

		if ( colonIndex !== -1 ) {
			// Command with subquery (e.g., "/ns:Talk")
			commandName = commandString.slice( 0, colonIndex ).toLowerCase();
			subQuery = commandString.slice( colonIndex + 1 ).trim();
		} else {
			// Command without subquery, potentially partially typed (e.g., "/ns")
			// or command ending with colon (e.g., "/ns:")
			commandName = commandString.toLowerCase();
			subQuery = '';
		}

		if ( commandName && commandRegistry[ commandName ] ) {
			const commandHandler = commandRegistry[ commandName ];

			if ( typeof commandHandler.getResults !== 'function' ) {
				mw.log.error( `[SlashCommandProvider] Command handler for "${ commandName }" is missing required getResults function.` );
				return [];
			}

			const results = await commandHandler.getResults( subQuery );
			return Array.isArray( results ) ? results : [];
		}

		return [];
	}
};
