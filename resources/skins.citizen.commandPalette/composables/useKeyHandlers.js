/**
 * Key handlers composable for the Command Palette
 * Manages keyboard event handling and dispatching to appropriate handlers
 */

module.exports = function useKeyHandlers( {
	state,
	navigation,
	actionNav,
	selectResult
} ) {
	// Setup keyboard navigation based on key events
	const onKeydown = ( event ) => {
		const keyHandlers = {
			ArrowUp: () => {
				event.preventDefault();
				navigation.highlightPrevious();
			},
			ArrowDown: () => {
				event.preventDefault();
				navigation.highlightNext();
			},
			ArrowRight: () => {
				if ( actionNav.focusActionButton( navigation.hasHighlightedItemWithActions ) ) {
					event.preventDefault();
				}
			},
			Home: () => {
				event.preventDefault();
				navigation.highlightFirst();
			},
			End: () => {
				event.preventDefault();
				navigation.highlightLast();
			},
			Enter: () => {
				event.preventDefault();
				
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
					const selectedItem = items[highlightedIndex];
					selectResult(selectedItem);
				} else {
					// If no valid item is highlighted, call selectResult with null
					// which will perform a search with the current query
					selectResult(null);
				}
			}
		};

		const handler = keyHandlers[ event.key ];
		if ( handler ) {
			handler();
		}
	};

	return {
		onKeydown
	};
};
