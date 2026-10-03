// @vitest-environment jsdom
/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const mwTitle = require( '../../mocks/mwTitle.js' );

const createRecentItems = require( '../../../../resources/skins.citizen.commandPalette/services/recentItems.js' );
const destinationKey = require( '../../../../resources/skins.citizen.commandPalette/utils/destinationKey.js' );

const RECENT_KEY = 'skin-citizen-command-palette-recent';
const LEGACY_KEY = 'skin-citizen-command-palette-recent-items';
const GO_NOTE_KEY = 'skin-citizen-command-palette-go-note';
const GO_LANDING_KEY = 'skin-citizen-command-palette-go-landing';

function page( title ) {
	return { id: `p-${ title }`, type: 'page', label: title, url: `/wiki/${ title }`, source: 'search' };
}

describe( 'createRecentItems', () => {
	let service;
	let storage;
	let session;

	beforeEach( () => {
		vi.restoreAllMocks();
		mw.config.get = vi.fn( ( key ) => ( {
			wgArticlePath: '/wiki/$1',
			wgScript: '/w/index.php'
		} )[ key ] ?? null );
		mw.Title = mwTitle;

		storage = {};
		mw.storage.getObject = vi.fn( ( key ) => {
			const val = storage[ key ];
			return val ? JSON.parse( JSON.stringify( val ) ) : null;
		} );
		mw.storage.setObject = vi.fn( ( key, val ) => {
			storage[ key ] = JSON.parse( JSON.stringify( val ) );
			return true;
		} );
		mw.storage.remove = vi.fn( ( key ) => {
			delete storage[ key ];
		} );

		session = {};
		mw.storage.session.getObject = vi.fn( ( key ) => {
			const val = session[ key ];
			return val ? JSON.parse( JSON.stringify( val ) ) : null;
		} );
		mw.storage.session.setObject = vi.fn( ( key, val ) => {
			session[ key ] = JSON.parse( JSON.stringify( val ) );
			return true;
		} );
		mw.storage.session.remove = vi.fn( ( key ) => {
			delete session[ key ];
		} );

		service = createRecentItems();
	} );

	describe( 'saveRecentItem', () => {
		it( 'stores where the row led, not the row', () => {
			const row = {
				...page( 'Main_Page' ),
				description: 'About the wiki',
				thumbnail: { url: 'thumb.jpg' },
				actions: [ { id: 'edit' } ],
				isMouseClick: true
			};

			service.saveRecentItem( row, row.url );

			expect( storage[ RECENT_KEY ] ).toEqual( {
				version: 1,
				entries: [ {
					kind: 'page',
					key: 'page:Main Page',
					label: 'Main_Page',
					url: '/wiki/Main_Page',
					savedAt: expect.any( Number )
				} ]
			} );
		} );

		it( 'stores the link the reader opened when it differs from the row link', () => {
			const row = { id: 'r1', type: 'revision', label: '5m · Alice', url: '/w/index.php?title=Main_Page&oldid=5' };

			service.saveRecentItem( row, '/w/index.php?title=Main_Page&diff=prev&oldid=5' );

			expect( storage[ RECENT_KEY ].entries[ 0 ] ).toMatchObject( {
				kind: 'revision',
				label: 'Main Page',
				url: '/w/index.php?title=Main_Page&diff=prev&oldid=5'
			} );
		} );

		it( 'falls back to the row link when none is given', () => {
			service.saveRecentItem( page( 'Foo' ) );

			expect( storage[ RECENT_KEY ].entries[ 0 ].url ).toBe( '/wiki/Foo' );
		} );

		it( 'remembers nothing for a row without a real link', () => {
			service.saveRecentItem( { id: 'x', type: 'menu-item', label: 'Purge', url: '#' }, '#' );

			expect( storage[ RECENT_KEY ] ).toBeUndefined();
		} );

		it( 'moves a place opened again to the front', () => {
			service.saveRecentItem( page( 'A' ) );
			service.saveRecentItem( page( 'B' ) );

			service.saveRecentItem( page( 'A' ) );

			expect( storage[ RECENT_KEY ].entries.map( ( e ) => e.label ) ).toEqual( [ 'A', 'B' ] );
		} );

		it( 'keeps the page over a go that named it, at the newest position', () => {
			service.saveRecentItem( page( 'Other' ) );
			service.saveRecentItem( page( 'Main_Page' ) );

			service.saveRecentItem(
				{ id: 'go', type: 'action', label: 'Main_Page', url: '/wiki/Special:Search?search=Main_Page' }
			);

			expect( storage[ RECENT_KEY ].entries.map( ( e ) => [ e.kind, e.label ] ) ).toEqual( [
				[ 'page', 'Main_Page' ],
				[ 'page', 'Other' ]
			] );
		} );

		it( 'replaces a go with the page once the page is opened', () => {
			service.saveRecentItem(
				{ id: 'go', type: 'action', label: 'Main_Page', url: '/wiki/Special:Search?search=Main_Page' }
			);

			service.saveRecentItem( page( 'Main_Page' ) );

			expect( storage[ RECENT_KEY ].entries.map( ( e ) => e.kind ) ).toEqual( [ 'page' ] );
		} );

		it( 'keeps at most 13 places', () => {
			for ( let i = 0; i < 15; i++ ) {
				service.saveRecentItem( page( `P${ i }` ) );
			}

			expect( storage[ RECENT_KEY ].entries ).toHaveLength( 13 );
			expect( storage[ RECENT_KEY ].entries[ 0 ].label ).toBe( 'P14' );
		} );

		it( 'drops stored entries it cannot read', () => {
			storage[ RECENT_KEY ] = {
				version: 1,
				entries: [
					{ kind: 'page', key: 'page:A', label: 'A', url: '/wiki/A', savedAt: 1 },
					'junk',
					{ kind: 'page' }
				]
			};

			service.saveRecentItem( page( 'B' ) );

			expect( storage[ RECENT_KEY ].entries.map( ( e ) => e.label ) ).toEqual( [ 'B', 'A' ] );
		} );
	} );

	describe( 'getRecentItems', () => {
		it( 'returns nothing when nothing is stored', () => {
			expect( service.getRecentItems() ).toEqual( [] );
		} );

		it( 'shows each place as a row built now, with a dismiss button', () => {
			service.saveRecentItem( page( 'Main_Page' ) );

			const rows = service.getRecentItems();

			expect( rows ).toHaveLength( 1 );
			expect( rows[ 0 ] ).toMatchObject( { type: 'page', label: 'Main_Page', url: '/wiki/Main_Page' } );
			expect( rows[ 0 ].actions.map( ( a ) => a.id ) ).toEqual( [ 'edit', 'dismiss' ] );
		} );

		it( 'leaves out a stored entry whose link is not a page', () => {
			storage[ RECENT_KEY ] = {
				version: 1,
				entries: [
					{ kind: 'link', key: 'url:script', label: 'Script', url: 'javascript:alert(1)', savedAt: 2 },
					{ kind: 'page', key: 'page:B', label: 'B', url: '/wiki/B', savedAt: 1 }
				]
			};

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => r.label ) ).toEqual( [ 'B' ] );
		} );

		it( 'leaves out a stored entry whose mode is not text', () => {
			storage[ RECENT_KEY ] = {
				version: 1,
				entries: [
					{ kind: 'page', key: 'page:A', label: 'A', url: '/wiki/A', savedAt: 2, mode: 5 },
					{ kind: 'page', key: 'page:B', label: 'B', url: '/wiki/B', savedAt: 1, mode: 'search' }
				]
			};

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => r.label ) ).toEqual( [ 'B' ] );
		} );

		it( 'leaves out a stored entry whose data is not an object', () => {
			storage[ RECENT_KEY ] = {
				version: 1,
				entries: [
					{ kind: 'page', key: 'page:A', label: 'A', url: '/wiki/A', savedAt: 2, data: 'x' },
					{ kind: 'page', key: 'page:B', label: 'B', url: '/wiki/B', savedAt: 1, data: { note: 'kept' } }
				]
			};

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => r.label ) ).toEqual( [ 'B' ] );
		} );

		it( 'shows nothing, without failing, when storage is unavailable', () => {
			mw.storage.getObject = vi.fn( () => false );

			expect( service.getRecentItems() ).toEqual( [] );
		} );

		it( 'builds rows only up to the limit, passing over the places left out', () => {
			const userMode = { id: 'user', remember: ( item ) => ( { kind: 'user', label: item.label } ) };
			const user = ( name ) => ( { id: `u-${ name }`, type: 'user', label: name, url: `/wiki/User:${ name }` } );
			// Saved oldest first, so they are stored newest first in this order.
			const newestFirst = [
				page( 'P0' ), page( 'P1' ), page( 'Gone1' ), user( 'Inside' ), page( 'P4' ),
				user( 'Gone2' ), page( 'P6' ), page( 'P7' ), page( 'P8' ), page( 'P9' ),
				user( 'Past' ), page( 'P11' ), page( 'P12' )
			];
			[ ...newestFirst ].reverse().forEach( ( row ) => {
				service.saveRecentItem( row, row.url, row.type === 'user' ? userMode : null );
			} );
			mw.util.getUrl.mockClear();

			const rows = service.getRecentItems( {
				leftOut: new Set( [ destinationKey( page( 'Gone1' ) ), destinationKey( user( 'Gone2' ) ) ] ),
				limit: 8
			} );

			expect( rows.map( ( r ) => r.label ) ).toEqual(
				[ 'P0', 'P1', 'Inside', 'P4', 'P6', 'P7', 'P8', 'P9' ]
			);
			// A user row links to the user's talk page as it is built.
			expect( mw.util.getUrl ).toHaveBeenCalledWith( 'User_talk:Inside' );
			expect( mw.util.getUrl ).not.toHaveBeenCalledWith( 'User_talk:Gone2' );
			expect( mw.util.getUrl ).not.toHaveBeenCalledWith( 'User_talk:Past' );
		} );
	} );

	describe( 'converting an earlier history', () => {
		it( 'converts the rows an earlier version stored, once', () => {
			storage[ LEGACY_KEY ] = [
				{ id: 'p', type: 'page', label: 'Main Page', description: 'About', url: '/wiki/Main_Page', actions: [ { id: 'edit' } ] },
				{ id: 'go', type: 'action', label: 'zzqx', description: 'Go to the page…', url: '/wiki/Special:Search?search=zzqx', source: 'queryAction:go' },
				{ id: 'm', type: 'menu-item', label: 'History', url: '/w/index.php?title=Help:Contents&action=history' },
				{ id: 'r', type: 'revision', label: '5m · Alice', url: '/w/index.php?title=Main_Page&oldid=5' },
				{ id: 'n', label: 'No link' }
			];

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => [ r.type, r.label ] ) ).toEqual( [
				[ 'page', 'Main Page' ],
				[ 'go', 'zzqx' ],
				[ 'link', 'History' ],
				[ 'revision', 'Main Page' ]
			] );
			expect( storage[ RECENT_KEY ].entries ).toHaveLength( 4 );
			expect( storage[ LEGACY_KEY ] ).toBeUndefined();
		} );

		it( 'keeps one entry per page, at its newest position, within the limit', () => {
			const others = Array.from( { length: 14 }, ( _, i ) => page( `P${ i }` ) );
			storage[ LEGACY_KEY ] = [
				others[ 0 ],
				page( 'Dup' ),
				others[ 1 ],
				others[ 2 ],
				page( 'Dup' ),
				...others.slice( 3 )
			];

			service.getRecentItems();

			const labels = storage[ RECENT_KEY ].entries.map( ( e ) => e.label );
			expect( labels ).toHaveLength( 13 );
			expect( labels ).toEqual( [
				'P0', 'Dup', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11'
			] );
		} );

		it( 'prefers the current format when both are stored', () => {
			storage[ RECENT_KEY ] = {
				version: 1,
				entries: [ { kind: 'page', key: 'page:A', label: 'A', url: '/wiki/A', savedAt: 1 } ]
			};
			storage[ LEGACY_KEY ] = [ page( 'B' ) ];

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => r.label ) ).toEqual( [ 'A' ] );
			expect( storage[ LEGACY_KEY ] ).toBeUndefined();
		} );

		it( 'converts a history with nothing usable into an empty one', () => {
			storage[ LEGACY_KEY ] = [ { id: 'n', label: 'No link' } ];

			expect( service.getRecentItems() ).toEqual( [] );
			expect( storage[ RECENT_KEY ] ).toEqual( { version: 1, entries: [] } );
			expect( storage[ LEGACY_KEY ] ).toBeUndefined();
		} );

		it( 'keeps the earlier history when the converted one cannot be stored', () => {
			storage[ LEGACY_KEY ] = [ page( 'A' ) ];
			mw.storage.setObject = vi.fn( () => false );

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => r.label ) ).toEqual( [ 'A' ] );
			expect( storage[ LEGACY_KEY ] ).toEqual( [ page( 'A' ) ] );
		} );
	} );

	describe( 'removeRecentItem', () => {
		it( 'removes the place the dismissed row shows', () => {
			service.saveRecentItem( page( 'A' ) );
			service.saveRecentItem( page( 'B' ) );
			const [ rowB ] = service.getRecentItems();

			service.removeRecentItem( rowB );

			expect( storage[ RECENT_KEY ].entries.map( ( e ) => e.label ) ).toEqual( [ 'A' ] );
		} );

		it( 'writes nothing when no place matches', () => {
			service.saveRecentItem( page( 'A' ) );
			mw.storage.setObject.mockClear();

			service.removeRecentItem( page( 'Unrelated' ) );

			expect( mw.storage.setObject ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'clearHistory', () => {
		it( 'removes the history in either format', () => {
			storage[ RECENT_KEY ] = { version: 1, entries: [] };
			storage[ LEGACY_KEY ] = [];

			service.clearHistory();

			expect( storage ).toEqual( {} );
		} );
	} );

	describe( 'a history from a newer version', () => {
		it( 'reads as empty and is never overwritten', () => {
			const newer = { version: 2, entries: [ { anything: true } ] };
			storage[ RECENT_KEY ] = JSON.parse( JSON.stringify( newer ) );
			storage[ LEGACY_KEY ] = [ page( 'B' ) ];

			service.saveRecentItem( page( 'A' ) );
			const rows = service.getRecentItems();

			expect( rows ).toEqual( [] );
			expect( storage[ RECENT_KEY ] ).toEqual( newer );
		} );
	} );

	describe( 'a row its mode describes', () => {
		const opened = '/w/index.php?title=Main_Page&diff=prev&oldid=5';
		const revisionRow = { id: 'r5', type: 'revision', label: '5m · Alice', url: '/w/index.php?title=Main_Page&oldid=5', user: 'Alice', timestamp: '2026-10-01T00:00:00Z' };
		const historyMode = {
			id: 'history',
			remember: ( item ) => ( { kind: 'revision', label: 'Main Page', data: { author: item.user, timestamp: item.timestamp, summary: 'Fix typo' } } )
		};

		it( 'stores what the mode chose, with the mode', () => {
			service.saveRecentItem( revisionRow, opened, historyMode );

			expect( storage[ RECENT_KEY ].entries[ 0 ] ).toMatchObject( {
				kind: 'revision',
				label: 'Main Page',
				url: opened,
				mode: 'history',
				data: { author: 'Alice', timestamp: '2026-10-01T00:00:00Z', summary: 'Fix typo' }
			} );
		} );

		it( 'keeps the mode\'s entry when the place is reopened from Recent', () => {
			service.saveRecentItem( revisionRow, opened, historyMode );
			const [ recentRow ] = service.getRecentItems();

			service.saveRecentItem( recentRow, recentRow.url );

			expect( storage[ RECENT_KEY ].entries ).toHaveLength( 1 );
			expect( storage[ RECENT_KEY ].entries[ 0 ] ).toMatchObject( { mode: 'history', data: { author: 'Alice' } } );
		} );

		it( 'leaves out a row its mode declines', () => {
			service.saveRecentItem( revisionRow, opened, { id: 'x', remember: () => null } );

			expect( storage[ RECENT_KEY ] ).toBeUndefined();
		} );

		it( 'reads the place from the link when the mode says nothing or fails', () => {
			mw.log.error.mockClear();

			service.saveRecentItem( revisionRow, opened, { id: 'x', remember: () => undefined } );
			service.saveRecentItem( page( 'B' ), '/wiki/B', {
				id: 'y',
				remember: () => {
					throw new Error( 'boom' );
				}
			} );

			expect( storage[ RECENT_KEY ].entries.map( ( e ) => [ e.kind, e.mode ] ) ).toEqual( [
				[ 'page', undefined ],
				[ 'revision', undefined ]
			] );
			expect( mw.log.error ).toHaveBeenCalled();
		} );
	} );

	describe( 'where a go landed', () => {
		const goRow = { id: 'go', type: 'action', label: 'main page', url: '/wiki/Special:Search?search=main+page', source: 'queryAction:go' };

		it( 'leaves a note naming the go', () => {
			vi.spyOn( Date, 'now' ).mockReturnValue( 1000 );

			service.saveRecentItem( goRow );

			expect( session[ GO_NOTE_KEY ] ).toEqual( { key: 'page:Main page', query: 'main page', expires: 61000 } );
			expect( storage[ GO_NOTE_KEY ] ).toBeUndefined();
		} );

		it( 'leaves no note for anything but a go', () => {
			service.saveRecentItem( page( 'A' ) );

			expect( session[ GO_NOTE_KEY ] ).toBeUndefined();
		} );

		it( 'keeps a go to a special page as typed, leaving no note', () => {
			const specialGo = { id: 'go', type: 'action', label: 'Special:Random', url: '/wiki/Special:Search?search=Special%3ARandom', source: 'queryAction:go' };

			service.saveRecentItem( specialGo );

			expect( storage[ RECENT_KEY ].entries.map( ( e ) => [ e.kind, e.label ] ) ).toEqual( [ [ 'go', 'Special:Random' ] ] );
			expect( session[ GO_NOTE_KEY ] ).toBeUndefined();
		} );

		it( 'keeps a go opened in a new tab as typed, leaving no note', () => {
			service.saveRecentItem( { ...goRow, newTab: true } );

			expect( storage[ RECENT_KEY ].entries.map( ( e ) => [ e.kind, e.label ] ) ).toEqual( [ [ 'go', 'main page' ] ] );
			expect( session[ GO_NOTE_KEY ] ).toBeUndefined();
		} );

		it( 'keeps a go opened with a modifier click as typed, leaving no note', () => {
			service.saveRecentItem( { ...goRow, modifierClick: true } );

			expect( storage[ RECENT_KEY ].entries.map( ( e ) => [ e.kind, e.label ] ) ).toEqual( [ [ 'go', 'main page' ] ] );
			expect( session[ GO_NOTE_KEY ] ).toBeUndefined();
		} );

		it( 'shows the page a go landed on in its place', () => {
			service.saveRecentItem( page( 'Other' ) );
			service.saveRecentItem( goRow );
			storage[ GO_LANDING_KEY ] = { key: 'page:Main page', url: '/wiki/Main_Page', label: 'Main Page' };

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => [ r.type, r.label ] ) ).toEqual( [ [ 'page', 'Main Page' ], [ 'page', 'Other' ] ] );
			expect( storage[ RECENT_KEY ].entries[ 0 ].url ).toBe( '/wiki/Main_Page' );
			expect( storage[ GO_LANDING_KEY ] ).toBeUndefined();
		} );

		it( 'merges the landing with an entry already there for that page', () => {
			service.saveRecentItem( page( 'Main_Page' ) );
			service.saveRecentItem( page( 'Other' ) );
			service.saveRecentItem( goRow );
			storage[ GO_LANDING_KEY ] = { key: 'page:Main page', url: '/wiki/Main_Page', label: 'Main Page' };

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => r.label ) ).toEqual( [ 'Main Page', 'Other' ] );
		} );

		it( 'shows a go that searched as that search', () => {
			service.saveRecentItem( goRow );
			storage[ GO_LANDING_KEY ] = { key: 'page:Main page', searched: true };

			const [ row ] = service.getRecentItems();

			expect( row ).toMatchObject( { type: 'search', label: 'main page' } );
			expect( row.url ).toBe( '/wiki/Special:Search?search=main+page&fulltext=1' );
		} );

		it( 'drops a landing whose go is gone', () => {
			service.saveRecentItem( page( 'A' ) );
			storage[ GO_LANDING_KEY ] = { key: 'page:Nothing', url: '/wiki/Nothing', label: 'Nothing' };

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => r.label ) ).toEqual( [ 'A' ] );
			expect( storage[ GO_LANDING_KEY ] ).toBeUndefined();
		} );

		it( 'drops a landing whose link is not text, keeping the go', () => {
			service.saveRecentItem( goRow );
			storage[ GO_LANDING_KEY ] = { key: 'page:Main page', url: 5, label: 'Main Page' };

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => [ r.type, r.label ] ) ).toEqual( [ [ 'go', 'main page' ] ] );
			expect( storage[ GO_LANDING_KEY ] ).toBeUndefined();
		} );

		it( 'drops a landing whose label is not text, keeping the go', () => {
			service.saveRecentItem( goRow );
			storage[ GO_LANDING_KEY ] = { key: 'page:Main page', url: '/wiki/Main_Page', label: { x: 1 } };

			const rows = service.getRecentItems();

			expect( rows.map( ( r ) => [ r.type, r.label ] ) ).toEqual( [ [ 'go', 'main page' ] ] );
			expect( storage[ RECENT_KEY ].entries.map( ( e ) => e.kind ) ).toEqual( [ 'go' ] );
		} );

		it( 'leaves no note when the go could not be remembered', () => {
			const newer = { version: 2, entries: [] };
			storage[ RECENT_KEY ] = JSON.parse( JSON.stringify( newer ) );

			service.saveRecentItem( goRow );

			expect( session[ GO_NOTE_KEY ] ).toBeUndefined();
			expect( storage[ RECENT_KEY ] ).toEqual( newer );
		} );
	} );
} );
