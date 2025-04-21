/**
 * Item navigation composable for the Command Palette
 * Handles navigation between items in the command palette list
 */

module.exports = function useItemNavigation( { state } ) {
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
		} else {
			state.highlightedItemIndex.value = -1;
		}
	};

	// Check if there's a valid highlighted item with actions
	const hasHighlightedItemWithActions = () => {
		if ( state.currentItems.value.length === 0 || state.highlightedItemIndex.value < 0 ) {
			return false;
		}

		const highlightedItem = state.currentItems.value[ state.highlightedItemIndex.value ];
		return Boolean( highlightedItem?.actions?.length > 0 );
	};

	return {
		highlightNext,
		highlightPrevious,
		highlightFirst,
		highlightLast,
		hasHighlightedItemWithActions
	};
};
