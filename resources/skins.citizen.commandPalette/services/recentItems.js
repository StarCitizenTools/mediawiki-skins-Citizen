const { cdxIconTrash } = require( '../icons.json' );
const destinationKey = require( '../utils/destinationKey.js' );
const RECENT_ITEMS_KEY = 'skin-citizen-command-palette-recent-items';
const MAX_RECENT_ITEMS = 5;

// How a row was activated, not what the row is. Remembering one makes the
// saved row replay that activation for good: `isMouseClick` tells the router
// the browser already followed the row's <a>, so a row still carrying it
// navigates nowhere on a later keyboard Enter.
const ACTIVATION_FLAGS = [ 'isMouseClick', 'modifierClick', 'newTab' ];

/**
 * Strip the activation flags from an item.
 *
 * Applied on write so nothing new is stored, and on read so entries an
 * earlier version already saved stop misbehaving without a cleared history.
 *
 * @param {Object} item
 * @return {Object}
 */
function withoutActivationFlags( item ) {
	const stored = Object.assign( {}, item );
	for ( const flag of ACTIVATION_FLAGS ) {
		delete stored[ flag ];
	}
	return stored;
}

/**
 * How much an entry says about what it opens. A row acting on the typed
 * query (go, full-text search, edit) says least; a mode's own entry (a
 * user, a file, a special page) says more than a plain page result.
 *
 * @param {Object} entry
 * @return {number}
 */
function specificityOf( entry ) {
	if ( entry.type === 'action' ) {
		return 0;
	}
	return entry.type === 'page' ? 1 : 2;
}

/**
 * Keeps one entry per destination, at the place of its newest save, showing
 * its most specific version and the newest of equally specific ones.
 *
 * @param {Object[]} entries Newest first.
 * @return {Object[]}
 */
function collapse( entries ) {
	const kept = new Map();
	for ( const entry of entries ) {
		const key = destinationKey( entry );
		const current = kept.get( key );
		// Setting an existing key keeps its place in the Map's order.
		if ( !current || specificityOf( entry ) > specificityOf( current ) ) {
			kept.set( key, entry );
		}
	}
	return Array.from( kept.values() );
}

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
		mw.storage.setObject(
			RECENT_ITEMS_KEY,
			collapse( [ withoutActivationFlags( item ), ...recentItems ] )
				.slice( 0, MAX_RECENT_ITEMS )
		);
	}

	/**
	 * Gets recent items from history
	 *
	 * @return {Array<import('../types.js').CommandPaletteItem>} Recent items in the format expected by the command palette
	 */
	function getRecentItems() {
		const items = mw.storage.getObject( RECENT_ITEMS_KEY ) ?? [];
		const dismissAction = {
			id: 'dismiss',
			label: mw.msg( 'citizen-command-palette-dismiss' ),
			icon: cdxIconTrash
		};

		// An earlier version kept one entry per row rather than per destination.
		return collapse( items ).map( ( item ) => {
			const actions = Array.isArray( item.actions ) ? [ ...item.actions ] : [];
			if ( !actions.some( ( action ) => action.id === 'dismiss' ) ) {
				actions.push( dismissAction );
			}

			return {
				...withoutActivationFlags( item ),
				actions
			};
		} );
	}

	/**
	 * Removes every entry for what the given item opens.
	 *
	 * @param {Object} item - The item to remove
	 */
	function removeRecentItem( item ) {
		const recentItems = mw.storage.getObject( RECENT_ITEMS_KEY ) || [];
		const key = destinationKey( item );
		const remaining = recentItems.filter( ( entry ) => destinationKey( entry ) !== key );
		if ( remaining.length !== recentItems.length ) {
			mw.storage.setObject( RECENT_ITEMS_KEY, remaining );
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
		getRecentItems,
		removeRecentItem,
		clearHistory
	};
}

module.exports = createRecentItems;
