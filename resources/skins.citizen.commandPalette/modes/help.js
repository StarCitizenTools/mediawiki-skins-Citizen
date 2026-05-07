/**
 * Help command for the command palette.
 *
 * Selecting this entry toggles the in-palette help overlay, which surfaces
 * every registered mode and the global keyboard shortcuts. The overlay is
 * a transient layer rendered on top of the active mode — opening or closing
 * it does not modify the active mode, query, or mode-context stack.
 *
 * @type {import('../types.js').PaletteCommand}
 */
module.exports = {
	id: 'help',
	triggers: [ '/help', '?' ],
	label: mw.message( 'citizen-command-palette-command-help-label' ).text(),
	description: mw.message( 'citizen-command-palette-command-help-description' ).text(),
	onResultSelect() {
		return { action: 'toggleHelp' };
	}
};
