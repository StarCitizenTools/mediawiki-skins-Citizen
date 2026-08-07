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
 *     primaryUrl, secondaryLinks: [ { url, label } ]
 *   }
 *   Wiki { id, name, url, apiUrl, timestamp }  — another wiki with something waiting
 *   FetchResult {
 *     items: NotificationItem[],
 *     counts: { total, local, foreign },
 *     wikis: Wiki[],
 *     seenTime: number,      — how far the "seen" marker reaches, unix seconds
 *     newestWaiting: number  — newest thing waiting, unix seconds; 0 if nothing
 *   }
 *
 * `seenTime` and `newestWaiting` exist so the panel can tell whether marking
 * seen would change anything, and skip the request when it would not.
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
// not a notification at all — no primary link, no read state, a placeholder id
// — so it is read for the wiki list it carries and never enters `items`.
const SUMMARY_TYPE = 'foreign';

// How many notifications to ask for. The panel shows what is waiting, not a
// history, so this is a ceiling nobody normally reaches rather than a page size.
const FETCH_LIMIT = 25;

// How many notifications to preview from another wiki. Five rows fill about
// one view of the panel, so one wiki cannot crowd the others out, and the
// wiki's own page is one click away for the rest.
const FOREIGN_LIMIT = 5;

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
 * Parse an ISO 8601 instant into unix seconds, so seen times and notification
 * timestamps can be compared as plain numbers.
 *
 * @param {string} iso
 * @return {number} 0 when absent or unparseable
 */
function toUnixSeconds( iso ) {
	const ms = Date.parse( iso );
	return isNaN( ms ) ? 0 : Math.floor( ms / 1000 );
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
 * Turn Echo's synthetic cross-wiki row into the list of wikis behind it.
 *
 * Echo reports one total across every wiki, not a count each, so a wiki knows
 * its name, its address and when it last had activity — but not how much is
 * waiting. That arrives only when the wiki itself is asked.
 *
 * @param {Object} entry raw Echo notification of type 'foreign'
 * @return {Array<{ id: string, name: string, url: string, timestamp: number }>}
 *   Wikis, most recently active first.
 */
function normalizeWikis( entry ) {
	const sources = ( entry && entry.sources ) || {};
	return Object.keys( sources )
		.map( ( id ) => {
			const source = sources[ id ];
			return {
				id: id,
				name: source.title || id,
				url: foreignNotificationsUrl( source ),
				// That wiki's api.php, for previewing what is waiting there.
				apiUrl: source.url || '',
				timestamp: toUnixSeconds( source.ts )
			};
		} )
		.sort( ( a, b ) => b.timestamp - a.timestamp );
}

/**
 * Create an Echo-backed notification source.
 *
 * @param {Function} ApiConstructor `mw.Api` constructor (injected for testability)
 * @param {Function} [ForeignApiConstructor] `mw.ForeignApi` constructor, used to
 *   preview another wiki's notifications straight from the browser
 * @return {{ fetch: Function, fetchWiki: Function, markSeen: Function,
 *   markRead: Function, markAllRead: Function }}
 */
function createEchoSource( ApiConstructor, ForeignApiConstructor ) {
	const api = new ApiConstructor();
	// Category titles from the last fetch. Categories are registered by
	// extensions, not per wiki, so the local labels serve another wiki's
	// notifications too and save it a second request.
	let categoryLabels = {};

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
			// seenTime rides this request, so the panel can tell whether Echo's
			// marker already covers everything waiting and skip re-marking it.
			notprop: 'list|count|seenTime',
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
			categoryLabels = labels;

			const items = [];
			let rollup = null;
			( notifications.list || [] ).forEach( ( entry ) => {
				if ( entry.type === SUMMARY_TYPE ) {
					rollup = entry;
				} else {
					items.push( normalizeEntry( entry, labels ) );
				}
			} );

			// rawcount covers other wikis too once notcrosswikisummary is set,
			// so the local figure is what is left after their share.
			const total = Number( notifications.rawcount || 0 );
			const foreign = rollup ? Number( rollup.count || 0 ) : 0;
			const counts = {
				total: total,
				foreign: foreign,
				local: Math.max( 0, total - foreign )
			};

			// Newest first. Everything here is unread, so there is no read
			// state left to sort on.
			items.sort( ( a, b ) => b.timestamp - a.timestamp );

			const wikis = rollup ? normalizeWikis( rollup ) : [];

			// Echo keeps a seen time per section and treats the older of the
			// two as the marker for 'all', so that is what has to cover the
			// newest thing waiting.
			const seen = notifications.seenTime || {};
			const seenTime = Math.min(
				toUnixSeconds( seen.alert ),
				toUnixSeconds( seen.message )
			);

			// What the marker has to reach past to be worth re-setting. Only
			// unread notifications count: Echo's own badge gates its unseen
			// state on the unread count and the last unread timestamp, so a
			// read one can never leave the badge flagged. Other wikis are
			// included because their rollup rides the same badge.
			const newestWaiting = Math.max(
				items.length ? items[ 0 ].timestamp : 0,
				wikis.reduce( ( max, wiki ) => Math.max( max, wiki.timestamp ), 0 )
			);

			return { items, counts, wikis, seenTime, newestWaiting };
		} );
	}

	/**
	 * Preview what is waiting on another wiki, asked of that wiki directly.
	 *
	 * The browser can do this itself: `mw.ForeignApi` sends the request with
	 * credentials, so a farm sharing a login — whether through shared cookies
	 * or a central account — answers as the user. Going direct also keeps the
	 * cost flat, since nothing is fetched until a wiki is opened and no wiki
	 * pays for any other.
	 *
	 * Only unread notifications come back; Echo has no way to serve another
	 * wiki's read history.
	 *
	 * @param {{ apiUrl: string }} wiki
	 * @return {Promise<{ items: Object[] }>} Rejects when that wiki cannot be
	 *   reached or will not answer for this user.
	 */
	function fetchWiki( wiki ) {
		if ( !ForeignApiConstructor || !wiki || !wiki.apiUrl ) {
			return Promise.reject( new Error( 'No API endpoint for this wiki' ) );
		}
		const foreignApi = new ForeignApiConstructor( wiki.apiUrl );
		return foreignApi.get( {
			action: 'query',
			meta: 'notifications',
			notsections: SECTIONS.join( '|' ),
			notformat: 'model',
			notfilter: '!read',
			notlimit: FOREIGN_LIMIT,
			notprop: 'list'
		} ).then( ( data ) => {
			const list = ( ( ( data || {} ).query || {} ).notifications || {} ).list || [];
			const items = list
				.filter( ( entry ) => entry.type !== SUMMARY_TYPE )
				.map( ( entry ) => normalizeEntry( entry, categoryLabels ) );
			items.sort( ( a, b ) => b.timestamp - a.timestamp );
			return { items };
		} );
	}

	/**
	 * Reset the "seen" marker so the badge highlight clears. Items remain
	 * unread until explicitly read.
	 *
	 * A GET, not a POST: the module takes no token, is not write mode, and
	 * touches the seen-time cache rather than the database. It was made a GET
	 * deliberately so multi-datacenter wikis can serve it locally instead of
	 * routing it to the primary — POSTing it gives that up. Echo's own client
	 * issues a GET here too.
	 *
	 * Echo additionally builds its API instance with `cache: false`; this one
	 * does not, because the option would apply to every request the source
	 * makes, and the response is already unreusable without it — MediaWiki
	 * answers with `private, must-revalidate, max-age=0` and no validator, so
	 * there is nothing a browser could serve from cache.
	 *
	 * @param {string} type 'alert' | 'message' | 'all'
	 * @return {Promise<number>} The marker Echo recorded, unix seconds; 0 when
	 *   it did not say.
	 */
	function markSeen( type ) {
		return api.get( {
			action: 'echomarkseen',
			type: type,
			timestampFormat: 'ISO_8601'
		} ).then( ( data ) => {
			const marked = ( ( ( data || {} ).query || {} ).echomarkseen || {} ).timestamp;
			return toUnixSeconds( marked );
		} );
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

	return { fetch, fetchWiki, markSeen, markRead, markAllRead };
}

module.exports = { createEchoSource };
