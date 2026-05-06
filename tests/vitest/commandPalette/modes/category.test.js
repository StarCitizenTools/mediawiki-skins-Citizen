const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createCategoryMode = require(
	'../../../../resources/skins.citizen.commandPalette/modes/category.js'
);

describe( 'category mode', () => {
	let mockGet;
	let mode;

	beforeEach( () => {
		mockGet = vi.fn();
		const ApiConstructor = function () {
			this.get = mockGet;
		};

		mw.config.get = vi.fn( ( key ) => {
			if ( key === 'wgCategories' ) {
				return [ 'Living people', 'Scientists' ];
			}
			return null;
		} );
		mw.log.error.mockClear();

		mode = createCategoryMode( ApiConstructor );
	} );

	describe( 'mode definition', () => {
		it( 'has correct id and triggers', () => {
			expect( mode.id ).toBe( 'category' );
			expect( mode.triggers ).toEqual( [ '/cat:', '#' ] );
		} );

		it( 'exposes headerLabel function', () => {
			expect( typeof mode.headerLabel ).toBe( 'function' );
		} );

		it( 'has emptyState with title and description', () => {
			expect( mode.emptyState ).toBeDefined();
			expect( mode.emptyState.title ).toBeTruthy();
			expect( mode.emptyState.description ).toBeTruthy();
		} );

		it( 'has noResults function returning title and description', () => {
			const state = mode.noResults( 'foo' );

			expect( state.title ).toBeTruthy();
			expect( state.description ).toBeTruthy();
		} );
	} );

	describe( 'getResults — root empty', () => {
		it( 'returns wgCategories items without API call', async () => {
			const results = await mode.getResults( '', undefined, [], [] );

			expect( mockGet ).not.toHaveBeenCalled();
			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'Living people', 'Scientists' ] );
			expect( results[ 0 ].type ).toBe( 'category' );
		} );

		it( 'attaches view + edit actions to category items', async () => {
			const results = await mode.getResults( '', undefined, [], [] );

			const actionIds = results[ 0 ].actions.map( ( a ) => a.id );
			expect( actionIds ).toEqual( [ 'view', 'edit' ] );
			expect( results[ 0 ].actions[ 0 ].url ).toContain( 'Category:Living people' );
			expect( results[ 0 ].actions[ 1 ].url ).toContain( 'action=edit' );
		} );

		it( 'returns empty array when wgCategories is missing', async () => {
			mw.config.get = vi.fn().mockReturnValue( null );

			const results = await mode.getResults( '', undefined, [], [] );

			expect( results ).toEqual( [] );
		} );
	} );

	describe( 'getResults — root typed', () => {
		it( 'calls prefixsearch with namespace 14', async () => {
			mockGet.mockResolvedValue( {
				query: { prefixsearch: [ { title: 'Category:Animals' } ] }
			} );

			const results = await mode.getResults( 'ani', undefined, [], [] );

			expect( mockGet ).toHaveBeenCalledTimes( 1 );
			const params = mockGet.mock.calls[ 0 ][ 0 ];
			expect( params.list ).toBe( 'prefixsearch' );
			expect( params.psnamespace ).toBe( 14 );
			expect( params.pssearch ).toBe( 'ani' );
			expect( results[ 0 ].label ).toBe( 'Animals' );
			expect( results[ 0 ].type ).toBe( 'category' );
		} );

		it( 'returns empty array on API error and logs', async () => {
			mockGet.mockRejectedValue( new Error( 'boom' ) );

			const results = await mode.getResults( 'ani', undefined, [], [] );

			expect( results ).toEqual( [] );
			expect( mw.log.error ).toHaveBeenCalled();
		} );

		it( 'returns empty array silently on AbortError', async () => {
			const abort = new Error( 'aborted' );
			abort.name = 'AbortError';
			mockGet.mockRejectedValue( abort );

			const results = await mode.getResults( 'ani', undefined, [], [] );

			expect( results ).toEqual( [] );
			expect( mw.log.error ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'getResults — drilled', () => {
		it( 'calls categorymembers with the top of the context stack', async () => {
			mockGet.mockResolvedValue( {
				query: { categorymembers: [
					{ ns: 14, title: 'Category:Mammals' },
					{ ns: 0, title: 'Lion' }
				] }
			} );

			const context = [ { title: 'Animals' } ];
			const results = await mode.getResults( '', undefined, [], context );

			const params = mockGet.mock.calls[ 0 ][ 0 ];
			expect( params.list ).toBe( 'categorymembers' );
			expect( params.cmtitle ).toBe( 'Category:Animals' );
			expect( params.cmtype ).toBe( 'subcat|page' );
			expect( results[ 0 ].label ).toBe( 'Mammals' );
			expect( results[ 0 ].type ).toBe( 'category' );
			expect( results[ 1 ].label ).toBe( 'Lion' );
			expect( results[ 1 ].type ).toBe( 'page' );
		} );

		it( 'attaches edit action to page items', async () => {
			mockGet.mockResolvedValue( {
				query: { categorymembers: [ { ns: 0, title: 'Lion' } ] }
			} );

			const results = await mode.getResults( '', undefined, [], [ { title: 'Cats' } ] );

			expect( results[ 0 ].actions ).toHaveLength( 1 );
			expect( results[ 0 ].actions[ 0 ].id ).toBe( 'edit' );
			expect( results[ 0 ].actions[ 0 ].url ).toContain( 'action=edit' );
		} );

		it( 'uses the deepest entry on the stack', async () => {
			mockGet.mockResolvedValue( { query: { categorymembers: [] } } );

			const context = [ { title: 'Animals' }, { title: 'Mammals' } ];
			await mode.getResults( '', undefined, [], context );

			expect( mockGet.mock.calls[ 0 ][ 0 ].cmtitle ).toBe( 'Category:Mammals' );
		} );

		it( 'filters drilled results client-side by case-insensitive prefix', async () => {
			mockGet.mockResolvedValue( {
				query: { categorymembers: [
					{ ns: 14, title: 'Category:Cats' },
					{ ns: 14, title: 'Category:Dogs' },
					{ ns: 0, title: 'Cheetah' }
				] }
			} );

			const context = [ { title: 'Mammals' } ];
			const results = await mode.getResults( 'c', undefined, [], context );

			const labels = results.map( ( r ) => r.label );
			expect( labels ).toEqual( [ 'Cats', 'Cheetah' ] );
		} );
	} );

	describe( 'onResultSelect', () => {
		it( 'returns pushModeContext for category items', () => {
			const result = mode.onResultSelect( { type: 'category', value: 'Animals' } );

			expect( result ).toEqual( {
				action: 'pushModeContext',
				payload: { title: 'Animals' }
			} );
		} );

		it( 'returns navigate for page items with url', () => {
			const result = mode.onResultSelect( { type: 'page', url: '/wiki/Lion' } );

			expect( result ).toEqual( { action: 'navigate', payload: '/wiki/Lion' } );
		} );

		it( 'returns none for items without url and not a category', () => {
			const result = mode.onResultSelect( { type: 'page' } );

			expect( result ).toEqual( { action: 'none' } );
		} );
	} );

	describe( 'headerLabel', () => {
		it( 'returns null when context is empty so the header falls back to placeholder', () => {
			expect( mode.headerLabel( [] ) ).toBeNull();
			expect( mode.headerLabel( undefined ) ).toBeNull();
		} );

		it( 'joins context segments with /', () => {
			const label = mode.headerLabel( [ { title: 'Animals' }, { title: 'Mammals' } ] );

			expect( label ).toContain( 'Animals' );
			expect( label ).toContain( 'Mammals' );
			expect( label ).toMatch( /Animals \/ Mammals$/ );
		} );
	} );
} );
