/**
 * Keyboard navigation composable for the Command Palette
 * Extracts keyboard navigation logic from App.vue
 */

module.exports = function useKeyboardNavigation( { state, refs, selectResult } ) {
	// Navigate to next item
	const highlightNext = () => {
		if ( !state.currentItems.value.length ) {
			return;
		}
		state.highlightedItemIndex.value = ( state.highlightedItemIndex.value + 1 ) % state.currentItems.value.length;
	};

	// Navigate to previous item
	const highlightPrevious = () => {
		if ( !state.currentItems.value.length ) {
			return;
		}
		state.highlightedItemIndex.value = ( state.highlightedItemIndex.value - 1 + state.currentItems.value.length ) % state.currentItems.value.length;
	};

	// Navigate to first item
	const highlightFirst = () => {
		if ( state.currentItems.value.length > 0 ) {
			state.highlightedItemIndex.value = 0;
		} else {
			state.highlightedItemIndex.value = -1;
		}
	};

	// Navigate to last item
	const highlightLast = () => {
		if ( state.currentItems.value.length > 0 ) {
			state.highlightedItemIndex.value = state.currentItems.value.length - 1;
		}
	};

	// Check if input cursor is at the end of text
	const isCursorAtInputEnd = () => {
		const inputEl = refs.searchHeader.value?.$el.querySelector( 'input' );
		return inputEl?.selectionStart === inputEl?.value.length;
	};

	// Check if there's a valid highlighted item with actions
	const hasHighlightedItemWithActions = () => {
		if ( state.currentItems.value.length === 0 || state.highlightedItemIndex.value < 0 ) {
			return false;
		}

		const highlightedItem = state.currentItems.value[ state.highlightedItemIndex.value ];
		return Boolean(
			highlightedItem &&
			highlightedItem.actions &&
			highlightedItem.actions.length > 0
		);
	};

	// Find and get the first action button of the highlighted item
	const getFirstActionButton = () => refs.resultsContainer.value.querySelector(
		'.citizen-command-palette-list-item--highlighted .citizen-command-palette-list-item__action'
	);

	// Focus the action button of the highlighted item
	const focusActionButton = () => {
		// Check preconditions
		if ( !isCursorAtInputEnd() || !hasHighlightedItemWithActions() ) {
			return false;
		}

		// Find the button
		const actionButton = getFirstActionButton();
		if ( !actionButton ) {
			return false;
		}

		// Move focus from input to the action button
		const inputEl = refs.searchHeader.value?.$el.querySelector( 'input' );
		if ( inputEl ) {
			inputEl.blur();
		}
		actionButton.focus();
		state.isActionButtonFocused.value = true;
		return true;
	};

	// Setup keyboard navigation based on key events
	const onKeydown = ( event ) => {
		const keyHandlers = {
			ArrowUp: () => {
				event.preventDefault();
				highlightPrevious();
			},
			ArrowDown: () => {
				event.preventDefault();
				highlightNext();
			},
			ArrowRight: () => {
				if ( focusActionButton() ) {
					event.preventDefault();
				}
			},
			Home: () => {
				event.preventDefault();
				highlightFirst();
			},
			End: () => {
				event.preventDefault();
				highlightLast();
			},
			Enter: () => {
				event.preventDefault();
				selectResult( state.currentItems.value[ state.highlightedItemIndex.value ] );
			}
		};

		const handler = keyHandlers[ event.key ];
		if ( handler ) {
			handler();
		}
	};

	// Setup event listeners for action button key navigation
	const setupActionButtonKeyNavigation = () => {
		// Use event delegation on the results container
		refs.resultsContainer.value?.addEventListener( 'keydown', ( event ) => {
			// Check if the event target is an action button
			if ( event.target.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
				if ( event.key === 'ArrowLeft' ) {
					const prevButton = event.target.previousElementSibling;
					if ( prevButton && prevButton.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
						// Focus previous action button if it exists
						prevButton.focus();
					} else {
						// If no previous action button, return focus to the highlighted item and search input
						event.target.blur();
						refs.searchHeader.value?.$el.querySelector( 'input' )?.focus();
						state.isActionButtonFocused.value = false;
					}
					event.preventDefault();
				} else if ( event.key === 'ArrowRight' ) {
					const nextButton = event.target.nextElementSibling;
					if ( nextButton && nextButton.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
						// Focus next action button if it exists
						nextButton.focus();
						event.preventDefault();
					}
				}
			}
		} );

		// Track focus state for keyboard hints
		refs.resultsContainer.value?.addEventListener( 'focusin', ( event ) => {
			if ( event.target.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
				state.isActionButtonFocused.value = true;
			}
		} );

		refs.resultsContainer.value?.addEventListener( 'focusout', ( event ) => {
			if ( event.target.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
				// Only set to false if we're not focusing another action button
				if ( !event.relatedTarget || !event.relatedTarget.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
					state.isActionButtonFocused.value = false;
				}
			}
		} );
	};

	// Scroll handling for highlighted items
	const maybeScrollIntoView = () => {
		if ( !refs.resultsContainer.value ) {
			return;
		}

		const isResultsScrollable =
			refs.resultsContainer.value.scrollHeight > refs.resultsContainer.value.clientHeight;

		if ( !isResultsScrollable ) {
			return;
		}

		const highlightedElement = refs.resultsContainer.value.querySelector( '.citizen-command-palette-list-item--highlighted' );
		highlightedElement?.scrollIntoView( {
			block: 'nearest',
			behavior: 'smooth'
		} );
	};

	return {
		// Navigation methods
		highlightNext,
		highlightPrevious,
		highlightFirst,
		highlightLast,

		// Focus handling
		focusActionButton,

		// Action logic
		hasHighlightedItemWithActions,

		// Event handlers
		onKeydown,
		setupActionButtonKeyNavigation,

		// Scroll handling
		maybeScrollIntoView
	};
};
