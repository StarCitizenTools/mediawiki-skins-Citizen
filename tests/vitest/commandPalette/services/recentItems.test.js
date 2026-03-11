/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createRecentItems = require( '../../../../resources/skins.citizen.commandPalette/services/recentItems.js' );

describe( 'createRecentItems', () => {
	let service;
	let storage;

	beforeEach( () => {
		vi.restoreAllMocks();

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
		mw.util.escapeIdForAttribute = vi.fn( ( str ) => str.replace( /[^a-zA-Z0-9-_:.]/g, '_' ) );

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

	describe( 'saveSearchQuery', () => {
		it( 'saves a search query with correct format', () => {
			service.saveSearchQuery( 'test query', '/wiki/Special:Search?search=test+query' );

			const stored = mw.storage.getObject( 'skin-citizen-command-palette-recent-items' );
			expect( stored ).toHaveLength( 1 );

			const item = stored[ 0 ];
			expect( item.type ).toBe( 'fulltext-search' );
			expect( item.id ).toBe( 'citizen-command-palette-result-search-test_query' );
			expect( item.label ).toBe( 'test query' );
			expect( item.url ).toBe( '/wiki/Special:Search?search=test+query' );
			expect( item.thumbnailIcon ).toBeDefined();
		} );
	} );
} );
