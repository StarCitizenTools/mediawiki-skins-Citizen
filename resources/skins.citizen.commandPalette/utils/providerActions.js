const { cdxIconEdit } = require( '../icons.json' );

/**
 * The edit action for a page.
 *
 * @param {string} title Prefixed page title.
 * @return {import('../types.js').CommandPaletteItemAction}
 */
function editAction( title ) {
	return {
		id: 'edit',
		label: mw.msg( 'action-edit' ),
		icon: cdxIconEdit,
		url: mw.util.getUrl( title, { action: 'edit' } )
	};
}

/**
 * The actions offered on a page row.
 *
 * A page id of 0 (or none) means the title cannot be a real page — a
 * virtual namespace such as `Special:` or `Media:`, or an interwiki
 * target. Such a title holds no wikitext, so `action=edit` is ignored and
 * merely renders the page.
 *
 * @param {Object} page
 * @param {number} [page.id] Page id; 0 or missing for titles that are not real pages.
 * @param {string} page.title Prefixed page title.
 * @return {import('../types.js').CommandPaletteItemAction[]}
 */
function buildPageActions( page ) {
	return page.id ? [ editAction( page.title ) ] : [];
}

/**
 * Returns a navigation action result based on the item's URL.
 *
 * This is primarily used for keyboard-driven selections (e.g., Enter key),
 * as clicks on items with URLs are handled by standard browser behavior on `<a>` tags.
 *
 * @param {import('../types.js').CommandPaletteItem} item The selected item.
 * @return {import('../types.js').CommandPaletteNavigateAction | import('../types.js').CommandPaletteNoneAction} Action result for the UI.
 */
function getNavigationAction( item ) {
	if ( !item?.url ) {
		return { action: 'none' };
	}

	return { action: 'navigate', payload: item.url };
}

module.exports = {
	getNavigationAction,
	buildPageActions,
	editAction
};
