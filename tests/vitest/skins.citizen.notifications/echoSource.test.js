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
function makeApi( resolved ) {
	const get = vi.fn( () => Promise.resolve( resolved ) );
	const postWithToken = vi.fn( () => Promise.resolve( {} ) );
	function ApiConstructor() {
		this.get = get;
		this.postWithToken = postWithToken;
	}
	return { ApiConstructor, get, postWithToken };
}

// Realistic grouped Echo response (groupbysection=1, format=html).
const GROUPED_RESPONSE = {
	query: {
		notifications: {
			alert: {
				list: [
					{
						id: 11,
						section: 'alert',
						category: 'mention',
						timestamp: { utcunix: '1700000200' },
						read: '20231114000000',
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
					}
				],
				continue: 'foo',
				rawcount: 1,
				count: '1'
			},
			message: {
				list: [
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
				rawcount: 1,
				count: '1'
			},
			rawcount: 2,
			count: '2'
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
 * notcrosswikisummary=1: type 'foreign', id -1, unshifted onto the front of
 * EVERY requested section's list, with no `read` key and no primary link.
 *
 * @param {string} section 'alert' | 'message'
 * @param {Object} sources `sources` map keyed by wiki id
 * @param {number} count unread count on the other wikis
 * @return {Object}
 */
function summaryEntry( section, sources, count ) {
	return {
		id: -1,
		type: 'foreign',
		// Echo files it under a pseudo-category that resolves to 'other'.
		category: 'other',
		section: section,
		count: count,
		sources: sources,
		timestamp: { utcunix: '1700000500' },
		'*': {
			header: `More ${ section === 'alert' ? 'alerts' : 'notices' } from another wiki`,
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
 * The grouped response with a cross-wiki summary unshifted into both sections.
 *
 * @param {Object} [sources] `sources` map to attach to each summary
 * @return {Object}
 */
function responseWithSummary( sources = ONE_WIKI ) {
	const base = structuredClone( GROUPED_RESPONSE );
	base.query.notifications.alert.list.unshift( summaryEntry( 'alert', sources, 3 ) );
	base.query.notifications.message.list.unshift( summaryEntry( 'message', sources, 2 ) );
	return base;
}

describe( 'createEchoSource', () => {
	describe( 'fetch', () => {
		it( 'requests both sections as grouped model data (no deprecated format/filter)', async () => {
			const { ApiConstructor, get } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.fetch();

			expect( get ).toHaveBeenCalledTimes( 1 );
			const params = get.mock.calls[ 0 ][ 0 ];
			expect( params ).toMatchObject( {
				action: 'query',
				meta: 'notifications|allmessages',
				notsections: 'alert|message',
				notformat: 'model',
				notgroupbysection: 1,
				notlimit: 25,
				// Asks for the cross-wiki roll-up row and cross-wiki-inclusive
				// counts; ignored where the wiki has cross-wiki turned off.
				notcrosswikisummary: 1
			} );
			// `notfilter` only accepts read/!read; rely on its default (both).
			expect( params.notfilter ).toBeUndefined();
		} );

		it( 'requests all category-title messages in the same parsed request', async () => {
			const { ApiConstructor, get } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.fetch();

			const params = get.mock.calls[ 0 ][ 0 ];
			expect( params ).toMatchObject( {
				amprefix: 'echo-category-title-',
				amenableparser: 1
			} );
		} );

		it( 'normalizes grouped model entries into a flat item list', async () => {
			const { ApiConstructor } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.map( ( i ) => i.id ) ).toEqual( [ 12, 21, 11 ] );
			expect( items[ 0 ] ).toEqual( {
				id: 12,
				section: 'alert',
				category: 'edit-user-talk',
				categoryLabel: 'Talk page edits',
				read: false,
				timestamp: 1700000400,
				iconUrl: '/icons/edit-user-talk.svg',
				header: 'New message on your talk page',
				body: '',
				primaryUrl: '/wiki/User_talk:Me?markasread=12',
				secondaryLinks: []
			} );
		} );

		it( 'resolves the category label from the parsed messages, incl. extensions', async () => {
			const { ApiConstructor } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			// edit-thank is defined by Extension:Thanks, not Echo core.
			expect( items.find( ( i ) => i.id === 21 ).categoryLabel ).toBe( 'Thanks' );
			expect( items.find( ( i ) => i.id === 11 ).categoryLabel ).toBe( 'Mentions' );
		} );

		it( 'leaves the category label blank when no message is registered', async () => {
			const response = { query: {
				notifications: {
					alert: { list: [ {
						id: 7, category: 'some-unknown-extension-category',
						timestamp: { utcunix: '1700000000' },
						'*': { header: 'h', body: '', iconUrl: '', links: { primary: [], secondary: [] } }
					} ], rawcount: 1 },
					message: { list: [], rawcount: 0 },
					rawcount: 1
				},
				allmessages: [ { name: 'echo-category-title-mention', '*': 'Mentions' } ]
			} };
			const { ApiConstructor } = makeApi( response );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items[ 0 ].categoryLabel ).toBe( '' );
		} );

		it( 'maps primary and secondary links from the model', async () => {
			const { ApiConstructor } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();
			const mention = items.find( ( i ) => i.id === 11 );

			expect( mention.primaryUrl ).toBe( '/wiki/Foo?markasread=11' );
			expect( mention.secondaryLinks ).toEqual( [ { url: '/wiki/User:NotifBot', label: 'NotifBot' } ] );
			expect( mention.iconUrl ).toBe( '/icons/mention.svg' );
		} );

		it( 'derives read state from the presence of a read timestamp', async () => {
			const { ApiConstructor } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();
			const alert11 = items.find( ( i ) => i.id === 11 );
			const alert12 = items.find( ( i ) => i.id === 12 );

			expect( alert11.read ).toBe( true );
			expect( alert12.read ).toBe( false );
		} );

		it( 'returns per-section and total unread counts', async () => {
			const { ApiConstructor } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { counts } = await source.fetch();

			expect( counts ).toEqual( { alert: 1, message: 1, total: 2 } );
		} );

		it( 'sorts unread before read, then newest first', async () => {
			const entry = ( id, ts, read ) => Object.assign(
				{ id: id, category: 'mention', timestamp: { utcunix: String( ts ) } },
				read ? { read: '20231114000000' } : {},
				{ '*': { header: '', body: '', iconUrl: '', links: { primary: [], secondary: [] } } }
			);
			const response = { query: { notifications: {
				alert: {
					// A read item that is NEWER than the unread ones.
					list: [ entry( 1, 900, true ), entry( 2, 300, false ), entry( 3, 500, false ) ],
					rawcount: 2
				},
				message: { list: [], rawcount: 0 },
				rawcount: 2
			} } };
			const { ApiConstructor } = makeApi( response );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			// Unread newest-first (3 then 2), then the newer-but-read item (1).
			expect( items.map( ( i ) => i.id ) ).toEqual( [ 3, 2, 1 ] );
		} );

		it( 'tolerates an empty notifications payload', async () => {
			const { ApiConstructor } = makeApi( { query: { notifications: {} } } );
			const source = createEchoSource( ApiConstructor );

			const { items, counts } = await source.fetch();

			expect( items ).toEqual( [] );
			expect( counts ).toEqual( { alert: 0, message: 0, total: 0 } );
		} );
	} );

	describe( 'cross-wiki summaries', () => {
		it( 'never exposes Echo\'s placeholder id', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.some( ( item ) => item.id === -1 ) ).toBe( false );
			expect( items.map( ( item ) => item.id ) )
				.toEqual( [ 'summary-alert', 'summary-message', 12, 21, 11 ] );
		} );

		it( 'pins summaries above the sorted list', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.slice( 0, 2 ).map( ( item ) => item.isSummary ) )
				.toEqual( [ true, true ] );
			// The remaining items keep the order they have without a summary.
			expect( items.slice( 2 ).map( ( item ) => item.id ) ).toEqual( [ 12, 21, 11 ] );
		} );

		it( 'carries the section and the count it stands for', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items[ 0 ] ).toMatchObject( { section: 'alert', count: 3, read: false } );
			expect( items[ 1 ] ).toMatchObject( { section: 'message', count: 2, read: false } );
		} );

		it( 'leaves the category label off rather than showing "Other"', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items[ 0 ].categoryLabel ).toBe( '' );
			expect( items[ 0 ].category ).toBe( '' );
		} );

		it( 'keeps Echo\'s own wording for the header and body', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items[ 0 ].header ).toBe( 'More alerts from another wiki' );
			expect( items[ 0 ].body ).toBe( 'Example Wiki' );
		} );

		it( 'links a single-wiki summary to that wiki\'s notifications', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items[ 0 ].primaryUrl )
				.toBe( 'https://example.org/wiki/Special:Notifications' );
		} );

		it( 'links a multi-wiki summary to the local special page', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary( Object.assign(
				{}, ONE_WIKI, { otherwiki: { title: 'Other', base: 'https://other.org/wiki/$1' } }
			) ) );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items[ 0 ].primaryUrl ).toBe( '/wiki/Special:Notifications' );
		} );

		it( 'falls back to the local special page for an unusable base', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary( {
				examplewiki: { title: 'Example Wiki', base: 'https://example.org/wiki/Foo' }
			} ) );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items[ 0 ].primaryUrl ).toBe( '/wiki/Special:Notifications' );
		} );

		it( 'leaves ordinary items untouched when no summary arrives', async () => {
			const { ApiConstructor } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.some( ( item ) => item.isSummary ) ).toBe( false );
			expect( items[ 0 ].isSummary ).toBeUndefined();
		} );
	} );

	describe( 'mutations', () => {
		it( 'markSeen posts the given type with a csrf token', async () => {
			const { ApiConstructor, postWithToken } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.markSeen( 'all' );

			expect( postWithToken ).toHaveBeenCalledWith( 'csrf', {
				action: 'echomarkseen',
				type: 'all'
			} );
		} );

		it( 'markRead posts the id list', async () => {
			const { ApiConstructor, postWithToken } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.markRead( [ 11, 12 ] );

			expect( postWithToken ).toHaveBeenCalledWith( 'csrf', {
				action: 'echomarkread',
				list: '11|12'
			} );
		} );

		it( 'markRead is a no-op for an empty list', async () => {
			const { ApiConstructor, postWithToken } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.markRead( [] );

			expect( postWithToken ).not.toHaveBeenCalled();
		} );

		it( 'markAllRead posts all=true when no section given', async () => {
			const { ApiConstructor, postWithToken } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.markAllRead( null );

			expect( postWithToken ).toHaveBeenCalledWith( 'csrf', {
				action: 'echomarkread',
				all: true
			} );
		} );

		it( 'markAllRead scopes to a section when given one', async () => {
			const { ApiConstructor, postWithToken } = makeApi( GROUPED_RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.markAllRead( 'alert' );

			expect( postWithToken ).toHaveBeenCalledWith( 'csrf', {
				action: 'echomarkread',
				sections: 'alert'
			} );
		} );
	} );
} );
