/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createPaletteRegistry = require( '../../../../resources/skins.citizen.commandPalette/services/paletteRegistry.js' );

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

describe( 'createPaletteRegistry', () => {
	let registry;

	beforeEach( () => {
		vi.restoreAllMocks();
		registry = createPaletteRegistry();
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

		it( 'rejects null handler with a null-specific warning', () => {
			mw.log.warn.mockClear();

			const result = registry.register( null );

			expect( result ).toBe( false );
			expect( mw.log.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'null' )
			);
		} );

		it( 'rejects non-object handler with a not-an-object warning', () => {
			mw.log.warn.mockClear();

			const result = registry.register( 'oops' );

			expect( result ).toBe( false );
			expect( mw.log.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'not an object' )
			);
		} );

		it( 'overwrites existing command with same id', () => {
			const original = makeHandler( { description: 'Original' } );
			const replacement = makeHandler( { description: 'Replacement' } );

			registry.register( original );
			registry.register( replacement );

			expect( registry.getHandler( 'test' ).description ).toBe( 'Replacement' );
		} );

		it( 'warns when triggers is missing or empty', () => {
			mw.log.warn.mockClear();

			registry.register( makeHandler( { id: 'no-trig', triggers: [] } ) );

			expect( mw.log.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'no triggers' )
			);
		} );

		it( 'warns when a trigger collides with an already-registered one', () => {
			registry.register( makeHandler( { id: 'first', triggers: [ '/x:' ] } ) );
			mw.log.warn.mockClear();

			registry.register( makeHandler( { id: 'second', triggers: [ '/x:' ] } ) );

			expect( mw.log.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'collides' )
			);
		} );

		it( 'does not warn about self-collision when overwriting same id', () => {
			registry.register( makeHandler( { id: 'same', triggers: [ '/x:' ] } ) );
			mw.log.warn.mockClear();

			registry.register( makeHandler( { id: 'same', triggers: [ '/x:' ] } ) );

			// "already registered. Overwriting" warning is fine; the
			// trigger-collision warning would be wrong (it's the same handler).
			const collisionWarnings = mw.log.warn.mock.calls.filter(
				( c ) => /collides/.test( c[ 0 ] )
			);
			expect( collisionWarnings ).toHaveLength( 0 );
		} );

		describe( 'a mode trigger that starts another handler\'s trigger', () => {
			const helpMode = () => makeHandler( { id: 'help', triggers: [ '/help', '?' ], getResults: () => [] } );
			const helpdesk = () => makeHandler( { id: 'helpdesk', triggers: [ '/helpdesk:' ], onResultSelect: () => ( { action: 'none' } ) } );
			const prefixWarnings = () => mw.log.warn.mock.calls.filter(
				( c ) => /is a prefix of/.test( c[ 0 ] )
			);

			it( 'warns, naming both, when the longer trigger registers second', () => {
				registry.register( helpMode() );
				mw.log.warn.mockClear();

				registry.register( helpdesk() );

				expect( prefixWarnings() ).toEqual( [ [
					expect.stringMatching( /"help".*"\/help".*"helpdesk".*"\/helpdesk:"/ )
				] ] );
			} );

			it( 'warns, naming both, when the mode registers second', () => {
				registry.register( helpdesk() );
				mw.log.warn.mockClear();

				registry.register( helpMode() );

				expect( prefixWarnings() ).toEqual( [ [
					expect.stringMatching( /"help".*"\/help".*"helpdesk".*"\/helpdesk:"/ )
				] ] );
			} );

			it( 'ignores case, as trigger matching does', () => {
				registry.register( makeHandler( { id: 'help', triggers: [ '/HELP' ], getResults: () => [] } ) );
				mw.log.warn.mockClear();

				registry.register( helpdesk() );

				expect( prefixWarnings() ).toHaveLength( 1 );
			} );

			it( 'does not warn when the shorter trigger is a plain command, which typing never enters', () => {
				registry.register( makeHandler( { id: 'go', triggers: [ '/help' ], onResultSelect: () => ( { action: 'none' } ) } ) );
				mw.log.warn.mockClear();

				registry.register( helpdesk() );

				expect( prefixWarnings() ).toHaveLength( 0 );
			} );

			it( 'does not warn for the built-in triggers', () => {
				mw.log.warn.mockClear();
				const builtIns = {
					namespace: [ '/ns:', ':' ],
					action: [ '/action:', '>' ],
					user: [ '/user:', '@' ],
					category: [ '/cat:', '#' ],
					history: [ '/hist:', '!' ],
					file: [ '/file:', '~' ],
					help: [ '/help', '?' ],
					smw: [ '/smw:' ],
					bucket: [ '/bucket:' ]
				};

				Object.entries( builtIns ).forEach( ( [ id, triggers ] ) => {
					registry.register( makeHandler( { id, triggers, getResults: () => [] } ) );
				} );

				expect( prefixWarnings() ).toHaveLength( 0 );
			} );
		} );

		it( 'warns when a handler has neither getResults nor onResultSelect', () => {
			mw.log.warn.mockClear();

			registry.register( makeHandler( { id: 'no-op' } ) );

			expect( mw.log.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'never produce a useful action' )
			);
		} );

		it( 'does not warn no-op when getResults is provided', () => {
			mw.log.warn.mockClear();

			registry.register( makeHandler( { id: 'mode', getResults: () => [] } ) );

			const noOpWarnings = mw.log.warn.mock.calls.filter(
				( c ) => /never produce a useful action/.test( c[ 0 ] )
			);
			expect( noOpWarnings ).toHaveLength( 0 );
		} );

		it( 'does not warn no-op when onResultSelect is provided', () => {
			mw.log.warn.mockClear();

			registry.register( makeHandler( { id: 'cmd', onResultSelect: () => ( { action: 'none' } ) } ) );

			const noOpWarnings = mw.log.warn.mock.calls.filter(
				( c ) => /never produce a useful action/.test( c[ 0 ] )
			);
			expect( noOpWarnings ).toHaveLength( 0 );
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

		it( 'skips a triggerless handler instead of emptying the list', () => {
			registry.register( makeHandler( { id: 'valid', triggers: [ '/valid:' ] } ) );
			// `register` warns about this but still accepts it, and third parties
			// register through a public hook.
			registry.register( makeHandler( { id: 'broken', triggers: [] } ) );

			const items = registry.getCommandListItems();

			expect( items ).toHaveLength( 1 );
			expect( items[ 0 ].value ).toBe( '/valid:' );
		} );

		it( 'skips a handler whose triggers is not an array', () => {
			registry.register( makeHandler( { id: 'valid', triggers: [ '/valid:' ] } ) );
			// A single string instead of a list of them is an easy mistake for a
			// third party calling `register` directly rather than via defineMode.
			registry.register( makeHandler( { id: 'stringy', triggers: '/oops:' } ) );

			const items = registry.getCommandListItems();

			expect( items ).toHaveLength( 1 );
			expect( items[ 0 ].value ).toBe( '/valid:' );
		} );

		it( 'skips a handler whose triggers property is missing entirely', () => {
			registry.register( makeHandler( { id: 'valid', triggers: [ '/valid:' ] } ) );
			const broken = makeHandler( { id: 'broken' } );
			delete broken.triggers;
			registry.register( broken );

			const items = registry.getCommandListItems();

			expect( items ).toHaveLength( 1 );
			expect( items[ 0 ].value ).toBe( '/valid:' );
		} );
	} );

	describe( 'searchCommandListItems', () => {
		function registerBuiltIns() {
			registry.register( makeHandler( {
				id: 'namespace',
				triggers: [ '/ns:', ':' ],
				label: 'Namespaces',
				description: 'Search for a page in a specific namespace'
			} ) );
			registry.register( makeHandler( {
				id: 'category',
				triggers: [ '/cat:', '#' ],
				label: 'Categories',
				description: 'Search and explore categories'
			} ) );
			registry.register( makeHandler( {
				id: 'file',
				triggers: [ '/file:', '~' ],
				label: 'Files and media',
				description: 'Find images, PDFs, audio, video and other files'
			} ) );
		}

		function sourcesFor( query ) {
			return registry.searchCommandListItems( query ).map( ( item ) => item.source );
		}

		it( 'returns every entry in registration order for an empty query', () => {
			registerBuiltIns();

			const sources = sourcesFor( '' );

			expect( sources ).toEqual( [ 'command:namespace', 'command:category', 'command:file' ] );
		} );

		it( 'matches a trigger by prefix, so a bare colon does not match every `/x:` trigger', () => {
			registerBuiltIns();

			expect( sourcesFor( '#' ) ).toEqual( [ 'command:category' ] );
			expect( sourcesFor( ':' ) ).toEqual( [ 'command:namespace' ] );
			expect( sourcesFor( '/ca' ) ).toEqual( [ 'command:category' ] );
		} );

		it( 'matches a slash trigger by the word after its slash', () => {
			registerBuiltIns();

			// Neither the name nor the description contains "ns".
			const sources = sourcesFor( 'ns' );

			expect( sources ).toEqual( [ 'command:namespace' ] );
		} );

		it( 'matches the name anywhere, ignoring case', () => {
			registerBuiltIns();

			const sources = sourcesFor( 'MEDIA' );

			expect( sources ).toEqual( [ 'command:file' ] );
		} );

		it( 'matches the description anywhere', () => {
			registerBuiltIns();

			const sources = sourcesFor( 'image' );

			expect( sources ).toEqual( [ 'command:file' ] );
		} );

		it( 'ranks a trigger match above a name match above a description match', () => {
			registry.register( makeHandler( {
				id: 'by-description', triggers: [ '/a:' ], label: 'A', description: 'Mentions foo'
			} ) );
			registry.register( makeHandler( {
				id: 'by-name', triggers: [ '/b:' ], label: 'Foo things', description: 'B'
			} ) );
			registry.register( makeHandler( {
				id: 'by-trigger', triggers: [ '/foo:' ], label: 'C', description: 'C'
			} ) );

			const sources = sourcesFor( 'foo' );

			expect( sources ).toEqual( [ 'command:by-trigger', 'command:by-name', 'command:by-description' ] );
		} );

		it( 'keeps registration order within a rank', () => {
			registerBuiltIns();

			const sources = sourcesFor( 'search' );

			expect( sources ).toEqual( [ 'command:namespace', 'command:category' ] );
		} );

		it( 'ignores whitespace around the query', () => {
			registerBuiltIns();

			expect( sourcesFor( '  cat ' ) ).toEqual( [ 'command:category' ] );
			expect( sourcesFor( '   ' ) ).toHaveLength( 3 );
		} );

		it( 'returns nothing when no entry matches', () => {
			registerBuiltIns();

			const sources = sourcesFor( 'zzz' );

			expect( sources ).toEqual( [] );
		} );

		it( 'matches a handler that declares no label or description by its triggers alone', () => {
			// Third parties register through a public hook, so neither field
			// can be assumed.
			registry.register( { id: 'bare', triggers: [ '/bare:' ], onResultSelect: () => {} } );

			expect( sourcesFor( '/ba' ) ).toEqual( [ 'command:bare' ] );
			expect( sourcesFor( 'bare thing' ) ).toEqual( [] );
		} );
	} );

	describe( 'selectCommandListItem', () => {
		it( 'opens a mode with its first trigger', async () => {
			registry.register( makeHandler( { id: 'cat', triggers: [ '/cat:', '#' ], getResults: () => [] } ) );
			const [ item ] = registry.getCommandListItems();

			const action = await registry.selectCommandListItem( item );

			expect( action ).toEqual( { action: 'exitWithQuery', payload: '/cat:' } );
		} );

		it( 'runs a plain command through its own handler', async () => {
			const onResultSelect = vi.fn( () => ( { action: 'navigate', payload: '/wiki/X' } ) );
			registry.register( makeHandler( { id: 'go', triggers: [ '/go' ], onResultSelect } ) );
			const [ item ] = registry.getCommandListItems();

			const action = await registry.selectCommandListItem( item );

			expect( onResultSelect ).toHaveBeenCalledWith( item );
			expect( action ).toEqual( { action: 'navigate', payload: '/wiki/X' } );
		} );

		it( 'does nothing for a row that is not a command', async () => {
			const action = await registry.selectCommandListItem( { source: 'search:Foo' } );

			expect( action ).toEqual( { action: 'none' } );
		} );

		it( 'does nothing for an unregistered handler', async () => {
			const action = await registry.selectCommandListItem( { source: 'command:gone', type: 'command' } );

			expect( action ).toEqual( { action: 'none' } );
		} );

		it( 'logs and does nothing when the handler throws', async () => {
			registry.register( makeHandler( { id: 'bad', triggers: [ '/bad' ], onResultSelect: () => {
				throw new Error( 'boom' );
			} } ) );
			const [ item ] = registry.getCommandListItems();
			mw.log.error.mockClear();

			const action = await registry.selectCommandListItem( item );

			expect( action ).toEqual( { action: 'none' } );
			expect( mw.log.error ).toHaveBeenCalled();
		} );

		it( 'logs and does nothing when the handler rejects', async () => {
			registry.register( makeHandler( {
				id: 'bad',
				triggers: [ '/bad' ],
				onResultSelect: () => Promise.reject( new Error( 'boom' ) )
			} ) );
			const [ item ] = registry.getCommandListItems();
			mw.log.error.mockClear();

			const action = await registry.selectCommandListItem( item );

			expect( action ).toEqual( { action: 'none' } );
			expect( mw.log.error ).toHaveBeenCalledWith(
				expect.stringContaining( '"bad"' ), expect.any( Error )
			);
		} );
	} );

	describe( 'register with a malformed handler', () => {
		it( 'does not throw, and later registrations still work', () => {
			expect( () => registry.register( makeHandler( { id: 'stringy', triggers: '/oops:' } ) ) )
				.not.toThrow();

			expect( () => registry.register( makeHandler( { id: 'good', triggers: [ '/good:' ] } ) ) )
				.not.toThrow();

			const items = registry.getCommandListItems();

			expect( items ).toHaveLength( 1 );
			expect( items[ 0 ].value ).toBe( '/good:' );
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

	describe( 'findModeByTrigger', () => {
		it( 'finds mode by single-character trigger', () => {
			registry.register( makeHandler( {
				id: 'user',
				triggers: [ '/user:', '@' ],
				getResults: vi.fn()
			} ) );

			const mode = registry.findModeByTrigger( '@' );

			expect( mode ).not.toBeNull();
			expect( mode.id ).toBe( 'user' );
		} );

		it( 'returns null for handler without getResults', () => {
			registry.register( makeHandler( {
				id: 'simple',
				triggers: [ '!' ]
			} ) );

			const mode = registry.findModeByTrigger( '!' );

			expect( mode ).toBeNull();
		} );

		it( 'returns null for unmatched trigger', () => {
			const mode = registry.findModeByTrigger( '#' );

			expect( mode ).toBeNull();
		} );
	} );

	describe( 'getTokenPatterns', () => {
		it( 'returns empty array when no handlers have tokenPattern', () => {
			registry.register( makeHandler( { id: 'plain', triggers: [ '/plain:' ] } ) );

			const patterns = registry.getTokenPatterns();

			expect( patterns ).toEqual( [] );
		} );

		it( 'returns token patterns from registered handlers', () => {
			const tokenPattern = {
				modeId: 'ns',
				position: 'prefix',
				match: vi.fn(),
				serialize: vi.fn()
			};
			registry.register( makeHandler( {
				id: 'ns',
				triggers: [ '/ns:', ':' ],
				tokenPattern,
				getResults: vi.fn()
			} ) );

			const patterns = registry.getTokenPatterns();

			expect( patterns ).toHaveLength( 1 );
			expect( patterns[ 0 ] ).toBe( tokenPattern );
		} );

		it( 'skips handlers without tokenPattern', () => {
			const tokenPattern = {
				modeId: 'ns',
				position: 'prefix',
				match: vi.fn()
			};
			registry.register( makeHandler( {
				id: 'ns',
				triggers: [ '/ns:' ],
				tokenPattern,
				getResults: vi.fn()
			} ) );
			registry.register( makeHandler( {
				id: 'action',
				triggers: [ '/action:', '>' ]
			} ) );

			const patterns = registry.getTokenPatterns();

			expect( patterns ).toHaveLength( 1 );
			expect( patterns[ 0 ].modeId ).toBe( 'ns' );
		} );

		it( 'flattens array tokenPattern from a single handler', () => {
			const pattern1 = { modeId: 'smw', position: 'any', activeIn: 'smw', match: vi.fn() };
			const pattern2 = { modeId: 'smw', position: 'any', activeIn: 'smw', match: vi.fn() };
			registry.register( makeHandler( {
				id: 'smw',
				triggers: [ '/smw:' ],
				tokenPattern: [ pattern1, pattern2 ],
				getResults: vi.fn()
			} ) );

			const patterns = registry.getTokenPatterns();

			expect( patterns ).toHaveLength( 2 );
			expect( patterns[ 0 ] ).toBe( pattern1 );
			expect( patterns[ 1 ] ).toBe( pattern2 );
		} );

		it( 'mixes single and array tokenPatterns from different handlers', () => {
			const singlePattern = { modeId: 'ns', position: 'prefix', activeIn: 'root', match: vi.fn() };
			const arrayPattern1 = { modeId: 'smw', position: 'any', activeIn: 'smw', match: vi.fn() };
			const arrayPattern2 = { modeId: 'smw', position: 'any', activeIn: 'smw', match: vi.fn() };
			registry.register( makeHandler( {
				id: 'ns',
				triggers: [ '/ns:', ':' ],
				tokenPattern: singlePattern,
				getResults: vi.fn()
			} ) );
			registry.register( makeHandler( {
				id: 'smw',
				triggers: [ '/smw:' ],
				tokenPattern: [ arrayPattern1, arrayPattern2 ],
				getResults: vi.fn()
			} ) );

			const patterns = registry.getTokenPatterns();

			expect( patterns ).toHaveLength( 3 );
			expect( patterns ).toContain( singlePattern );
			expect( patterns ).toContain( arrayPattern1 );
			expect( patterns ).toContain( arrayPattern2 );
		} );
	} );

	describe( 'findModeByQuery', () => {
		it( 'finds mode and trigger by query prefix', () => {
			registry.register( makeHandler( {
				id: 'ns',
				triggers: [ '/ns:', ':' ],
				getResults: vi.fn()
			} ) );

			const match = registry.findModeByQuery( '/ns:Talk' );

			expect( match ).not.toBeNull();
			expect( match.mode.id ).toBe( 'ns' );
			expect( match.trigger ).toBe( '/ns:' );
		} );

		it( 'returns null for handler without getResults', () => {
			registry.register( makeHandler( {
				id: 'simple',
				triggers: [ '/simple' ]
			} ) );

			const match = registry.findModeByQuery( '/simple test' );

			expect( match ).toBeNull();
		} );

		it( 'returns null for unmatched query', () => {
			const match = registry.findModeByQuery( 'hello' );

			expect( match ).toBeNull();
		} );
	} );
} );
