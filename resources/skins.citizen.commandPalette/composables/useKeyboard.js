const { computed, nextTick } = require( 'vue' );
const { resolveBinding, resolveHints } = require( './useKeyboardBindings.js' );

// Mac vs everywhere-else copy shortcut, computed once. Mac users
// recognise ⌘C; Windows/Linux users recognise Ctrl+C.
const IS_MAC = typeof navigator !== 'undefined' &&
	/Mac|iPhone|iPad/i.test( navigator.platform || '' );
const COPY_KBD = IS_MAC ? '⌘C' : 'Ctrl+C';

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

	// --- INPUT ZONE: copy header shortcut (hint-only) ---
	// The actual handler lives at the top of handleKeydown, before the
	// modifier-key early-return. This binding only contributes the
	// footer hint, shown when the highlighted item declares a copyValue.
	{
		id: 'input-copy-header-hint',
		zone: 'input',
		keys: [],
		when: ( state ) => state.highlightedItemHasCopyValue,
		handle: () => {},
		hint: { msgKey: 'citizen-command-palette-detail-copy-action', kbd: COPY_KBD, order: 35 }
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
 * Options are grouped into named buckets so the dependency surface is
 * self-documenting at the call site (see `App.vue`):
 *  - `core`       — DOM handles + palette-wide callbacks the dispatcher
 *                   always needs (input ref, item map, items, query,
 *                   onSelect, onClose, onClearQuery, requestHeaderCopy).
 *  - `navigation` — list/grid/action composables and the layout flag.
 *  - `mode`       — active-mode refs, mode-context stack, mode-trigger
 *                   callbacks, and the cross-mode lookup.
 *  - `tokens`     — token state + selection callbacks for chip handling.
 *  - `help`       — help overlay visibility flag and toggle/close callbacks.
 *
 * Optionality contract:
 *  - `tokens` and `help` are entire-bucket-optional — callers without
 *    chip or help-overlay subsystems can omit them.
 *  - `mode.activeModeContext` is field-level optional within the required
 *    `mode` bucket — modes that don't drill in (no `pushModeContext`)
 *    can leave it out. Every other field in `core`, `navigation`, and
 *    `mode` is required.
 *
 * @param {Object} options
 * @param {Object} options.core Required. inputRef, itemRefs, items,
 *   query, requestHeaderCopy, onSelect, onClose, onClearQuery.
 * @param {Object} options.navigation Required. listNav, gridNav,
 *   isGalleryLayout, actionNav.
 * @param {Object} options.mode Required. activeMode, findModeByTrigger,
 *   onEnterMode, onExitMode, onPopModeContext, plus optional
 *   activeModeContext.
 * @param {Object} [options.tokens] tokens, selectedTokenIndex,
 *   onSelectToken, onRemoveToken.
 * @param {Object} [options.help] helpVisible, onToggleHelp, onCloseHelp.
 * @return {Object} Keyboard handler and focus management methods.
 */
function useKeyboard( options ) {
	const core = options.core;
	const navigation = options.navigation;
	const mode = options.mode;
	const tokens = options.tokens || {};
	const help = options.help || {};

	const listNav = navigation.listNav;
	const actionNav = navigation.actionNav;
	// Gallery support: `gridNav` and `isGalleryLayout` are always present in
	// the navigation bucket, but `isGalleryLayout.value` is only true while
	// the active mode declares layout='gallery'. `navigateList` branches on
	// the live value to pick the right composable per dispatch.
	const gridNav = navigation.gridNav;
	const isGalleryLayout = navigation.isGalleryLayout;

	/**
	 * Effective binding list: mode-contributed bindings (if any) prepended
	 * onto `coreBindings`. Prepending means the mode wins on key collisions
	 * within its own zone. `coreBindings` itself stays immutable.
	 */
	const activeBindings = computed( () => {
		const activeMode = mode.activeMode.value;
		const modeBindings = activeMode && Array.isArray( activeMode.keybindings ) ?
			activeMode.keybindings :
			[];
		return modeBindings.concat( coreBindings );
	} );

	/**
	 * The ID of the currently highlighted item, for aria-activedescendant.
	 */
	const activeDescendantId = computed( () => {
		const index = listNav.highlightedIndex.value;
		if ( index >= 0 && core.items.value[ index ] ) {
			return String( core.items.value[ index ].id );
		}
		return null;
	} );

	/**
	 * Whether the highlighted item has action buttons.
	 */
	const highlightedItemHasActions = computed( () => {
		const index = listNav.highlightedIndex.value;
		if ( index < 0 || index >= core.items.value.length ) {
			return false;
		}
		const item = core.items.value[ index ];
		return Boolean( item && item.actions && item.actions.length > 0 );
	} );

	function focusInput() {
		if ( core.inputRef.value ) {
			core.inputRef.value.focus();
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
				targetNav.scrollToHighlighted( core.itemRefs );
			}
		} );
	}

	function getInputElement() {
		const header = core.inputRef.value;
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
		const items = core.items.value;
		const highlightedItem = highlightedIndex >= 0 && highlightedIndex < items.length ?
			items[ highlightedIndex ] :
			null;

		return {
			query: core.query.value,
			tokens: tokens.tokens ? tokens.tokens.value : [],
			selectedTokenIndex: tokens.selectedTokenIndex ? tokens.selectedTokenIndex.value : -1,
			inputElement: getInputElement(),
			modeContext: mode.activeModeContext ? mode.activeModeContext.value : [],
			activeMode: mode.activeMode.value,
			isGalleryLayout: !!( isGalleryLayout && isGalleryLayout.value ),
			highlightedIndex: highlightedIndex,
			items: items,
			highlightedItem: highlightedItem,
			highlightedItemHasActions: Boolean(
				highlightedItem && highlightedItem.actions && highlightedItem.actions.length > 0
			),
			highlightedItemHasCopyValue: Boolean(
				highlightedItem &&
				highlightedItem.detail &&
				highlightedItem.detail.header &&
				highlightedItem.detail.header.copyValue
			),
			helpVisible: help.helpVisible ? help.helpVisible.value : false,
			actionsFocused: actionNav.isActive.value,
			onClose: core.onClose,
			onClearQuery: core.onClearQuery,
			onExitMode: mode.onExitMode,
			onEnterMode: mode.onEnterMode,
			onSelect: core.onSelect,
			onToggleHelp: help.onToggleHelp,
			onCloseHelp: help.onCloseHelp,
			onSelectToken: tokens.onSelectToken,
			onRemoveToken: tokens.onRemoveToken,
			onPopModeContext: mode.onPopModeContext,
			findModeByTrigger: mode.findModeByTrigger,
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

	/**
	 * Whether a non-empty user selection exists anywhere in the palette.
	 * Used by the copy shortcut to back off when the user actually wants
	 * to copy a selection rather than the highlighted item's copyValue.
	 *
	 * @return {boolean}
	 */
	function hasTextSelection() {
		const sel = typeof window !== 'undefined' && window.getSelection ?
			window.getSelection() :
			null;
		return Boolean( sel && sel.toString().length > 0 );
	}

	function handleKeydown( event ) {
		// Cmd/Ctrl+C: when nothing is selected and the highlighted item
		// declares `detail.header.copyValue`, hijack the shortcut to copy
		// that value. With a selection present, the browser's native copy
		// wins so users keep their normal text-copy behaviour.
		if (
			( event.metaKey || event.ctrlKey ) &&
			!event.altKey &&
			!event.shiftKey &&
			( event.key === 'c' || event.key === 'C' ) &&
			!hasTextSelection() &&
			core.requestHeaderCopy
		) {
			const items = core.items.value;
			const idx = listNav.highlightedIndex.value;
			const item = idx >= 0 && idx < items.length ? items[ idx ] : null;
			const copyValue = item && item.detail && item.detail.header &&
				item.detail.header.copyValue;
			if ( copyValue ) {
				event.preventDefault();
				core.requestHeaderCopy();
				return;
			}
		}

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
			tokens.selectedTokenIndex &&
			tokens.onSelectToken &&
			state.selectedTokenIndex >= 0 &&
			event.key.length === 1
		) {
			tokens.onSelectToken( -1 );
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
			mode.findModeByTrigger
		) {
			const matched = mode.findModeByTrigger( event.key );
			if ( matched ) {
				event.preventDefault();
				mode.onEnterMode( matched );
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
