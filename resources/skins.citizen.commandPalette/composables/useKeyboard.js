const { computed, nextTick } = require( 'vue' );
const { resolveBinding, resolveHints } = require( './useKeyboardBindings.js' );

/**
 * Core keybinding registry for the command palette.
 *
 * Each binding is data: { id, zone, keys, when, worksDuringHelp, handle, hint }.
 * Both the dispatcher and the footer hints derive from this list, so a hint is
 * visible iff its handler will fire — by construction.
 *
 * Some entries are "hint-only" (empty `keys` array): they only contribute a
 * footer label. The matching handlers live in sibling entries with `hint: null`.
 * This pattern lets a single hint represent a group of keys (e.g. `↑↓` for
 * ArrowUp/ArrowDown/Home/End).
 */
const coreBindings = [
	// --- ACTION ZONE ---
	{
		id: 'action-select',
		zone: 'action',
		keys: [ 'Enter', ' ' ],
		when: () => true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.actionNav.clickFocused();
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-enter-select', kbd: '↵', order: 10 }
	},
	{
		id: 'action-prev',
		zone: 'action',
		keys: [ 'ArrowLeft' ],
		when: () => true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.actionNav.focusPrevious();
		},
		hint: null
	},
	{
		id: 'action-next',
		zone: 'action',
		keys: [ 'ArrowRight' ],
		when: () => true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.actionNav.focusNext();
		},
		hint: null
	},
	{
		id: 'action-back-to-list',
		zone: 'action',
		keys: [ 'ArrowUp', 'ArrowDown' ],
		when: () => true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.actionNav.deactivate();
			// Route through navigateList so the layout-aware dispatch
			// picks the right composable: list wraps on overflow, grid
			// clamps and steps by column count. Direct calls to
			// listNav.* would silently use list semantics in gallery
			// modes that someday declare per-item actions.
			state.navigateList( event.key === 'ArrowUp' ? 'up' : 'down' );
			state.requestInputFocus();
		},
		hint: null
	},
	{
		id: 'action-escape',
		zone: 'action',
		keys: [ 'Escape' ],
		when: () => true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.actionNav.deactivate();
			state.dispatchEscape( state, event );
			state.focusInput();
		},
		hint: null
	},
	// Action-zone navigate hint variants. Mutually exclusive `when` clauses
	// produce one of: `↑↓`, `↑↓←`, or `↑↓←→` depending on action count and
	// focused index.
	{
		id: 'action-navigate-single',
		zone: 'action',
		keys: [],
		when: ( state ) => actionCount( state ) <= 1,
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-keyhint-navigate', kbd: '↑↓', order: 30 }
	},
	{
		id: 'action-navigate-multi-last',
		zone: 'action',
		keys: [],
		when: ( state ) => {
			const count = actionCount( state );
			return count > 1 && state.actionNav.focusedIndex.value >= count - 1;
		},
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-keyhint-navigate', kbd: '↑↓←', order: 30 }
	},
	{
		id: 'action-navigate-multi-mid',
		zone: 'action',
		keys: [],
		when: ( state ) => {
			const count = actionCount( state );
			return count > 1 && state.actionNav.focusedIndex.value < count - 1;
		},
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-keyhint-navigate', kbd: '↑↓←→', order: 30 }
	},
	{
		id: 'action-return',
		zone: 'action',
		keys: [],
		when: ( state ) => state.actionNav.focusedIndex.value === 0,
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-keyhint-return', kbd: '←', order: 20 }
	},
	{
		id: 'action-escape-hint',
		zone: 'action',
		keys: [],
		when: () => true,
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc', order: 999 }
	},

	// --- INPUT ZONE: navigation handlers ---
	{
		id: 'input-arrow-down',
		zone: 'input',
		keys: [ 'ArrowDown' ],
		when: () => true,
		worksDuringHelp: true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.navigateList( 'down' );
		},
		hint: null
	},
	{
		id: 'input-arrow-up',
		zone: 'input',
		keys: [ 'ArrowUp' ],
		when: () => true,
		worksDuringHelp: true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.navigateList( 'up' );
		},
		hint: null
	},
	// Gallery layouts: ←/→ navigate between tiles in the same row. List
	// layouts route ←/→ to action-zone navigation (see below) so we only
	// fire here when the active mode declares layout='gallery'.
	{
		id: 'input-arrow-left-gallery',
		zone: 'input',
		keys: [ 'ArrowLeft' ],
		when: ( state ) => state.isGalleryLayout,
		worksDuringHelp: true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.navigateList( 'previous' );
		},
		hint: null
	},
	{
		id: 'input-arrow-right-gallery',
		zone: 'input',
		keys: [ 'ArrowRight' ],
		when: ( state ) => state.isGalleryLayout,
		worksDuringHelp: true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.navigateList( 'next' );
		},
		hint: null
	},
	{
		id: 'input-home',
		zone: 'input',
		keys: [ 'Home' ],
		when: () => true,
		worksDuringHelp: true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.navigateList( 'first' );
		},
		hint: null
	},
	{
		id: 'input-end',
		zone: 'input',
		keys: [ 'End' ],
		when: () => true,
		worksDuringHelp: true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.navigateList( 'last' );
		},
		hint: null
	},
	{
		id: 'input-navigate-hint',
		zone: 'input',
		keys: [],
		when: ( state ) => state.items.length > 1 && !state.isGalleryLayout,
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-keyhint-navigate', kbd: '↑↓', order: 20 }
	},
	{
		id: 'input-navigate-hint-gallery',
		zone: 'input',
		keys: [],
		when: ( state ) => state.items.length > 1 && state.isGalleryLayout,
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-keyhint-navigate', kbd: '↑↓←→', order: 20 }
	},

	// --- INPUT ZONE: Enter ---
	{
		id: 'input-enter-select',
		zone: 'input',
		keys: [ 'Enter' ],
		when: ( state ) => state.highlightedIndex >= 0,
		worksDuringHelp: true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.onSelect( state.items[ state.highlightedIndex ] );
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-enter-select', kbd: '↵', order: 10 }
	},
	{
		id: 'input-enter-search',
		zone: 'input',
		keys: [ 'Enter' ],
		when: ( state ) => state.highlightedIndex < 0,
		handle: ( state, event ) => {
			// Today's behavior: Enter with no highlight prevents default but
			// fires no callback; the "Search" hint is shown for affordance.
			event.preventDefault();
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-enter-search', kbd: '↵', order: 10 }
	},

	// --- INPUT ZONE: ArrowRight to actions ---
	// Handler requires the cursor at the end of the input. The hint is
	// intentionally less strict so it shows whenever the highlighted item has
	// actions (matches today's behavior).
	{
		id: 'input-arrow-right-to-actions',
		zone: 'input',
		keys: [ 'ArrowRight' ],
		when: ( state ) => {
			if ( !state.highlightedItemHasActions ) {
				return false;
			}
			const el = state.inputElement;
			if ( !el ) {
				return false;
			}
			return el.selectionStart === el.value.length &&
				el.selectionEnd === el.value.length;
		},
		handle: ( state, event ) => {
			event.preventDefault();
			state.actionNav.focusFirst();
		},
		hint: null
	},
	{
		id: 'input-arrow-right-hint',
		zone: 'input',
		keys: [],
		when: ( state ) => state.highlightedItemHasActions,
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-keyhint-actions', kbd: '→', order: 30 }
	},

	// --- INPUT ZONE: help toggle ---
	// Split into a handler (worksDuringHelp: true, so the same key closes help)
	// and a hint-only sibling that lacks worksDuringHelp — isActive() then
	// filters the hint out while the overlay is open, hiding `?` from the
	// footer without needing a redundant !helpVisible clause in `when`.
	{
		id: 'input-toggle-help',
		zone: 'input',
		keys: [ '?' ],
		when: ( state ) => Boolean( state.onToggleHelp ) &&
			!state.query &&
			state.tokens.length === 0,
		worksDuringHelp: true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.onToggleHelp();
		},
		hint: null
	},
	{
		id: 'input-toggle-help-hint',
		zone: 'input',
		keys: [],
		when: ( state ) => Boolean( state.onToggleHelp ) &&
			!state.query &&
			state.tokens.length === 0,
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-command-help-label', kbd: '?', order: 40 }
	},

	// --- INPUT ZONE: Tab closes the palette ---
	{
		id: 'input-tab-close',
		zone: 'input',
		keys: [ 'Tab' ],
		when: () => true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.onClose();
		},
		hint: null
	},

	// --- INPUT ZONE: Escape (4 disjoint cases) ---
	{
		id: 'input-escape-close-help',
		zone: 'input',
		keys: [ 'Escape' ],
		when: ( state ) => state.helpVisible && Boolean( state.onCloseHelp ),
		worksDuringHelp: true,
		handle: ( state, event ) => {
			event.preventDefault();
			state.onCloseHelp();
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc', order: 999 }
	},
	{
		id: 'input-escape-clear-query',
		zone: 'input',
		keys: [ 'Escape' ],
		when: ( state ) => !state.helpVisible && Boolean( state.query ),
		handle: ( state, event ) => {
			event.preventDefault();
			state.onClearQuery();
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-clear', kbd: 'esc', order: 999 }
	},
	{
		id: 'input-escape-exit-mode',
		zone: 'input',
		keys: [ 'Escape' ],
		when: ( state ) => !state.helpVisible && !state.query && Boolean( state.activeMode ),
		handle: ( state, event ) => {
			event.preventDefault();
			state.onExitMode();
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-exit', kbd: 'esc', order: 999 }
	},
	{
		id: 'input-escape-close-palette',
		zone: 'input',
		keys: [ 'Escape' ],
		when: ( state ) => !state.helpVisible && !state.query && !state.activeMode,
		handle: ( state, event ) => {
			event.preventDefault();
			state.onClose();
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-close', kbd: 'esc', order: 999 }
	},

	// --- INPUT ZONE: Backspace (3 disjoint cases) ---
	{
		id: 'input-pop-mode-context',
		zone: 'input',
		keys: [ 'Backspace' ],
		when: ( state ) => {
			if ( !cursorAtStart( state ) ) {
				return false;
			}
			return state.tokens.length === 0 &&
				!state.query &&
				state.modeContext.length > 0 &&
				Boolean( state.onPopModeContext );
		},
		handle: ( state, event ) => {
			event.preventDefault();
			state.onPopModeContext();
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-back', kbd: '⌫', order: 200 }
	},
	{
		id: 'input-remove-selected-token',
		zone: 'input',
		keys: [ 'Backspace' ],
		when: ( state ) => {
			if ( !cursorAtStart( state ) ) {
				return false;
			}
			return state.tokens.length > 0 &&
				state.selectedTokenIndex >= 0 &&
				Boolean( state.onRemoveToken );
		},
		handle: ( state, event ) => {
			event.preventDefault();
			state.onRemoveToken( state.selectedTokenIndex );
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-edit-token', kbd: '⌫', order: 200 }
	},
	{
		id: 'input-select-last-token',
		zone: 'input',
		keys: [ 'Backspace' ],
		when: ( state ) => {
			if ( !cursorAtStart( state ) ) {
				return false;
			}
			return state.tokens.length > 0 && Boolean( state.onSelectToken );
		},
		handle: ( state, event ) => {
			event.preventDefault();
			state.onSelectToken( state.tokens.length - 1 );
		},
		hint: { msgKey: 'citizen-command-palette-keyhint-select-token', kbd: '⌫', order: 200 }
	}
];

/**
 * @param {Object} state
 * @return {boolean}
 */
function cursorAtStart( state ) {
	const el = state.inputElement;
	return Boolean( el && el.selectionStart === 0 && el.selectionEnd === 0 );
}

/**
 * @param {Object} state
 * @return {number}
 */
function actionCount( state ) {
	const item = state.highlightedItem;
	return item && item.actions ? item.actions.length : 0;
}

/**
 * Centralized keyboard routing composable for the command palette.
 *
 * Internally this wires reactive Vue refs into a plain state snapshot the
 * pure resolver consumes. Both keydown dispatch and the footer hints derive
 * from `activeBindings`, which prepends any `keybindings` array exported by
 * the active mode onto `coreBindings` so mode bindings win on collisions.
 *
 * @param {Object} deps Dependencies.
 * @param {import('vue').Ref} deps.inputRef Ref to the header component (exposes focus(), getInputElement()).
 * @param {import('vue').Ref<Map>} deps.itemRefs Map of index to item component refs.
 * @param {import('vue').Ref<Array>} deps.items The displayed items list.
 * @param {Object} deps.listNav List navigation composable return value.
 * @param {Object} deps.actionNav Action navigation composable return value.
 * @param {Function} deps.onSelect Called when an item is selected (Enter key).
 * @param {Function} deps.onClose Called when the palette should close (Escape key).
 * @param {import('vue').Ref<string>} deps.query Current query string.
 * @param {import('vue').Ref<Object|null>} deps.activeMode Current active mode or null.
 * @param {Function} deps.onClearQuery Called to clear the query.
 * @param {Function} deps.onExitMode Called to exit the current mode.
 * @param {Function} deps.onEnterMode Called to enter a mode.
 * @param {Function} deps.findModeByTrigger Given a character, returns a PaletteMode or null.
 * @param {import('vue').Ref<Array>} [deps.tokens] Token array ref for chip backspace handling.
 * @param {import('vue').Ref<number>} [deps.selectedTokenIndex] Selected token index ref (-1 = none).
 * @param {Function} [deps.onSelectToken] Called with index to select a token chip.
 * @param {Function} [deps.onRemoveToken] Called with index to remove a selected token chip.
 * @param {import('vue').Ref<Array>} [deps.activeModeContext] Active mode's drill-down stack ref.
 * @param {Function} [deps.onPopModeContext] Called to pop the last entry from the active mode's context stack.
 * @param {import('vue').Ref<boolean>} [deps.helpVisible] Whether the help overlay is currently open.
 * @param {Function} [deps.onToggleHelp] Called to toggle the help overlay.
 * @param {Function} [deps.onCloseHelp] Called to close the help overlay.
 * @return {Object} Keyboard handler and focus management methods.
 */
function useKeyboard( deps ) {
	const listNav = deps.listNav;
	const actionNav = deps.actionNav;
	// Optional: gallery support. When provided, navigateList branches on
	// `isGalleryLayout` to use the grid composable's column-aware methods.
	// Modes that don't declare layout='gallery' fall through to listNav.
	const gridNav = deps.gridNav;
	const isGalleryLayout = deps.isGalleryLayout;

	/**
	 * Effective binding list: mode-contributed bindings (if any) prepended
	 * onto `coreBindings`. Prepending means the mode wins on key collisions
	 * within its own zone. `coreBindings` itself stays immutable.
	 */
	const activeBindings = computed( () => {
		const mode = deps.activeMode.value;
		const modeBindings = mode && Array.isArray( mode.keybindings ) ? mode.keybindings : [];
		return modeBindings.concat( coreBindings );
	} );

	/**
	 * The ID of the currently highlighted item, for aria-activedescendant.
	 */
	const activeDescendantId = computed( () => {
		const index = listNav.highlightedIndex.value;
		if ( index >= 0 && deps.items.value[ index ] ) {
			return String( deps.items.value[ index ].id );
		}
		return null;
	} );

	/**
	 * Whether the highlighted item has action buttons.
	 */
	const highlightedItemHasActions = computed( () => {
		const index = listNav.highlightedIndex.value;
		if ( index < 0 || index >= deps.items.value.length ) {
			return false;
		}
		const item = deps.items.value[ index ];
		return Boolean( item && item.actions && item.actions.length > 0 );
	} );

	function focusInput() {
		if ( deps.inputRef.value ) {
			deps.inputRef.value.focus();
		}
	}

	function requestInputFocus() {
		nextTick( focusInput );
	}

	function navigateList( direction ) {
		const isGallery = !!( gridNav && isGalleryLayout && isGalleryLayout.value );
		const targetNav = isGallery ? gridNav : listNav;
		const methods = isGallery ? {
			next: 'highlightNext',
			previous: 'highlightPrevious',
			down: 'highlightDown',
			up: 'highlightUp',
			first: 'highlightFirst',
			last: 'highlightLast'
		} : {
			next: 'highlightNext',
			previous: 'highlightPrevious',
			down: 'highlightNext',
			up: 'highlightPrevious',
			first: 'highlightFirst',
			last: 'highlightLast'
		};
		const method = methods[ direction ];
		if ( method && typeof targetNav[ method ] === 'function' ) {
			targetNav[ method ]();
		}
		nextTick( () => {
			if ( typeof targetNav.scrollToHighlighted === 'function' ) {
				targetNav.scrollToHighlighted( deps.itemRefs );
			}
		} );
	}

	function getInputElement() {
		const header = deps.inputRef.value;
		if ( header && typeof header.getInputElement === 'function' ) {
			return header.getInputElement();
		}
		return null;
	}

	/**
	 * Re-runs the input-zone Escape ladder from inside the action-zone Escape
	 * binding. The action-zone handler deactivates first, then needs to fall
	 * through to the same close-help/clear/exit/close logic the input zone uses.
	 *
	 * Lives inside the composable so it resolves against `activeBindings` —
	 * mode-contributed bindings participate in the fallback too.
	 *
	 * @param {Object} state
	 * @param {KeyboardEvent} event
	 */
	function dispatchEscape( state, event ) {
		// Strip dispatchEscape from the cloned state so a mode-contributed
		// Escape binding cannot recurse into us. A bad mode binding will
		// throw a TypeError instead of looping silently — easier to diagnose.
		const inputState = Object.assign( {}, state, {
			actionsFocused: false,
			dispatchEscape: null
		} );
		const binding = resolveBinding( inputState, { key: 'Escape' }, activeBindings.value );
		if ( binding ) {
			binding.handle( inputState, event );
		}
	}

	/**
	 * Build a plain state snapshot for the resolver. Captures all refs at
	 * dispatch time and exposes navigation helpers.
	 *
	 * @return {Object}
	 */
	function buildState() {
		const highlightedIndex = listNav.highlightedIndex.value;
		const items = deps.items.value;
		const highlightedItem = highlightedIndex >= 0 && highlightedIndex < items.length ?
			items[ highlightedIndex ] :
			null;

		return {
			query: deps.query.value,
			tokens: deps.tokens ? deps.tokens.value : [],
			selectedTokenIndex: deps.selectedTokenIndex ? deps.selectedTokenIndex.value : -1,
			inputElement: getInputElement(),
			modeContext: deps.activeModeContext ? deps.activeModeContext.value : [],
			activeMode: deps.activeMode.value,
			isGalleryLayout: !!( isGalleryLayout && isGalleryLayout.value ),
			highlightedIndex: highlightedIndex,
			items: items,
			highlightedItem: highlightedItem,
			highlightedItemHasActions: Boolean(
				highlightedItem && highlightedItem.actions && highlightedItem.actions.length > 0
			),
			helpVisible: deps.helpVisible ? deps.helpVisible.value : false,
			actionsFocused: actionNav.isActive.value,
			onClose: deps.onClose,
			onClearQuery: deps.onClearQuery,
			onExitMode: deps.onExitMode,
			onEnterMode: deps.onEnterMode,
			onSelect: deps.onSelect,
			onToggleHelp: deps.onToggleHelp,
			onCloseHelp: deps.onCloseHelp,
			onSelectToken: deps.onSelectToken,
			onRemoveToken: deps.onRemoveToken,
			onPopModeContext: deps.onPopModeContext,
			findModeByTrigger: deps.findModeByTrigger,
			listNav: listNav,
			actionNav: actionNav,
			focusInput: focusInput,
			requestInputFocus: requestInputFocus,
			navigateList: navigateList,
			dispatchEscape: dispatchEscape
		};
	}

	const keyboardHints = computed( () => {
		const state = buildState();
		const zone = state.actionsFocused ? 'action' : 'input';
		return resolveHints( state, zone, activeBindings.value ).map( ( hint ) => ( {
			msgKey: hint.msgKey,
			kbd: hint.kbd
		} ) );
	} );

	function handleKeydown( event ) {
		// Ignore events with modifier keys (Shift is allowed for printable chars
		// like @, >, :, ?).
		if ( event.altKey || event.ctrlKey || event.metaKey ) {
			return;
		}
		if ( event.shiftKey && event.key.length !== 1 ) {
			return;
		}

		const state = buildState();
		// The actual focus zone is determined by the event target (an action
		// button), not just actionNav.isActive — the activation may lag in
		// some test setups.
		const isActionFocused = Boolean(
			event.target &&
			typeof event.target.closest === 'function' &&
			event.target.closest( '.citizen-command-palette-list-item__action' )
		);
		state.actionsFocused = isActionFocused;

		// Typing with a chip selected: deselect the chip first, then let the
		// character flow through to the dispatcher so it lands in the input.
		if (
			!state.actionsFocused &&
			!state.helpVisible &&
			deps.selectedTokenIndex &&
			deps.onSelectToken &&
			state.selectedTokenIndex >= 0 &&
			event.key.length === 1
		) {
			deps.onSelectToken( -1 );
			state.selectedTokenIndex = -1;
		}

		const binding = resolveBinding( state, event, activeBindings.value );
		if ( binding ) {
			binding.handle( state, event );
			return;
		}

		// Help-mode swallow: while the overlay is up, eat printable keys and
		// Backspace so they neither modify input nor trigger modes/tokens.
		if ( state.helpVisible && ( event.key.length === 1 || event.key === 'Backspace' ) ) {
			event.preventDefault();
			return;
		}

		// Action-zone fallback: typing redirects to the input field.
		if (
			state.actionsFocused &&
			(
				event.key.length === 1 ||
				event.key === 'Backspace' ||
				event.key === 'Delete'
			)
		) {
			actionNav.deactivate();
			focusInput();
			return;
		}

		// Mode-trigger fallback (Note C): a printable single-char with no active
		// mode and empty query routes through findModeByTrigger. The set of
		// trigger characters is open-ended, so it can't be enumerated as bindings.
		// The `!state.helpVisible` guard makes help-mode protection explicit at
		// this fallback rather than relying on the help-swallow fallback above
		// firing first.
		if (
			!state.actionsFocused &&
			!state.helpVisible &&
			!state.activeMode &&
			!state.query &&
			event.key.length === 1 &&
			deps.findModeByTrigger
		) {
			const mode = deps.findModeByTrigger( event.key );
			if ( mode ) {
				event.preventDefault();
				deps.onEnterMode( mode );
			}
		}
	}

	return {
		handleKeydown,
		focusInput,
		requestInputFocus,
		activeDescendantId,
		highlightedItemHasActions,
		keyboardHints
	};
}

module.exports = useKeyboard;
