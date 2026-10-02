// @vitest-environment jsdom
/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const mwTitle = require( '../../mocks/mwTitle.js' );

const createRecentItems = require( '../../../../resources/skins.citizen.commandPalette/services/recentItems.js' );

const RECENT_KEY = 'skin-citizen-command-palette-recent';
const LEGACY_KEY = 'skin-citizen-command-palette-recent-items';

function page( title ) {
	return { id: `p-${ title }`, type: 'page', label: title, url: `/wiki/${ title }`, source: 'search' };
}

describe( 'createRecentItems', () => {
	let service;
	let storage;

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

		it( 'shows nothing, without failing, when storage is unavailable', () => {
			mw.storage.getObject = vi.fn( () => false );

			expect( service.getRecentItems() ).toEqual( [] );
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
} );
