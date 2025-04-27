/**
 * Placeholder command handler for actions.
 */
const { CommandPaletteItem, CommandPaletteCommand, CommandPaletteActionResult } = require( '../types.js' );
const { cdxIconSpecialPages, cdxIconPlay } = require( '../icons.json' );
const config = require( '../config.json' );

/**
 * Cache for special page results to avoid repeated API calls.
 *
 * @type {null|Promise<Array<CommandPaletteItem>>}
 */
let specialPageCache = null;

/**
 * Cache for menu item results to avoid repeated DOM queries.
 *
 * @type {null|Array<CommandPaletteItem>}
 */
let menuItemCache = null;

/**
 * Fetches and formats special pages from the MediaWiki API.
 *
 * @return {Promise<Array<CommandPaletteItem>>} A promise that resolves with an array of special page items.
 */
function fetchSpecialPages() {
	// Check if the cache promise has been initialized
	if ( specialPageCache !== null ) {
		return specialPageCache;
	}

	specialPageCache = new mw.Api().get( {
		action: 'query',
		meta: 'siteinfo',
		siprop: 'specialpagealiases',
		maxage: config.wgSearchSuggestCacheExpiry,
		smaxage: config.wgSearchSuggestCacheExpiry
	} ).then( ( data ) => {
		const specialPages = data.query.specialpagealiases;
		/** @type {Array<CommandPaletteItem>} */
		const items = [];

		specialPages.forEach( ( page ) => {
			// Use the first alias as the primary label
			const label = page.aliases[ 0 ].replace( /_/g, ' ' );
			const realName = page.realname;
			const url = mw.util.getUrl( 'Special:' + realName );

			items.push( {
				id: 'special-' + realName.toLowerCase(),
				type: 'special-page',
				label: label,
				url: url,
				// description: Could potentially fetch descriptions via another API call or use mw.message
				// icon: Needs a way to map special pages to icons
				thumbnailIcon: cdxIconSpecialPages,
				value: '/action:' + realName,
				highlightQuery: true
			} );
		} );

		// Sort alphabetically by label
		items.sort( ( a, b ) => a.label.localeCompare( b.label ) );

		return items;
	} ).catch( ( error ) => {
		mw.log.error( 'Error fetching special pages:', error );
		specialPageCache = null; // Clear cache on error
		return []; // Return empty list on error
	} );

	return specialPageCache;
}

/**
 * Fetches and formats menu items from the specified portlet's navigation.
 *
 * @return {Array<CommandPaletteItem>} An array of menu items.
 */
function fetchMenuItems() {
	if ( menuItemCache !== null ) {
		// Return cached results if available
		return menuItemCache;
	}

	/**
	 * The IDs of the portlets to fetch menu items from.
	 * Defined here because ResourceLoader may have trouble with this in the top-level scope.
	 */
	const TARGET_PORTLET_IDS = [ 'p-views', 'p-associated-pages', 'p-cactions', 'p-tb', 'p-personal' ];

	/** @type {Array<CommandPaletteItem>} */
	const allItems = [];
	const seenUrls = new Set();

	TARGET_PORTLET_IDS.forEach( ( portletId ) => {
		const portletElement = document.getElementById( portletId );

		if ( !portletElement ) {
			return;
		}

		const menuLabel = portletElement.querySelector( '.citizen-menu__heading' )?.textContent?.trim();
		const links = portletElement.querySelectorAll( '.citizen-menu__content-list li a' );

		links.forEach( ( link ) => {
			const listItem = link.closest( 'li' );
			const id = listItem ? listItem.id : ''; // e.g., 't-whatlinkshere'
			const url = link.getAttribute( 'href' ) || '#';
			const labelElement = link.querySelector( 'span:not([class*="icon"])' ); // Get the text span, excluding icon spans

			// Skip if label element not found or URL already seen
			if ( !labelElement || seenUrls.has( url ) ) {
				return;
			}

			// Should not happen, but just in case
			const label = labelElement.textContent?.trim() || '';
			// Remove trailing access key hint like "[alt-shift-j]"
			const description = link.getAttribute( 'title' )?.replace( /\s*\[[^\]]*\]\s*$/, '' );

			allItems.push( {
				id: id || 'menuitem-' + label.toLowerCase().replace( /\s+/g, '-' ), // Generate an ID if none exists
				type: 'menu-item',
				label: label,
				description: description,
				url: url,
				thumbnailIcon: cdxIconPlay, // TODO: Somehow get the icon from the link
				value: `/action:${ label }`,
				highlightQuery: true,
				metadata: [
					{
						label: menuLabel
					}
				]
			} );
			seenUrls.add( url ); // Add URL to set to track duplicates
		} );
	} );

	// Sort alphabetically by label after combining and de-duplicating
	allItems.sort( ( a, b ) => a.label.localeCompare( b.label ) );

	// Cache the combined and sorted results
	menuItemCache = allItems;

	return allItems;
}

/**
 * Checks if a CommandPaletteItem matches the given query.
 *
 * @param {CommandPaletteItem} item The item to check.
 * @param {string} lowerCaseQuery The query string (already lowercased).
 * @return {boolean} True if the item matches, false otherwise.
 */
function itemMatchesQuery( item, lowerCaseQuery ) {
	if ( item.label.toLowerCase().includes( lowerCaseQuery ) ) {
		return true;
	}

	// Check ID (covers both special pages and menu items)
	if ( item.id.toLowerCase().includes( lowerCaseQuery ) ) {
		return true;
	}

	return false;
}

/**
 * Gets action results (special pages and menu items) based on the sub-query.
 *
 * @param {string} subQuery The part of the query after "/action:".
 * @return {Promise<Array<CommandPaletteItem>>} A promise resolving to an array of action items.
 */
async function getActionResults( subQuery ) {
	// Fetch both special pages and menu items
	// Use Promise.all to fetch concurrently, though fetchMenuItems is currently synchronous
	const [ specialPages, menuItems ] = await Promise.all( [
		fetchSpecialPages(),
		fetchMenuItems()
	] );

	// Combine the results, filtering out any potential null/undefined items from promises
	// Ensure menu items come first, then special pages.
	// Both lists are already sorted alphabetically.
	const allItems = [ ...menuItems, ...specialPages ].filter( ( item ) => item );

	if ( !subQuery ) {
		return allItems; // Return all combined and sorted items if no subQuery
	}

	const lowerSubQuery = subQuery.toLowerCase();
	// Filter using the helper function
	return allItems.filter( ( item ) => itemMatchesQuery( item, lowerSubQuery ) );
}

/** @type {CommandPaletteCommand} */
module.exports = {
	id: 'action',
	triggers: [ '/action:', '>' ],
	label: mw.message( 'citizen-command-palette-command-action-label' ).text(),
	description: mw.message( 'citizen-command-palette-command-action-description' ).text(),
	getResults: getActionResults,
	/**
	 * Handles selection of an action item result (Special Page or Menu Item).
	 *
	 * @param {CommandPaletteItem} item The selected result item.
	 * @return {CommandPaletteActionResult}
	 */
	onResultSelect( item ) {
		if ( item.url ) {
			return { action: 'navigate', payload: item.url };
		}

		// Fallback
		return { action: 'none' };
	}
};
