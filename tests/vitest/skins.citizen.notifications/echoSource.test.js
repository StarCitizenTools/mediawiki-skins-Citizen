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
			count: '3'
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
		it( 'never exposes Echo\'s placeholder id', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.some( ( item ) => item.id === -1 ) ).toBe( false );
			expect( items[ 0 ].id ).toBe( 'summary-foreign' );
		} );

		it( 'arrives as a single merged row, not one per section', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.filter( ( item ) => item.isSummary ) ).toHaveLength( 1 );
		} );

		it( 'pins the roll-up above the list even though Echo sends it last', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items[ 0 ].isSummary ).toBe( true );
			// The rest keep the order they have without a roll-up.
			expect( items.slice( 1 ).map( ( i ) => i.id ) ).toEqual( [ 12, 21, 11 ] );
		} );

		it( 'splits the count into local and elsewhere', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary( ONE_WIKI, 5 ) );
			const source = createEchoSource( ApiConstructor );

			const { counts } = await source.fetch();

			expect( counts ).toEqual( { total: 8, local: 3, foreign: 5 } );
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

			expect( items[ 0 ].header ).toBe( 'More notifications from another wiki' );
			expect( items[ 0 ].body ).toBe( 'Example Wiki' );
		} );

		it( 'links a single-wiki roll-up to that wiki\'s notifications', async () => {
			const { ApiConstructor } = makeApi( responseWithSummary() );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items[ 0 ].primaryUrl ).toBe( 'https://example.org/wiki/Special:Notifications' );
		} );

		it( 'links a multi-wiki roll-up to the local special page', async () => {
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

		it( 'leaves ordinary items untouched when no roll-up arrives', async () => {
			const { ApiConstructor } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			const { items } = await source.fetch();

			expect( items.some( ( item ) => item.isSummary ) ).toBe( false );
			expect( items[ 0 ].isSummary ).toBeUndefined();
		} );
	} );

	describe( 'mutations', () => {
		it( 'markSeen posts the given type with a csrf token', async () => {
			const { ApiConstructor, postWithToken } = makeApi( RESPONSE );
			const source = createEchoSource( ApiConstructor );

			await source.markSeen( 'all' );

			expect( postWithToken ).toHaveBeenCalledWith( 'csrf', {
				action: 'echomarkseen',
				type: 'all'
			} );
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
