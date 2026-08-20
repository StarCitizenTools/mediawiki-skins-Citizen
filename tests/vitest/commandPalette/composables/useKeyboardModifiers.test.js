// @vitest-environment jsdom

/**
 * Characterisation table for the dispatcher's modifier policy.
 *
 * Which (key, modifier) combinations reach a binding is currently decided by
 * two blanket guards in `handleKeydown` rather than by the bindings themselves,
 * so the policy is invisible from the registry and has produced three bugs:
 * Ctrl+Alt+Space clicking the focused action, Shift+Tab escaping the palette,
 * and the copy chord needing to be hoisted above the guards entirely.
 *
 * This file pins the resulting behaviour as a table. It is deliberately about
 * observable outcomes — which callback fired, whether the keystroke was claimed
 * — so it survives a change in how the policy is expressed and fails only if
 * what the user experiences changes.
 */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const { ref } = require( 'vue' );
const useKeyboard = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useKeyboard.js'
);

const MODIFIER_SETS = {
	none: {},
	shift: { shiftKey: true },
	ctrl: { ctrlKey: true },
	alt: { altKey: true },
	meta: { metaKey: true },
	// Windows delivers AltGr as Ctrl+Alt; several layouts type `@`, `~` and `#`
	// — all mode triggers — that way.
	altgr: { ctrlKey: true, altKey: true },
	ctrlShift: { ctrlKey: true, shiftKey: true }
};

describe( 'dispatcher modifier policy', () => {
	let spies;
	let deps;
	let keyboard;

	/**
	 * Dispatch one key in one zone and report what the palette did, as a
	 * stable signature.
	 *
	 * @param {string} key
	 * @param {string} modifierSet
	 * @param {string} zone 'input' or 'action'
	 * @return {string}
	 */
	function outcome( key, modifierSet, zone ) {
		Object.values( spies ).forEach( ( spy ) => spy.mockClear() );
		const actionTarget = {
			closest: vi.fn( ( selector ) => (
				selector === '.citizen-command-palette-list-item__action' ? actionTarget : null
			) )
		};
		const inputTarget = { closest: vi.fn( () => null ) };
		const event = Object.assign( {
			key,
			target: zone === 'action' ? actionTarget : inputTarget,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: false,
			getModifierState: vi.fn( () => false )
		}, MODIFIER_SETS[ modifierSet ] );

		keyboard.handleKeydown( event );

		const fired = Object.keys( spies ).filter( ( name ) => spies[ name ].mock.calls.length > 0 );
		if ( !fired.length ) {
			return event.preventDefault.mock.calls.length ? 'claimed' : 'ignored';
		}
		return fired.sort().join( '+' ) +
			( event.preventDefault.mock.calls.length ? ' (claimed)' : '' );
	}

	beforeEach( () => {
		spies = {
			onSelect: vi.fn(),
			onClose: vi.fn(),
			onClearQuery: vi.fn(),
			onEnterMode: vi.fn(),
			onToggleHelp: vi.fn(),
			highlightNext: vi.fn(),
			clickFocused: vi.fn(),
			deactivate: vi.fn(),
			focusFirst: vi.fn(),
			requestHeaderCopy: vi.fn()
		};

		deps = {
			core: {
				inputRef: ref( { focus: vi.fn(), closest: vi.fn( () => null ) } ),
				itemRefs: ref( new Map() ),
				items: ref( [ { id: '1', actions: [ { id: 'edit' } ] } ] ),
				query: ref( '' ),
				requestHeaderCopy: spies.requestHeaderCopy,
				onSelect: spies.onSelect,
				onClose: spies.onClose,
				onClearQuery: spies.onClearQuery
			},
			navigation: {
				listNav: {
					highlightedIndex: ref( 0 ),
					highlightNext: spies.highlightNext,
					highlightPrevious: vi.fn(),
					highlightFirst: vi.fn(),
					highlightLast: vi.fn(),
					resetHighlight: vi.fn(),
					scrollToHighlighted: vi.fn()
				},
				actionNav: {
					isActive: ref( true ),
					focusedIndex: ref( 0 ),
					focusFirst: spies.focusFirst,
					focusNext: vi.fn(),
					focusPrevious: vi.fn(),
					deactivate: spies.deactivate,
					clickFocused: spies.clickFocused
				}
			},
			help: {
				helpVisible: ref( false ),
				onToggleHelp: spies.onToggleHelp,
				onCloseHelp: vi.fn()
			},
			mode: {
				activeMode: ref( null ),
				activeModeContext: ref( [] ),
				findModeByTrigger: vi.fn( ( char ) => ( char === '@' ? { id: 'user' } : null ) ),
				onEnterMode: spies.onEnterMode,
				onExitMode: vi.fn(),
				onPopModeContext: vi.fn()
			}
		};
		keyboard = useKeyboard( deps );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	// Each row: [ key, modifiers, zone, expected outcome ].
	// Read this as "what a user pressing that combination gets today".
	const TABLE = [
		// Bare keys do what the registry says.
		[ 'Enter', 'none', 'input', 'onSelect (claimed)' ],
		[ 'Escape', 'none', 'input', 'onClose (claimed)' ],
		[ 'ArrowDown', 'none', 'input', 'highlightNext (claimed)' ],
		[ 'Tab', 'none', 'input', 'onClose (claimed)' ],
		[ ' ', 'none', 'action', 'clickFocused (claimed)' ],

		// A command modifier suppresses them, unless a binding claims it.
		[ 'ArrowDown', 'ctrl', 'input', 'ignored' ],
		[ 'ArrowDown', 'meta', 'input', 'ignored' ],
		[ 'Escape', 'alt', 'input', 'ignored' ],

		// Ctrl+Enter is the anchor convention for "open in a new tab", so the
		// Enter binding claims the accelerator, with or without Shift.
		[ 'Enter', 'ctrl', 'input', 'onSelect (claimed)' ],
		[ 'Enter', 'ctrlShift', 'input', 'onSelect (claimed)' ],

		// Shift is allowed only for printable characters, plus Tab by exception.
		[ 'ArrowDown', 'shift', 'input', 'ignored' ],
		[ 'Tab', 'shift', 'input', 'onClose (claimed)' ],
		[ '@', 'shift', 'input', 'onEnterMode (claimed)' ],

		// AltGr composes printable characters, so it is not a chord — but a
		// plain space is excluded, or Ctrl+Alt+Space clicks the focused action.
		[ '@', 'altgr', 'input', 'onEnterMode (claimed)' ],
		[ ' ', 'altgr', 'action', 'ignored' ],
		[ 'ArrowDown', 'altgr', 'input', 'ignored' ],

		// Typing in the action zone redirects to the input.
		[ 'a', 'none', 'action', 'deactivate' ],
		[ 'a', 'ctrl', 'action', 'ignored' ],
		[ 'Tab', 'none', 'action', 'deactivate (claimed)' ],

		// `?` is Shift+/ on a US layout, so Shift must not suppress it.
		[ '?', 'none', 'input', 'onToggleHelp (claimed)' ],
		[ '?', 'shift', 'input', 'onToggleHelp (claimed)' ],

		// Chords belong to the browser and the text field.
		[ 'Tab', 'ctrl', 'input', 'ignored' ],
		[ 'Home', 'shift', 'input', 'ignored' ],
		[ 'End', 'shift', 'input', 'ignored' ],
		[ 'ArrowLeft', 'shift', 'input', 'ignored' ],
		[ 'ArrowLeft', 'alt', 'input', 'ignored' ],
		[ 'ArrowLeft', 'ctrl', 'input', 'ignored' ],
		[ 'Enter', 'shift', 'input', 'ignored' ],
		[ 'Enter', 'meta', 'input', 'ignored' ],
		[ 'Backspace', 'ctrl', 'input', 'ignored' ],
		[ '@', 'meta', 'input', 'ignored' ],

		// Two rows that record a defect rather than an intention. The guards
		// classify by key shape, not by what the binding wants, so a real chord
		// reaches a binding that only ever meant to claim a bare key.
		// `Ctrl+Alt+?` is not AltGr on a US layout — it is a chord.
		[ '?', 'altgr', 'input', 'onToggleHelp (claimed)' ],
		// `action-select` lists `Enter` and `' '` together; the space picks up
		// Shift because Guard B exempts single-character keys.
		[ ' ', 'shift', 'action', 'clickFocused (claimed)' ]
	];

	TABLE.forEach( ( [ key, modifiers, zone, expected ] ) => {
		const label = `${ modifiers === 'none' ? '' : modifiers + '+' }${ key === ' ' ? 'Space' : key }`;
		it( `${ label } in the ${ zone } zone → ${ expected }`, () => {
			expect( outcome( key, modifiers, zone ) ).toBe( expected );
		} );
	} );

	it( 'claims the copy chord only when the highlighted item offers a value', () => {
		deps.core.items = ref( [
			{ id: '1', detail: { header: { copyValue: 'File:Foo.png' } } }
		] );
		keyboard = useKeyboard( deps );

		expect( outcome( 'c', 'ctrl', 'input' ) ).toBe( 'requestHeaderCopy (claimed)' );
		// Without the value there is nothing to copy, so the browser keeps it.
		deps.core.items = ref( [ { id: '1' } ] );
		keyboard = useKeyboard( deps );

		expect( outcome( 'c', 'ctrl', 'input' ) ).toBe( 'ignored' );
	} );
} );
