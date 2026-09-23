/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createAppendQueryActions = require( '../../../../resources/skins.citizen.commandPalette/utils/appendQueryActions.js' );

describe( 'createAppendQueryActions', () => {
	beforeEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'builds the full-text search row from the query', () => {
		const { leadActions } = createAppendQueryActions();

		const lead = leadActions( 'test query' );

		expect( lead[ 0 ] ).toMatchObject( {
			id: 'citizen-command-palette-item-fulltext-search',
			type: 'action',
			label: 'test query',
			source: 'queryAction:fulltext-search',
			url: '/wiki/Special:Search?search=test+query&fulltext=1'
		} );
	} );

	it( 'no longer emits the media-search action (handled by the file mode now)', () => {
		const { leadActions, trailActions } = createAppendQueryActions();

		const rows = leadActions( 'cat photos' ).concat( trailActions( 'cat photos' ) );

		expect( rows.map( ( i ) => i.id ) )
			.not.toContain( 'citizen-command-palette-item-media-search' );
	} );

	describe( 'lead/trail split', () => {
		it( 'always performs a full-text search, never a near-match redirect', () => {
			const queryActions = createAppendQueryActions();

			// Without fulltext, Special:Search redirects to the page when the
			// query is an exact title, so this row would sometimes navigate
			// rather than search.
			const lead = queryActions.leadActions( 'Main Page' );

			expect( lead[ 0 ].url ).toContain( 'fulltext=1' );
		} );

		it( 'exposes the fulltext action on its own so it can be positioned first', () => {
			const queryActions = createAppendQueryActions();

			const lead = queryActions.leadActions( 'test query' );

			expect( lead ).toHaveLength( 1 );
			expect( lead[ 0 ].source ).toBe( 'queryAction:fulltext-search' );
		} );

		it( 'keeps the fulltext action out of the trailing set', () => {
			const queryActions = createAppendQueryActions();

			const trail = queryActions.trailActions( 'test query' );

			expect( trail.every( ( i ) => i.source !== 'queryAction:fulltext-search' ) ).toBe( true );
		} );

		it( 'returns nothing for either half when the query is empty', () => {
			const queryActions = createAppendQueryActions();

			expect( queryActions.leadActions( '' ) ).toEqual( [] );
			expect( queryActions.trailActions( '' ) ).toEqual( [] );
		} );

		it( 'produces a fresh row per call, so it always matches the current query', () => {
			const queryActions = createAppendQueryActions();

			const first = queryActions.leadActions( 'sun' );
			const second = queryActions.leadActions( 'sunset' );

			expect( first[ 0 ].label ).toBe( 'sun' );
			expect( second[ 0 ].label ).toBe( 'sunset' );
			expect( second[ 0 ].url ).toBe( '/wiki/Special:Search?search=sunset&fulltext=1' );
		} );
	} );
} );
