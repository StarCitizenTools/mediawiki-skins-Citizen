const { ref } = require( 'vue' );

/**
 * Composable for managing list navigation index state.
 *
 * @param {import('vue').Ref<Array>} itemsRef Reactive reference to the list of items.
 * @return {Object} Navigation API with index state and control functions.
 */
function useListNavigation( itemsRef ) {
	const highlightedIndex = ref( -1 );

	function highlightNext() {
		if ( !itemsRef.value || itemsRef.value.length === 0 ) {
			return;
		}
		highlightedIndex.value = ( highlightedIndex.value + 1 ) % itemsRef.value.length;
	}

	function highlightPrevious() {
		if ( !itemsRef.value || itemsRef.value.length === 0 ) {
			return;
		}
		highlightedIndex.value = ( highlightedIndex.value - 1 + itemsRef.value.length ) % itemsRef.value.length;
	}

	function highlightFirst() {
		highlightedIndex.value = ( itemsRef.value && itemsRef.value.length > 0 ) ? 0 : -1;
	}

	function highlightLast() {
		highlightedIndex.value = ( itemsRef.value && itemsRef.value.length > 0 ) ?
			itemsRef.value.length - 1 : -1;
	}

	function resetHighlight() {
		highlightedIndex.value = -1;
	}

	/**
	 * Scrolls the currently highlighted item into view.
	 *
	 * @param {import('vue').Ref<Map<number, HTMLElement|null>>} itemRefs Reactive reference to the Map of DOM elements.
	 */
	function scrollToHighlighted( itemRefs ) {
		const itemElement = itemRefs.value?.get( highlightedIndex.value );
		itemElement?.$el?.scrollIntoView( { block: 'nearest' } );
	}

	return {
		highlightedIndex,
		highlightNext,
		highlightPrevious,
		highlightFirst,
		highlightLast,
		resetHighlight,
		scrollToHighlighted
	};
}

module.exports = useListNavigation;
