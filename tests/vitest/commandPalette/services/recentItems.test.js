// @vitest-environment jsdom
/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const mwTitle = require( '../../mocks/mwTitle.js' );

const createRecentItems = require( '../../../../resources/skins.citizen.commandPalette/services/recentItems.js' );

const RECENT_ITEMS_KEY = 'skin-citizen-command-palette-recent-items';

function stored() {
	return mw.storage.getObject( RECENT_ITEMS_KEY );
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
		} );
		mw.storage.remove = vi.fn( ( key ) => {
			delete storage[ key ];
		} );

		service = createRecentItems();
	} );

	describe( 'saveRecentItem', () => {
		it( 'saves an item to storage', () => {
			const item = { id: 'item-1', label: 'Test Page' };

			service.saveRecentItem( item );

			const stored = mw.storage.getObject( 'skin-citizen-command-palette-recent-items' );
			expect( stored ).toHaveLength( 1 );
			expect( stored[ 0 ] ).toEqual( item );
		} );

		it( 'moves duplicate items to the front', () => {
			const itemA = { id: 'item-a', label: 'Page A' };
			const itemB = { id: 'item-b', label: 'Page B' };
			const itemC = { id: 'item-c', label: 'Page C' };

			service.saveRecentItem( itemA );
			service.saveRecentItem( itemB );
			service.saveRecentItem( itemC );
			service.saveRecentItem( itemA );

			const stored = mw.storage.getObject( 'skin-citizen-command-palette-recent-items' );
			expect( stored ).toHaveLength( 3 );
			expect( stored[ 0 ].id ).toBe( 'item-a' );
			expect( stored[ 1 ].id ).toBe( 'item-c' );
			expect( stored[ 2 ].id ).toBe( 'item-b' );
		} );

		it( 'does not remember how the item was activated', () => {
			// A row saved from a Ctrl+click would otherwise replay that
			// activation for good -- opening a new tab, or navigating
			// nowhere at all, on every later plain Enter.
			const item = {
				id: 'item-1',
				label: 'Test Page',
				isMouseClick: true,
				modifierClick: true,
				newTab: true
			};

			service.saveRecentItem( item );

			const stored = mw.storage.getObject( 'skin-citizen-command-palette-recent-items' );
			expect( stored[ 0 ] ).toEqual( { id: 'item-1', label: 'Test Page' } );
		} );

		it( 'enforces maximum of 5 items', () => {
			for ( let i = 1; i <= 7; i++ ) {
				service.saveRecentItem( { id: `item-${ i }`, label: `Page ${ i }` } );
			}

			const stored = mw.storage.getObject( 'skin-citizen-command-palette-recent-items' );
			expect( stored ).toHaveLength( 5 );
			expect( stored[ 0 ].id ).toBe( 'item-7' );
			expect( stored[ 4 ].id ).toBe( 'item-3' );
		} );
	} );

	describe( 'one entry per destination', () => {
		const searchResult = {
			id: 'citizen-command-palette-item-page-User:Alistair3149',
			type: 'page',
			label: 'User:Alistair3149',
			url: '/wiki/User:Alistair3149'
		};
		const userResult = {
			id: 'citizen-command-palette-item-user-7',
			type: 'user',
			label: 'Alistair3149',
			url: '/wiki/User:Alistair3149'
		};
		const other = { id: 'other', type: 'page', label: 'Other', url: '/wiki/Other' };

		it( 'keeps a mode\'s own entry over a page result for the same page', () => {
			service.saveRecentItem( searchResult );

			service.saveRecentItem( userResult );

			expect( stored() ).toEqual( [ userResult ] );
		} );

		it( 'keeps the mode\'s entry, moved to the top, when the page result is opened later', () => {
			service.saveRecentItem( userResult );
			service.saveRecentItem( other );

			service.saveRecentItem( searchResult );

			expect( stored() ).toEqual( [ userResult, other ] );
		} );

		it( 'shows the newest of two entries that are equally specific', () => {
			const categoryMember = { ...searchResult, id: 'citizen-command-palette-item-categorymember-User:Alistair3149' };
			service.saveRecentItem( searchResult );

			service.saveRecentItem( categoryMember );

			expect( stored() ).toEqual( [ categoryMember ] );
		} );

		it( 'counts a go row as the page its query names', () => {
			const go = {
				id: 'citizen-command-palette-item-go-akita',
				type: 'action',
				label: 'akita',
				url: '/w/index.php?title=Special:Search&search=akita'
			};
			const page = { id: 'page-Akita', type: 'page', label: 'Akita', url: '/wiki/Akita' };
			service.saveRecentItem( page );
			service.saveRecentItem( other );

			service.saveRecentItem( go );

			expect( stored() ).toEqual( [ page, other ] );
		} );

		it( 'keeps each full-text search as its own entry', () => {
			const fulltext = ( query ) => ( {
				id: `citizen-command-palette-item-fulltext-search-${ query }`,
				type: 'action',
				label: query,
				url: `/w/index.php?title=Special:Search&search=${ query }&fulltext=1`
			} );
			service.saveRecentItem( fulltext( 'sun' ) );
			service.saveRecentItem( fulltext( 'moon' ) );

			service.saveRecentItem( fulltext( 'sun' ) );

			expect( stored().map( ( i ) => i.label ) ).toEqual( [ 'sun', 'moon' ] );
		} );

	} );

	describe( 'getRecentItems', () => {
		it( 'returns empty array when no items saved', () => {
			const result = service.getRecentItems();

			expect( result ).toEqual( [] );
		} );

		it( 'adds dismiss action to each item', () => {
			service.saveRecentItem( { id: 'item-1', label: 'Page 1' } );
			service.saveRecentItem( { id: 'item-2', label: 'Page 2' } );

			const result = service.getRecentItems();

			expect( result ).toHaveLength( 2 );
			for ( const item of result ) {
				const dismissAction = item.actions.find( ( a ) => a.id === 'dismiss' );
				expect( dismissAction ).toBeDefined();
				expect( dismissAction.label ).toBe( 'citizen-command-palette-dismiss' );
			}
		} );

		it( 'drops activation flags left behind by an earlier version', () => {
			mw.storage.setObject( 'skin-citizen-command-palette-recent-items', [
				{ id: 'item-1', label: 'Page 1', isMouseClick: true, modifierClick: false }
			] );

			const result = service.getRecentItems();

			expect( result[ 0 ].isMouseClick ).toBeUndefined();
			expect( result[ 0 ].modifierClick ).toBeUndefined();
		} );

		it( 'keeps one entry per page from a history an earlier version saved', () => {
			mw.storage.setObject( RECENT_ITEMS_KEY, [
				{ id: 'page', type: 'page', label: 'User:Foo', url: '/wiki/User:Foo' },
				{ id: 'user', type: 'user', label: 'Foo', url: '/wiki/User:Foo' },
				{ id: 'bar', type: 'page', label: 'Bar', url: '/wiki/Bar' }
			] );

			const result = service.getRecentItems();

			expect( result.map( ( i ) => i.id ) ).toEqual( [ 'user', 'bar' ] );
		} );

		it( 'does not duplicate dismiss action if already present', () => {
			const existingDismiss = { id: 'dismiss', label: 'Already there', icon: 'some-icon' };
			service.saveRecentItem( { id: 'item-1', label: 'Page 1', actions: [ existingDismiss ] } );

			const result = service.getRecentItems();

			const dismissActions = result[ 0 ].actions.filter( ( a ) => a.id === 'dismiss' );
			expect( dismissActions ).toHaveLength( 1 );
		} );
	} );

	describe( 'removeRecentItem', () => {
		it( 'removes a specific item by id', () => {
			service.saveRecentItem( { id: 'item-1', label: 'Page 1' } );
			service.saveRecentItem( { id: 'item-2', label: 'Page 2' } );
			service.saveRecentItem( { id: 'item-3', label: 'Page 3' } );

			service.removeRecentItem( { id: 'item-2' } );

			const stored = mw.storage.getObject( 'skin-citizen-command-palette-recent-items' );
			expect( stored ).toHaveLength( 2 );
			expect( stored.find( ( i ) => i.id === 'item-2' ) ).toBeUndefined();
		} );
	} );

	describe( 'removeRecentItem — by destination', () => {
		it( 'removes every entry for the dismissed page, however it was saved', () => {
			mw.storage.setObject( RECENT_ITEMS_KEY, [
				{ id: 'page', type: 'page', label: 'User:Foo', url: '/wiki/User:Foo' },
				{ id: 'user', type: 'user', label: 'Foo', url: '/wiki/User:Foo' }
			] );
			const [ shown ] = service.getRecentItems();

			service.removeRecentItem( shown );

			expect( stored() ).toEqual( [] );
		} );
	} );

	describe( 'clearHistory', () => {
		it( 'removes all items', () => {
			service.saveRecentItem( { id: 'item-1', label: 'Page 1' } );
			service.saveRecentItem( { id: 'item-2', label: 'Page 2' } );

			service.clearHistory();

			expect( mw.storage.remove ).toHaveBeenCalledWith( 'skin-citizen-command-palette-recent-items' );
			const stored = mw.storage.getObject( 'skin-citizen-command-palette-recent-items' );
			expect( stored ).toBeNull();
		} );
	} );
} );
