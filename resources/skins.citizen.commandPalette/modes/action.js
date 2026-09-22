const { cdxIconSpecialPages, cdxIconPlay } = require( '../icons.json' );
const { getNavigationAction } = require( '../utils/providerActions.js' );
const { defineMode } = require( '../services/defineMode.js' );

/**
 * Creates the action command handler.
 *
 * @param {Document} documentRef The document object for DOM queries.
 * @param {Array<string|[string, string]>} specialPages Every registered special
 *  page, as its canonical name or a [ canonical name, label ] pair.
 * @return {Object} The command handler.
 */
function createActionCommand( documentRef, specialPages ) {
	let specialPageCache = null;
	let menuItemCache = null;

	function getSpecialPages() {
		if ( specialPageCache !== null ) {
			return specialPageCache;
		}

		const items = specialPages.map( ( page ) => {
			const [ realName, alias = realName ] = typeof page === 'string' ? [ page ] : page;
			return {
				id: 'special-' + realName.toLowerCase(),
				type: 'special-page',
				label: alias.replace( /_/g, ' ' ),
				url: mw.util.getUrl( 'Special:' + realName ),
				thumbnailIcon: cdxIconSpecialPages,
				value: '/action:' + realName,
				highlightQuery: true
			};
		} );
		items.sort( ( a, b ) => a.label.localeCompare( b.label ) );
		specialPageCache = items;
		return items;
	}

	function fetchMenuItems() {
		if ( menuItemCache !== null ) {
			return menuItemCache;
		}

		const TARGET_PORTLET_IDS = [
			'p-views', 'p-associated-pages', 'p-cactions', 'p-tb', 'p-personal'
		];

		const allItems = [];
		const seenUrls = new Set();

		TARGET_PORTLET_IDS.forEach( ( portletId ) => {
			const portletElement = documentRef.getElementById( portletId );
			if ( !portletElement ) {
				return;
			}

			const menuLabel = portletElement
				.querySelector( '.citizen-menu__heading' )?.textContent?.trim();
			const links = portletElement
				.querySelectorAll( '.citizen-menu__content-list li a' );

			links.forEach( ( link ) => {
				const listItem = link.closest( 'li' );
				const id = listItem ?
					listItem.id + '-command-palette-item' : '';
				const url = link.getAttribute( 'href' ) || '#';
				const labelElement = link.querySelector( 'span:not([class*="icon"])' );

				if ( !labelElement || seenUrls.has( url ) ) {
					return;
				}

				const label = labelElement.textContent?.trim() || '';
				const description = link.getAttribute( 'title' )
					?.replace( /\s*\[[^\]]*\]\s*$/, '' );

				allItems.push( {
					id: id || 'menuitem-' + label.toLowerCase().replace( /\s+/g, '-' ),
					type: 'menu-item',
					label: label,
					description: description,
					url: url,
					thumbnailIcon: cdxIconPlay,
					value: '/action:' + label,
					highlightQuery: true,
					metadata: menuLabel ? [ { label: menuLabel } ] : undefined
				} );
				seenUrls.add( url );
			} );
		} );

		allItems.sort( ( a, b ) => a.label.localeCompare( b.label ) );
		menuItemCache = allItems;
		return allItems;
	}

	function itemMatchesQuery( item, lowerCaseQuery ) {
		return item.label.toLowerCase().includes( lowerCaseQuery ) ||
			item.id.toLowerCase().includes( lowerCaseQuery );
	}

	async function getActionResults( subQuery ) {
		const allItems = [ ...fetchMenuItems(), ...getSpecialPages() ];

		if ( !subQuery ) {
			return allItems;
		}

		const lowerSubQuery = subQuery.toLowerCase();
		return allItems.filter( ( item ) => itemMatchesQuery( item, lowerSubQuery ) );
	}

	return defineMode( {
		id: 'action',
		triggers: [ '/action:', '>' ],
		label: mw.message( 'citizen-command-palette-command-action-label' ).text(),
		description: mw.message( 'citizen-command-palette-command-action-description' ).text(),
		placeholder: mw.message( 'citizen-command-palette-mode-action-placeholder' ).text(),
		icon: cdxIconSpecialPages,
		compactResults: true,
		help: {
			description: 'citizen-command-palette-mode-action-description-help'
		},
		getResults: getActionResults,
		async onResultSelect( item ) {
			return getNavigationAction( item );
		}
	} );
}

module.exports = createActionCommand;
