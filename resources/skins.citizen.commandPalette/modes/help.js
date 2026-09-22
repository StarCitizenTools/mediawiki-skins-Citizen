const { defineMode } = require( '../services/defineMode.js' );
const modeHelpDetail = require( '../utils/modeHelpDetail.js' );
const { cdxIconHelp } = require( '../icons.json' );

const HELP_MODE_ID = 'help';
const COMMAND_SOURCE_PREFIX = 'command:';

/**
 * Help mode: every registered mode and command, narrowed by what is typed,
 * with each one's triggers and long description in the detail pane.
 * Picking a row opens that mode or runs that command.
 *
 * @param {Object} registry The palette registry.
 * @return {import('../types.js').PaletteMode|null}
 */
function createHelpMode( registry ) {
	return defineMode( {
		id: HELP_MODE_ID,
		triggers: [ '/help', '?' ],
		label: mw.message( 'citizen-command-palette-command-help-label' ).text(),
		description: mw.message( 'citizen-command-palette-command-help-description' ).text(),
		placeholder: mw.message( 'citizen-command-palette-help-placeholder' ).text(),
		icon: cdxIconHelp,
		compactResults: true,
		// The list is filtered locally, so there is no request to wait for.
		debounceMs: 0,
		getResults( query ) {
			return registry.searchCommandListItems( query )
				.filter( ( item ) => item.source !== COMMAND_SOURCE_PREFIX + HELP_MODE_ID )
				.map( ( item ) => {
					const handler = registry.getHandler( item.source.slice( COMMAND_SOURCE_PREFIX.length ) );
					return handler ? Object.assign( {}, item, { detail: modeHelpDetail( handler ) } ) : item;
				} );
		},
		onResultSelect: ( item ) => registry.selectCommandListItem( item )
	} );
}

module.exports = { createHelpMode, HELP_MODE_ID };
