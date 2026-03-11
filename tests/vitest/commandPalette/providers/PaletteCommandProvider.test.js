const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createPaletteCommandProvider = require(
	'../../../../resources/skins.citizen.commandPalette/providers/PaletteCommandProvider.js'
);
const createPaletteRegistry = require(
	'../../../../resources/skins.citizen.commandPalette/services/paletteRegistry.js'
);

describe( 'createPaletteCommandProvider', () => {
	let registry;
	let provider;

	beforeEach( () => {
		registry = createPaletteRegistry();
		registry.register( {
			id: 'namespace',
			triggers: [ '/ns:', ':' ],
			description: 'Namespace search',
			getResults: vi.fn( () => Promise.resolve( [
				{ id: 'ns-1', label: 'Talk', type: 'namespace' }
			] ) )
		} );
		registry.register( {
			id: 'user',
			triggers: [ '/user:', '@' ],
			description: 'User search',
			getResults: vi.fn( () => Promise.resolve( [] ) )
		} );

		provider = createPaletteCommandProvider( registry );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'canProvide', () => {
		it( 'should handle slash prefix', () => {
			expect( provider.canProvide( '/' ) ).toBe( true );
			expect( provider.canProvide( '/ns:Talk' ) ).toBe( true );
		} );

		it( 'should handle registered trigger abbreviations', () => {
			expect( provider.canProvide( '@john' ) ).toBe( true );
			expect( provider.canProvide( ':Talk' ) ).toBe( true );
		} );

		it( 'should not handle regular queries', () => {
			expect( provider.canProvide( 'hello' ) ).toBe( false );
		} );
	} );

	describe( 'getResults', () => {
		it( 'should show all commands for root "/"', async () => {
			const result = await provider.getResults( '/' );

			expect( result.items.length ).toBeGreaterThan( 0 );
			expect( result.items[ 0 ].type ).toBe( 'command' );
		} );

		it( 'should delegate to command handler for matched trigger', async () => {
			await provider.getResults( '/ns:Talk' );

			const nsHandler = registry.getHandler( 'namespace' );
			expect( nsHandler.getResults ).toHaveBeenCalledWith( 'Talk' );
		} );

		it( 'should tag results with command source', async () => {
			const result = await provider.getResults( '/ns:Talk' );

			expect( result.items[ 0 ].source ).toBe( 'command:namespace' );
		} );
	} );

	describe( 'onResultSelect', () => {
		it( 'returns exitWithQuery with trigger value when selecting a mode from command list', async () => {
			const result = await provider.onResultSelect( {
				id: 'cmd-ns',
				type: 'command',
				value: '/ns:',
				source: 'command:namespace'
			} );

			expect( result ).toEqual( {
				action: 'exitWithQuery',
				payload: '/ns:'
			} );
		} );

		it( 'delegates to handler onResultSelect for non-command items', async () => {
			const nsHandler = registry.getHandler( 'namespace' );
			nsHandler.onResultSelect = vi.fn( () => ( { action: 'navigate', payload: '/wiki/Talk:' } ) );

			const result = await provider.onResultSelect( {
				id: 'ns-1',
				type: 'namespace',
				label: 'Talk',
				source: 'command:namespace'
			} );

			expect( nsHandler.onResultSelect ).toHaveBeenCalled();
			expect( result ).toEqual( {
				action: 'navigate',
				payload: '/wiki/Talk:'
			} );
		} );

		it( 'returns none for unknown source', async () => {
			const result = await provider.onResultSelect( {
				id: 'unknown',
				type: 'page',
				source: 'search'
			} );

			expect( result ).toEqual( { action: 'none' } );
		} );
	} );
} );
