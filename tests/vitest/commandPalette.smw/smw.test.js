const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

const smwMode = require(
	'../../../resources/skins.citizen.commandPalette.smw/init.js'
);

describe( 'SMW mode', () => {
	describe( 'tokenPattern (condition)', () => {
		const match = smwMode.tokenPattern[ 0 ].match;

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

	describe( 'tokenPattern (printout)', () => {
		const match = smwMode.tokenPattern[ 1 ].match;

		it( 'should detect printout followed by pipe', () => {
			const result = match( '|?Population|next' );

			expect( result ).toEqual( {
				raw: '|?Population',
				label: 'Population'
			} );
		} );

		it( 'should detect printout with spaces followed by pipe', () => {
			const result = match( '|?Located in|next' );

			expect( result ).toEqual( {
				raw: '|?Located in',
				label: 'Located in'
			} );
		} );

		it( 'should detect printout followed by bracket', () => {
			const result = match( '|?Population[[Category:City]]' );

			expect( result ).toEqual( {
				raw: '|?Population',
				label: 'Population'
			} );
		} );

		it( 'should stop at next pipe with another printout', () => {
			const result = match( '|?Located in|?Population' );

			expect( result ).toEqual( {
				raw: '|?Located in',
				label: 'Located in'
			} );
		} );

		it( 'should detect printout with label alias followed by pipe', () => {
			const result = match( '|?Population=Pop|next' );

			expect( result ).toEqual( {
				raw: '|?Population=Pop',
				label: 'Population=Pop'
			} );
		} );

		it( 'should detect printout with format modifier followed by pipe', () => {
			const result = match( '|?Has birthday#ISO|next' );

			expect( result ).toEqual( {
				raw: '|?Has birthday#ISO',
				label: 'Has birthday#ISO'
			} );
		} );

		it( 'should return null for printout without trailing delimiter', () => {
			expect( match( '|?Population' ) ).toBeNull();
		} );

		it( 'should return null for plain text', () => {
			expect( match( 'hello' ) ).toBeNull();
		} );

		it( 'should return null for incomplete |? with no name', () => {
			expect( match( '|?' ) ).toBeNull();
		} );

		it( 'should return null for text not starting with |?', () => {
			expect( match( 'prefix|?Foo' ) ).toBeNull();
		} );
	} );

	describe( 'mode definition', () => {
		it( 'should have correct id', () => {
			expect( smwMode.id ).toBe( 'smw' );
		} );

		it( 'should have correct triggers', () => {
			expect( smwMode.triggers ).toEqual( [ '/smw:' ] );
		} );

		it( 'should have tokenPattern array with correct modeIds', () => {
			expect( Array.isArray( smwMode.tokenPattern ) ).toBe( true );
			expect( smwMode.tokenPattern[ 0 ].modeId ).toBe( 'smw' );
			expect( smwMode.tokenPattern[ 1 ].modeId ).toBe( 'smw' );
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

		it( 'should return updateQuery action for smw-printout items', () => {
			const result = smwMode.onResultSelect( { type: 'smw-printout', label: 'Population' } );

			expect( result ).toEqual( { action: 'updateQuery', payload: '|?Population' } );
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

		it( 'should return no-printouts state for incomplete printout with no results', () => {
			const result = smwMode.noResults( '|?NonExistent', [] );

			expect( result.title ).toBe( 'citizen-command-palette-mode-smw-noprintouts-title' );
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
				params: JSON.stringify( { search: 'Ci', limit: 10 } ),
				maxage: 1200,
				smaxage: 1200
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
				params: JSON.stringify( { search: 'Ger', property: 'Located in', limit: 10 } ),
				maxage: 1200,
				smaxage: 1200
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

		it( 'should fetch property suggestions for incomplete printout', async () => {
			mockGet.mockResolvedValue( {
				query: {
					Population: { label: 'Population', key: 'Population' }
				}
			} );

			const result = await smwMode.getResults( '|?Pop' );

			expect( mockGet ).toHaveBeenCalledWith( {
				action: 'smwbrowse',
				browse: 'property',
				params: JSON.stringify( { search: 'Pop', limit: 10 } ),
				maxage: 1200,
				smaxage: 1200
			} );
			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ].type ).toBe( 'smw-printout' );
			expect( result[ 0 ].id ).toContain( 'smw-printout' );
		} );

		it( 'should fetch all properties for empty printout fragment', async () => {
			mockGet.mockResolvedValue( { query: {} } );

			await smwMode.getResults( '|?' );

			expect( mockGet ).toHaveBeenCalledWith( expect.objectContaining( {
				action: 'smwbrowse',
				browse: 'property',
				params: JSON.stringify( { search: '', limit: 10 } )
			} ) );
		} );

		it( 'should execute Ask query with printout token', async () => {
			mockGet.mockResolvedValue( { query: { results: {} } } );
			const tokens = [
				{ modeId: 'smw', raw: '[[Category:City]]' }
			];
			const allTokens = [ ...tokens, { modeId: 'smw', raw: '|?Population' } ];

			await smwMode.getResults( '', undefined, allTokens );

			expect( mockGet ).toHaveBeenCalledWith( {
				action: 'ask',
				query: '[[Category:City]]|?Population|limit=10',
				format: 'json',
				maxage: 1200,
				smaxage: 1200
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
				format: 'json',
				maxage: 1200,
				smaxage: 1200
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
				format: 'json',
				maxage: 1200,
				smaxage: 1200
			} );
		} );

		it( 'should return empty array on API error', async () => {
			mockGet.mockRejectedValue( new Error( 'Network error' ) );

			const result = await smwMode.getResults( '[[Category:City]]' );

			expect( result ).toEqual( [] );
		} );

		it( 'should include detail pairs when printouts are in the response', async () => {
			mockGet.mockResolvedValue( {
				query: {
					results: {
						Berlin: {
							fulltext: 'Berlin',
							fullurl: 'https://example.org/wiki/Berlin',
							printouts: {
								Population: [ { raw: '3748148' } ],
								'Located in': [ { fulltext: 'Germany', fullurl: 'https://example.org/wiki/Germany' } ]
							}
						}
					}
				}
			} );
			const tokens = [
				{ modeId: 'smw', raw: '[[Category:City]]' }
			];
			const allTokens = [
				...tokens,
				{ modeId: 'smw', raw: '|?Population' },
				{ modeId: 'smw', raw: '|?Located in' }
			];

			const result = await smwMode.getResults( '', undefined, allTokens );

			expect( result ).toHaveLength( 1 );
			expect( result[ 0 ].detail ).toEqual( {
				pairs: [
					{ label: 'Population', value: '3748148' },
					{ label: 'Located in', value: 'Germany' }
				]
			} );
		} );

		it( 'should join multi-value printout properties with comma', async () => {
			mockGet.mockResolvedValue( {
				query: {
					results: {
						Berlin: {
							fulltext: 'Berlin',
							fullurl: 'https://example.org/wiki/Berlin',
							printouts: {
								'Located in': [
									{ fulltext: 'Germany' },
									{ fulltext: 'Europe' }
								]
							}
						}
					}
				}
			} );
			const tokens = [
				{ modeId: 'smw', raw: '[[Category:City]]' }
			];
			const allTokens = [ ...tokens, { modeId: 'smw', raw: '|?Located in' } ];

			const result = await smwMode.getResults( '', undefined, allTokens );

			expect( result[ 0 ].detail.pairs[ 0 ].value ).toBe( 'Germany, Europe' );
		} );

		it( 'should not include detail when response has no printouts', async () => {
			mockGet.mockResolvedValue( {
				query: {
					results: {
						Berlin: {
							fulltext: 'Berlin',
							fullurl: 'https://example.org/wiki/Berlin'
						}
					}
				}
			} );

			const result = await smwMode.getResults( '[[Category:City]]' );

			expect( result[ 0 ].detail ).toBeUndefined();
		} );

		it( 'should handle falsy printout values like raw: 0', async () => {
			mockGet.mockResolvedValue( {
				query: {
					results: {
						Berlin: {
							fulltext: 'Berlin',
							fullurl: 'https://example.org/wiki/Berlin',
							printouts: {
								Score: [ { raw: 0 } ]
							}
						}
					}
				}
			} );
			const tokens = [
				{ modeId: 'smw', raw: '[[Category:City]]' }
			];
			const allTokens = [ ...tokens, { modeId: 'smw', raw: '|?Score' } ];

			const result = await smwMode.getResults( '', undefined, allTokens );

			expect( result[ 0 ].detail.pairs[ 0 ].value ).toBe( '0' );
		} );

		it( 'should handle empty printout arrays gracefully', async () => {
			mockGet.mockResolvedValue( {
				query: {
					results: {
						Berlin: {
							fulltext: 'Berlin',
							fullurl: 'https://example.org/wiki/Berlin',
							printouts: {
								Population: []
							}
						}
					}
				}
			} );
			const tokens = [
				{ modeId: 'smw', raw: '[[Category:City]]' }
			];
			const allTokens = [ ...tokens, { modeId: 'smw', raw: '|?Population' } ];

			const result = await smwMode.getResults( '', undefined, allTokens );

			expect( result[ 0 ].detail.pairs[ 0 ].value ).toBe( '' );
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
				format: 'json',
				maxage: 1200,
				smaxage: 1200
			} );
		} );
	} );
} );
