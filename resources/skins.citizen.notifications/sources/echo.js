/**
 * Echo data source — the single seam between Citizen's notification panel
 * and the Echo extension. Everything Echo-specific (API module names,
 * parameter shapes, response structure) lives here; the panel UI consumes
 * only the backend-neutral shapes this module returns:
 *
 *   NotificationItem {
 *     id, category, categoryLabel,
 *     read, timestamp (unix seconds), iconUrl,
 *     header (escaped HTML), body (escaped HTML),
 *     primaryUrl, secondaryLinks: [ { url, label } ],
 *     isSummary, count   // summary rows only; absent on real notifications
 *   }
 *   FetchResult { items: NotificationItem[], counts: { total, local, foreign } }
 *
 * Only unread notifications are fetched — the panel shows what is waiting,
 * and Special:Notifications is where the history lives.
 *
 * A summary row stands for unread notifications the user has somewhere else
 * rather than for one notification here — today, Echo's cross-wiki roll-up. It
 * carries no backend id, cannot be marked read, and `count` is how many
 * notifications it speaks for.
 *
 * Category labels (`categoryLabel`) are resolved from the wiki's
 * echo-category-title-<key> messages, fetched in the same request via
 * meta=allmessages so that categories defined by any extension (e.g.
 * Extension:Thanks) are covered without the skin pre-registering each key.
 *
 * `header` and `body` are message content Echo has already parsed/escaped;
 * the panel renders the surrounding structure (icon, links, timestamp) itself.
 * A future notification backend can replace this file by implementing the same
 * `fetch` / `markSeen` / `markRead` / `markAllRead` interface and shapes.
 *
 * @module sources/echo
 */

const SECTIONS = [ 'alert', 'message' ];
const CATEGORY_TITLE_PREFIX = 'echo-category-title-';

// Echo's synthetic "you have unread notifications on other wikis" row. It is
// not a real notification — no primary link, no read state, and a placeholder
// id — so it is normalized separately rather than run through normalizeEntry().
const SUMMARY_TYPE = 'foreign';

// How many notifications to ask for. The panel shows what is waiting, not a
// history, so this is a ceiling nobody normally reaches rather than a page size.
const FETCH_LIMIT = 25;

/**
 * Normalize one Echo list entry (notformat=model) into a backend-neutral
 * NotificationItem.
 *
 * @param {Object} entry raw Echo notification (model format)
 * @param {Object} labels category key -> localized title
 * @return {Object} NotificationItem
 */
function normalizeEntry( entry, labels ) {
	const model = entry[ '*' ] || {};
	const links = model.links || {};
	const primary = links.primary && links.primary.url ? links.primary : null;
	const utcunix = entry.timestamp && entry.timestamp.utcunix;
	const category = entry.category || '';
	return {
		id: entry.id,
		// Notification category key (e.g. 'mention', 'user-rights').
		category: category,
		// Localized category title; blank if the wiki registers no message
		// for this category.
		categoryLabel: labels[ category ] || '',
		// Echo only sets `read` (a timestamp) on read notifications.
		read: !!entry.read,
		timestamp: utcunix ? Number( utcunix ) : 0,
		iconUrl: model.iconUrl || '',
		header: model.header || '',
		body: model.body || '',
		primaryUrl: primary ? primary.url : '',
		secondaryLinks: ( links.secondary || [] )
			.filter( ( link ) => link && link.url )
			.map( ( link ) => ( { url: link.url, label: link.label } ) )
	};
}

/**
 * Link target for a cross-wiki summary. Echo hands back each wiki's article
 * path with a `$1` placeholder; anything not shaped like that falls back to the
 * local special page, which is the only surface with a cross-wiki view.
 *
 * @param {Object} source `sources` entry for one wiki
 * @return {string}
 */
function foreignNotificationsUrl( source ) {
	const base = ( source && source.base ) || '';
	if ( !/^https?:\/\/\S*\$1/.test( base ) ) {
		return mw.util.getUrl( 'Special:Notifications' );
	}
	// split/join rather than replace: '$1' is special in a replacement string.
	return base.split( '$1' ).join( 'Special:Notifications' );
}

/**
 * Normalize Echo's synthetic cross-wiki row into a summary NotificationItem.
 *
 * @param {Object} entry raw Echo notification of type 'foreign'
 * @return {Object} NotificationItem carrying isSummary and count
 */
function normalizeSummary( entry ) {
	const model = entry[ '*' ] || {};
	const sources = entry.sources || {};
	const wikis = Object.keys( sources );
	const utcunix = entry.timestamp && entry.timestamp.utcunix;
	return {
		// Echo gives the summary row id -1. A stable string keeps it clear of
		// the numeric ids, and means it can never address a real notification
		// if it ever reached markRead.
		id: 'summary-foreign',
		isSummary: true,
		// How many notifications on other wikis this row stands for.
		count: Number( entry.count || 0 ),
		// Echo files this row under a 'foreign' pseudo-category that is not a
		// registered category and resolves to 'other', so a label here would
		// read "Other". Leave it off rather than mislabel it.
		category: '',
		categoryLabel: '',
		// It stands for notifications on other wikis, which this panel cannot
		// clear, so it is always unread.
		read: false,
		timestamp: utcunix ? Number( utcunix ) : 0,
		iconUrl: model.iconUrl || '',
		// Echo's own localized strings: "More alerts from another wiki", with
		// the wiki names as the body.
		header: model.header || '',
		body: model.body || '',
		// Echo returns no primary link for this row. With one foreign wiki, go
		// straight to its notifications; with several, the local special page.
		primaryUrl: wikis.length === 1 ?
			foreignNotificationsUrl( sources[ wikis[ 0 ] ] ) :
			mw.util.getUrl( 'Special:Notifications' ),
		secondaryLinks: []
	};
}

/**
 * Create an Echo-backed notification source.
 *
 * @param {Function} ApiConstructor `mw.Api` constructor (injected for testability)
 * @return {{ fetch: Function, markSeen: Function, markRead: Function, markAllRead: Function }}
 */
function createEchoSource( ApiConstructor ) {
	const api = new ApiConstructor();

	/**
	 * Fetch the notifications waiting for the user, newest first, plus the
	 * unread counts.
	 *
	 * @return {Promise<{ items: Object[], counts: Object }>}
	 */
	function fetch() {
		return api.get( {
			action: 'query',
			// Fetch the notifications and every echo-category-title-* message
			// in one request, so extension-defined categories get a label too.
			meta: 'notifications|allmessages',
			notsections: SECTIONS.join( '|' ),
			// 'model' returns raw structured data (header, body, icon, links)
			// so the panel renders its own markup, instead of the deprecated
			// pre-rendered 'flyout'/'html' formats.
			notformat: 'model',
			// The panel shows what is waiting, so read notifications are left
			// to Special:Notifications. This roughly halves the payload for a
			// typical user, whose unread are a handful among a long history.
			notfilter: '!read',
			notlimit: FETCH_LIMIT,
			notprop: 'list|count',
			// Ask Echo for its "N unread on other wikis" row, and for
			// cross-wiki-inclusive counts — the same figure the server already
			// renders on the bell. Echo only registers this parameter where
			// $wgEchoCrossWikiNotifications is on; elsewhere it is ignored with
			// a harmless API warning, which is what Echo's own client does too.
			// Ungrouped, Echo emits ONE merged row covering every section
			// rather than one per section.
			notcrosswikisummary: 1,
			// All category titles, parsed (resolves PLURAL etc.), in the
			// viewer's language.
			amprefix: CATEGORY_TITLE_PREFIX,
			amenableparser: 1,
			amlang: mw.config.get( 'wgUserLanguage' ) || undefined
		} ).then( ( data ) => {
			const query = ( data && data.query ) || {};
			const notifications = query.notifications || {};
			const labels = {};
			( query.allmessages || [] ).forEach( ( message ) => {
				labels[ message.name.replace( CATEGORY_TITLE_PREFIX, '' ) ] =
					( message[ '*' ] || '' ).trim();
			} );

			const items = [];
			const summaries = [];
			( notifications.list || [] ).forEach( ( entry ) => {
				if ( entry.type === SUMMARY_TYPE ) {
					summaries.push( normalizeSummary( entry ) );
				} else {
					items.push( normalizeEntry( entry, labels ) );
				}
			} );

			// rawcount covers other wikis too once notcrosswikisummary is set,
			// so the local figure is what is left after the summary's share.
			const total = Number( notifications.rawcount || 0 );
			const foreign = summaries.reduce( ( sum, s ) => sum + s.count, 0 );
			const counts = {
				total: total,
				foreign: foreign,
				local: Math.max( 0, total - foreign )
			};

			// Newest first. Everything here is unread, so there is no read
			// state left to sort on.
			items.sort( ( a, b ) => b.timestamp - a.timestamp );

			// The cross-wiki summary stays pinned above the list. Echo adds it
			// after notlimit has been applied, so left to the sort it could
			// sink below the limit and out of view.
			return { items: summaries.concat( items ), counts };
		} );
	}

	/**
	 * Reset the "seen" marker so the badge highlight clears. Items remain
	 * unread until explicitly read.
	 *
	 * @param {string} type 'alert' | 'message' | 'all'
	 * @return {Promise<void>}
	 */
	function markSeen( type ) {
		return api.postWithToken( 'csrf', {
			action: 'echomarkseen',
			type: type
		} ).then( () => undefined );
	}

	/**
	 * Mark specific notifications as read.
	 *
	 * @param {number[]} ids
	 * @return {Promise<void>}
	 */
	function markRead( ids ) {
		if ( !ids || ids.length === 0 ) {
			return Promise.resolve();
		}
		return api.postWithToken( 'csrf', {
			action: 'echomarkread',
			list: ids.join( '|' )
		} ).then( () => undefined );
	}

	/**
	 * Mark every notification read.
	 *
	 * @return {Promise<void>}
	 */
	function markAllRead() {
		return api.postWithToken( 'csrf', {
			action: 'echomarkread',
			all: true
		} ).then( () => undefined );
	}

	return { fetch, markSeen, markRead, markAllRead };
}

module.exports = { createEchoSource };
