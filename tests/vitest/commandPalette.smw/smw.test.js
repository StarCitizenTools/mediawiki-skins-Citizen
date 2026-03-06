const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

const smwMode = require(
	'../../../resources/skins.citizen.commandPalette.smw/init.js'
);

describe( 'SMW mode', () => {
	describe( 'tokenPattern.match', () => {
		const match = smwMode.tokenPattern.match;

		it( 'should detect a category condition', () => {
			const result = match( '[[Category:City]]rest' );

			expect( result ).toEqual( {
				raw: '[[Category:City]]',
				label: 'Category: City'
			} );
		} );

		it( 'should detect a property condition', () => {
			const result = match( '[[Located in::Germany]]rest' );

			expect( result ).toEqual( {
				raw: '[[Located in::Germany]]',
				label: 'Located in: Germany'
			} );
		} );

		it( 'should return null for incomplete conditions', () => {
			const result = match( '[[Category:Ci' );

			expect( result ).toBeNull();
		} );

		it( 'should return null for plain text', () => {
			const result = match( 'hello world' );

			expect( result ).toBeNull();
		} );

		it( 'should match only from the start of text', () => {
			const result = match( 'prefix[[Category:City]]' );

			expect( result ).toBeNull();
		} );

		it( 'should handle greedy matching correctly', () => {
			const result = match( '[[Has::value]]extra]]' );

			expect( result ).toEqual( {
				raw: '[[Has::value]]',
				label: 'Has: value'
			} );
		} );
	} );

	describe( 'mode definition', () => {
		it( 'should have correct id', () => {
			expect( smwMode.id ).toBe( 'smw' );
		} );

		it( 'should have correct triggers', () => {
			expect( smwMode.triggers ).toEqual( [ '/smw:' ] );
		} );

		it( 'should have tokenPattern with position any, modeId smw, and activeIn smw', () => {
			expect( smwMode.tokenPattern.position ).toBe( 'any' );
			expect( smwMode.tokenPattern.modeId ).toBe( 'smw' );
			expect( smwMode.tokenPattern.activeIn ).toBe( 'smw' );
		} );

		it( 'should have getResults function', () => {
			expect( typeof smwMode.getResults ).toBe( 'function' );
		} );

		it( 'should return navigate action for items with url', () => {
			const result = smwMode.onResultSelect( { url: 'https://example.org/wiki/Berlin' } );

			expect( result ).toEqual( { action: 'navigate', payload: 'https://example.org/wiki/Berlin' } );
		} );

		it( 'should return none action for items without url', () => {
			const result = smwMode.onResultSelect( {} );

			expect( result ).toEqual( { action: 'none' } );
		} );

		it( 'should return updateQuery action for smw-category items', () => {
			const result = smwMode.onResultSelect( { type: 'smw-category', label: 'City' } );

			expect( result ).toEqual( { action: 'updateQuery', payload: '[[Category:City]]' } );
		} );

		it( 'should return updateQuery action for smw-property items', () => {
			const result = smwMode.onResultSelect( { type: 'smw-property', label: 'Located in' } );

			expect( result ).toEqual( { action: 'updateQuery', payload: '[[Located in::' } );
		} );

		it( 'should return updateQuery action for smw-value items', () => {
			const result = smwMode.onResultSelect( {
				type: 'smw-value',
				label: 'Germany',
				value: 'Located in'
			} );

			expect( result ).toEqual( {
				action: 'updateQuery',
				payload: '[[Located in::Germany]]'
			} );
		} );

		it( 'should have emptyState with title, description, and icon', () => {
			expect( smwMode.emptyState ).toBeDefined();
			expect( smwMode.emptyState.title ).toBe( 'citizen-command-palette-mode-smw-empty-title' );
			expect( smwMode.emptyState.description ).toBe( 'citizen-command-palette-mode-smw-empty-description' );
			expect( smwMode.emptyState.icon ).toBe( smwMode.icon );
		} );

		it( 'should return no-categories state for incomplete category query', () => {
			const result = smwMode.noResults( '[[Category:Ci', [] );

			expect( result.title ).toBe( 'citizen-command-palette-mode-smw-nocategories-title' );
			expect( result.description ).toBe( 'citizen-command-palette-mode-smw-nocategories-description' );
		} );

		it( 'should return no-values state for incomplete value query', () => {
			const result = smwMode.noResults( '[[Located in::Ger', [] );

			expect( result.title ).toBe( 'citizen-command-palette-mode-smw-novalues-title' );
			expect( result.description ).toBe( 'citizen-command-palette-mode-smw-novalues-description' );
		} );

		it( 'should return no-properties state for incomplete property query', () => {
			const result = smwMode.noResults( '[[SomeText', [] );

			expect( result.title ).toBe( 'citizen-command-palette-mode-smw-noproperties-title' );
			expect( result.description ).toBe( 'citizen-command-palette-mode-smw-noproperties-description' );
		} );

		it( 'should return no-results state for valid but empty query', () => {
			const result = smwMode.noResults( '[[Category:City]]', [] );

			expect( result.title ).toBe( 'citizen-command-palette-mode-smw-noresults-title' );
			expect( result.description ).toBe( 'citizen-command-palette-mode-smw-noresults-description' );
		} );

		it( 'should return malformed state when tokens plus freetext form an invalid query', () => {
			const tokens = [ { modeId: 'smw', raw: '[[Category:City]]' } ];

			const result = smwMode.noResults( 'foo', tokens );

			expect( result.title ).toBe( 'citizen-command-palette-mode-smw-malformed-title' );
		} );

		it( 'should return no-results state when tokens alone form a complete query', () => {
			const tokens = [ { modeId: 'smw', raw: '[[Category:City]]' } ];

			const result = smwMode.noResults( '', tokens );

			expect( result.title ).toBe( 'citizen-command-palette-mode-smw-noresults-title' );
		} );
	} );

	describe( 'getSmwResults', () => {
		let mockGet;

		beforeEach( () => {
			mockGet = vi.fn();
			mw.Api = function () {
				this.get = mockGet;
			};
		} );

		it( 'should return empty array for empty query', async () => {
			const result = await smwMode.getResults( '', undefined, [] );

			expect( result ).toEqual( [] );
			expect( mockGet ).not.toHaveBeenCalled();
		} );

		it( 'should fetch category suggestions for incomplete category condition', async () => {
			mockGet.mockResolvedValue( {
				query: {
					City: { label: 'City', key: 'City' }
				}
			} );

			const result = await smwMode.getResults( '[[Category:Ci' );

			expect( mockGet ).toHaveBeenCalledWith( {
				action: 'smwbrowse',
				browse: 'category',
				params: JSON.stringify( { search: 'Ci', limit: 10 } )
			} );
			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ] ).toMatchObject( {
				id: 'citizen-command-palette-item-smw-category-0',
				type: 'smw-category',
				label: 'City',
				highlightQuery: true
			} );
		} );

		it( 'should fetch value suggestions for incomplete value condition', async () => {
			mockGet.mockResolvedValue( {
				query: [ 'Germany', 'Greece' ]
			} );

			const result = await smwMode.getResults( '[[Located in::Ger' );

			expect( mockGet ).toHaveBeenCalledWith( {
				action: 'smwbrowse',
				browse: 'pvalue',
				params: JSON.stringify( { search: 'Ger', property: 'Located in', limit: 10 } )
			} );
			expect( result ).toHaveLength( 2 );
			expect( result[ 0 ] ).toMatchObject( {
				id: 'citizen-command-palette-item-smw-value-0',
				type: 'smw-value',
				label: 'Germany',
				value: 'Located in',
				highlightQuery: true
			} );
			expect( result[ 1 ] ).toMatchObject( {
				id: 'citizen-command-palette-item-smw-value-1',
				type: 'smw-value',
				label: 'Greece',
				value: 'Located in',
				highlightQuery: true
			} );
		} );

		it( 'should return empty array when freetext contains non-Ask text after tokens', async () => {
			const tokens = [
				{ modeId: 'smw', raw: '[[Category:City]]' }
			];

			const result = await smwMode.getResults( 'some freetext', undefined, tokens );

			expect( result ).toEqual( [] );
			expect( mockGet ).not.toHaveBeenCalled();
		} );

		it( 'should call Ask API and return adapted results', async () => {
			mockGet.mockResolvedValue( {
				query: {
					results: {
						'Berlin': {
							fulltext: 'Berlin',
							fullurl: 'https://example.org/wiki/Berlin'
						},
						'Munich': {
							fulltext: 'Munich',
							fullurl: 'https://example.org/wiki/Munich'
						}
					}
				}
			} );

			const result = await smwMode.getResults( '[[Category:City]]' );

			expect( mockGet ).toHaveBeenCalledWith( {
				action: 'ask',
				query: '[[Category:City]]|limit=10',
				format: 'json'
			} );
			expect( result ).toEqual( [
				{
					id: 'citizen-command-palette-item-smw-0',
					type: 'smw',
					label: 'Berlin',
					url: 'https://example.org/wiki/Berlin'
				},
				{
					id: 'citizen-command-palette-item-smw-1',
					type: 'smw',
					label: 'Munich',
					url: 'https://example.org/wiki/Munich'
				}
			] );
		} );

		it( 'should combine tokens and freeText in the query', async () => {
			mockGet.mockResolvedValue( { query: { results: {} } } );
			const tokens = [
				{ modeId: 'smw', raw: '[[Category:City]]' },
				{ modeId: 'smw', raw: '[[Located in::Germany]]' }
			];

			await smwMode.getResults( '[[Has population::>1000000]]', undefined, tokens );

			expect( mockGet ).toHaveBeenCalledWith( {
				action: 'ask',
				query: '[[Category:City]][[Located in::Germany]][[Has population::>1000000]]|limit=10',
				format: 'json'
			} );
		} );

		it( 'should return empty array on API error', async () => {
			mockGet.mockRejectedValue( new Error( 'Network error' ) );

			const result = await smwMode.getResults( '[[Category:City]]' );

			expect( result ).toEqual( [] );
		} );

		it( 'should ignore non-smw tokens', async () => {
			mockGet.mockResolvedValue( { query: { results: {} } } );
			const tokens = [
				{ modeId: 'smw', raw: '[[Category:City]]' },
				{ modeId: 'other', raw: '[[Ignored]]' }
			];

			await smwMode.getResults( '', undefined, tokens );

			expect( mockGet ).toHaveBeenCalledWith( {
				action: 'ask',
				query: '[[Category:City]]|limit=10',
				format: 'json'
			} );
		} );
	} );
} );
