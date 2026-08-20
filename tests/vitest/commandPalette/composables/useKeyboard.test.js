// @vitest-environment jsdom

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const { ref } = require( 'vue' );
const useKeyboard = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useKeyboard.js'
);

/**
 * Adapter: useKeyboard takes grouped buckets, but the test fixtures here
 * keep their dependencies flat for ergonomics. Funnel the flat shape into
 * the bucketed shape on each call so the existing `deps.X` mutations in
 * test bodies keep working without per-test rewrites.
 *
 * MUST stay in sync with useKeyboard.js's bucket definitions. If a field
 * moves buckets (e.g. requestHeaderCopy promoted to its own bucket), update
 * this mapping or tests will silently put the field in the wrong place and
 * the binding handler will quietly stop firing.
 *
 * @param {Object} deps
 * @return {Object}
 */
function toGrouped( deps ) {
	return {
		core: {
			inputRef: deps.inputRef,
			itemRefs: deps.itemRefs,
			items: deps.items,
			query: deps.query,
			requestHeaderCopy: deps.requestHeaderCopy,
			canQueueActivation: deps.canQueueActivation,
			onQueueActivation: deps.onQueueActivation,
			onSelect: deps.onSelect,
			onClose: deps.onClose,
			onClearQuery: deps.onClearQuery
		},
		navigation: {
			listNav: deps.listNav,
			gridNav: deps.gridNav,
			isGalleryLayout: deps.isGalleryLayout,
			actionNav: deps.actionNav
		},
		mode: {
			activeMode: deps.activeMode,
			activeModeContext: deps.activeModeContext,
			findModeByTrigger: deps.findModeByTrigger,
			onEnterMode: deps.onEnterMode,
			onExitMode: deps.onExitMode,
			onPopModeContext: deps.onPopModeContext
		},
		tokens: {
			tokens: deps.tokens,
			selectedTokenIndex: deps.selectedTokenIndex,
			onSelectToken: deps.onSelectToken,
			onRemoveToken: deps.onRemoveToken
		},
		help: {
			helpVisible: deps.helpVisible,
			onToggleHelp: deps.onToggleHelp,
			onCloseHelp: deps.onCloseHelp
		}
	};
}

describe( 'useKeyboard', () => {
	let listNav;
	let actionNav;
	let deps;
	let keyboard;

	function createKeyEvent( key, target ) {
		var defaultTarget = deps.inputRef.value;
		// Ensure the default target has a closest() method for zone detection
		if ( !target && defaultTarget && typeof defaultTarget.closest !== 'function' ) {
			defaultTarget.closest = vi.fn( () => null );
		}
		return {
			key: key,
			target: target || defaultTarget,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			shiftKey: false,
			// Browsers always supply this; the AltGr detection consults it
			// before falling back to the modifier flags, so a fixture without
			// it would leave that branch unreachable.
			getModifierState: vi.fn( () => false )
		};
	}

	beforeEach( () => {
		listNav = {
			highlightedIndex: ref( 0 ),
			highlightNext: vi.fn(),
			highlightPrevious: vi.fn(),
			highlightFirst: vi.fn(),
			highlightLast: vi.fn(),
			resetHighlight: vi.fn(),
			scrollToHighlighted: vi.fn()
		};

		actionNav = {
			isActive: ref( false ),
			focusedIndex: ref( -1 ),
			focusFirst: vi.fn(),
			focusNext: vi.fn(),
			focusPrevious: vi.fn(),
			deactivate: vi.fn(),
			clickFocused: vi.fn()
		};

		deps = {
			inputRef: ref( {
				focus: vi.fn(),
				querySelector: vi.fn( () => ( {
					selectionStart: 5,
					selectionEnd: 5,
					value: 'hello',
					focus: vi.fn()
				} ) )
			} ),
			itemRefs: ref( new Map() ),
			items: ref( [ { id: '1', actions: [ { id: 'edit' } ] } ] ),
			listNav: listNav,
			actionNav: actionNav,
			onSelect: vi.fn(),
			onClose: vi.fn(),
			canQueueActivation: ref( false ),
			onQueueActivation: vi.fn(),
			query: ref( '' ),
			activeMode: ref( null ),
			onClearQuery: vi.fn(),
			onExitMode: vi.fn(),
			onEnterMode: vi.fn(),
			findModeByTrigger: vi.fn( () => null )
		};

		keyboard = useKeyboard( toGrouped( deps ) );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	describe( 'input zone — arrow keys', () => {
		it( 'should call highlightNext on ArrowDown', () => {
			keyboard.handleKeydown( createKeyEvent( 'ArrowDown' ) );

			expect( listNav.highlightNext ).toHaveBeenCalled();
		} );

		it( 'should call highlightPrevious on ArrowUp', () => {
			keyboard.handleKeydown( createKeyEvent( 'ArrowUp' ) );

			expect( listNav.highlightPrevious ).toHaveBeenCalled();
		} );

		it( 'should call highlightFirst on Home', () => {
			keyboard.handleKeydown( createKeyEvent( 'Home' ) );

			expect( listNav.highlightFirst ).toHaveBeenCalled();
		} );

		it( 'should call highlightLast on End', () => {
			keyboard.handleKeydown( createKeyEvent( 'End' ) );

			expect( listNav.highlightLast ).toHaveBeenCalled();
		} );
	} );

	describe( 'input zone — Enter', () => {
		it( 'should call onSelect with highlighted item', () => {
			listNav.highlightedIndex.value = 0;

			keyboard.handleKeydown( createKeyEvent( 'Enter' ) );

			expect( deps.onSelect ).toHaveBeenCalledWith( deps.items.value[ 0 ] );
		} );

		it( 'should ask for a new tab on Ctrl+Enter, as Ctrl+click does', () => {
			listNav.highlightedIndex.value = 0;
			const event = createKeyEvent( 'Enter' );
			event.ctrlKey = true;

			keyboard.handleKeydown( event );

			expect( deps.onSelect ).toHaveBeenCalledWith( {
				id: '1',
				actions: [ { id: 'edit' } ],
				modifierClick: true,
				newTab: true
			} );
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( 'should leave the list item itself unflagged', () => {
			// The row lives in the reactive result list; flagging it in place
			// would make every later activation of that row open a new tab.
			listNav.highlightedIndex.value = 0;
			const event = createKeyEvent( 'Enter' );
			event.ctrlKey = true;

			keyboard.handleKeydown( event );

			expect( deps.items.value[ 0 ] ).toEqual( { id: '1', actions: [ { id: 'edit' } ] } );
		} );

		it( 'should read Ctrl+Shift+Enter as the same new-tab request', () => {
			listNav.highlightedIndex.value = 0;
			const event = createKeyEvent( 'Enter' );
			event.ctrlKey = true;
			event.shiftKey = true;

			keyboard.handleKeydown( event );

			expect( deps.onSelect ).toHaveBeenCalledWith(
				expect.objectContaining( { newTab: true } )
			);
		} );

		it( 'should carry the new-tab request into a held activation', () => {
			listNav.highlightedIndex.value = -1;
			deps.canQueueActivation.value = true;
			const event = createKeyEvent( 'Enter' );
			event.ctrlKey = true;

			keyboard.handleKeydown( event );

			expect( deps.onQueueActivation ).toHaveBeenCalledWith( {
				modifierClick: true,
				newTab: true
			} );
		} );
	} );

	describe( 'input zone — Escape', () => {
		it( 'should call onClose', () => {
			keyboard.handleKeydown( createKeyEvent( 'Escape' ) );

			expect( deps.onClose ).toHaveBeenCalled();
		} );
	} );

	describe( 'modifier keys', () => {
		it( 'should ignore events with modifier keys', () => {
			var event = createKeyEvent( 'ArrowDown' );
			event.ctrlKey = true;

			keyboard.handleKeydown( event );

			expect( listNav.highlightNext ).not.toHaveBeenCalled();
		} );

		it( 'should close on Shift+Tab, so focus cannot leave the open palette', () => {
			var event = createKeyEvent( 'Tab' );
			event.shiftKey = true;

			keyboard.handleKeydown( event );

			expect( deps.onClose ).toHaveBeenCalled();
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( 'should still claim Tab while the help overlay is up', () => {
			deps.helpVisible = ref( true );
			deps.onToggleHelp = vi.fn();
			deps.onCloseHelp = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );

			[ false, true ].forEach( ( shift ) => {
				const event = createKeyEvent( 'Tab' );
				event.shiftKey = shift;

				keyboard.handleKeydown( event );

				expect( event.preventDefault ).toHaveBeenCalled();
			} );
			expect( deps.onClose ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should step Tab back to the input from the action zone, not out of the palette', () => {
			const actionTarget = {
				closest: vi.fn( ( selector ) => (
					selector === '.citizen-command-palette-list-item__action' ? actionTarget : null
				) )
			};
			actionNav.isActive.value = true;

			const event = createKeyEvent( 'Tab', actionTarget );
			event.shiftKey = true;

			keyboard.handleKeydown( event );

			expect( event.preventDefault ).toHaveBeenCalled();
			expect( actionNav.deactivate ).toHaveBeenCalled();
			expect( deps.onClose ).not.toHaveBeenCalled();
		} );

		it( 'should ignore Shift for non-printable keys', () => {
			var event = createKeyEvent( 'ArrowDown' );
			event.shiftKey = true;

			keyboard.handleKeydown( event );

			expect( listNav.highlightNext ).not.toHaveBeenCalled();
		} );

		it( 'should allow Shift for printable characters like @', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( null );
			const mode = { id: 'user', triggers: [ '@' ] };
			deps.findModeByTrigger = vi.fn( () => mode );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );

			var event = createKeyEvent( '@' );
			event.shiftKey = true;

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).toHaveBeenCalledWith( mode );
		} );
	} );

	describe( 'AltGr characters', () => {
		it( 'should treat a Ctrl+Alt character as typed, not as a chord', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( null );
			const mode = { id: 'user', triggers: [ '@' ] };
			deps.findModeByTrigger = vi.fn( () => mode );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );

			// German and Nordic layouts type "@" as AltGr+Q, which Windows
			// reports as Ctrl+Alt.
			var event = createKeyEvent( '@' );
			event.ctrlKey = true;
			event.altKey = true;

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).toHaveBeenCalledWith( mode );
		} );

		it( 'should still ignore Ctrl+Alt with a non-printable key', () => {
			// Ctrl+Alt+Arrow is a live desktop shortcut; AltGr cannot produce it.
			var event = createKeyEvent( 'ArrowDown' );
			event.ctrlKey = true;
			event.altKey = true;

			keyboard.handleKeydown( event );

			expect( listNav.highlightNext ).not.toHaveBeenCalled();
		} );

		it( 'should redirect an AltGr character typed in the action zone to the input', () => {
			const actionTarget = {
				closest: vi.fn( ( selector ) => (
					selector === '.citizen-command-palette-list-item__action' ? actionTarget : null
				) )
			};
			actionNav.isActive.value = true;

			var event = createKeyEvent( '@', actionTarget );
			event.ctrlKey = true;
			event.altKey = true;

			keyboard.handleKeydown( event );

			expect( actionNav.deactivate ).toHaveBeenCalled();
		} );

		it( 'should treat a character Firefox reports via getModifierState as typed', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( null );
			const mode = { id: 'user', triggers: [ '@' ] };
			deps.findModeByTrigger = vi.fn( () => mode );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );

			// Firefox flags AltGr without setting ctrlKey.
			var event = createKeyEvent( '@' );
			event.altKey = true;
			event.getModifierState = vi.fn( ( m ) => m === 'AltGraph' );

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).toHaveBeenCalledWith( mode );
		} );

		it( 'should not let Ctrl+Alt+Space activate the focused action', () => {
			const actionTarget = {
				closest: vi.fn( ( selector ) => (
					selector === '.citizen-command-palette-list-item__action' ? actionTarget : null
				) )
			};
			actionNav.isActive.value = true;

			// Space is a real action-zone binding, and no AltGr layer types a
			// plain U+0020 — the layouts that map it emit U+00A0.
			var event = createKeyEvent( ' ', actionTarget );
			event.ctrlKey = true;
			event.altKey = true;

			keyboard.handleKeydown( event );

			expect( actionNav.clickFocused ).not.toHaveBeenCalled();
		} );

		it( 'should still ignore a Command chord', () => {
			const actionTarget = {
				closest: vi.fn( ( selector ) => (
					selector === '.citizen-command-palette-list-item__action' ? actionTarget : null
				) )
			};
			actionNav.isActive.value = true;

			var event = createKeyEvent( '@', actionTarget );
			event.metaKey = true;
			event.altKey = true;
			event.ctrlKey = true;

			keyboard.handleKeydown( event );

			expect( actionNav.deactivate ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'input method composition', () => {
		it( 'should ignore the Enter that commits an IME candidate', () => {
			listNav.highlightedIndex.value = 0;

			var event = createKeyEvent( 'Enter' );
			event.isComposing = true;

			keyboard.handleKeydown( event );

			expect( deps.onSelect ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );

		it( 'should still act on a key that only reports the legacy keyCode 229', () => {
			// Chrome on Android sets 229 for almost every non-printable key,
			// Enter included, whether or not anything is being composed. Reading
			// it would disable the palette's Enter and Backspace on mobile.
			var event = createKeyEvent( 'Escape' );
			event.keyCode = 229;

			keyboard.handleKeydown( event );

			expect( deps.onClose ).toHaveBeenCalled();
		} );
	} );

	describe( 'copy shortcut', () => {
		function withCopyValue() {
			deps.items = ref( [
				{ id: '1', detail: { header: { copyValue: 'File:Foo.png' } } }
			] );
			deps.requestHeaderCopy = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			listNav.highlightedIndex.value = 0;
		}

		it( 'should copy the header value on Ctrl+C', () => {
			withCopyValue();

			var event = createKeyEvent( 'c' );
			event.ctrlKey = true;

			keyboard.handleKeydown( event );

			expect( deps.requestHeaderCopy ).toHaveBeenCalled();
		} );

		it( 'should copy on a layout that types no Latin letter', () => {
			withCopyValue();

			// Russian keycaps carry a Latin legend on the US positions.
			var event = createKeyEvent( 'с' );
			event.code = 'KeyC';
			event.ctrlKey = true;

			keyboard.handleKeydown( event );

			expect( deps.requestHeaderCopy ).toHaveBeenCalled();
		} );

		it( 'should not copy from the key position when the layout types c elsewhere', () => {
			withCopyValue();

			// Dvorak types "j" from the US QWERTY "c" position.
			var event = createKeyEvent( 'j' );
			event.code = 'KeyC';
			event.ctrlKey = true;

			keyboard.handleKeydown( event );

			expect( deps.requestHeaderCopy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'right-to-left interface languages', () => {
		function actionZoneTarget() {
			const target = {
				closest: vi.fn( ( selector ) => (
					selector === '.citizen-command-palette-list-item__action' ? target : null
				) )
			};
			actionNav.isActive.value = true;
			return target;
		}

		afterEach( () => {
			document.dir = '';
		} );

		it( 'steps the action row visually, so ArrowLeft advances under RTL', () => {
			document.dir = 'rtl';
			const target = actionZoneTarget();

			keyboard.handleKeydown( createKeyEvent( 'ArrowLeft', target ) );

			expect( actionNav.focusNext ).toHaveBeenCalled();
			expect( actionNav.focusPrevious ).not.toHaveBeenCalled();
		} );

		it( 'sends ArrowRight backwards under RTL', () => {
			document.dir = 'rtl';
			const target = actionZoneTarget();

			keyboard.handleKeydown( createKeyEvent( 'ArrowRight', target ) );

			expect( actionNav.focusPrevious ).toHaveBeenCalled();
			expect( actionNav.focusNext ).not.toHaveBeenCalled();
		} );

		it( 'leaves the action row unmirrored under LTR', () => {
			document.dir = 'ltr';
			const target = actionZoneTarget();

			keyboard.handleKeydown( createKeyEvent( 'ArrowRight', target ) );

			expect( actionNav.focusNext ).toHaveBeenCalled();
			expect( actionNav.focusPrevious ).not.toHaveBeenCalled();
		} );

		it( 'prefers the input\'s own direction over the document', () => {
			// A palette inside a direction island must follow the island.
			document.dir = 'ltr';
			// A real element: getComputedStyle rejects anything else.
			const inputEl = document.createElement( 'input' );
			deps.inputRef.value.getInputElement = vi.fn( () => inputEl );
			const original = globalThis.getComputedStyle;
			globalThis.getComputedStyle = vi.fn( () => ( { direction: 'rtl' } ) );
			keyboard = useKeyboard( toGrouped( deps ) );
			const target = actionZoneTarget();

			try {
				keyboard.handleKeydown( createKeyEvent( 'ArrowLeft', target ) );
			} finally {
				globalThis.getComputedStyle = original;
			}

			expect( actionNav.focusNext ).toHaveBeenCalled();
			expect( actionNav.focusPrevious ).not.toHaveBeenCalled();
		} );

		it( 'does not mirror the vertical arrows', () => {
			document.dir = 'rtl';

			keyboard.handleKeydown( createKeyEvent( 'ArrowDown' ) );
			keyboard.handleKeydown( createKeyEvent( 'ArrowUp' ) );

			expect( listNav.highlightNext ).toHaveBeenCalledTimes( 1 );
			expect( listNav.highlightPrevious ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'reaches the action row with ArrowLeft under RTL', () => {
			// The input to action-row jump: one of the two paths in T1741.
			document.dir = 'rtl';
			var inputEl = {
				selectionStart: 5,
				selectionEnd: 5,
				value: 'hello',
				focus: vi.fn(),
				closest: vi.fn( () => null )
			};
			deps.inputRef.value.getInputElement = vi.fn( () => inputEl );
			listNav.highlightedIndex.value = 0;
			keyboard = useKeyboard( toGrouped( deps ) );

			keyboard.handleKeydown( createKeyEvent( 'ArrowLeft', inputEl ) );

			expect( actionNav.focusFirst ).toHaveBeenCalled();
		} );

		it( 'steps gallery tiles with ArrowLeft under RTL', () => {
			// Gallery tiles: the other path in T1741.
			document.dir = 'rtl';
			const gridNav = {
				highlightNext: vi.fn(),
				highlightPrevious: vi.fn(),
				highlightUp: vi.fn(),
				highlightDown: vi.fn(),
				highlightFirst: vi.fn(),
				highlightLast: vi.fn(),
				highlightedIndex: ref( 0 ),
				scrollToHighlighted: vi.fn()
			};
			deps.gridNav = gridNav;
			deps.isGalleryLayout = ref( true );
			keyboard = useKeyboard( toGrouped( deps ) );

			keyboard.handleKeydown( createKeyEvent( 'ArrowLeft' ) );

			expect( gridNav.highlightNext ).toHaveBeenCalled();
			expect( gridNav.highlightPrevious ).not.toHaveBeenCalled();
		} );

		it( 'mirrors every arrow in a combined hint glyph', () => {
			document.dir = 'rtl';
			const actionTarget = {
				closest: vi.fn( ( selector ) => (
					selector === '.citizen-command-palette-list-item__action' ? actionTarget : null
				) )
			};
			actionNav.isActive.value = true;
			// focusedIndex at the last action selects the `↑↓←` hint variant.
			actionNav.focusedIndex.value = 1;
			deps.items = ref( [ { id: '1', actions: [ { id: 'a' }, { id: 'b' } ] } ] );
			keyboard = useKeyboard( toGrouped( deps ) );
			listNav.highlightedIndex.value = 0;

			const kbds = keyboard.keyboardHints.value.map( ( hint ) => hint.kbd );

			expect( kbds ).toContain( '↑↓→' );
			expect( kbds ).not.toContain( '↑↓←' );
		} );

		it( 'leaves a hint offering both arrows untouched', () => {
			// focusedIndex before the last action selects the `↑↓←→` variant,
			// which already covers either direction — swapping would only
			// shuffle the glyphs into a stranger order.
			document.dir = 'rtl';
			const actionTarget = {
				closest: vi.fn( ( selector ) => (
					selector === '.citizen-command-palette-list-item__action' ? actionTarget : null
				) )
			};
			actionNav.isActive.value = true;
			actionNav.focusedIndex.value = 0;
			deps.items = ref( [ { id: '1', actions: [ { id: 'a' }, { id: 'b' } ] } ] );
			keyboard = useKeyboard( toGrouped( deps ) );
			listNav.highlightedIndex.value = 0;

			const kbds = keyboard.keyboardHints.value.map( ( hint ) => hint.kbd );

			expect( kbds ).toContain( '↑↓←→' );
		} );

		it( 'mirrors the arrow glyphs in the footer hints', () => {
			document.dir = 'rtl';
			deps.items = ref( [ { id: '1', actions: [ { id: 'edit' } ] } ] );
			keyboard = useKeyboard( toGrouped( deps ) );
			listNav.highlightedIndex.value = 0;

			const kbds = keyboard.keyboardHints.value.map( ( hint ) => hint.kbd );

			// The action row sits to the left under RTL, so the hint for
			// reaching it must advertise the key the user actually presses.
			expect( kbds ).toContain( '←' );
			expect( kbds ).not.toContain( '→' );
		} );
	} );

	describe( 'input zone — ArrowRight at end of input', () => {
		it( 'should call actionNav.focusFirst when cursor is at end and item has actions', () => {
			var inputEl = {
				selectionStart: 5,
				selectionEnd: 5,
				value: 'hello',
				focus: vi.fn(),
				closest: vi.fn( () => null )
			};
			deps.inputRef.value.getInputElement = vi.fn( () => inputEl );
			listNav.highlightedIndex.value = 0;

			keyboard.handleKeydown( createKeyEvent( 'ArrowRight', inputEl ) );

			expect( actionNav.focusFirst ).toHaveBeenCalled();
		} );
	} );

	describe( 'keyboardHints', () => {
		it( 'should offer no Enter hint when nothing is highlighted and nothing can be queued', () => {
			deps.items.value = [];
			listNav.highlightedIndex.value = -1;

			const hints = keyboard.keyboardHints.value;

			// Enter has nothing to act on here, so advertising it would promise
			// a keystroke that does nothing.
			expect( hints ).toEqual( [
				{ msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc' }
			] );
		} );

		it( 'should offer the Enter hint when an activation can be queued', () => {
			deps.items.value = [];
			listNav.highlightedIndex.value = -1;
			deps.canQueueActivation.value = true;

			const hints = keyboard.keyboardHints.value;

			expect( hints ).toContainEqual(
				{ msgKey: 'citizen-command-palette-keyhint-enter-select', kbd: '↵' }
			);
		} );

		it( 'should name Enter as Search when the pinned fulltext row is highlighted', () => {
			deps.items.value = [
				{ id: 1, type: 'action', source: 'queryAction:fulltext-search' },
				{ id: 2, type: 'page' }
			];
			listNav.highlightedIndex.value = 0;

			const hints = keyboard.keyboardHints.value;

			expect( hints ).toContainEqual(
				{ msgKey: 'citizen-command-palette-keyhint-enter-search', kbd: '↵' }
			);
			expect( hints ).not.toContainEqual(
				{ msgKey: 'citizen-command-palette-keyhint-enter-select', kbd: '↵' }
			);
		} );

		it( 'should return Enter/Select, Navigate, and Exit when item is highlighted with no actions', () => {
			deps.items.value = [ { id: 1, type: 'page' }, { id: 2, type: 'page' } ];
			listNav.highlightedIndex.value = 0;

			const hints = keyboard.keyboardHints.value;

			expect( hints ).toEqual( [
				{ msgKey: 'citizen-command-palette-keyhint-enter-select', kbd: '↵' },
				{ msgKey: 'citizen-command-palette-keyhint-navigate', kbd: '↑↓' },
				{ msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc' }
			] );
		} );

		it( 'should include Actions hint when highlighted item has actions', () => {
			deps.items.value = [
				{ id: 1, type: 'page', actions: [ { type: 'dismiss' } ] },
				{ id: 2, type: 'page' }
			];
			listNav.highlightedIndex.value = 0;

			const hints = keyboard.keyboardHints.value;

			expect( hints ).toEqual( [
				{ msgKey: 'citizen-command-palette-keyhint-enter-select', kbd: '↵' },
				{ msgKey: 'citizen-command-palette-keyhint-navigate', kbd: '↑↓' },
				{ msgKey: 'citizen-command-palette-keyhint-actions', kbd: '→' },
				{ msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc' }
			] );
		} );

		it( 'should return Enter/Select, Return, Navigate, and Exit when action focused at first action', () => {
			deps.items.value = [
				{ id: 1, type: 'page', actions: [ { type: 'dismiss' } ] }
			];
			listNav.highlightedIndex.value = 0;
			actionNav.isActive.value = true;
			actionNav.focusedIndex.value = 0;

			const hints = keyboard.keyboardHints.value;

			expect( hints ).toEqual( [
				{ msgKey: 'citizen-command-palette-keyhint-enter-select', kbd: '↵' },
				{ msgKey: 'citizen-command-palette-keyhint-return', kbd: '←' },
				{ msgKey: 'citizen-command-palette-keyhint-navigate', kbd: '↑↓' },
				{ msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc' }
			] );
		} );

		it( 'should return Enter/Select, Navigate with all arrows, and Exit when action focused in middle of multiple actions', () => {
			deps.items.value = [
				{ id: 1, type: 'page', actions: [ { type: 'a' }, { type: 'b' }, { type: 'c' } ] }
			];
			listNav.highlightedIndex.value = 0;
			actionNav.isActive.value = true;
			actionNav.focusedIndex.value = 1;

			const hints = keyboard.keyboardHints.value;

			expect( hints ).toEqual( [
				{ msgKey: 'citizen-command-palette-keyhint-enter-select', kbd: '↵' },
				{ msgKey: 'citizen-command-palette-keyhint-navigate', kbd: '↑↓←→' },
				{ msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc' }
			] );
		} );

		it( 'should show Clear hint when query is non-empty', () => {
			deps.query.value = 'test';
			deps.items.value = [];
			listNav.highlightedIndex.value = -1;

			const hints = keyboard.keyboardHints.value;

			expect( hints[ hints.length - 1 ] ).toEqual(
				{ msgKey: 'citizen-command-palette-keyhint-clear', kbd: 'esc' }
			);
		} );

		it( 'should show Exit hint when in a mode with no query', () => {
			deps.query.value = '';
			deps.activeMode.value = { id: 'namespace' };
			deps.items.value = [];
			listNav.highlightedIndex.value = -1;

			const hints = keyboard.keyboardHints.value;

			expect( hints[ hints.length - 1 ] ).toEqual(
				{ msgKey: 'citizen-command-palette-keyhint-exit', kbd: 'esc' }
			);
		} );
	} );

	describe( 'Backspace hints', () => {
		function setupCursorAtStart() {
			deps.inputRef.value.getInputElement = vi.fn( () => ( {
				selectionStart: 0,
				selectionEnd: 0,
				value: '',
				focus: vi.fn(),
				closest: vi.fn( () => null )
			} ) );
		}

		it( 'shows the Back hint when drilled with empty input and no tokens', () => {
			setupCursorAtStart();
			deps.activeModeContext = ref( [ { title: 'Category A' } ] );
			deps.onPopModeContext = vi.fn();
			deps.query.value = '';

			keyboard = useKeyboard( toGrouped( deps ) );

			expect( keyboard.keyboardHints.value.some(
				( h ) => h.msgKey === 'citizen-command-palette-keyhint-back'
			) ).toBe( true );
		} );

		it( 'shows the Edit tag hint when a token is selected', () => {
			setupCursorAtStart();
			deps.tokens = ref( [ { id: 't1', label: 'Foo' } ] );
			deps.selectedTokenIndex = ref( 0 );
			deps.onSelectToken = vi.fn();
			deps.onRemoveToken = vi.fn();

			keyboard = useKeyboard( toGrouped( deps ) );

			expect( keyboard.keyboardHints.value.some(
				( h ) => h.msgKey === 'citizen-command-palette-keyhint-edit-token'
			) ).toBe( true );
		} );

		it( 'shows the Select tag hint when tokens are present and none selected', () => {
			setupCursorAtStart();
			deps.tokens = ref( [ { id: 't1', label: 'Foo' } ] );
			deps.selectedTokenIndex = ref( -1 );
			deps.onSelectToken = vi.fn();
			deps.onRemoveToken = vi.fn();

			keyboard = useKeyboard( toGrouped( deps ) );

			expect( keyboard.keyboardHints.value.some(
				( h ) => h.msgKey === 'citizen-command-palette-keyhint-select-token'
			) ).toBe( true );
		} );

		it( 'omits Backspace hints in the action zone', () => {
			setupCursorAtStart();
			deps.activeModeContext = ref( [ { title: 'A' } ] );
			deps.onPopModeContext = vi.fn();
			actionNav.isActive.value = true;

			keyboard = useKeyboard( toGrouped( deps ) );

			expect( keyboard.keyboardHints.value.some(
				( h ) => h.kbd === '⌫'
			) ).toBe( false );
		} );
	} );

	describe( 'action zone — Escape', () => {
		it( 'should deactivate action navigation on Escape from action zone', () => {
			actionNav.isActive.value = true;
			var actionButton = document.createElement( 'button' );
			actionButton.classList.add( 'citizen-command-palette-list-item__action' );

			keyboard.handleKeydown( createKeyEvent( 'Escape', actionButton ) );

			expect( actionNav.deactivate ).toHaveBeenCalled();
		} );
	} );

	describe( 'action-zone Escape delegates to input-zone Escape ladder', () => {
		let actionTarget;

		beforeEach( () => {
			actionTarget = {
				closest: vi.fn( ( selector ) => (
					selector === '.citizen-command-palette-list-item__action' ? actionTarget : null
				) )
			};
			actionNav.isActive.value = true;
		} );

		it( 'clears the query when query is non-empty', () => {
			deps.query.value = 'hello';

			keyboard = useKeyboard( toGrouped( deps ) );
			keyboard.handleKeydown( createKeyEvent( 'Escape', actionTarget ) );

			expect( actionNav.deactivate ).toHaveBeenCalled();
			expect( deps.onClearQuery ).toHaveBeenCalled();
			expect( deps.onExitMode ).not.toHaveBeenCalled();
			expect( deps.onClose ).not.toHaveBeenCalled();
		} );

		it( 'exits the active mode when query is empty and a mode is active', () => {
			deps.query.value = '';
			deps.activeMode.value = { id: 'category' };

			keyboard = useKeyboard( toGrouped( deps ) );
			keyboard.handleKeydown( createKeyEvent( 'Escape', actionTarget ) );

			expect( actionNav.deactivate ).toHaveBeenCalled();
			expect( deps.onExitMode ).toHaveBeenCalled();
			expect( deps.onClearQuery ).not.toHaveBeenCalled();
			expect( deps.onClose ).not.toHaveBeenCalled();
		} );

		it( 'closes the palette when query is empty and no mode is active', () => {
			deps.query.value = '';
			deps.activeMode.value = null;

			keyboard = useKeyboard( toGrouped( deps ) );
			keyboard.handleKeydown( createKeyEvent( 'Escape', actionTarget ) );

			expect( actionNav.deactivate ).toHaveBeenCalled();
			expect( deps.onClose ).toHaveBeenCalled();
			expect( deps.onClearQuery ).not.toHaveBeenCalled();
			expect( deps.onExitMode ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'three-level Escape', () => {
		it( 'clears query when Escape pressed with non-empty query', () => {
			deps.query = ref( 'test' );
			deps.activeMode = ref( null );
			deps.onClearQuery = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( 'Escape' );

			keyboard.handleKeydown( event );

			expect( deps.onClearQuery ).toHaveBeenCalled();
			expect( deps.onClose ).not.toHaveBeenCalled();
		} );

		it( 'exits mode when Escape pressed with empty query and active mode', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( { id: 'ns' } );
			deps.onExitMode = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( 'Escape' );

			keyboard.handleKeydown( event );

			expect( deps.onExitMode ).toHaveBeenCalled();
			expect( deps.onClose ).not.toHaveBeenCalled();
		} );

		it( 'closes palette when Escape pressed with empty query and no mode', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( null );
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( 'Escape' );

			keyboard.handleKeydown( event );

			expect( deps.onClose ).toHaveBeenCalled();
		} );
	} );

	describe( 'trigger interception', () => {
		it( 'intercepts trigger character and enters mode when no mode active and query empty', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( null );
			const mode = { id: 'user', triggers: [ '@' ] };
			deps.findModeByTrigger = vi.fn( () => mode );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( '@' );

			keyboard.handleKeydown( event );

			expect( event.preventDefault ).toHaveBeenCalled();
			expect( deps.onEnterMode ).toHaveBeenCalledWith( mode );
		} );

		it( 'does not intercept trigger when mode is already active', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( { id: 'ns' } );
			deps.findModeByTrigger = vi.fn( () => ( { id: 'user' } ) );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( '@' );

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).not.toHaveBeenCalled();
		} );

		it( 'does not intercept trigger when query is non-empty', () => {
			deps.query = ref( 'hello' );
			deps.activeMode = ref( null );
			deps.findModeByTrigger = vi.fn( () => ( { id: 'user' } ) );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( '@' );

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).not.toHaveBeenCalled();
		} );

		it( 'does not intercept when findModeByTrigger returns null', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( null );
			deps.findModeByTrigger = vi.fn( () => null );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( 'x' );

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Backspace with mode context', () => {
		function setupBackspace( { tokens, query, modeContext } ) {
			const inputEl = {
				selectionStart: 0,
				selectionEnd: 0,
				value: '',
				focus: vi.fn(),
				closest: vi.fn( () => null )
			};
			deps.inputRef.value.getInputElement = vi.fn( () => inputEl );
			deps.tokens = ref( tokens );
			deps.selectedTokenIndex = ref( -1 );
			deps.onSelectToken = vi.fn();
			deps.onRemoveToken = vi.fn();
			deps.query = ref( query );
			deps.activeMode = ref( modeContext.length > 0 ? { id: 'm' } : null );
			deps.activeModeContext = ref( modeContext );
			deps.onPopModeContext = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			return { inputEl };
		}

		it( 'pops context when input empty and stack non-empty', () => {
			const { inputEl } = setupBackspace( {
				tokens: [],
				query: '',
				modeContext: [ { name: 'A' } ]
			} );
			const event = createKeyEvent( 'Backspace', inputEl );

			keyboard.handleKeydown( event );

			expect( deps.onPopModeContext ).toHaveBeenCalledTimes( 1 );
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( 'no-ops Backspace when stack is empty and no tokens', () => {
			const { inputEl } = setupBackspace( {
				tokens: [],
				query: '',
				modeContext: []
			} );
			const event = createKeyEvent( 'Backspace', inputEl );

			keyboard.handleKeydown( event );

			expect( deps.onPopModeContext ).not.toHaveBeenCalled();
			expect( event.preventDefault ).not.toHaveBeenCalled();
		} );

		it( 'falls through to token logic when context empty but tokens exist', () => {
			const { inputEl } = setupBackspace( {
				tokens: [ { id: 't1', label: 'Talk' } ],
				query: '',
				modeContext: []
			} );
			const event = createKeyEvent( 'Backspace', inputEl );

			keyboard.handleKeydown( event );

			expect( deps.onPopModeContext ).not.toHaveBeenCalled();
			expect( deps.onSelectToken ).toHaveBeenCalledWith( 0 );
		} );
	} );

	describe( 'help overlay', () => {
		function setupHelp( { helpVisible = false, query = '', tokens = [], activeMode = null } = {} ) {
			deps.query = ref( query );
			deps.tokens = ref( tokens );
			deps.activeMode = ref( activeMode );
			deps.helpVisible = ref( helpVisible );
			deps.onToggleHelp = vi.fn();
			deps.onCloseHelp = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
		}

		it( '"?" at empty input toggles help', () => {
			setupHelp( { query: '', tokens: [] } );
			const event = createKeyEvent( '?' );

			keyboard.handleKeydown( event );

			expect( deps.onToggleHelp ).toHaveBeenCalledTimes( 1 );
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( '"?" toggles help even when a mode is active, as long as input is empty', () => {
			setupHelp( { query: '', tokens: [], activeMode: { id: 'category' } } );
			const event = createKeyEvent( '?' );

			keyboard.handleKeydown( event );

			expect( deps.onToggleHelp ).toHaveBeenCalledTimes( 1 );
		} );

		it( '"?" mid-typing does NOT toggle help', () => {
			setupHelp( { query: 'cat', tokens: [] } );
			const event = createKeyEvent( '?' );

			keyboard.handleKeydown( event );

			expect( deps.onToggleHelp ).not.toHaveBeenCalled();
		} );

		it( '"?" with tokens present does NOT toggle help', () => {
			setupHelp( { query: '', tokens: [ { id: 't1', label: 'Talk:' } ] } );
			const event = createKeyEvent( '?' );

			keyboard.handleKeydown( event );

			expect( deps.onToggleHelp ).not.toHaveBeenCalled();
		} );

		it( 'Escape closes help when help is visible (precedence over 3-level ladder)', () => {
			setupHelp( { helpVisible: true, query: 'still has query', activeMode: { id: 'foo' } } );
			const event = createKeyEvent( 'Escape' );

			keyboard.handleKeydown( event );

			expect( deps.onCloseHelp ).toHaveBeenCalledTimes( 1 );
			expect( deps.onClearQuery ).not.toHaveBeenCalled();
			expect( deps.onExitMode ).not.toHaveBeenCalled();
			expect( deps.onClose ).not.toHaveBeenCalled();
		} );

		it( '"?" closes help when help is visible', () => {
			setupHelp( { helpVisible: true } );
			const event = createKeyEvent( '?' );

			keyboard.handleKeydown( event );

			expect( deps.onToggleHelp ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'ArrowDown still navigates while help is visible', () => {
			setupHelp( { helpVisible: true } );
			const event = createKeyEvent( 'ArrowDown' );

			keyboard.handleKeydown( event );

			expect( listNav.highlightNext ).toHaveBeenCalled();
		} );

		it( 'Enter still selects highlighted item while help is visible', () => {
			setupHelp( { helpVisible: true } );
			listNav.highlightedIndex.value = 0;
			const event = createKeyEvent( 'Enter' );

			keyboard.handleKeydown( event );

			expect( deps.onSelect ).toHaveBeenCalledWith( deps.items.value[ 0 ] );
		} );

		it( 'mode-trigger keys are swallowed while help is visible', () => {
			setupHelp( { helpVisible: true } );
			const mode = { id: 'user', triggers: [ '@' ] };
			deps.findModeByTrigger = vi.fn( () => mode );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( '@' );

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).not.toHaveBeenCalled();
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( 'Backspace is swallowed while help is visible (does not pop mode context)', () => {
			setupHelp( { helpVisible: true } );
			deps.activeModeContext = ref( [ { name: 'A' } ] );
			deps.onPopModeContext = vi.fn();
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( 'Backspace' );

			keyboard.handleKeydown( event );

			expect( deps.onPopModeContext ).not.toHaveBeenCalled();
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( 'Backspace is swallowed while help is visible (does not remove or select tokens)', () => {
			setupHelp( { helpVisible: true } );
			deps.tokens = ref( [ { id: 't1', label: 'Talk:' } ] );
			deps.selectedTokenIndex = ref( 0 );
			deps.onRemoveToken = vi.fn();
			deps.onSelectToken = vi.fn();
			deps.inputRef.value.getInputElement = vi.fn( () => ( {
				selectionStart: 0,
				selectionEnd: 0,
				value: '',
				focus: vi.fn(),
				closest: vi.fn( () => null )
			} ) );
			keyboard = useKeyboard( toGrouped( deps ) );
			const event = createKeyEvent( 'Backspace' );

			keyboard.handleKeydown( event );

			expect( deps.onRemoveToken ).not.toHaveBeenCalled();
			expect( deps.onSelectToken ).not.toHaveBeenCalled();
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( 'escHintMsgKey is "close" while help is visible, even with non-empty query', () => {
			setupHelp( { helpVisible: true, query: 'something' } );

			const hints = keyboard.keyboardHints.value;

			expect( hints[ hints.length - 1 ] ).toEqual(
				{ msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc' }
			);
		} );
	} );

	describe( 'mode keybindings contribution', () => {
		it( 'prepends mode bindings before core (mode wins on collision)', () => {
			const modeHandler = vi.fn();
			deps.activeMode.value = {
				id: 'test',
				keybindings: [ {
					id: 'mode-enter-override',
					zone: 'input',
					keys: [ 'Enter' ],
					when: () => true,
					handle: modeHandler
				} ]
			};
			listNav.highlightedIndex.value = 0;

			keyboard = useKeyboard( toGrouped( deps ) );
			keyboard.handleKeydown( createKeyEvent( 'Enter' ) );

			expect( modeHandler ).toHaveBeenCalled();
			expect( deps.onSelect ).not.toHaveBeenCalled();
		} );

		it( 'falls back to core when mode binding when() is false', () => {
			deps.activeMode.value = {
				id: 'test',
				keybindings: [ {
					id: 'mode-enter-noop',
					zone: 'input',
					keys: [ 'Enter' ],
					when: () => false,
					handle: vi.fn()
				} ]
			};
			listNav.highlightedIndex.value = 0;

			keyboard = useKeyboard( toGrouped( deps ) );
			keyboard.handleKeydown( createKeyEvent( 'Enter' ) );

			expect( deps.onSelect ).toHaveBeenCalled();
		} );

		it( 'is a no-op when mode has no keybindings', () => {
			deps.activeMode.value = { id: 'no-bindings' };
			listNav.highlightedIndex.value = 0;

			keyboard = useKeyboard( toGrouped( deps ) );
			keyboard.handleKeydown( createKeyEvent( 'Enter' ) );

			expect( deps.onSelect ).toHaveBeenCalled();
		} );

		it( 'is a no-op when activeMode is null', () => {
			deps.activeMode.value = null;
			listNav.highlightedIndex.value = 0;

			keyboard = useKeyboard( toGrouped( deps ) );
			keyboard.handleKeydown( createKeyEvent( 'Enter' ) );

			expect( deps.onSelect ).toHaveBeenCalled();
		} );

		it( 'merges mode hints into the keyboardHints output', () => {
			deps.activeMode.value = {
				id: 'test',
				keybindings: [ {
					id: 'mode-special',
					zone: 'input',
					keys: [ 'F1' ],
					when: () => true,
					handle: () => {},
					hint: { msgKey: 'citizen-command-palette-keyhint-actions', kbd: 'F1', order: 50 }
				} ]
			};

			keyboard = useKeyboard( toGrouped( deps ) );

			expect( keyboard.keyboardHints.value.some( ( h ) => h.kbd === 'F1' ) ).toBe( true );
		} );
	} );
} );
