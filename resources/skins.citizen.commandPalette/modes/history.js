/**
 * Command palette mode for browsing the current page's revision history.
 *
 * - Off-article (wgArticleId is missing or 0): empty state, no API call.
 * - Empty input on an article: lists up to 50 most recent revisions.
 * - Typed input: client-side substring filter against editor name OR edit
 *   summary, case-insensitive.
 * - Default click: diff vs previous revision (`?diff=prev&oldid=<revid>`),
 *   or view at revision for the page's first-ever edit (parentid === 0,
 *   which has no parent in the database — distinct from "the oldest in
 *   the 50-rev window," which may still have a real parent outside it).
 */
const { cdxIconHistory, cdxIconArticle } = require( '../icons.json' );
const config = require( '../config.json' );

const REV_LIMIT = 50;

/**
 * Pull the revisions array out of the API response shape.
 *
 * @param {Object} data
 * @return {Array<Object>}
 */
function extractRevisions( data ) {
	const pages = ( data && data.query && data.query.pages ) || {};
	const firstPage = Object.values( pages )[ 0 ];
	return ( firstPage && firstPage.revisions ) || [];
}

const MS_PER_MIN = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Format a revision timestamp for human scanning.
 *
 * Recent edits get a compact relative form — "now", "5m", "3h", "2d" —
 * inspired by how Git, Slack, and Twitter render commit/message ages.
 * The "ago" suffix is omitted because the surrounding context (a
 * revision list) makes the past tense implicit, and language-neutral
 * abbreviations stay short across locales. Older edits get a compact
 * absolute date ("Apr 28") via Intl.DateTimeFormat, which localizes
 * for free.
 *
 * @param {string} timestamp ISO 8601 string from the API
 * @return {string}
 */
function formatTimestamp( timestamp ) {
	const then = new Date( timestamp );
	const diffMs = Date.now() - then.getTime();

	if ( diffMs >= 0 && diffMs < 7 * MS_PER_DAY ) {
		if ( diffMs < MS_PER_MIN ) {
			return 'now';
		}
		if ( diffMs < MS_PER_HOUR ) {
			return Math.floor( diffMs / MS_PER_MIN ) + 'm';
		}
		if ( diffMs < MS_PER_DAY ) {
			return Math.floor( diffMs / MS_PER_HOUR ) + 'h';
		}
		return Math.floor( diffMs / MS_PER_DAY ) + 'd';
	}

	const sameYear = then.getFullYear() === new Date().getFullYear();
	return then.toLocaleDateString( undefined, sameYear ?
		{ month: 'short', day: 'numeric' } :
		{ year: 'numeric', month: 'short', day: 'numeric' } );
}

/**
 * Convert API-returned HTML (e.g. tag displaynames, which may carry
 * markup from per-wiki MediaWiki:Tag-* messages) to plain text. We use
 * the browser's parser via a detached div, then read textContent — same
 * approach Vue uses internally for v-text. Avoids a regex-based stripper
 * and any XSS risk if the result is ever rendered as innerHTML elsewhere.
 *
 * @param {string} html
 * @return {string}
 */
function htmlToText( html ) {
	const div = document.createElement( 'div' );
	div.innerHTML = html;
	return ( div.textContent || '' ).trim();
}

/**
 * Strip the auto-generated section prefix MediaWiki prepends to
 * section-edit summaries. The prefix has the form slash-star-space
 * Section name space-star-slash. Returns the section name and the
 * remaining comment text. If no prefix is present, section is null
 * and the comment is returned unchanged.
 *
 * @param {string} comment
 * @return {{section: string|null, text: string}}
 */
function parseSectionComment( comment ) {
	// String operations only — no regex. Earlier regex versions kept
	// tripping S5852 on overlapping quantifiers. indexOf + slice + trim
	// is O(n), no backtracking possible. MediaWiki's auto-generated
	// section prefix is always at position 0, so no leading-whitespace
	// tolerance is needed.
	const input = comment || '';
	if ( !input.startsWith( '/*' ) ) {
		return { section: null, text: input };
	}
	const closeIdx = input.indexOf( '*/', 2 );
	if ( closeIdx === -1 ) {
		return { section: null, text: input };
	}
	const section = input.slice( 2, closeIdx ).trim();
	if ( section === '' ) {
		return { section: null, text: input };
	}
	let textStart = closeIdx + 2;
	if ( input.charAt( textStart ) === ' ' ) {
		textStart++;
	}
	return { section, text: input.slice( textStart ) };
}

/**
 * Compute the byte-delta string between two consecutive revisions.
 * Returns null if no parent (oldest in window).
 *
 * @param {Object} rev
 * @param {Object|undefined} parentRev The chronologically previous revision (next in newest-first array)
 * @return {string|null}
 */
function formatByteDelta( rev, parentRev ) {
	if ( !parentRev ) {
		return null;
	}
	const delta = ( rev.size || 0 ) - ( parentRev.size || 0 );
	if ( delta > 0 ) {
		return '+' + delta;
	}
	if ( delta < 0 ) {
		// Use Unicode minus (U+2212) for typographic correctness.
		return '−' + Math.abs( delta );
	}
	return '±0';
}

/**
 * Build the metadata array for a revision row.
 *
 * @param {Object} rev
 * @param {Object|undefined} parentRev
 * @param {string|null} section Section name extracted from the comment, or null
 * @param {Map<string,string>|null} tagDisplayNames Resolved tag display names, or null when unavailable
 * @return {Array<Object>}
 */
function buildMetadata( rev, parentRev, section, tagDisplayNames ) {
	const meta = [];
	const delta = formatByteDelta( rev, parentRev );
	if ( delta !== null ) {
		const item = { label: delta };
		// `±0` (no-op edit) deliberately carries no status — neutral
		// styling matches the meaning of an edit that didn't change size.
		if ( delta.startsWith( '+' ) ) {
			item.status = 'success';
		} else if ( delta.startsWith( '−' ) ) {
			item.status = 'error';
		}
		meta.push( item );
	}
	if ( rev.minor ) {
		meta.push( { label: 'm' } );
	}
	if ( section ) {
		meta.push( { label: section } );
	}
	if ( Array.isArray( rev.tags ) ) {
		rev.tags.forEach( ( tag ) => {
			const displayName = tagDisplayNames && tagDisplayNames.get( tag );
			meta.push( { label: displayName || tag } );
		} );
	}
	return meta;
}

/**
 * Adapt one revision API entry to a CommandPaletteItem.
 *
 * @param {Object} rev
 * @param {Object|undefined} parentRev The chronologically previous revision (or undefined for the oldest)
 * @param {string} title The current page title (passed in to keep the function pure)
 * @param {Map<string,string>|null} tagDisplayNames Resolved tag display names, or null when unavailable
 * @return {Object}
 */
function adaptRevisionItem( rev, parentRev, title, tagDisplayNames ) {
	const { section, text } = parseSectionComment( rev.comment );
	const summary = text.trim() !== '' ?
		text :
		mw.message( 'citizen-command-palette-mode-history-no-summary-text' ).text();

	return {
		id: 'citizen-command-palette-item-revision-' + rev.revid,
		thumbnailIcon: cdxIconHistory,
		type: 'revision',
		label: formatTimestamp( rev.timestamp ) + ' · ' + rev.user,
		description: summary,
		metadata: buildMetadata( rev, parentRev, section, tagDisplayNames ),
		highlightQuery: true,
		actions: [
			{
				id: 'view',
				label: mw.message( 'citizen-command-palette-mode-history-action-view' ).text(),
				icon: cdxIconArticle,
				url: mw.util.getUrl( title, { oldid: rev.revid } )
			}
		],
		// Internal — used by onResultSelect. Not part of the public
		// CommandPaletteItem shape; consumers should ignore these.
		revid: rev.revid,
		parentid: rev.parentid,
		value: title
	};
}

/**
 * Filter revisions by case-insensitive substring match against user OR comment.
 *
 * @param {Array<Object>} revisions
 * @param {string} subQuery
 * @return {Array<Object>}
 */
function filterRevisions( revisions, subQuery ) {
	if ( !subQuery ) {
		return revisions;
	}
	const lower = subQuery.toLowerCase();
	return revisions.filter( ( rev ) => {
		const userMatch = ( rev.user || '' ).toLowerCase().includes( lower );
		const commentMatch = ( rev.comment || '' ).toLowerCase().includes( lower );
		return userMatch || commentMatch;
	} );
}

/**
 * Factory for the revision history mode.
 *
 * @param {Function} ApiConstructor mw.Api constructor.
 * @return {Object}
 */
function createHistoryMode( ApiConstructor ) {
	// Cached map of MW tag id → display-name text. Populated lazily on the
	// first getResults() call and shared across calls. The wiki's tag list
	// rarely changes, so one fetch per session is plenty. Failures or
	// aborts leave it null so the next call retries; an empty Map (wiki
	// with no tags) is a successful cache.
	let tagDisplayNames = null;

	async function fetchRevisions( title, signal ) {
		const api = new ApiConstructor();
		try {
			const data = await api.get( {
				action: 'query',
				format: 'json',
				prop: 'revisions',
				titles: title,
				rvlimit: REV_LIMIT,
				rvprop: 'ids|timestamp|user|comment|size|flags|tags',
				maxage: config.wgSearchSuggestCacheExpiry,
				smaxage: config.wgSearchSuggestCacheExpiry
			}, { signal } );
			return extractRevisions( data );
		} catch ( error ) {
			if ( error && error.name !== 'AbortError' ) {
				mw.log.error( '[commandPalette] History fetch failed:', error );
			}
			return [];
		}
	}

	async function fetchTagDisplayNames( signal ) {
		if ( tagDisplayNames !== null ) {
			return tagDisplayNames;
		}
		const api = new ApiConstructor();
		try {
			const data = await api.get( {
				action: 'query',
				format: 'json',
				list: 'tags',
				tgprop: 'displayname',
				tglimit: 'max',
				maxage: config.wgSearchSuggestCacheExpiry,
				smaxage: config.wgSearchSuggestCacheExpiry
			}, { signal } );
			const tags = ( data && data.query && data.query.tags ) || [];
			const map = new Map();
			tags.forEach( ( tag ) => {
				if ( tag.name && tag.displayname ) {
					map.set( tag.name, htmlToText( tag.displayname ) );
				}
			} );
			tagDisplayNames = map;
			return map;
		} catch ( error ) {
			if ( error && error.name !== 'AbortError' ) {
				mw.log.error( '[commandPalette] Tag display-name fetch failed:', error );
			}
			return new Map();
		}
	}

	async function getResults( subQuery, signal ) {
		const articleId = mw.config.get( 'wgArticleId' );
		if ( !articleId ) {
			return [];
		}
		const title = mw.config.get( 'wgPageName' );
		const [ revisions, tagMap ] = await Promise.all( [
			fetchRevisions( title, signal ),
			fetchTagDisplayNames( signal )
		] );
		const filtered = filterRevisions( revisions, subQuery );
		return filtered.map( ( rev, idx ) => {
			// `parentRev` is the chronologically previous revision. Since the
			// API returns newest-first, that's the next element in the array.
			// Note: lookup happens against the FILTERED array — if a revision's
			// true parent was filtered out, its delta will be computed against
			// the wrong neighbour. For filter use, the delta is approximate;
			// the unfiltered case is exact.
			const parentRev = filtered[ idx + 1 ];
			return adaptRevisionItem( rev, parentRev, title, tagMap );
		} );
	}

	function onResultSelect( item ) {
		const title = item.value || mw.config.get( 'wgPageName' );
		if ( !item.parentid ) {
			return {
				action: 'navigate',
				payload: mw.util.getUrl( title, { oldid: item.revid } )
			};
		}
		return {
			action: 'navigate',
			payload: mw.util.getUrl( title, { diff: 'prev', oldid: item.revid } )
		};
	}

	return {
		id: 'history',
		triggers: [ '/hist:', '!' ],
		label: mw.message( 'citizen-command-palette-command-history-label' ).text(),
		description: mw.message( 'citizen-command-palette-command-history-description' ).text(),
		placeholder: mw.message( 'citizen-command-palette-mode-history-placeholder' ).text(),
		icon: cdxIconHistory,
		compactResults: true,
		emptyState: {
			title: mw.message( 'citizen-command-palette-mode-history-empty-title' ).text(),
			description: mw.message( 'citizen-command-palette-mode-history-empty-description' ).text(),
			icon: cdxIconHistory
		},
		noResults() {
			return {
				title: mw.message( 'citizen-command-palette-mode-history-noresults-title' ).text(),
				description: mw.message( 'citizen-command-palette-mode-history-noresults-description' ).text(),
				icon: cdxIconHistory
			};
		},
		help: {
			description: 'citizen-command-palette-mode-history-description-help'
		},
		getResults,
		onResultSelect
	};
}

module.exports = createHistoryMode;
