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

		return hints;
	}

	/**
	 * Data-driven keyboard hints for the footer.
	 * Each entry is { msgKey, kbd }.
	 */
	const keyboardHints = computed( () => {
		const hints = actionNav.isActive.value ?
			getActionZoneHints() : getInputZoneHints();

		hints.push( {
			msgKey: 'citizen-command-palette-keyhint-exit',
			kbd: 'esc'
		} );

		return hints;
	} );

	/**
	 * Three-level Escape: clear query → exit mode → close palette.
	 */
	function handleEscape() {
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
	 * Handles keyboard events when focus is in the input zone.
	 *
	 * @param {KeyboardEvent} event The keydown event.
	 */
	function handleInputZone( event ) {
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
				listNav.highlightNext();
				nextTick( () => {
					listNav.scrollToHighlighted( deps.itemRefs );
				} );
				break;

			case 'ArrowUp':
				event.preventDefault();
				listNav.highlightPrevious();
				nextTick( () => {
					listNav.scrollToHighlighted( deps.itemRefs );
				} );
				break;

			case 'Home':
				event.preventDefault();
				listNav.highlightFirst();
				nextTick( () => {
					listNav.scrollToHighlighted( deps.itemRefs );
				} );
				break;

			case 'End':
				event.preventDefault();
				listNav.highlightLast();
				nextTick( () => {
					listNav.scrollToHighlighted( deps.itemRefs );
				} );
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
