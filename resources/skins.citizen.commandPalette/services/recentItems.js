const { CommandPaletteItem } = require( '../types.js' );
const { cdxIconArticleSearch, cdxIconTrash } = require( '../icons.json' );
const RECENT_ITEMS_KEY = 'skin-citizen-command-palette-recent-items';
const MAX_RECENT_ITEMS = 5;

/**
 * @return {Object} Recent items service
 */
function createRecentItems() {
	/**
	 * Saves an item to recent history
	 *
	 * @param {Object} item - The item to save
	 */
	function saveRecentItem( item ) {
		const recentItems = mw.storage.getObject( RECENT_ITEMS_KEY ) || [];
		// Remove if already exists
		const existingIndex = recentItems.findIndex( ( i ) => i.id === item.id );
		if ( existingIndex !== -1 ) {
			recentItems.splice( existingIndex, 1 );
		}
		// Add to beginning
		recentItems.unshift( item );
		// Keep only MAX_RECENT_ITEMS
		if ( recentItems.length > MAX_RECENT_ITEMS ) {
			recentItems.pop();
		}
		mw.storage.setObject( RECENT_ITEMS_KEY, recentItems );
	}

	/**
	 * Saves a search query to recent history
	 *
	 * @param {string} query - The search query to save
	 * @param {string} searchUrl - The URL to the search page
	 */
	function saveSearchQuery( query, searchUrl ) {
		saveRecentItem( {
			type: 'fulltext-search',
			id: `citizen-command-palette-result-search-${ mw.util.escapeIdForAttribute( query ) }`,
			label: query,
			url: searchUrl,
			thumbnailIcon: cdxIconArticleSearch
		} );
	}

	/**
	 * Gets recent items from history
	 *
	 * @return {Array<CommandPaletteItem>} Recent items in the format expected by the command palette
	 */
	function getRecentItems() {
		const items = mw.storage.getObject( RECENT_ITEMS_KEY ) ?? [];
		const dismissAction = {
			id: 'dismiss',
			label: mw.msg( 'citizen-command-palette-dismiss' ),
			icon: cdxIconTrash
		};

		return items.map( ( item ) => {
			const actions = Array.isArray( item.actions ) ? [ ...item.actions ] : [];
			if ( !actions.some( ( action ) => action.id === 'dismiss' ) ) {
				actions.push( dismissAction );
			}

			return {
				...item,
				actions
			};
		} );
	}

	/**
	 * Removes a specific item from recent history
	 *
	 * @param {Object} item - The item to remove
	 */
	function removeRecentItem( item ) {
		const recentItems = mw.storage.getObject( RECENT_ITEMS_KEY ) || [];
		const index = recentItems.findIndex( ( i ) => i.id === item.id );
		if ( index !== -1 ) {
			recentItems.splice( index, 1 );
			mw.storage.setObject( RECENT_ITEMS_KEY, recentItems );
		}
	}

	/**
	 * Clears all search history
	 */
	function clearHistory() {
		mw.storage.remove( RECENT_ITEMS_KEY );
	}

	return {
		saveRecentItem,
		saveSearchQuery,
		getRecentItems,
		removeRecentItem,
		clearHistory
	};
}

module.exports = createRecentItems;
