const { CommandPaletteItem, CommandPaletteEventDetails, CommandPaletteNavigateAction, CommandPaletteNavigateNewTabAction, CommandPaletteNoneAction } = require( '../types.js' );

/**
 * Returns a navigation action result based on the item's URL and its embedded event details.
 *
 * @param {CommandPaletteItem} item The selected item, which should include eventDetails if applicable.
 * @return {CommandPaletteNavigateAction | CommandPaletteNavigateNewTabAction | CommandPaletteNoneAction} Action result for the UI.
 */
function getNavigationAction( item ) {
	if ( !item?.url ) {
		return { action: 'none' };
	}

	if ( isNewTabActivation( item.eventDetails ) ) {
		return { action: 'navigate-new-tab', payload: item.url };
	} else {
		return { action: 'navigate', payload: item.url };
	}
}

/**
 * Checks if the event details indicate an intention to open in a new tab.
 *
 * @param {CommandPaletteEventDetails} eventDetails
 * @return {boolean}
 */
function isNewTabActivation( eventDetails ) {
	if ( !eventDetails ) {
		return false;
	}
	const isMiddleClick = eventDetails.button === 1;
	const isCtrlOrCmdClick = eventDetails.button === 0 && ( eventDetails.ctrlKey || eventDetails.metaKey );
	return isMiddleClick || isCtrlOrCmdClick;
}

module.exports = {
	getNavigationAction
};
