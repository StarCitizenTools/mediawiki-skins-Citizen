const { cdxIconTrash } = require( '../icons.json' );
const destinationKey = require( '../utils/destinationKey.js' );
const { isPlaceLink, entryFromLink, rowFromEntry, rankOf } = require( '../utils/recentEntry.js' );

const RECENT_KEY = 'skin-citizen-command-palette-recent';
// Earlier versions stored whole rows here. Read once, converted, then removed.
const LEGACY_KEY = 'skin-citizen-command-palette-recent-items';
const FORMAT_VERSION = 1;
// Exceeds RECENT_ITEMS_SHOWN (useProviderOrchestration.js) by the most the
// empty palette leaves out of Recent: the view you are on, the redirect
// that led to it, and each page Related lists. Leaving those out then
// never shortens the list.
const MAX_RECENT_ITEMS = 13;

/**
 * @param {any} value
 * @return {boolean}
 */
function isEntry( value ) {
	return !!value &&
		typeof value.kind === 'string' &&
		typeof value.key === 'string' &&
		typeof value.label === 'string' &&
		typeof value.url === 'string' &&
		isPlaceLink( value.url );
}

/**
 * Keeps one entry per place, at the position of its newest save, showing
 * the entry that names the place most directly.
 *
 * @param {import('../utils/recentEntry.js').RecentEntry[]} entries Newest first.
 * @return {import('../utils/recentEntry.js').RecentEntry[]}
 */
function collapse( entries ) {
	const kept = new Map();
	for ( const entry of entries ) {
		const current = kept.get( entry.key );
		// Setting an existing key keeps its place in the Map's order.
		if ( !current || rankOf( entry ) > rankOf( current ) ) {
			kept.set( entry.key, entry );
		}
	}
	return Array.from( kept.values() );
}

/**
 * @return {Object} Recent items service
 */
function createRecentItems() {
	/**
	 * @param {import('../utils/recentEntry.js').RecentEntry[]} entries
	 * @return {boolean} Whether the entries were stored.
	 */
	function write( entries ) {
		return mw.storage.setObject( RECENT_KEY, { version: FORMAT_VERSION, entries } );
	}

	/**
	 * The stored entries, newest first, converting an earlier history once.
	 *
	 * @return {import('../utils/recentEntry.js').RecentEntry[]}
	 */
	function load() {
		const stored = mw.storage.getObject( RECENT_KEY );
		if ( stored && stored.version === FORMAT_VERSION && Array.isArray( stored.entries ) ) {
			return stored.entries.filter( isEntry );
		}
		const legacy = mw.storage.getObject( LEGACY_KEY );
		if ( !Array.isArray( legacy ) ) {
			return [];
		}
		const entries = collapse(
			legacy
				.map( ( row ) => row && entryFromLink( row.url, row, 0 ) )
				.filter( isEntry )
		).slice( 0, MAX_RECENT_ITEMS );
		// The earlier history goes only once its conversion is stored, so a
		// full or blocked storage converts it again next time instead of
		// losing it.
		if ( write( entries ) ) {
			mw.storage.remove( LEGACY_KEY );
		}
		return entries;
	}

	/**
	 * Remembers the place a row led to.
	 *
	 * @param {import('../types.js').CommandPaletteItem} item The row that was opened.
	 * @param {string} [url] The link actually opened; the row's own link if omitted.
	 */
	function saveRecentItem( item, url ) {
		const entry = entryFromLink( url || item.url, item, Date.now() );
		if ( !entry ) {
			return;
		}
		write( collapse( [ entry, ...load() ] ).slice( 0, MAX_RECENT_ITEMS ) );
	}

	/**
	 * @return {Array<import('../types.js').CommandPaletteItem>} Rows for the remembered places.
	 */
	function getRecentItems() {
		const dismissAction = {
			id: 'dismiss',
			label: mw.msg( 'citizen-command-palette-dismiss' ),
			icon: cdxIconTrash
		};
		return load().map( ( entry ) => {
			const row = rowFromEntry( entry );
			return { ...row, actions: [ ...( row.actions || [] ), dismissAction ] };
		} );
	}

	/**
	 * Forgets the place a row shows.
	 *
	 * @param {Object} item The row to forget.
	 */
	function removeRecentItem( item ) {
		const key = destinationKey( item );
		const entries = load();
		const remaining = entries.filter( ( entry ) => entry.key !== key );
		if ( remaining.length !== entries.length ) {
			write( remaining );
		}
	}

	/**
	 * Clears all search history
	 */
	function clearHistory() {
		mw.storage.remove( RECENT_KEY );
		mw.storage.remove( LEGACY_KEY );
	}

	return {
		saveRecentItem,
		getRecentItems,
		removeRecentItem,
		clearHistory
	};
}

module.exports = createRecentItems;
