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

	// Handler for vertical navigation (up/down)
	const handleVerticalNavigation = ( event ) => {
		if ( itemNavigation ) {
			return itemNavigation.handleKeydown( event );
		}
		return false;
	};

	// Handler for horizontal navigation (left/right)
	const handleHorizontalNavigation = ( event ) => {
		const isActionButtonFocused = state.isActionButtonFocused.value;

		if ( event.key === 'ArrowRight' ) {
			if ( !isActionButtonFocused ) {
				// Only navigate to action buttons if cursor is at the end of the input
				if ( navigation.hasHighlightedItemWithActions() && inputUtils.isCursorAtInputEnd() ) {
					if ( itemNavigation.navigateRight() ) {
						event.preventDefault();
						return true;
					}
				}
			} else {
				// Already in nested navigation, continue moving right if possible
				if ( itemNavigation.navigateRight() ) {
					event.preventDefault();
					return true;
				}
			}
		} else if ( event.key === 'ArrowLeft' && isActionButtonFocused ) {
			if ( itemNavigation.navigateLeft() ) {
				event.preventDefault();
				return true;
			}
		}
		return false;
	};

	// Handler for Enter key
	const handleEnterKey = ( event ) => {
		event.preventDefault();

		// If an action button is focused, let it handle the event naturally
		if ( state.isActionButtonFocused.value ) {
			setTimeout( closeCommandPalette, 0 );
			return true;
		}

		// Check if we have a valid item at the highlighted index
		const highlightedIndex = state.highlightedItemIndex.value;
		const items = state.currentItems.value;

		// Only proceed if we have items and a valid index
		if (
			items &&
			items.length > 0 &&
			highlightedIndex >= 0 &&
			highlightedIndex < items.length
		) {
			selectResult( items[ highlightedIndex ] );
		} else {
			// If no valid item is highlighted, perform a search with the current query
			selectResult( null );
		}

		// Close the command palette after selection/search
		setTimeout( closeCommandPalette, 0 );
		return true;
	};

	// Setup keyboard navigation based on key events
	const onKeydown = ( event ) => {
		// Handle different key events
		switch ( event.key ) {
			case 'ArrowUp':
			case 'ArrowDown':
			case 'Home':
			case 'End':
				if ( handleVerticalNavigation( event ) ) {
					return;
				}
				break;

			case 'ArrowRight':
			case 'ArrowLeft':
				if ( handleHorizontalNavigation( event ) ) {
					return;
				}
				break;

			case 'Enter':
				handleEnterKey( event );
				break;

			case 'Escape':
				closeCommandPalette();
				break;
		}
	};

	return {
		onKeydown
	};
};
