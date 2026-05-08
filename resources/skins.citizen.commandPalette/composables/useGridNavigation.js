const { ref } = require( 'vue' );

/**
 * Composable for managing 2D grid navigation index state.
 *
 * Mirrors useListNavigation's shape but adds column-count awareness so
 * vertical arrow keys jump by the current column count rather than by
 * one. With columnCount = 1, behaves like a 1D list.
 *
 * Differs from useListNavigation in two ways:
 *  - All directions clamp at edges (no wrap-around). Wrapping across rows
 *    in a grid is disorienting.
 *  - From the initial -1 (nothing selected) state, any direction lands at
 *    index 0, regardless of which arrow key was pressed.
 *
 * Optionally accepts an external highlightedIndex ref via options so the
 * grid composable can share state with a sibling list composable. When
 * shared, swapping between layouts preserves the user's selection.
 *
 * @param {import('vue').Ref<Array>} itemsRef Reactive list of items.
 * @param {import('vue').Ref<number>} columnCountRef Reactive column count.
 * @param {Object} [options]
 * @param {import('vue').Ref<number>} [options.highlightedIndex] External index ref.
 * @return {Object} Navigation API.
 */
function useGridNavigation( itemsRef, columnCountRef, options ) {
	const highlightedIndex = ( options && options.highlightedIndex ) || ref( -1 );

	function step( delta ) {
		const length = itemsRef.value ? itemsRef.value.length : 0;
		if ( length === 0 ) {
			highlightedIndex.value = -1;
			return;
		}
		if ( highlightedIndex.value < 0 ) {
			highlightedIndex.value = 0;
			return;
		}
		const next = highlightedIndex.value + delta;
		highlightedIndex.value = Math.max( 0, Math.min( length - 1, next ) );
	}

	function columns() {
		const c = columnCountRef.value;
		return c && c > 0 ? c : 1;
	}

	function highlightNext() {
		step( 1 );
	}

	function highlightPrevious() {
		step( -1 );
	}

	function highlightDown() {
		step( columns() );
	}

	function highlightUp() {
		step( -columns() );
	}

	function highlightFirst() {
		const length = itemsRef.value ? itemsRef.value.length : 0;
		highlightedIndex.value = length > 0 ? 0 : -1;
	}

	function highlightLast() {
		const length = itemsRef.value ? itemsRef.value.length : 0;
		highlightedIndex.value = length > 0 ? length - 1 : -1;
	}

	function resetHighlight() {
		highlightedIndex.value = -1;
	}

	function scrollToHighlighted( itemRefs ) {
		const itemElement = itemRefs.value && itemRefs.value.get( highlightedIndex.value );
		if ( itemElement && itemElement.$el ) {
			itemElement.$el.scrollIntoView( { block: 'nearest' } );
		}
	}

	return {
		highlightedIndex: highlightedIndex,
		highlightNext: highlightNext,
		highlightPrevious: highlightPrevious,
		highlightDown: highlightDown,
		highlightUp: highlightUp,
		highlightFirst: highlightFirst,
		highlightLast: highlightLast,
		resetHighlight: resetHighlight,
		scrollToHighlighted: scrollToHighlighted
	};
}

module.exports = useGridNavigation;
