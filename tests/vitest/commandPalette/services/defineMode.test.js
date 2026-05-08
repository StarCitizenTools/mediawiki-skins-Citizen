// @vitest-environment jsdom

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const { defineMode, defineCommand } = require(
	'../../../../resources/skins.citizen.commandPalette/services/defineMode.js'
);

const VALID_MODE = {
	id: 'test',
	triggers: [ '/test:' ],
	getResults: async () => []
};

const VALID_COMMAND = {
	id: 'test-cmd',
	triggers: [ '/cmd' ],
	onResultSelect: () => ( { action: 'none' } )
};

describe( 'defineMode', () => {
	beforeEach( () => {
		mw.log.error.mockClear();
		mw.log.warn.mockClear();
	} );

	describe( 'happy path', () => {
		it( 'returns the config with defaults filled', () => {
			const result = defineMode( VALID_MODE );

			expect( result ).not.toBeNull();
			expect( result.id ).toBe( 'test' );
			expect( result.layout ).toBe( 'list' );
			expect( result.compactResults ).toBe( false );
		} );

		it( 'preserves explicit layout and compactResults', () => {
			const result = defineMode( Object.assign( {}, VALID_MODE, {
				layout: 'gallery'
			} ) );

			expect( result.layout ).toBe( 'gallery' );
		} );

		it( 'returns a new object — does not mutate the input', () => {
			const input = Object.assign( {}, VALID_MODE );
			const result = defineMode( input );

			expect( result ).not.toBe( input );
			expect( input.layout ).toBeUndefined();
		} );
	} );

	describe( 'hard fails', () => {
		it( 'returns null and logs error when config is not an object', () => {
			expect( defineMode( null ) ).toBeNull();
			expect( defineMode( 'string' ) ).toBeNull();
			expect( defineMode( [] ) ).toBeNull();
			expect( mw.log.error ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'returns null when id is missing or empty', () => {
			expect( defineMode( Object.assign( {}, VALID_MODE, { id: '' } ) ) ).toBeNull();
			expect( defineMode( Object.assign( {}, VALID_MODE, { id: '   ' } ) ) ).toBeNull();
			expect( defineMode( { triggers: [ '/x' ], getResults: () => [] } ) ).toBeNull();
			expect( mw.log.error ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'returns null when id is not a string', () => {
			expect( defineMode( Object.assign( {}, VALID_MODE, { id: 42 } ) ) ).toBeNull();
			expect( mw.log.error ).toHaveBeenCalled();
		} );

		it( 'returns null when triggers is missing or empty', () => {
			expect( defineMode( Object.assign( {}, VALID_MODE, { triggers: undefined } ) ) ).toBeNull();
			expect( defineMode( Object.assign( {}, VALID_MODE, { triggers: [] } ) ) ).toBeNull();
			expect( defineMode( Object.assign( {}, VALID_MODE, { triggers: 'not-an-array' } ) ) ).toBeNull();
			expect( mw.log.error ).toHaveBeenCalledTimes( 3 );
		} );

		it( 'returns null when triggers contains non-strings', () => {
			expect( defineMode( Object.assign( {}, VALID_MODE, { triggers: [ '/x', 42 ] } ) ) ).toBeNull();
			expect( mw.log.error ).toHaveBeenCalled();
		} );

		it( 'returns null when triggers contains empty or whitespace-only strings', () => {
			expect( defineMode( Object.assign( {}, VALID_MODE, { triggers: [ '/x', '' ] } ) ) ).toBeNull();
			expect( defineMode( Object.assign( {}, VALID_MODE, { triggers: [ '/x', '   ' ] } ) ) ).toBeNull();
			expect( mw.log.error ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'returns null when getResults is missing or not a function', () => {
			expect( defineMode( Object.assign( {}, VALID_MODE, { getResults: undefined } ) ) ).toBeNull();
			expect( defineMode( Object.assign( {}, VALID_MODE, { getResults: 'string' } ) ) ).toBeNull();
			expect( mw.log.error ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'returns null when onResultSelect is present but not a function', () => {
			expect( defineMode( Object.assign( {}, VALID_MODE, { onResultSelect: 'not-a-fn' } ) ) ).toBeNull();
			expect( mw.log.error ).toHaveBeenCalled();
		} );
	} );

	describe( 'soft warnings + coercion', () => {
		it( 'warns and falls back to "list" on invalid layout', () => {
			const result = defineMode( Object.assign( {}, VALID_MODE, { layout: 'pyramid' } ) );

			expect( result.layout ).toBe( 'list' );
			expect( mw.log.warn ).toHaveBeenCalled();
		} );

		it( 'warns and coerces non-boolean compactResults', () => {
			const result = defineMode( Object.assign( {}, VALID_MODE, { compactResults: 'yes' } ) );

			expect( result.compactResults ).toBe( true );
			expect( mw.log.warn ).toHaveBeenCalled();
		} );

		it( 'warns and drops compactResults when combined with gallery layout', () => {
			const result = defineMode( Object.assign( {}, VALID_MODE, {
				layout: 'gallery',
				compactResults: true
			} ) );

			expect( result.layout ).toBe( 'gallery' );
			expect( result.compactResults ).toBe( false );
			expect( mw.log.warn ).toHaveBeenCalled();
		} );

		it( 'coerces compactResults THEN drops it when combined with gallery layout', () => {
			// Two-step path: coerce 'yes' → true (warn), then notice the
			// gallery pairing and drop it back to false (warn). Both warnings
			// should fire and the final value should be false.
			const result = defineMode( Object.assign( {}, VALID_MODE, {
				layout: 'gallery',
				compactResults: 'yes'
			} ) );

			expect( result.layout ).toBe( 'gallery' );
			expect( result.compactResults ).toBe( false );
			expect( mw.log.warn ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'warns and drops keybindings when not an array', () => {
			const result = defineMode( Object.assign( {}, VALID_MODE, { keybindings: 'oops' } ) );

			expect( result.keybindings ).toBeUndefined();
			expect( mw.log.warn ).toHaveBeenCalled();
		} );

		it( 'preserves valid keybindings as-is', () => {
			const bindings = [ { id: 'a', zone: 'input', keys: [ 'a' ], when: () => true, handle: () => {}, hint: null } ];
			const result = defineMode( Object.assign( {}, VALID_MODE, { keybindings: bindings } ) );

			expect( result.keybindings ).toBe( bindings );
		} );

		it( 'warns and drops tokenPattern when not an object/array', () => {
			const result = defineMode( Object.assign( {}, VALID_MODE, { tokenPattern: 'oops' } ) );

			expect( result.tokenPattern ).toBeUndefined();
			expect( mw.log.warn ).toHaveBeenCalled();
		} );

		it( 'warns and drops tokenPattern when null (typeof null === "object" trap)', () => {
			const result = defineMode( Object.assign( {}, VALID_MODE, { tokenPattern: null } ) );

			expect( result.tokenPattern ).toBeUndefined();
			expect( mw.log.warn ).toHaveBeenCalled();
		} );

		it( 'warns on unknown top-level fields but keeps them', () => {
			const result = defineMode( Object.assign( {}, VALID_MODE, {
				placholder: 'typo'
			} ) );

			expect( result ).not.toBeNull();
			expect( result.placholder ).toBe( 'typo' );
			expect( mw.log.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'placholder' )
			);
		} );

		it( 'does not warn for known optional fields', () => {
			defineMode( Object.assign( {}, VALID_MODE, {
				placeholder: 'Search',
				icon: { path: '...' },
				emptyState: { title: 't', description: 'd', icon: {} },
				noResults: () => ( { title: 't', description: 'd', icon: {} } ),
				help: { description: 'foo' },
				headerLabel: () => 'breadcrumb'
			} ) );

			expect( mw.log.warn ).not.toHaveBeenCalled();
		} );
	} );
} );

describe( 'defineCommand', () => {
	beforeEach( () => {
		mw.log.error.mockClear();
		mw.log.warn.mockClear();
	} );

	describe( 'happy path', () => {
		it( 'returns the config preserved (no defaults filled)', () => {
			const result = defineCommand( VALID_COMMAND );

			expect( result ).not.toBeNull();
			expect( result.id ).toBe( 'test-cmd' );
			// Commands don't carry layout/compactResults — those would be
			// nonsense for an action-on-selection entry.
			expect( result.layout ).toBeUndefined();
		} );
	} );

	describe( 'hard fails', () => {
		it( 'returns null when onResultSelect is missing', () => {
			const config = Object.assign( {}, VALID_COMMAND );
			delete config.onResultSelect;

			expect( defineCommand( config ) ).toBeNull();
			expect( mw.log.error ).toHaveBeenCalled();
		} );

		it( 'reuses base validation (id, triggers)', () => {
			expect( defineCommand( null ) ).toBeNull();
			expect( defineCommand( { triggers: [ '/x' ], onResultSelect: () => {} } ) ).toBeNull();
			expect( defineCommand( Object.assign( {}, VALID_COMMAND, { triggers: [] } ) ) ).toBeNull();
		} );
	} );

	describe( 'unknown field warnings', () => {
		it( 'warns on mode-only fields appearing on a command (typo guard)', () => {
			defineCommand( Object.assign( {}, VALID_COMMAND, {
				layout: 'gallery',
				getResults: () => []
			} ) );

			expect( mw.log.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'layout' )
			);
			expect( mw.log.warn ).toHaveBeenCalledWith(
				expect.stringContaining( 'getResults' )
			);
		} );

		it( 'does not warn for the standard command fields', () => {
			defineCommand( Object.assign( {}, VALID_COMMAND, {
				label: 'Test',
				description: 'A test',
				help: { description: 'foo' }
			} ) );

			expect( mw.log.warn ).not.toHaveBeenCalled();
		} );
	} );
} );
