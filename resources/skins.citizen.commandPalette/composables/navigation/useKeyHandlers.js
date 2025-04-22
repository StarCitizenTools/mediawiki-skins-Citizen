/**
 * Key handlers composable for the Command Palette
 * Manages keyboard event handling and dispatching to appropriate handlers
 */

module.exports = function useKeyHandlers( {
	state,
	navigation,
	selectResult,
	itemNavigation,
	inputUtils,
	onClose
} ) {

	// Function to close the command palette
	const closeCommandPalette = () => {
		if ( typeof onClose === 'function' ) {
			onClose();
		}
	};

	// Setup keyboard navigation based on key events
	const onKeydown = ( event ) => {
		// Check if an action button is focused
		const isActionButtonFocused = state.isActionButtonFocused.value;

		// Declare variables at the top to avoid lexical declaration in case blocks
		let highlightedIndex;
		let items;
		let handled;

		// Handle arrow keys
		switch ( event.key ) {
			case 'ArrowUp':
			case 'ArrowDown':
				// Use the item navigation for vertical movement
				if ( itemNavigation ) {
					handled = itemNavigation.handleKeydown( event );
					if ( handled ) {
						return;
					}
				}
				break;

			case 'ArrowRight':
				// If not in nested navigation mode, try to enter it
				if ( !isActionButtonFocused ) {
					// Only try to navigate to action buttons if cursor is at the end of the input
					if ( navigation.hasHighlightedItemWithActions() && inputUtils.isCursorAtInputEnd() ) {
						handled = itemNavigation.navigateRight();
						if ( handled ) {
							event.preventDefault();
							return;
						}
					}
				} else {
					// Already in nested navigation, continue moving right if possible
					handled = itemNavigation.navigateRight();
					if ( handled ) {
						event.preventDefault();
						return;
					}
				}
				break;

			case 'ArrowLeft':
				// If in nested navigation mode, try to exit or move left
				if ( isActionButtonFocused ) {
					handled = itemNavigation.navigateLeft();
					if ( handled ) {
						event.preventDefault();
						return;
					}
				}
				break;

			case 'Enter':
				event.preventDefault();

				// If an action button is focused, let it handle the event naturally
				if ( isActionButtonFocused ) {
					// Close the command palette after action button is clicked
					setTimeout( closeCommandPalette, 0 );
					return;
				}

				// Check if we have a valid item at the highlighted index
				highlightedIndex = state.highlightedItemIndex.value;
				items = state.currentItems.value;

				// Only proceed if we have items and a valid index
				if (
					items &&
					items.length > 0 &&
					highlightedIndex >= 0 &&
					highlightedIndex < items.length
				) {
					const selectedItem = items[ highlightedIndex ];
					selectResult( selectedItem );
					// Close the command palette after item is selected
					setTimeout( closeCommandPalette, 0 );
				} else {
					// If no valid item is highlighted, call selectResult with null
					// which will perform a search with the current query
					selectResult( null );
					// Close the command palette after search is performed
					setTimeout( closeCommandPalette, 0 );
				}
				break;

			case 'Escape':
				// Close the command palette when Escape is pressed
				closeCommandPalette();
				break;

			case 'Home':
			case 'End':
				// Use the item navigation for these keys
				if ( itemNavigation ) {
					handled = itemNavigation.handleKeydown( event );
					if ( handled ) {
						return;
					}
				}
				break;
		}
	};

	return {
		onKeydown
	};
};
