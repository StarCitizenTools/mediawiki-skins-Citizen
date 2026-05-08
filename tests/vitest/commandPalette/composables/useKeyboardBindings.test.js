const {
	resolveBinding,
	resolveHints
} = require( '../../../../resources/skins.citizen.commandPalette/composables/useKeyboardBindings.js' );

function makeState( overrides ) {
	return Object.assign( { helpVisible: false, actionsFocused: false }, overrides );
}

function makeEvent( key ) {
	return { key };
}

describe( 'resolveBinding', () => {
	it( 'returns null when no binding matches', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'Enter' ], when: () => true, handle: () => {} }
		];

		const result = resolveBinding( makeState(), makeEvent( 'Tab' ), bindings );

		expect( result ).toBeNull();
	} );

	it( 'matches by zone, key, and when predicate', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'Enter' ], when: () => true, handle: () => {} }
		];

		const result = resolveBinding( makeState(), makeEvent( 'Enter' ), bindings );

		expect( result.id ).toBe( 'a' );
	} );

	it( 'returns first match when multiple bindings could fire', () => {
		const bindings = [
			{ id: 'first', zone: 'input', keys: [ 'Backspace' ], when: () => true, handle: () => {} },
			{ id: 'second', zone: 'input', keys: [ 'Backspace' ], when: () => true, handle: () => {} }
		];

		const result = resolveBinding( makeState(), makeEvent( 'Backspace' ), bindings );

		expect( result.id ).toBe( 'first' );
	} );

	it( 'filters by zone', () => {
		const bindings = [
			{ id: 'a', zone: 'action', keys: [ 'Enter' ], when: () => true, handle: () => {} }
		];

		const result = resolveBinding( makeState( { actionsFocused: false } ), makeEvent( 'Enter' ), bindings );

		expect( result ).toBeNull();
	} );

	it( 'suppresses bindings without worksDuringHelp when help is visible', () => {
		const bindings = [
			{ id: 'normal', zone: 'input', keys: [ 'Enter' ], when: () => true, handle: () => {} },
			{ id: 'help', zone: 'input', keys: [ 'Enter' ], when: () => true, worksDuringHelp: true, handle: () => {} }
		];

		const result = resolveBinding( makeState( { helpVisible: true } ), makeEvent( 'Enter' ), bindings );

		expect( result.id ).toBe( 'help' );
	} );

	it( 'evaluates when predicate against state', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'Backspace' ], when: ( s ) => s.tokens.length > 0, handle: () => {} }
		];

		expect( resolveBinding( makeState( { tokens: [] } ), makeEvent( 'Backspace' ), bindings ) ).toBeNull();
		expect( resolveBinding( makeState( { tokens: [ 'a' ] } ), makeEvent( 'Backspace' ), bindings ).id ).toBe( 'a' );
	} );

	it( 'never returns a binding with empty keys array', () => {
		const bindings = [
			{ id: 'hint-only', zone: 'input', keys: [], when: () => true, handle: () => {}, hint: { msgKey: 'a', kbd: 'x', order: 10 } }
		];

		const result = resolveBinding( makeState(), makeEvent( 'x' ), bindings );

		expect( result ).toBeNull();
	} );
} );

describe( 'resolveHints', () => {
	it( 'returns hints from active bindings only', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'Enter' ], when: () => true, handle: () => {}, hint: { msgKey: 'a', kbd: '↵', order: 10 } },
			{ id: 'b', zone: 'input', keys: [ 'Tab' ], when: () => false, handle: () => {}, hint: { msgKey: 'b', kbd: 'tab', order: 20 } }
		];

		const hints = resolveHints( makeState(), 'input', bindings );

		expect( hints ).toHaveLength( 1 );
		expect( hints[ 0 ].msgKey ).toBe( 'a' );
	} );

	it( 'sorts hints by order ascending', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'A' ], when: () => true, handle: () => {}, hint: { msgKey: 'a', kbd: 'a', order: 999 } },
			{ id: 'b', zone: 'input', keys: [ 'B' ], when: () => true, handle: () => {}, hint: { msgKey: 'b', kbd: 'b', order: 10 } }
		];

		const hints = resolveHints( makeState(), 'input', bindings );

		expect( hints.map( ( h ) => h.kbd ) ).toEqual( [ 'b', 'a' ] );
	} );

	it( 'dedupes hints by kbd, keeping first', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'Backspace' ], when: () => true, handle: () => {}, hint: { msgKey: 'first', kbd: '⌫', order: 100 } },
			{ id: 'b', zone: 'input', keys: [ 'Backspace' ], when: () => true, handle: () => {}, hint: { msgKey: 'second', kbd: '⌫', order: 200 } }
		];

		const hints = resolveHints( makeState(), 'input', bindings );

		expect( hints ).toHaveLength( 1 );
		expect( hints[ 0 ].msgKey ).toBe( 'first' );
	} );

	it( 'keeps the lowest-order hint when bindings share kbd', () => {
		const bindings = [
			// Higher order appears first in list
			{ id: 'a', zone: 'input', keys: [ 'X' ], when: () => true, handle: () => {}, hint: { msgKey: 'high', kbd: '⌫', order: 200 } },
			// Lower order appears later — should win
			{ id: 'b', zone: 'input', keys: [ 'X' ], when: () => true, handle: () => {}, hint: { msgKey: 'low', kbd: '⌫', order: 100 } }
		];

		const hints = resolveHints( makeState(), 'input', bindings );

		expect( hints ).toHaveLength( 1 );
		expect( hints[ 0 ].msgKey ).toBe( 'low' );
	} );

	it( 'omits bindings with no hint', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'X' ], when: () => true, handle: () => {} }
		];

		const hints = resolveHints( makeState(), 'input', bindings );

		expect( hints ).toEqual( [] );
	} );

	it( 'filters by zone', () => {
		const bindings = [
			{ id: 'a', zone: 'action', keys: [ 'Enter' ], when: () => true, handle: () => {}, hint: { msgKey: 'a', kbd: '↵', order: 10 } }
		];

		expect( resolveHints( makeState(), 'input', bindings ) ).toEqual( [] );
		expect( resolveHints( makeState(), 'action', bindings ) ).toHaveLength( 1 );
	} );

	it( 'respects worksDuringHelp when help is visible', () => {
		const bindings = [
			{ id: 'normal', zone: 'input', keys: [ 'X' ], when: () => true, handle: () => {}, hint: { msgKey: 'a', kbd: 'x', order: 10 } },
			{ id: 'help', zone: 'input', keys: [ 'Y' ], when: () => true, worksDuringHelp: true, handle: () => {}, hint: { msgKey: 'b', kbd: 'y', order: 20 } }
		];

		const hints = resolveHints( makeState( { helpVisible: true } ), 'input', bindings );

		expect( hints.map( ( h ) => h.kbd ) ).toEqual( [ 'y' ] );
	} );

	it( 'includes hints from bindings with empty keys array', () => {
		const bindings = [
			{ id: 'hint-only', zone: 'input', keys: [], when: () => true, handle: () => {}, hint: { msgKey: 'navigate', kbd: '↑↓', order: 10 } }
		];

		const hints = resolveHints( makeState(), 'input', bindings );

		expect( hints ).toHaveLength( 1 );
		expect( hints[ 0 ].kbd ).toBe( '↑↓' );
	} );
} );
