/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createAppendQueryActions = require( '../../../../resources/skins.citizen.commandPalette/utils/appendQueryActions.js' );

// Enough of mw.Title for the decorator: underscores read as spaces and the
// first letter is capitalised, as on a wiki with $wgCapitalLinks.
function stubTitle( text ) {
	const normalized = text.replace( /_/g, ' ' ).trim();
	if ( !normalized || /[{}[\]]/.test( normalized ) ) {
		return null;
	}
	return {
		getPrefixedText: () => normalized.charAt( 0 ).toUpperCase() + normalized.slice( 1 )
	};
}

function pageResult( id, title, linkedTitle ) {
	return {
		id,
		type: 'page',
		label: title,
		description: `About ${ title }`,
		url: mw.util.getUrl( linkedTitle || title ),
		thumbnail: { url: `${ id }.jpg` },
		source: 'search'
	};
}

describe( 'createAppendQueryActions', () => {
	beforeEach( () => {
		vi.restoreAllMocks();
		mw.config.get = vi.fn( () => null );
		mw.user = { options: { get: vi.fn( () => true ) } };
		mw.Title = { newFromText: vi.fn( stubTitle ) };
	} );

	describe( 'queryActions', () => {
		it( 'builds the full-text search row from the query', () => {
			const { queryActions } = createAppendQueryActions();

			const { trail } = queryActions( 'test query' );

			expect( trail[ 0 ] ).toMatchObject( {
				id: 'citizen-command-palette-item-fulltext-search',
				type: 'action',
				label: 'test query',
				source: 'queryAction:fulltext-search',
				url: '/wiki/Special:Search?search=test+query&fulltext=1'
			} );
		} );

		it( 'no longer emits the media-search action (handled by the file mode now)', () => {
			const { queryActions } = createAppendQueryActions();

			const { lead, trail } = queryActions( 'cat photos', { leads: true } );

			expect( lead.concat( trail ).map( ( i ) => i.id ) )
				.not.toContain( 'citizen-command-palette-item-media-search' );
		} );

		it( 'leads a search with a row that lets Special:Search resolve the title', () => {
			const { queryActions } = createAppendQueryActions();

			const { lead } = queryActions( 'Main Page', { leads: true } );

			expect( lead ).toHaveLength( 1 );
			expect( lead[ 0 ].source ).toBe( 'queryAction:go' );
			expect( lead[ 0 ].label ).toBe( 'Main Page' );
			expect( lead[ 0 ].url ).toBe( '/wiki/Special:Search?search=Main+Page' );
		} );

		it( 'keeps a real full-text search after the results', () => {
			const { queryActions } = createAppendQueryActions();

			const { trail } = queryActions( 'Main Page', { leads: true } );

			expect( trail.map( ( i ) => i.source ) ).toEqual( [ 'queryAction:fulltext-search' ] );
			expect( trail[ 0 ].url ).toBe( '/wiki/Special:Search?search=Main+Page&fulltext=1' );
		} );

		it( 'offers the edit row after the full-text search when the page is editable', () => {
			mw.config.get.mockImplementation( ( key ) => key === 'wgRelevantPageIsProbablyEditable' );
			const { queryActions } = createAppendQueryActions();

			const { trail } = queryActions( 'Main Page', { leads: true } );

			expect( trail.map( ( i ) => i.source ) ).toEqual( [
				'queryAction:fulltext-search',
				'queryAction:page-edit'
			] );
		} );

		it( 'gives a query that does not lead no go row', () => {
			const { queryActions } = createAppendQueryActions();

			const { lead, trail } = queryActions( '#cat' );

			expect( lead ).toEqual( [] );
			expect( trail.map( ( i ) => i.source ) ).toEqual( [ 'queryAction:fulltext-search' ] );
		} );

		it( 'returns nothing for either group when the query is empty', () => {
			const { queryActions } = createAppendQueryActions();

			expect( queryActions( '', { leads: true } ) )
				.toEqual( { lead: [], trail: [] } );
			expect( queryActions( '' ) )
				.toEqual( { lead: [], trail: [] } );
		} );

		it( 'produces a fresh row per call, so it always matches the current query', () => {
			const { queryActions } = createAppendQueryActions();

			const first = queryActions( 'sun', { leads: true } ).lead;
			const second = queryActions( 'sunset', { leads: true } ).lead;

			expect( first[ 0 ].label ).toBe( 'sun' );
			expect( second[ 0 ].label ).toBe( 'sunset' );
			expect( second[ 0 ].url ).toBe( '/wiki/Special:Search?search=sunset' );
		} );

		describe( 'when a result is the page the query names', () => {
			it( 'shows that result in the lead, keeping the lead\'s link', () => {
				const { queryActions } = createAppendQueryActions();
				const results = [
					pageResult( 'p1', 'Main Page archive' ),
					pageResult( 'p2', 'Main Page' )
				];

				const { lead } = queryActions(
					'main_Page', { leads: true, results }
				);

				expect( lead ).toEqual( [ {
					...results[ 1 ],
					url: '/wiki/Special:Search?search=main_Page'
				} ] );
			} );

			it( 'recognises a title reached through a redirect', () => {
				const { queryActions } = createAppendQueryActions();
				const results = [ pageResult( 'us', 'United States', 'USA' ) ];

				const { lead } = queryActions(
					'USA', { leads: true, results }
				);

				expect( lead[ 0 ].id ).toBe( 'us' );
				expect( lead[ 0 ].label ).toBe( 'United States' );
			} );

			it( 'keeps the plain go row when no result is that page', () => {
				const { queryActions } = createAppendQueryActions();
				const results = [ pageResult( 'p1', 'Main Page archive' ) ];

				const { lead } = queryActions(
					'Main Page', { leads: true, results }
				);

				expect( lead[ 0 ].source ).toBe( 'queryAction:go' );
			} );

			it( 'keeps the plain go row when the query is not a valid title', () => {
				const { queryActions } = createAppendQueryActions();
				const results = [ pageResult( 'p1', 'Template:Navbox' ) ];

				const { lead } = queryActions(
					'{{Navbox}}', { leads: true, results }
				);

				expect( lead[ 0 ].source ).toBe( 'queryAction:go' );
			} );
		} );

		describe( 'when Special:Search does not go to exact matches', () => {
			beforeEach( () => {
				mw.user.options.get.mockImplementation(
					( key ) => key === 'search-match-redirect' ? 0 : null
				);
			} );

			it( 'leads with the full-text search, as the search page would show', () => {
				const { queryActions } = createAppendQueryActions();

				const { lead, trail } = queryActions(
					'Main Page', { leads: true }
				);

				expect( lead.map( ( i ) => i.source ) ).toEqual( [ 'queryAction:fulltext-search' ] );
				expect( trail.map( ( i ) => i.source ) ).not.toContain( 'queryAction:fulltext-search' );
			} );

			it( 'does not show a result in the lead', () => {
				const { queryActions } = createAppendQueryActions();
				const results = [ pageResult( 'p1', 'Main Page' ) ];

				const { lead } = queryActions(
					'Main Page', { leads: true, results }
				);

				expect( lead[ 0 ].source ).toBe( 'queryAction:fulltext-search' );
			} );
		} );
	} );
} );
