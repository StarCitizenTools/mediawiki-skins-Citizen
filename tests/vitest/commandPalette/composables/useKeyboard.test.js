// @vitest-environment jsdom

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const { ref } = require( 'vue' );
const useKeyboard = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useKeyboard.js'
);

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
			shiftKey: false
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
			query: ref( '' ),
			activeMode: ref( null ),
			onClearQuery: vi.fn(),
			onExitMode: vi.fn(),
			onEnterMode: vi.fn(),
			findModeByTrigger: vi.fn( () => null )
		};

		keyboard = useKeyboard( deps );
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
			keyboard = useKeyboard( deps );

			var event = createKeyEvent( '@' );
			event.shiftKey = true;

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).toHaveBeenCalledWith( mode );
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
		it( 'should return Enter/Search and Exit when no items and nothing highlighted', () => {
			deps.items.value = [];
			listNav.highlightedIndex.value = -1;

			const hints = keyboard.keyboardHints.value;

			expect( hints ).toEqual( [
				{ msgKey: 'citizen-command-palette-keyhint-enter-search', kbd: '↵' },
				{ msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc' }
			] );
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

	describe( 'action zone — Escape', () => {
		it( 'should deactivate action navigation on Escape from action zone', () => {
			actionNav.isActive.value = true;
			var actionButton = document.createElement( 'button' );
			actionButton.classList.add( 'citizen-command-palette-list-item__action' );

			keyboard.handleKeydown( createKeyEvent( 'Escape', actionButton ) );

			expect( actionNav.deactivate ).toHaveBeenCalled();
		} );
	} );

	describe( 'three-level Escape', () => {
		it( 'clears query when Escape pressed with non-empty query', () => {
			deps.query = ref( 'test' );
			deps.activeMode = ref( null );
			deps.onClearQuery = vi.fn();
			keyboard = useKeyboard( deps );
			const event = createKeyEvent( 'Escape' );

			keyboard.handleKeydown( event );

			expect( deps.onClearQuery ).toHaveBeenCalled();
			expect( deps.onClose ).not.toHaveBeenCalled();
		} );

		it( 'exits mode when Escape pressed with empty query and active mode', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( { id: 'ns' } );
			deps.onExitMode = vi.fn();
			keyboard = useKeyboard( deps );
			const event = createKeyEvent( 'Escape' );

			keyboard.handleKeydown( event );

			expect( deps.onExitMode ).toHaveBeenCalled();
			expect( deps.onClose ).not.toHaveBeenCalled();
		} );

		it( 'closes palette when Escape pressed with empty query and no mode', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( null );
			keyboard = useKeyboard( deps );
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
			keyboard = useKeyboard( deps );
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
			keyboard = useKeyboard( deps );
			const event = createKeyEvent( '@' );

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).not.toHaveBeenCalled();
		} );

		it( 'does not intercept trigger when query is non-empty', () => {
			deps.query = ref( 'hello' );
			deps.activeMode = ref( null );
			deps.findModeByTrigger = vi.fn( () => ( { id: 'user' } ) );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( deps );
			const event = createKeyEvent( '@' );

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).not.toHaveBeenCalled();
		} );

		it( 'does not intercept when findModeByTrigger returns null', () => {
			deps.query = ref( '' );
			deps.activeMode = ref( null );
			deps.findModeByTrigger = vi.fn( () => null );
			deps.onEnterMode = vi.fn();
			keyboard = useKeyboard( deps );
			const event = createKeyEvent( 'x' );

			keyboard.handleKeydown( event );

			expect( deps.onEnterMode ).not.toHaveBeenCalled();
		} );
	} );
} );
