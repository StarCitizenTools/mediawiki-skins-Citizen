const { ref, watch, nextTick } = require( 'vue' );

/**
 * Composable for handling keyboard navigation (highlighting, scrolling) within a list.
 *
 * @param {import('vue').Ref<Array>} itemsRef Reactive reference to the list of items.
 * @param {import('vue').Ref<Map<number, HTMLElement|null>>} itemRefs Reactive reference to the Map of DOM elements for the items.
 * @return {Object} { highlightedItemIndex, handleNavigationKeydown }
 */
function usePaletteNavigation( itemsRef, itemRefs ) {
	const highlightedItemIndex = ref( -1 );

	function scrollToHighlightedItem() {
		const itemElement = itemRefs.value?.get( highlightedItemIndex.value );
		itemElement?.$el?.scrollIntoView( { block: 'nearest' } );
	}

	function highlightNext() {
		if ( !itemsRef.value || itemsRef.value.length === 0 ) {
			return;
		}
		highlightedItemIndex.value = ( highlightedItemIndex.value + 1 ) % itemsRef.value.length;
	}

	function highlightPrevious() {
		if ( !itemsRef.value || itemsRef.value.length === 0 ) {
			return;
		}
		highlightedItemIndex.value = ( highlightedItemIndex.value - 1 + itemsRef.value.length ) % itemsRef.value.length;
	}

	function highlightFirst() {
		highlightedItemIndex.value = ( itemsRef.value && itemsRef.value.length > 0 ) ? 0 : -1;
	}

	function highlightLast() {
		if ( itemsRef.value && itemsRef.value.length > 0 ) {
			highlightedItemIndex.value = itemsRef.value.length - 1;
		} else {
			highlightedItemIndex.value = -1;
		}
	}

	/**
	 * Handles specific keyboard events for list navigation.
	 * Should be called from the component's keydown handler.
	 *
	 * @param {KeyboardEvent} event The keydown event.
	 * @return {boolean} True if the event was handled, false otherwise.
	 */
	function handleNavigationKeydown( event ) {
		const keyActions = {
			ArrowUp: highlightPrevious,
			ArrowDown: highlightNext,
			Home: highlightFirst,
			End: highlightLast
		};

		if ( keyActions[ event.key ] ) {
			event.preventDefault();
			keyActions[ event.key ]();
			// Scroll after the index is updated
			nextTick( scrollToHighlightedItem );
			return true; // Indicate that the event was handled
		}
		return false; // Indicate that the event was not handled by this function
	}

	// Watch for external changes to the items list and reset highlighting
	watch( itemsRef, () => {
		highlightedItemIndex.value = -1;
	} );

	// Watch for index changes and scroll
	watch( highlightedItemIndex, ( newIndex, oldIndex ) => {
		if ( newIndex !== oldIndex && newIndex >= 0 ) {
			// We don't call scrollToHighlightedItem directly here
			// because handleNavigationKeydown already calls it via nextTick.
			// This watch is more for cases where the index might be set externally,
			// though currently it's primarily managed internally.
			// If external setting becomes common, reconsider scrolling logic placement.
		}
	} );

	return {
		highlightedItemIndex: highlightedItemIndex, // The reactive index
		handleNavigationKeydown: handleNavigationKeydown // The function to call on keydown
	};
}

module.exports = usePaletteNavigation;
