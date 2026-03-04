const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createSearchProvider = require(
	'../../../../resources/skins.citizen.commandPalette/providers/SearchProvider.js'
);

describe( 'createSearchProvider', () => {
	let mockSearchClient;
	let provider;

	beforeEach( () => {
		mockSearchClient = {
			fetchByQuery: vi.fn( () => Promise.resolve( {
				query: 'test',
				results: [ { id: '1', label: 'Result', type: 'page' } ]
			} ) )
		};

		provider = createSearchProvider( mockSearchClient );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'should have id "search"', () => {
		expect( provider.id ).toBe( 'search' );
	} );

	describe( 'canProvide', () => {
		it( 'should handle non-empty, non-slash queries', () => {
			expect( provider.canProvide( 'hello' ) ).toBe( true );
		} );

		it( 'should not handle empty queries', () => {
			expect( provider.canProvide( '' ) ).toBe( false );
		} );

		it( 'should not handle slash commands', () => {
			expect( provider.canProvide( '/ns:' ) ).toBe( false );
		} );
	} );

	describe( 'getResults', () => {
		it( 'should call searchClient.fetchByQuery', async () => {
			await provider.getResults( 'test' );

			expect( mockSearchClient.fetchByQuery ).toHaveBeenCalledWith(
				'test', undefined, undefined
			);
		} );

		it( 'should tag results with source', async () => {
			const result = await provider.getResults( 'test' );

			expect( result.items[ 0 ].source ).toBe( 'search' );
		} );

		it( 'should pass abort signal through', async () => {
			const signal = new AbortController().signal;

			await provider.getResults( 'test', signal );

			expect( mockSearchClient.fetchByQuery ).toHaveBeenCalledWith(
				'test', undefined, signal
			);
		} );
	} );
} );
