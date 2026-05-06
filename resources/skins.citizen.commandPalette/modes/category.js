/**
 * Command palette mode for searching and exploring categories.
 *
 * States:
 *  - root, empty input: lists the current page's categories from
 *    mw.config.get('wgCategories'), no API call.
 *  - root, typed query: prefixsearch on the Category namespace.
 *  - drilled, empty input: categorymembers of the deepest stack entry,
 *    subcategories first then pages.
 *  - drilled, typed query: same fetch, filtered client-side by
 *    case-insensitive title startsWith.
 */
const { cdxIconTag, cdxIconArticle } = require( '../icons.json' );
const config = require( '../config.json' );

const CATEGORY_NS_ID = 14;
const CATEGORY_NS_NAME = 'Category';

/**
 * Strip the "Category:" prefix from a title.
 *
 * @param {string} title
 * @return {string}
 */
function stripPrefix( title ) {
	if ( !title ) {
		return '';
	}
	const prefix = CATEGORY_NS_NAME + ':';
	return title.startsWith( prefix ) ? title.slice( prefix.length ) : title;
}

/**
 * Build a CommandPaletteItem for a category result (drillable).
 *
 * @param {string} bareTitle Title without the Category: prefix.
 * @return {Object}
 */
function adaptCategoryItem( bareTitle ) {
	// No url is set on category results: drilling, not navigation, is the
	// primary action. Setting url would render the item as an <a> tag and
	// the browser would follow it on mouse click before the Vue handler
	// could fire pushModeContext.
	return {
		id: 'citizen-command-palette-item-category-' + bareTitle,
		thumbnailIcon: cdxIconTag,
		type: 'category',
		label: bareTitle,
		value: bareTitle,
		highlightQuery: true
	};
}

/**
 * Build a CommandPaletteItem for a member page (terminal).
 *
 * @param {{title: string}} apiPage
 * @return {Object}
 */
function adaptPageItem( apiPage ) {
	return {
		id: 'citizen-command-palette-item-categorymember-' + apiPage.title,
		thumbnailIcon: cdxIconArticle,
		type: 'page',
		label: apiPage.title,
		url: mw.util.getUrl( apiPage.title ),
		highlightQuery: true
	};
}

/**
 * Filter results client-side by case-insensitive title prefix.
 *
 * @param {Array<Object>} items
 * @param {string} subQuery
 * @return {Array<Object>}
 */
function filterByPrefix( items, subQuery ) {
	if ( !subQuery ) {
		return items;
	}
	const lower = subQuery.toLowerCase();
	return items.filter( ( item ) => item.label.toLowerCase().startsWith( lower ) );
}

/**
 * Returns the current page's categories from MediaWiki config.
 *
 * @return {Array<Object>}
 */
function getCurrentPageCategoryItems() {
	const cats = mw.config.get( 'wgCategories' ) || [];
	return cats.map( adaptCategoryItem );
}

/**
 * Factory for the category mode.
 *
 * @param {Function} ApiConstructor mw.Api constructor.
 * @return {Object}
 */
function createCategoryMode( ApiConstructor ) {
	async function searchCategories( subQuery, signal ) {
		const api = new ApiConstructor();
		try {
			const data = await api.get( {
				action: 'query',
				format: 'json',
				list: 'prefixsearch',
				pssearch: subQuery,
				psnamespace: CATEGORY_NS_ID,
				pslimit: 10,
				maxage: config.wgSearchSuggestCacheExpiry,
				smaxage: config.wgSearchSuggestCacheExpiry
			}, { signal } );

			const hits = data?.query?.prefixsearch || [];
			return hits.map( ( hit ) => adaptCategoryItem( stripPrefix( hit.title ) ) );
		} catch ( error ) {
			if ( error && error.name === 'AbortError' ) {
				return [];
			}
			mw.log.error( '[commandPalette] Category prefixsearch failed:', error );
			return [];
		}
	}

	async function fetchMembers( bareTitle, signal ) {
		const api = new ApiConstructor();
		try {
			const data = await api.get( {
				action: 'query',
				format: 'json',
				list: 'categorymembers',
				cmtitle: CATEGORY_NS_NAME + ':' + bareTitle,
				cmtype: 'subcat|page',
				cmlimit: 50,
				maxage: config.wgSearchSuggestCacheExpiry,
				smaxage: config.wgSearchSuggestCacheExpiry
			}, { signal } );

			const members = data?.query?.categorymembers || [];
			const subcats = [];
			const pages = [];
			members.forEach( ( m ) => {
				if ( m.ns === CATEGORY_NS_ID ) {
					subcats.push( adaptCategoryItem( stripPrefix( m.title ) ) );
				} else {
					pages.push( adaptPageItem( m ) );
				}
			} );
			return subcats.concat( pages );
		} catch ( error ) {
			if ( error && error.name === 'AbortError' ) {
				return [];
			}
			mw.log.error( '[commandPalette] Category members fetch failed:', error );
			return [];
		}
	}

	async function getResults( subQuery, signal, _tokens, modeContext ) {
		const context = Array.isArray( modeContext ) ? modeContext : [];
		const drilled = context.length > 0 ? context[ context.length - 1 ] : null;

		if ( !drilled ) {
			if ( !subQuery ) {
				return getCurrentPageCategoryItems();
			}
			return await searchCategories( subQuery, signal );
		}

		const members = await fetchMembers( drilled.title, signal );
		return filterByPrefix( members, subQuery );
	}

	function onResultSelect( item ) {
		if ( item.type === 'category' ) {
			return { action: 'pushModeContext', payload: { title: item.value } };
		}
		if ( item.url ) {
			return { action: 'navigate', payload: item.url };
		}
		return { action: 'none' };
	}

	function headerLabel( modeContext ) {
		const root = mw.message( 'citizen-command-palette-mode-category-breadcrumb-root' ).text();
		const segments = [ root ].concat( ( modeContext || [] ).map( ( c ) => c.title ) );
		return segments.join( ' / ' );
	}

	return {
		id: 'category',
		triggers: [ '/cat:', '#' ],
		label: mw.message( 'citizen-command-palette-command-category-label' ).text(),
		description: mw.message( 'citizen-command-palette-command-category-description' ).text(),
		placeholder: mw.message( 'citizen-command-palette-mode-category-placeholder' ).text(),
		icon: cdxIconTag,
		getResults,
		onResultSelect,
		headerLabel
	};
}

module.exports = createCategoryMode;
