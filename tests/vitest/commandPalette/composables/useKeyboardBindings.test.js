const {
	modifierToken,
	resolveBinding,
	resolveHints
} = require( '../../../../resources/skins.citizen.commandPalette/composables/useKeyboardBindings.js' );

function makeState( overrides ) {
	return Object.assign( { helpVisible: false, actionsFocused: false }, overrides );
}

describe( 'resolveBinding', () => {
	it( 'returns null when no binding matches', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'Enter' ], when: () => true, handle: () => {} }
		];

		const result = resolveBinding( makeState(), 'Tab', bindings );

		expect( result ).toBeNull();
	} );

	it( 'matches by zone, key, and when predicate', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'Enter' ], when: () => true, handle: () => {} }
		];

		const result = resolveBinding( makeState(), 'Enter', bindings );

		expect( result.id ).toBe( 'a' );
	} );

	it( 'returns first match when multiple bindings could fire', () => {
		const bindings = [
			{ id: 'first', zone: 'input', keys: [ 'Backspace' ], when: () => true, handle: () => {} },
			{ id: 'second', zone: 'input', keys: [ 'Backspace' ], when: () => true, handle: () => {} }
		];

		const result = resolveBinding( makeState(), 'Backspace', bindings );

		expect( result.id ).toBe( 'first' );
	} );

	it( 'filters by zone', () => {
		const bindings = [
			{ id: 'a', zone: 'action', keys: [ 'Enter' ], when: () => true, handle: () => {} }
		];

		const result = resolveBinding( makeState( { actionsFocused: false } ), 'Enter', bindings );

		expect( result ).toBeNull();
	} );

	it( 'suppresses bindings without worksDuringHelp when help is visible', () => {
		const bindings = [
			{ id: 'normal', zone: 'input', keys: [ 'Enter' ], when: () => true, handle: () => {} },
			{ id: 'help', zone: 'input', keys: [ 'Enter' ], when: () => true, worksDuringHelp: true, handle: () => {} }
		];

		const result = resolveBinding( makeState( { helpVisible: true } ), 'Enter', bindings );

		expect( result.id ).toBe( 'help' );
	} );

	it( 'evaluates when predicate against state', () => {
		const bindings = [
			{ id: 'a', zone: 'input', keys: [ 'Backspace' ], when: ( s ) => s.tokens.length > 0, handle: () => {} }
		];

		expect( resolveBinding( makeState( { tokens: [] } ), 'Backspace', bindings ) ).toBeNull();
		expect( resolveBinding( makeState( { tokens: [ 'a' ] } ), 'Backspace', bindings ).id ).toBe( 'a' );
	} );

	it( 'never returns a binding with empty keys array', () => {
		const bindings = [
			{ id: 'hint-only', zone: 'input', keys: [], when: () => true, handle: () => {}, hint: { msgKey: 'a', kbd: 'x', order: 10 } }
		];

		const result = resolveBinding( makeState(), 'x', bindings );

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

describe( 'modifierToken', () => {
	const noAltGraph = () => false;

	function event( overrides ) {
		return Object.assign( {
			key: 'a', altKey: false, ctrlKey: false, metaKey: false, shiftKey: false
		}, overrides );
	}

	it( 'reports no modifiers for a bare key', () => {
		expect( modifierToken( event(), false, noAltGraph ) ).toBe( 'none' );
	} );

	it( 'does not count Shift on a key that produces a character', () => {
		// `?` is Shift+/ on a US layout; treating Shift as a modifier there
		// would make the help shortcut unreachable.
		expect( modifierToken( event( { key: '?', shiftKey: true } ), false, noAltGraph ) )
			.toBe( 'none' );
	} );

	it( 'counts Shift on a key that produces no character', () => {
		expect( modifierToken( event( { key: 'Tab', shiftKey: true } ), false, noAltGraph ) )
			.toBe( 'shift' );
	} );

	it( 'reads the accelerator per platform', () => {
		expect( modifierToken( event( { ctrlKey: true } ), false, noAltGraph ) ).toBe( 'accel' );
		expect( modifierToken( event( { metaKey: true } ), true, noAltGraph ) ).toBe( 'accel' );
		// The other one is a foreign chord on that platform.
		expect( modifierToken( event( { metaKey: true } ), false, noAltGraph ) ).toBe( 'other' );
		expect( modifierToken( event( { ctrlKey: true } ), true, noAltGraph ) ).toBe( 'other' );
	} );

	it( 'combines the accelerator with Shift', () => {
		expect( modifierToken( event( { key: 'Tab', ctrlKey: true, shiftKey: true } ), false, noAltGraph ) )
			.toBe( 'accel+shift' );
	} );

	it( 'reports an Alt chord as unclaimable', () => {
		expect( modifierToken( event( { altKey: true } ), false, noAltGraph ) ).toBe( 'other' );
	} );

	it( 'treats an AltGr-composed character as typed text', () => {
		// `@`, `~` and `#` are AltGr characters on European layouts, and all
		// three are mode triggers.
		const alwaysAltGraph = () => true;

		expect( modifierToken( event( { key: '@', ctrlKey: true, altKey: true } ), false, alwaysAltGraph ) )
			.toBe( 'none' );
	} );
} );

describe( 'resolveBinding — modifiers', () => {
	function binding( overrides ) {
		return Object.assign(
			{ id: 'b', zone: 'input', keys: [ 'Tab' ], when: () => true, handle: () => {} },
			overrides
		);
	}

	it( 'matches a binding with no declared policy only when none are held', () => {
		const bindings = [ binding() ];

		expect( resolveBinding( makeState(), 'Tab', bindings, 'none' ) ).not.toBeNull();
		expect( resolveBinding( makeState(), 'Tab', bindings, 'shift' ) ).toBeNull();
		expect( resolveBinding( makeState(), 'Tab', bindings, 'accel' ) ).toBeNull();
	} );

	it( 'treats an omitted modifiers argument as none', () => {
		expect( resolveBinding( makeState(), 'Tab', [ binding() ] ) ).not.toBeNull();
	} );

	it( 'matches a required modifier only when it is held', () => {
		const bindings = [ binding( { keys: [ 'c' ], modifiers: 'accel' } ) ];

		expect( resolveBinding( makeState(), 'c', bindings, 'accel' ) ).not.toBeNull();
		expect( resolveBinding( makeState(), 'c', bindings, 'none' ) ).toBeNull();
	} );

	it( 'accepts any of several declared states', () => {
		const bindings = [ binding( { modifiers: [ 'none', 'shift' ] } ) ];

		expect( resolveBinding( makeState(), 'Tab', bindings, 'none' ) ).not.toBeNull();
		expect( resolveBinding( makeState(), 'Tab', bindings, 'shift' ) ).not.toBeNull();
		expect( resolveBinding( makeState(), 'Tab', bindings, 'accel' ) ).toBeNull();
	} );

	it( 'lets a binding opt out of the policy entirely', () => {
		const bindings = [ binding( { modifiers: 'any' } ) ];

		expect( resolveBinding( makeState(), 'Tab', bindings, 'other' ) ).not.toBeNull();
	} );

	it( 'leaves an unnameable chord to the browser', () => {
		// `other` covers Alt chords and the Windows key; nothing but `any` can
		// claim one, so they stay with the browser and the text field.
		const bindings = [ binding( { modifiers: [ 'none', 'shift', 'accel', 'accel+shift' ] } ) ];

		expect( resolveBinding( makeState(), 'Tab', bindings, 'other' ) ).toBeNull();
	} );
} );
