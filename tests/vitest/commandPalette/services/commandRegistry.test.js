/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createCommandRegistry = require( '../../../../resources/skins.citizen.commandPalette/services/commandRegistry.js' );

/**
 * Creates a minimal valid command handler for testing.
 *
 * @param {Object} [overrides] Properties to override on the handler.
 * @return {Object} A command handler object.
 */
function makeHandler( overrides = {} ) {
	return {
		id: 'test',
		triggers: [ '/test:' ],
		description: 'Test command',
		...overrides
	};
}

describe( 'createCommandRegistry', () => {
	let registry;

	beforeEach( () => {
		vi.restoreAllMocks();
		registry = createCommandRegistry();
	} );

	describe( 'register', () => {
		it( 'registers a valid command', () => {
			const handler = makeHandler();

			const result = registry.register( handler );

			expect( result ).toBe( true );
			expect( registry.getHandler( 'test' ) ).toBe( handler );
		} );

		it( 'rejects command without id', () => {
			const handler = { triggers: [ '/bad:' ], description: 'No id' };

			const result = registry.register( handler );

			expect( result ).toBe( false );
		} );

		it( 'rejects null handler', () => {
			const result = registry.register( null );

			expect( result ).toBe( false );
		} );

		it( 'overwrites existing command with same id', () => {
			const original = makeHandler( { description: 'Original' } );
			const replacement = makeHandler( { description: 'Replacement' } );

			registry.register( original );
			registry.register( replacement );

			expect( registry.getHandler( 'test' ).description ).toBe( 'Replacement' );
		} );
	} );

	describe( 'findMatchingCommand', () => {
		it( 'finds command by trigger prefix', () => {
			registry.register( makeHandler( { id: 'ns', triggers: [ '/ns:' ] } ) );

			const match = registry.findMatchingCommand( '/ns:talk' );

			expect( match ).not.toBeNull();
			expect( match.id ).toBe( 'ns' );
			expect( match.trigger ).toBe( '/ns:' );
		} );

		it( 'finds command by abbreviation trigger', () => {
			registry.register( makeHandler( { id: 'user', triggers: [ '/user:', '@' ] } ) );

			const match = registry.findMatchingCommand( '@admin' );

			expect( match ).not.toBeNull();
			expect( match.id ).toBe( 'user' );
			expect( match.trigger ).toBe( '@' );
		} );

		it( 'returns longest matching trigger when multiple match', () => {
			registry.register( makeHandler( { id: 'short', triggers: [ '/a' ] } ) );
			registry.register( makeHandler( { id: 'long', triggers: [ '/action:' ] } ) );

			const match = registry.findMatchingCommand( '/action:test' );

			expect( match ).not.toBeNull();
			expect( match.id ).toBe( 'long' );
			expect( match.trigger ).toBe( '/action:' );
		} );

		it( 'returns null for unmatched query', () => {
			registry.register( makeHandler( { id: 'ns', triggers: [ '/ns:' ] } ) );

			const match = registry.findMatchingCommand( 'no-match' );

			expect( match ).toBeNull();
		} );

		it( 'matches case-insensitively', () => {
			registry.register( makeHandler( { id: 'ns', triggers: [ '/NS:' ] } ) );

			const match = registry.findMatchingCommand( '/ns:talk' );

			expect( match ).not.toBeNull();
			expect( match.id ).toBe( 'ns' );
		} );
	} );

	describe( 'getCommandListItems', () => {
		it( 'returns all registered commands as palette items with correct format', () => {
			registry.register( makeHandler( {
				id: 'alpha',
				triggers: [ '/alpha:' ],
				description: 'Alpha command'
			} ) );
			registry.register( makeHandler( {
				id: 'beta',
				triggers: [ '/beta:' ],
				description: 'Beta command'
			} ) );

			const items = registry.getCommandListItems();

			expect( items ).toHaveLength( 2 );
			expect( items[ 0 ] ).toEqual( expect.objectContaining( {
				type: 'command',
				source: 'command:alpha',
				label: '/alpha:',
				description: 'Alpha command',
				highlightQuery: true
			} ) );
			expect( items[ 1 ] ).toEqual( expect.objectContaining( {
				type: 'command',
				source: 'command:beta'
			} ) );
		} );

		it( 'filters commands by prefix', () => {
			registry.register( makeHandler( { id: 'ns', triggers: [ '/ns:', ':' ] } ) );
			registry.register( makeHandler( { id: 'action', triggers: [ '/action:', '>' ] } ) );

			const items = registry.getCommandListItems( '/ns' );

			expect( items ).toHaveLength( 1 );
			expect( items[ 0 ].source ).toBe( 'command:ns' );
		} );

		it( 'includes alternate triggers as metadata', () => {
			registry.register( makeHandler( {
				id: 'user',
				triggers: [ '/user:', '@' ]
			} ) );

			const items = registry.getCommandListItems();

			expect( items[ 0 ].metadata ).toEqual( [ { label: '@' } ] );
		} );
	} );

	describe( 'getHandler', () => {
		it( 'returns handler for registered command', () => {
			const handler = makeHandler();
			registry.register( handler );

			const result = registry.getHandler( 'test' );

			expect( result ).toBe( handler );
		} );

		it( 'returns undefined for unregistered command', () => {
			const result = registry.getHandler( 'nonexistent' );

			expect( result ).toBeUndefined();
		} );
	} );

	describe( 'hasMatchingTrigger', () => {
		it( 'returns true when a trigger matches', () => {
			registry.register( makeHandler( { id: 'ns', triggers: [ '/ns:' ] } ) );

			expect( registry.hasMatchingTrigger( '/ns:talk' ) ).toBe( true );
		} );

		it( 'returns false when no trigger matches', () => {
			registry.register( makeHandler( { id: 'ns', triggers: [ '/ns:' ] } ) );

			expect( registry.hasMatchingTrigger( 'hello' ) ).toBe( false );
		} );
	} );
} );
