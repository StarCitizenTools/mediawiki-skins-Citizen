const { computed, nextTick } = require( 'vue' );

/**
 * Centralized keyboard routing composable for the command palette.
 * Implements a state machine with INPUT and ACTIONS focus zones.
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

	/**
	 * Builds keyboard hints for when an action button is focused.
	 *
	 * @return {Array} Hint objects for the action zone.
	 */
	function getActionZoneHints() {
		const hints = [
			{ msgKey: 'citizen-command-palette-keyhint-enter-select', kbd: '↵' }
		];

		if ( actionNav.focusedIndex.value === 0 ) {
			hints.push( {
				msgKey: 'citizen-command-palette-keyhint-return',
				kbd: '←'
			} );
		}

		const highlightedIndex = listNav.highlightedIndex.value;
		const item = highlightedIndex >= 0 ? deps.items.value[ highlightedIndex ] : null;
		const actionCount = item?.actions?.length || 0;

		let navKeys = '↑↓';
		if ( actionCount > 1 ) {
			navKeys += '←';
			if ( actionNav.focusedIndex.value < actionCount - 1 ) {
				navKeys += '→';
			}
		}
		hints.push( { msgKey: 'citizen-command-palette-keyhint-navigate', kbd: navKeys } );

		return hints;
	}

	/**
	 * Builds keyboard hints for when the input or a list item is focused.
	 *
	 * @return {Array} Hint objects for the input zone.
	 */
	function getInputZoneHints() {
		const enterMsgKey = listNav.highlightedIndex.value >= 0 ?
			'citizen-command-palette-keyhint-enter-select' :
			'citizen-command-palette-keyhint-enter-search';
		const hints = [ { msgKey: enterMsgKey, kbd: '↵' } ];

		if ( deps.items.value.length > 1 ) {
			hints.push( {
				msgKey: 'citizen-command-palette-keyhint-navigate',
				kbd: '↑↓'
			} );
		}

		if ( highlightedItemHasActions.value ) {
			hints.push( {
				msgKey: 'citizen-command-palette-keyhint-actions',
				kbd: '→'
			} );
		}

		// Show the help hint only when "?" would actually open help — empty
		// input, no tokens, help not already visible. Mirrors the gate in
		// handleInputZone so the hint appears exactly when the key fires.
		const helpAlreadyOpen = deps.helpVisible && deps.helpVisible.value;
		const inputEmpty = !deps.query.value &&
			( !deps.tokens || deps.tokens.value.length === 0 );
		if ( !helpAlreadyOpen && inputEmpty && deps.onToggleHelp ) {
			hints.push( {
				msgKey: 'citizen-command-palette-command-help-label',
				kbd: '?'
			} );
		}

		return hints;
	}

	/**
	 * Mirrors the four-level logic in handleEscape(); keep in sync.
	 */
	const escHintMsgKey = computed( () => {
		if ( deps.helpVisible && deps.helpVisible.value ) {
			return 'citizen-command-palette-keyhint-close';
		}
		if ( deps.query.value ) {
			return 'citizen-command-palette-keyhint-clear';
		} else if ( deps.activeMode.value ) {
			return 'citizen-command-palette-keyhint-exit';
		}
		return 'citizen-command-palette-keyhint-close';
	} );

	/**
	 * Data-driven keyboard hints for the footer.
	 * Each entry is { msgKey, kbd }.
	 */
	const keyboardHints = computed( () => {
		const hints = actionNav.isActive.value ?
			getActionZoneHints() : getInputZoneHints();

		hints.push( {
			msgKey: escHintMsgKey.value,
			kbd: 'esc'
		} );

		return hints;
	} );

	/**
	 * Four-level Escape: close help → clear query → exit mode → close palette.
	 * Help takes precedence so users can peek at the overlay and dismiss it
	 * without losing query/mode state.
	 */
	function handleEscape() {
		if ( deps.helpVisible && deps.helpVisible.value && deps.onCloseHelp ) {
			deps.onCloseHelp();
			return;
		}
		if ( deps.query.value ) {
			deps.onClearQuery();
		} else if ( deps.activeMode.value ) {
			deps.onExitMode();
		} else {
			deps.onClose();
		}
	}

	function focusInput() {
		deps.inputRef.value?.focus();
	}

	function requestInputFocus() {
		nextTick( focusInput );
	}

	function getInputElement() {
		const header = deps.inputRef.value;
		if ( header && typeof header.getInputElement === 'function' ) {
			return header.getInputElement();
		}
		return null;
	}

	/**
	 * Handles Backspace on token chips: first press selects last chip,
	 * second press removes the selected chip.
	 *
	 * @param {KeyboardEvent} event The keydown event.
	 * @return {boolean} Whether the event was handled.
	 */
	function handleTokenBackspace( event ) {
		const inputEl = getInputElement();
		const isCursorAtStart = inputEl &&
			inputEl.selectionStart === 0 &&
			inputEl.selectionEnd === 0;
		if ( !isCursorAtStart ) {
			return false;
		}

		const tokensLength = deps.tokens ? deps.tokens.value.length : 0;
		const freeTextEmpty = !deps.query || !deps.query.value;

		if (
			tokensLength === 0 &&
			freeTextEmpty &&
			deps.activeModeContext &&
			deps.activeModeContext.value.length > 0 &&
			deps.onPopModeContext
		) {
			event.preventDefault();
			deps.onPopModeContext();
			return true;
		}

		if ( !deps.tokens || !deps.onSelectToken || !deps.onRemoveToken ) {
			return false;
		}
		if ( tokensLength === 0 ) {
			return false;
		}
		event.preventDefault();
		if ( deps.selectedTokenIndex.value >= 0 ) {
			deps.onRemoveToken( deps.selectedTokenIndex.value );
		} else {
			deps.onSelectToken( tokensLength - 1 );
		}
		return true;
	}

	/**
	 * Navigates the highlighted item list in a given direction and scrolls.
	 *
	 * @param {'next'|'previous'|'first'|'last'} direction Navigation direction.
	 */
	function navigateList( direction ) {
		const methods = {
			next: 'highlightNext',
			previous: 'highlightPrevious',
			first: 'highlightFirst',
			last: 'highlightLast'
		};
		listNav[ methods[ direction ] ]();
		nextTick( () => {
			listNav.scrollToHighlighted( deps.itemRefs );
		} );
	}

	/**
	 * Handles keyboard events when focus is in the input zone.
	 *
	 * @param {KeyboardEvent} event The keydown event.
	 */
	function handleInputZone( event ) {
		// While help is visible, only navigation, selection, and dismissal are
		// allowed. Other keys are swallowed so they don't enter modes, alter
		// the query, or pop the mode-context stack underneath the overlay.
		const helpIsVisible = deps.helpVisible && deps.helpVisible.value;
		if ( helpIsVisible ) {
			switch ( event.key ) {
				case 'ArrowDown':
					event.preventDefault();
					navigateList( 'next' );
					return;
				case 'ArrowUp':
					event.preventDefault();
					navigateList( 'previous' );
					return;
				case 'Home':
					event.preventDefault();
					navigateList( 'first' );
					return;
				case 'End':
					event.preventDefault();
					navigateList( 'last' );
					return;
				case 'Enter':
					event.preventDefault();
					if ( listNav.highlightedIndex.value >= 0 ) {
						deps.onSelect( deps.items.value[ listNav.highlightedIndex.value ] );
					}
					return;
				case 'Escape':
					event.preventDefault();
					handleEscape();
					return;
				case '?':
					if ( deps.onToggleHelp ) {
						event.preventDefault();
						deps.onToggleHelp();
						return;
					}
					break;
				default:
					// Swallow all other keys while help is open.
					if ( event.key.length === 1 || event.key === 'Backspace' ) {
						event.preventDefault();
					}
					return;
			}
		}

		// Typing with a chip selected: deselect the chip, let the character go to input
		if (
			deps.selectedTokenIndex &&
			deps.onSelectToken &&
			deps.selectedTokenIndex.value >= 0 &&
			event.key.length === 1
		) {
			deps.onSelectToken( -1 );
		}

		// "?" toggles the help overlay when there is no in-progress input. Runs
		// regardless of activeMode so users can peek at help mid-mode.
		if (
			event.key === '?' &&
			!deps.query.value &&
			( !deps.tokens || deps.tokens.value.length === 0 ) &&
			deps.onToggleHelp
		) {
			event.preventDefault();
			deps.onToggleHelp();
			return;
		}

		if (
			!deps.activeMode.value &&
			!deps.query.value &&
			event.key.length === 1 &&
			deps.findModeByTrigger
		) {
			const mode = deps.findModeByTrigger( event.key );
			if ( mode ) {
				event.preventDefault();
				deps.onEnterMode( mode );
				return;
			}
		}

		switch ( event.key ) {
			case 'ArrowDown':
				event.preventDefault();
				navigateList( 'next' );
				break;

			case 'ArrowUp':
				event.preventDefault();
				navigateList( 'previous' );
				break;

			case 'Home':
				event.preventDefault();
				navigateList( 'first' );
				break;

			case 'End':
				event.preventDefault();
				navigateList( 'last' );
				break;

			case 'Enter':
				event.preventDefault();
				if ( listNav.highlightedIndex.value >= 0 ) {
					deps.onSelect( deps.items.value[ listNav.highlightedIndex.value ] );
				}
				break;

			case 'Tab':
				deps.onClose();
				event.preventDefault();
				break;

			case 'Escape':
				event.preventDefault();
				handleEscape();
				break;

			case 'Backspace':
				handleTokenBackspace( event );
				break;

			case 'ArrowRight': {
				const inputEl = getInputElement();
				if ( inputEl && event.target === inputEl ) {
					const atEnd = inputEl.selectionStart === inputEl.value.length &&
						inputEl.selectionEnd === inputEl.value.length;
					if ( atEnd && highlightedItemHasActions.value ) {
						event.preventDefault();
						actionNav.focusFirst();
					}
				}
				break;
			}
		}
	}

	/**
	 * Handles keyboard events when focus is in the action zone.
	 *
	 * @param {KeyboardEvent} event The keydown event.
	 */
	function handleActionZone( event ) {
		switch ( event.key ) {
			case 'ArrowLeft':
				event.preventDefault();
				actionNav.focusPrevious();
				break;

			case 'ArrowRight':
				event.preventDefault();
				actionNav.focusNext();
				break;

			case 'ArrowUp':
			case 'ArrowDown':
				event.preventDefault();
				actionNav.deactivate();
				if ( event.key === 'ArrowUp' ) {
					listNav.highlightPrevious();
				} else {
					listNav.highlightNext();
				}
				requestInputFocus();
				break;

			case 'Enter':
			case ' ':
				event.preventDefault();
				actionNav.clickFocused();
				break;

			case 'Escape':
				event.preventDefault();
				actionNav.deactivate();
				handleEscape();
				focusInput();
				break;

			default:
				// Typing keys redirect to input
				if ( event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete' ) {
					actionNav.deactivate();
					focusInput();
				}
				break;
		}
	}

	/**
	 * Main keydown handler — attach to the palette root element.
	 *
	 * @param {KeyboardEvent} event The keydown event.
	 */
	function handleKeydown( event ) {
		// Ignore events with modifier keys (allow Shift for printable characters like @, >, :)
		if ( event.altKey || event.ctrlKey || event.metaKey ) {
			return;
		}
		if ( event.shiftKey && event.key.length !== 1 ) {
			return;
		}

		// Determine which zone the event is from
		const isActionFocused = event.target?.closest( '.citizen-command-palette-list-item__action' );

		if ( isActionFocused ) {
			handleActionZone( event );
		} else {
			handleInputZone( event );
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
