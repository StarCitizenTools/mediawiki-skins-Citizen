const {
	cdxIconArticle,
	cdxIconArticleSearch,
	cdxIconEdit,
	cdxIconHistory,
	cdxIconPlay,
	cdxIconSearch,
	cdxIconSpecialPages
} = require( '../icons.json' );
const destinationKey = require( './destinationKey.js' );
const parseWikiLink = require( './parseWikiLink.js' );
const resolveSpecialPage = require( './resolveSpecialPage.js' );
const { editAction } = require( './providerActions.js' );

/**
 * A place Recent remembers. Only what names the place is kept; how it looks
 * is rebuilt each time Recent is shown.
 *
 * @typedef {Object} RecentEntry
 * @property {'page'|'special'|'go'|'search'|'edit'|'revision'|'link'} kind
 * @property {string} key The place's identity, as `destinationKey` gives it.
 *   Computed when the entry is saved, while dismissing recomputes it from the
 *   row's link, so a change to `destinationKey`'s rules or to the wiki's paths
 *   leaves older entries undismissable.
 * @property {string} label
 * @property {string} url The link the reader actually opened.
 * @property {number} savedAt
 * @property {string} [context] For a link that acts on a wiki page, that page.
 */

const ICONS = {
	page: cdxIconArticle,
	special: cdxIconSpecialPages,
	go: cdxIconSearch,
	search: cdxIconArticleSearch,
	edit: cdxIconEdit,
	revision: cdxIconHistory,
	link: cdxIconPlay
};

const DESCRIPTIONS = {
	search: 'citizen-command-palette-queryaction-fulltext-search-description',
	edit: 'citizen-command-palette-queryaction-page-edit-description'
};

/**
 * @param {string} url
 * @return {URL|null}
 */
function toUrl( url ) {
	try {
		return new URL( url, window.location.href );
	} catch ( e ) {
		return null;
	}
}

/**
 * Whether Recent may store a link and render it back as a row's link: one
 * that opens a page over http or https, never a fragment or a script.
 *
 * @param {string|undefined} url
 * @return {url is string}
 */
function isPlaceLink( url ) {
	if ( !url || url.startsWith( '#' ) ) {
		return false;
	}
	const link = toUrl( url );
	return !!link && ( link.protocol === 'http:' || link.protocol === 'https:' );
}

/**
 * The kind of place a link opens, and what names it.
 *
 * @param {URL} link
 * @return {{kind: RecentEntry['kind'], name?: string, context?: string}}
 */
function placeOf( link ) {
	const parsed = parseWikiLink( link );
	if ( !parsed ) {
		return { kind: 'link' };
	}
	const { title, params } = parsed;
	const name = title.getPrefixedText();
	const special = resolveSpecialPage( title );
	if ( special && special.name === 'Search' && params.get( 'search' ) ) {
		const query = String( params.get( 'search' ) );
		// Special:Search treats the parameter's presence, whatever its value,
		// as a request for full-text results.
		const fulltext = params.has( 'fulltext' );
		params.delete( 'search' );
		params.delete( 'fulltext' );
		if ( !params.toString() ) {
			return { kind: fulltext ? 'search' : 'go', name: query };
		}
		return { kind: 'link', context: name };
	}
	if ( !params.toString() ) {
		if ( title.getNamespaceId() === -1 ) {
			return { kind: 'special', name: special ? special.title.getPrefixedText() : name };
		}
		return { kind: 'page', name };
	}
	const editsWithAction = params.get( 'action' ) === 'edit';
	const editsWithEditor = params.get( 'veaction' ) === 'edit' ||
		params.get( 'veaction' ) === 'editsource';
	if ( editsWithAction || editsWithEditor ) {
		if ( editsWithAction ) {
			params.delete( 'action' );
		}
		if ( editsWithEditor ) {
			params.delete( 'veaction' );
		}
		params.delete( 'section' );
		if ( !params.toString() ) {
			return { kind: 'edit', name };
		}
	} else if ( params.has( 'oldid' ) || params.has( 'diff' ) ) {
		params.delete( 'oldid' );
		params.delete( 'diff' );
		if ( !params.toString() ) {
			return { kind: 'revision', name };
		}
	}
	return { kind: 'link', context: name };
}

/**
 * The entry for a place a reader opened, or null when it is not a place
 * Recent can take them back to.
 *
 * @param {string|undefined} url The link the reader actually opened.
 * @param {{label?: string, url?: string}} row The row they opened it from.
 * @param {number} savedAt
 * @return {RecentEntry|null}
 */
function entryFromLink( url, row, savedAt ) {
	if ( !isPlaceLink( url ) ) {
		return null;
	}
	const place = placeOf( /** @type {URL} */ ( toUrl( url ) ) );
	let label = place.name;
	if ( place.kind === 'link' ||
		( ( place.kind === 'page' || place.kind === 'special' ) && row.url === url && row.label )
	) {
		label = row.label;
	}
	if ( !label ) {
		return null;
	}
	/** @type {RecentEntry} */
	const entry = {
		kind: place.kind,
		key: destinationKey( { id: '', url } ),
		label,
		url,
		savedAt
	};
	if ( place.context ) {
		entry.context = place.context;
	}
	return entry;
}

/**
 * The palette row that shows an entry, built in the current language.
 *
 * @param {RecentEntry} entry
 * @return {import('../types.js').CommandPaletteItem}
 */
function rowFromEntry( entry ) {
	/** @type {import('../types.js').CommandPaletteItem} */
	const row = {
		id: `citizen-command-palette-recent-${ encodeURIComponent( entry.key ) }`,
		type: entry.kind,
		label: entry.label,
		url: entry.url,
		thumbnailIcon: ICONS[ entry.kind ] || cdxIconPlay,
		actions: []
	};
	const descriptionKey = DESCRIPTIONS[ entry.kind ];
	if ( descriptionKey ) {
		// eslint-disable-next-line mediawiki/msg-doc -- the keys are the literals in DESCRIPTIONS
		row.description = mw.msg( descriptionKey );
	} else if ( entry.kind === 'link' && entry.context ) {
		row.description = entry.context;
	}
	if ( entry.kind === 'page' ) {
		const link = toUrl( entry.url );
		const parsed = link && parseWikiLink( link );
		if ( parsed && parsed.title.getNamespaceId() >= 0 ) {
			row.actions = [ editAction( parsed.title.getPrefixedText() ) ];
		}
	}
	return row;
}

/**
 * How directly an entry names its place. A go names only the query that
 * led there, so another entry for the same place wins over it.
 *
 * @param {RecentEntry} entry
 * @return {number}
 */
function rankOf( entry ) {
	return entry.kind === 'go' ? 0 : 1;
}

module.exports = {
	isPlaceLink,
	entryFromLink,
	rowFromEntry,
	rankOf
};
