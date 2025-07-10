const { CommandPaletteItem, CommandPaletteNavigateAction, CommandPaletteNoneAction } = require( '../types.js' );

/**
 * Returns a navigation action result based on the item's URL.
 *
 * This is primarily used for keyboard-driven selections (e.g., Enter key),
 * as clicks on items with URLs are handled by standard browser behavior on `<a>` tags.
 *
 * @param {CommandPaletteItem} item The selected item.
 * @return {CommandPaletteNavigateAction | CommandPaletteNoneAction} Action result for the UI.
 */
function getNavigationAction( item ) {
	if ( !item?.url ) {
		return { action: 'none' };
	}

	return { action: 'navigate', payload: item.url };
}

module.exports = {
	getNavigationAction
};
