/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createProvider = require( '../../../../resources/skins.citizen.commandPalette/providers/createProvider.js' );

/**
 * Creates a minimal valid handler for testing.
 *
 * @param {Object} [overrides] Properties to override on the handler.
 * @return {Object} A handler object with canProvide and getResults.
 */
function makeHandler( overrides = {} ) {
	return {
		canProvide: vi.fn( () => true ),
		getResults: vi.fn( () => [] ),
		...overrides
	};
}

describe( 'createProvider', () => {
	beforeEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'creates a provider with valid handler', () => {
		const handler = makeHandler();

		const provider = createProvider( 'test', handler );

		expect( provider.id ).toBe( 'test' );
		expect( typeof provider.canProvide ).toBe( 'function' );
		expect( typeof provider.getResults ).toBe( 'function' );
		expect( typeof provider.onResultSelect ).toBe( 'function' );
	} );

	it( 'throws if id is missing or empty', () => {
		const handler = makeHandler();

		expect( () => createProvider( '', handler ) ).toThrow( 'id must be a non-empty string' );
		expect( () => createProvider( '  ', handler ) ).toThrow( 'id must be a non-empty string' );
	} );

	it( 'throws if canProvide is missing', () => {
		const handler = makeHandler( { canProvide: undefined } );

		expect( () => createProvider( 'test', handler ) ).toThrow( 'handler.canProvide must be a function' );
	} );

	it( 'throws if getResults is missing', () => {
		const handler = makeHandler( { getResults: undefined } );

		expect( () => createProvider( 'test', handler ) ).toThrow( 'handler.getResults must be a function' );
	} );

	it( 'uses default onResultSelect that navigates to item url', () => {
		const handler = makeHandler();

		const provider = createProvider( 'test', handler );
		const result = provider.onResultSelect( { url: '/wiki/Foo' } );

		expect( result ).toEqual( { action: 'navigate', payload: '/wiki/Foo' } );
	} );

	it( 'applies config defaults', () => {
		const handler = makeHandler();

		const provider = createProvider( 'test', handler );

		expect( provider.debounceMs ).toBe( 250 );
		expect( provider.keepStaleResults ).toBe( false );
	} );

	it( 'allows config overrides', () => {
		const handler = makeHandler();

		const provider = createProvider( 'test', handler, {
			debounceMs: 500,
			keepStaleResults: true
		} );

		expect( provider.debounceMs ).toBe( 500 );
		expect( provider.keepStaleResults ).toBe( true );
	} );
} );
