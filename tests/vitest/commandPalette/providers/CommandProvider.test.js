const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createCommandProvider = require(
	'../../../../resources/skins.citizen.commandPalette/providers/CommandProvider.js'
);
const createCommandRegistry = require(
	'../../../../resources/skins.citizen.commandPalette/services/commandRegistry.js'
);

describe( 'createCommandProvider', () => {
	let registry;
	let provider;

	beforeEach( () => {
		registry = createCommandRegistry();
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

		provider = createCommandProvider( registry );
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
} );
