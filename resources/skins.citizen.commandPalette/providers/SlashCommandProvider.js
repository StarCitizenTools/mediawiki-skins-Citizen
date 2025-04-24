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
				value: `/${ cmdName }:`,
				metadata: [
					{
						label: `/${ cmdName }`,
						highlightQuery: true
					}
				]
			} ) );
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

			const results = await commandHandler.getResults( subQuery );
			return Array.isArray( results ) ? results : [];
		}

		return [];
	}
};
