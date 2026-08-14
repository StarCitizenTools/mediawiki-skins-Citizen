/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createAppendQueryActions = require( '../../../../resources/skins.citizen.commandPalette/utils/appendQueryActions.js' );

describe( 'createAppendQueryActions', () => {
	beforeEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'returns items unchanged when query is empty', () => {
		const appendQueryActions = createAppendQueryActions();
		const items = [ { id: 'existing-item' } ];

		const result = appendQueryActions( items, '' );

		expect( result ).toBe( items );
	} );

	it( 'appends fulltext search action item', () => {
		const appendQueryActions = createAppendQueryActions();

		const result = appendQueryActions( [], 'test query' );

		const fulltextAction = result.find( ( item ) => item.id === 'citizen-command-palette-item-fulltext-search' );
		expect( fulltextAction ).toBeDefined();
		expect( fulltextAction.type ).toBe( 'action' );
		expect( fulltextAction.label ).toBe( 'test query' );
		expect( fulltextAction.source ).toBe( 'queryAction:fulltext-search' );
		expect( fulltextAction.url ).toBe( '/wiki/Special:Search?search=test+query&fulltext=1' );
	} );

	it( 'no longer emits the media-search action (handled by the file mode now)', () => {
		const appendQueryActions = createAppendQueryActions();

		const result = appendQueryActions( [], 'cat photos' );

		const mediaAction = result.find( ( item ) => item.id === 'citizen-command-palette-item-media-search' );
		expect( mediaAction ).toBeUndefined();
	} );

	it( 'preserves original items at the beginning', () => {
		const appendQueryActions = createAppendQueryActions();
		const originalItems = [
			{ id: 'first-item', label: 'First' },
			{ id: 'second-item', label: 'Second' }
		];

		const result = appendQueryActions( originalItems, 'query' );

		expect( result[ 0 ] ).toEqual( originalItems[ 0 ] );
		expect( result[ 1 ] ).toEqual( originalItems[ 1 ] );
		expect( result.length ).toBeGreaterThan( originalItems.length );
	} );

	describe( 'lead/trail split', () => {
		it( 'always performs a full-text search, never a near-match redirect', () => {
			const appendQueryActions = createAppendQueryActions();

			// Without fulltext, Special:Search redirects to the page when the
			// query is an exact title, so this row would sometimes navigate
			// rather than search.
			const lead = appendQueryActions.leadActions( 'Main Page' );

			expect( lead[ 0 ].url ).toContain( 'fulltext=1' );
		} );

		it( 'exposes the fulltext action on its own so it can be positioned first', () => {
			const appendQueryActions = createAppendQueryActions();

			const lead = appendQueryActions.leadActions( 'test query' );

			expect( lead ).toHaveLength( 1 );
			expect( lead[ 0 ].source ).toBe( 'queryAction:fulltext-search' );
		} );

		it( 'keeps the fulltext action out of the trailing set', () => {
			const appendQueryActions = createAppendQueryActions();

			const trail = appendQueryActions.trailActions( 'test query' );

			expect( trail.every( ( i ) => i.source !== 'queryAction:fulltext-search' ) ).toBe( true );
		} );

		it( 'returns nothing for either half when the query is empty', () => {
			const appendQueryActions = createAppendQueryActions();

			expect( appendQueryActions.leadActions( '' ) ).toEqual( [] );
			expect( appendQueryActions.trailActions( '' ) ).toEqual( [] );
		} );

		it( 'produces a fresh row per call, so it always matches the current query', () => {
			const appendQueryActions = createAppendQueryActions();

			const first = appendQueryActions.leadActions( 'sun' );
			const second = appendQueryActions.leadActions( 'sunset' );

			expect( first[ 0 ].label ).toBe( 'sun' );
			expect( second[ 0 ].label ).toBe( 'sunset' );
			expect( second[ 0 ].url ).toBe( '/wiki/Special:Search?search=sunset&fulltext=1' );
		} );

		it( 'combined call still yields the same set as the two halves', () => {
			const appendQueryActions = createAppendQueryActions();

			const combined = appendQueryActions( [], 'q' ).map( ( i ) => i.source );
			const split = appendQueryActions.leadActions( 'q' )
				.concat( appendQueryActions.trailActions( 'q' ) )
				.map( ( i ) => i.source );

			expect( combined ).toEqual( split );
		} );
	} );
} );
