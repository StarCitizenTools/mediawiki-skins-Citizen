globalThis.mw = require( '../mocks/mw.js' );
const { createEchoSource } = require( '../../../resources/skins.citizen.notifications/sources/echo.js' );

/**
 * Build a fake `mw.Api` constructor whose instances expose spied
 * `get` / `postWithToken` methods, so tests can assert the exact params
 * the source sends and control the resolved responses.
 *
 * @param {Object} [resolved] value `get` resolves with
 * @return {{ ApiConstructor: Function, get: Function, postWithToken: Function }}
 */
/**
 * Fake `mw.ForeignApi`: records the endpoint it was constructed with and the
 * params it was asked for, so the cross-wiki request can be asserted without a
 * second wiki to talk to.
 *
 * @param {Object|Error} resolved value to resolve with, or an error to reject
 * @return {{ ForeignApiConstructor: Function, get: Function, urls: string[] }}
 */
function makeForeignApi( resolved ) {
	const urls = [];
	const get = vi.fn( () => resolved instanceof Error ?
		Promise.reject( resolved ) :
		Promise.resolve( resolved ) );
	function ForeignApiConstructor( url ) {
		urls.push( url );
		this.get = get;
	}
	return { ForeignApiConstructor, get, urls };
}

function makeApi( resolved ) {
	const get = vi.fn( () => Promise.resolve( resolved ) );
	const postWithToken = vi.fn( () => Promise.resolve( {} ) );
	function ApiConstructor() {
		this.get = get;
		this.postWithToken = postWithToken;
	}
	return { ApiConstructor, get, postWithToken };
}

// Realistic ungrouped Echo response (notformat=model, notfilter=!read). Echo
// returns one flat list, each entry carrying its own section, and a top-level
// rawcount that includes other wikis when notcrosswikisummary is set.
const RESPONSE = {
	query: {
		notifications: {
			list: [
				{
					id: 11,
					section: 'alert',
					category: 'mention',
					timestamp: { utcunix: '1700000200' },
					'*': {
						header: '<strong>NotifBot</strong> mentioned you',
						body: 'Hello there',
						iconUrl: '/icons/mention.svg',
						links: {
							primary: { url: '/wiki/Foo?markasread=11', label: 'View mention' },
							secondary: [ { url: '/wiki/User:NotifBot', label: 'NotifBot' } ]
						}
					}
				},
				{
					id: 12,
					section: 'alert',
					category: 'edit-user-talk',
					timestamp: { utcunix: '1700000400' },
					'*': {
						header: 'New message on your talk page',
						body: '',
						iconUrl: '/icons/edit-user-talk.svg',
						links: {
							primary: { url: '/wiki/User_talk:Me?markasread=12', label: 'View message' },
							secondary: []
						}
					}
				},
				{
					id: 21,
					section: 'message',
					category: 'edit-thank',
					timestamp: { utcunix: '1700000300' },
					'*': {
						header: '<strong>Someone</strong> thanked you',
						body: '',
						iconUrl: '/icons/thanks.svg',
						links: { primary: { url: '/wiki/Page', label: 'View' }, secondary: [] }
					}
				}
			],
			continue: null,
			rawcount: 3,
			count: '3',
			// Echo keeps one marker per section; 'all' is the older of the two.
			// Second precision, no milliseconds, as Echo's TS_ISO_8601 emits.
			seenTime: {
				alert: '2023-11-14T22:19:10Z',
				message: '2023-11-14T22:15:00Z'
			}
		},
		// Parsed echo-category-title-* messages, including one from an
		// extension (edit-thank, Extension:Thanks).
		allmessages: [
			{ name: 'echo-category-title-mention', '*': 'Mentions' },
			{ name: 'echo-category-title-edit-user-talk', '*': 'Talk page edits' },
			{ name: 'echo-category-title-edit-thank', '*': 'Thanks' }
		]
	}
};

/**
 * Echo's synthetic cross-wiki roll-up, as it arrives with
 * notcrosswikisummary=1 and no grouping: ONE row covering every section, with
 * type 'foreign', the placeholder id, no `read` key and no primary link.
 *
 * @param {Object} sources `sources` map keyed by wiki id
 * @param {number} count unread count on the other wikis
 * @return {Object}
 */
function summaryEntry( sources, count ) {
	return {
		id: -1,
		type: 'foreign',
		// Echo files it under a pseudo-category that resolves to 'other'.
		category: 'other',
		section: 'all',
		count: count,
		sources: sources,
		timestamp: { utcunix: '1700000500' },
		'*': {
			header: 'More notifications from another wiki',
			body: 'Example Wiki',
			iconUrl: '/icons/global.svg',
			links: { primary: [], secondary: [] }
		}
	};
}

const ONE_WIKI = {
	examplewiki: {
		title: 'Example Wiki',
		url: 'https://example.org/w/api.php',
		base: 'https://example.org/wiki/$1',
		ts: '2023-11-14T00:00:00Z'
	}
};

/**
 * The response with a cross-wiki roll-up appended, as Echo delivers it — at
 * the END of the list, after the limit has been applied.
 *
 * @param {Object} [sources] `sources` map to attach
 * @param {number} [count] unread count on the other wikis
 * @return {Object}
 */
function responseWithSummary( sources = ONE_WIKI, count = 5 ) {
	const base = structuredClone( RESPONSE );
	base.query.notifications.list.push( summaryEntry( sources, count ) );
	// rawcount goes cross-wiki-inclusive once the roll-up is requested.
	base.query.notifications.rawcount = 3 + count;
	return base;
}

describe( 'createEchoSource', () => {
	describe( 'fetch', () => {
		it( 'requests unread notifications as one flat model list', async () => {
			const { ApiConstructor, get } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.fetch();

			expect( get ).toHaveBeenCalledTimes( 1 );
			const params = get.mock.calls[ 0 ][ 0 ];
			expect( params ).toMatchObject( {
				action: 'query',
				meta: 'notifications|allmessages',
				notsections: 'alert|message',
				notformat: 'model',
				notfilter: '!read',
				notlimit: 25,
				// Ungrouped, so Echo emits one merged roll-up rather than one
				// per section.
				notcrosswikisummary: 1
			} );
			expect( params.notgroupbysection ).toBeUndefined();
		} );

		it( 'requests all category-title messages in the same parsed request', async () => {
			const { ApiConstructor, get } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.fetch();

			const params = get.mock.calls[ 0 ][ 0 ];
			expect( params ).toMatchObject( {
				amprefix: 'echo-category-title-',
				amenableparser: 1
			} );
		} );

		it( 'normalizes model entries into items', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items ).toHaveLength( 3 );
			expect( items.map( ( item ) => item.id ) ).toEqual( [ 12, 21, 11 ] );
		} );

		it( 'resolves the category label from the parsed messages, incl. extensions', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			const byId = Object.fromEntries( items.map( ( i ) => [ i.id, i ] ) );
			expect( byId[ 11 ].categoryLabel ).toBe( 'Mentions' );
			expect( byId[ 21 ].categoryLabel ).toBe( 'Thanks' );
		} );

		it( 'leaves the category label blank when no message is registered', async () => {
			const payload = structuredClone( RESPONSE );
			payload.query.allmessages = [];
			const { ApiConstructor } = makeApi( payload );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.every( ( item ) => item.categoryLabel === '' ) ).toBe( true );
		} );

		it( 'maps primary and secondary links from the model', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			const mention = items.find( ( i ) => i.id === 11 );
			expect( mention.primaryUrl ).toBe( '/wiki/Foo?markasread=11' );
			expect( mention.secondaryLinks ).toEqual( [
				{ url: '/wiki/User:NotifBot', label: 'NotifBot' }
			] );
		} );

		it( 'treats every fetched notification as unread', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.every( ( item ) => item.read === false ) ).toBe( true );
		} );

		it( 'sorts newest first', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.map( ( item ) => item.timestamp ) )
				.toEqual( [ 1700000400, 1700000300, 1700000200 ] );
		} );

		it( 'reports the unread count, all of it local without a roll-up', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { counts } = await source.fetch();

			expect( counts ).toEqual( { total: 3, local: 3, foreign: 0 } );
		} );

		it( 'tolerates an empty notifications payload', async () => {
			const { ApiConstructor } = makeApi( { query: { notifications: {} } } );
			const source = createEchoSource( ApiConstructor );

			const { items, counts } = await source.fetch();

			expect( items ).toEqual( [] );
			expect( counts ).toEqual( { total: 0, local: 0, foreign: 0 } );
		} );
	} );

	describe( 'cross-wiki roll-up', () => {
		it( 'never lets the roll-up into the notification list', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.map( ( item ) => item.id ) ).toEqual( [ 12, 21, 11 ] );
			expect( items.some( ( item ) => item.id === -1 ) ).toBe( false );
		} );

		it( 'reads the wikis out of it', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { wikis } = await source.fetch();

			expect( wikis ).toEqual( [ {
				id: 'examplewiki',
				name: 'Example Wiki',
				url: 'https://example.org/wiki/Special:Notifications',
				apiUrl: 'https://example.org/w/api.php',
				timestamp: Math.floor( Date.parse( '2023-11-14T00:00:00Z' ) / 1000 )
			} ] );
		} );

		it( 'links every wiki straight to itself, however many there are', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary( {
				examplewiki: { title: 'Example Wiki', url: 'https://example.org/w/api.php', base: 'https://example.org/wiki/$1', ts: '2023-11-14T00:00:00Z' },
				otherwiki: { title: 'Other Wiki', url: 'https://other.org/w/api.php', base: 'https://other.org/wiki/$1', ts: '2023-11-15T00:00:00Z' }
			} ) );
			const source = createEchoSource( ApiConstructor );

			const { wikis } = await source.fetch();

			expect( wikis.map( ( w ) => w.url ) ).toEqual( [
				'https://other.org/wiki/Special:Notifications',
				'https://example.org/wiki/Special:Notifications'
			] );
		} );

		it( 'sorts wikis by most recent activity', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary( {
				stale: { title: 'Stale', base: 'https://stale.org/wiki/$1', ts: '2023-01-01T00:00:00Z' },
				fresh: { title: 'Fresh', base: 'https://fresh.org/wiki/$1', ts: '2023-12-01T00:00:00Z' }
			} ) );
			const source = createEchoSource( ApiConstructor );

			const { wikis } = await source.fetch();

			expect( wikis.map( ( w ) => w.name ) ).toEqual( [ 'Fresh', 'Stale' ] );
		} );

		it( 'falls back to the local special page for an unusable base', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary( {
				examplewiki: { title: 'Example Wiki', base: 'https://example.org/wiki/Foo', ts: '2023-11-14T00:00:00Z' }
			} ) );
			const source = createEchoSource( ApiConstructor );

			const { wikis } = await source.fetch();

			expect( wikis[ 0 ].url ).toBe( '/wiki/Special:Notifications' );
		} );

		it( 'falls back to the wiki id when it has no name', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary( {
				examplewiki: { base: 'https://example.org/wiki/$1', ts: '2023-11-14T00:00:00Z' }
			} ) );
			const source = createEchoSource( ApiConstructor );

			const { wikis } = await source.fetch();

			expect( wikis[ 0 ].name ).toBe( 'examplewiki' );
		} );

		it( 'splits the count into local and elsewhere', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary( ONE_WIKI, 5 ) );
			const source = createEchoSource( ApiConstructor );

			const { counts } = await source.fetch();

			expect( counts ).toEqual( { total: 8, local: 3, foreign: 5 } );
		} );

		it( 'reports no wikis when none arrive', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { wikis, counts } = await source.fetch();

			expect( wikis ).toEqual( [] );
			expect( counts.foreign ).toBe( 0 );
		} );
	} );

	describe( 'previewing another wiki', () => {
		const WIKI = { id: 'examplewiki', name: 'Example Wiki', apiUrl: 'https://example.org/w/api.php' };

		const FOREIGN_RESPONSE = {
			query: {
				notifications: {
					list: [
						{
							id: 5,
							section: 'alert',
							category: 'mention',
							timestamp: { utcunix: '1700000100' },
							'*': { header: 'Older', body: '', iconUrl: '', links: { primary: { url: '/a' }, secondary: [] } }
						},
						{
							id: 7,
							section: 'message',
							category: 'edit-thank',
							timestamp: { utcunix: '1700000900' },
							'*': { header: 'Newer', body: '', iconUrl: '', links: { primary: { url: '/b' }, secondary: [] } }
						}
					],
					rawcount: 12
				}
			}
		};

		it( 'asks that wiki directly, for its unread only', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const { ForeignApiConstructor, get, urls } = makeForeignApi( FOREIGN_RESPONSE );
			const source = createEchoSource( ApiConstructor, ForeignApiConstructor );

			await source.fetchWiki( WIKI );

			expect( urls ).toEqual( [ 'https://example.org/w/api.php' ] );
			expect( get.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
				action: 'query',
				meta: 'notifications',
				notformat: 'model',
				notfilter: '!read',
				notlimit: 5,
				notprop: 'list'
			} );
		} );

		it( 'normalizes what comes back, newest first', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const { ForeignApiConstructor } = makeForeignApi( FOREIGN_RESPONSE );
			const source = createEchoSource( ApiConstructor, ForeignApiConstructor );

			const { items } = await source.fetchWiki( WIKI );

			expect( items.map( ( i ) => i.id ) ).toEqual( [ 7, 5 ] );
			expect( items[ 0 ].header ).toBe( 'Newer' );
		} );

		it( 'labels categories with what the local wiki already told us', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const { ForeignApiConstructor } = makeForeignApi( FOREIGN_RESPONSE );
			const source = createEchoSource( ApiConstructor, ForeignApiConstructor );

			// The local fetch is what learns the category titles.
			await source.fetch();
			const { items } = await source.fetchWiki( WIKI );

			expect( items.find( ( i ) => i.id === 5 ).categoryLabel ).toBe( 'Mentions' );
			expect( items.find( ( i ) => i.id === 7 ).categoryLabel ).toBe( 'Thanks' );
		} );

		it( 'drops a roll-up row arriving from the other wiki', async () => {
			const payload = structuredClone( FOREIGN_RESPONSE );
			payload.query.notifications.list.push( summaryEntry( ONE_WIKI, 3 ) );
			const { ApiConstructor } = makeApi( RESPONSE );
			const { ForeignApiConstructor } = makeForeignApi( payload );
			const source = createEchoSource( ApiConstructor, ForeignApiConstructor );

			const { items } = await source.fetchWiki( WIKI );

			expect( items.map( ( i ) => i.id ) ).toEqual( [ 7, 5 ] );
		} );

		it( 'rejects rather than guessing when there is no endpoint', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const { ForeignApiConstructor } = makeForeignApi( FOREIGN_RESPONSE );
			const source = createEchoSource( ApiConstructor, ForeignApiConstructor );

			await expect( source.fetchWiki( { id: 'x', apiUrl: '' } ) ).rejects.toThrow();
		} );

		it( 'rejects when the skin was given no way to reach other wikis', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await expect( source.fetchWiki( WIKI ) ).rejects.toThrow();
		} );

		it( 'passes a refusal through so the caller can offer the wiki instead', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const { ForeignApiConstructor } = makeForeignApi( new Error( 'http' ) );
			const source = createEchoSource( ApiConstructor, ForeignApiConstructor );

			await expect( source.fetchWiki( WIKI ) ).rejects.toThrow( 'http' );
		} );
	} );

	describe( 'seen marker', () => {
		it( 'asks for the seen time on the request it already makes', async () => {
			const { ApiConstructor, get } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.fetch();

			expect( get ).toHaveBeenCalledTimes( 1 );
			expect( get.mock.calls[ 0 ][ 0 ].notprop ).toContain( 'seenTime' );
		} );

		it( 'takes the older of the two section markers, as Echo does for "all"', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const result = await source.fetch();

			// message (22:15:00) is older than alert (22:19:10).
			expect( result.seenTime ).toBe( 1700000100 );
		} );

		it( 'reports the newest unread notification as what the marker must cover', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const result = await source.fetch();

			expect( result.newestWaiting ).toBe( 1700000400 );
		} );

		it( 'counts another wiki as something waiting, since it rides the same badge', async () => {
			const recentWiki = {
				examplewiki: {
					title: 'Example Wiki',
					url: 'https://example.org/w/api.php',
					base: 'https://example.org/wiki/$1',
					// Later than any local notification (22:20:00).
					ts: '2023-11-14T23:00:00Z'
				}
			};
			const { ApiConstructor } = makeApi( responseWithSummary( recentWiki ) );
			const source = createEchoSource( ApiConstructor );

			const result = await source.fetch();

			expect( result.newestWaiting ).toBe( 1700002800 );
		} );

		it( 'ignores another wiki that is older than what is waiting here', async () => {
			// The bundled fixture's wiki last saw activity well before the
			// local notifications, so it must not drag the figure backwards.
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const result = await source.fetch();

			expect( result.newestWaiting ).toBe( 1700000400 );
		} );

		it( 'reads Echo\'s never-seen sentinel as older than anything waiting', async () => {
			// Echo has no "absent" marker: with nothing stored it reports
			// unix 1, so this is what a user who has never opened the panel
			// actually gets back.
			const neverSeen = structuredClone( RESPONSE );
			neverSeen.query.notifications.seenTime = {
				alert: '1970-01-01T00:00:01Z',
				message: '1970-01-01T00:00:01Z'
			};
			const { ApiConstructor } = makeApi( neverSeen );
			const source = createEchoSource( ApiConstructor );

			const result = await source.fetch();

			expect( result.seenTime ).toBe( 1 );
			expect( result.seenTime ).toBeLessThan( result.newestWaiting );
		} );

		it( 'treats a marker Echo did not send as unseen rather than as now', async () => {
			const bare = structuredClone( RESPONSE );
			delete bare.query.notifications.seenTime;
			const { ApiConstructor } = makeApi( bare );
			const source = createEchoSource( ApiConstructor );

			const result = await source.fetch();

			// Zero is older than anything waiting, so the panel marks seen.
			expect( result.seenTime ).toBe( 0 );
		} );

		it( 'reports nothing waiting when the list and the wikis are both empty', async () => {
			const { ApiConstructor } = makeApi( {
				query: { notifications: { list: [], rawcount: 0 }, allmessages: [] }
			} );
			const source = createEchoSource( ApiConstructor );

			const result = await source.fetch();

			expect( result.newestWaiting ).toBe( 0 );
		} );
	} );

	describe( 'mutations', () => {
		it( 'marks seen with a plain GET, which multi-DC wikis can serve locally', async () => {
			const { ApiConstructor, get, postWithToken } = makeApi( {
				query: { echomarkseen: { result: 'success', timestamp: '2026-08-07T21:27:42Z' } }
			} );
			const source = createEchoSource( ApiConstructor );

			const marked = await source.markSeen( 'all' );

			// The module takes no token and is not write mode; POSTing it would
			// pin the request to the primary datacentre for nothing.
			expect( postWithToken ).not.toHaveBeenCalled();
			expect( get ).toHaveBeenCalledWith( {
				action: 'echomarkseen',
				type: 'all',
				timestampFormat: 'ISO_8601'
			} );
			// Echo's own marker comes back, so the panel can carry it forward
			// instead of trusting the client clock.
			expect( marked ).toBe( 1786138062 );
		} );

		it( 'reports an unparseable seen marker as zero rather than NaN', async () => {
			const { ApiConstructor } = makeApi( { query: { echomarkseen: { result: 'success' } } } );
			const source = createEchoSource( ApiConstructor );

			await expect( source.markSeen( 'all' ) ).resolves.toBe( 0 );
		} );

		it( 'markRead posts the id list', async () => {
			const { ApiConstructor, postWithToken } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.markRead( [ 11, 12 ] );

			expect( postWithToken ).toHaveBeenCalledWith( 'csrf', {
				action: 'echomarkread',
				list: '11|12'
			} );
		} );

		it( 'markRead is a no-op for an empty list', async () => {
			const { ApiConstructor, postWithToken } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.markRead( [] );

			expect( postWithToken ).not.toHaveBeenCalled();
		} );

		it( 'markAllRead clears everything, unscoped', async () => {
			const { ApiConstructor, postWithToken } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.markAllRead();

			expect( postWithToken ).toHaveBeenCalledWith( 'csrf', {
				action: 'echomarkread',
				all: true
			} );
		} );
	} );
} );
