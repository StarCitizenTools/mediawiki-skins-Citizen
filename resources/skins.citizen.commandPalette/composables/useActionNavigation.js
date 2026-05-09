const { ref, computed } = require( 'vue' );

/**
 * Composable for managing focus across the action buttons of the
 * currently highlighted result row. Exposes the same surface the
 * keyboard composable expects (`isActive`, `focusedIndex`, plus the
 * five focus/click helpers) and delegates to the row component's
 * `focusFirstButton`, `focusButtonAtIndex`, and `clickButtonAtIndex`
 * methods.
 *
 * @param {Object} options
 * @param {import('vue').Ref<Array<{actions?: Array}>>} options.items Reactive list of result items.
 * @param {import('vue').Ref<number>} options.highlightedIndex Index of the highlighted row.
 * @param {import('vue').Ref<Map<number, Object>>} options.itemRefs Map of row index → row component instance.
 * @return {Object} Action-navigation API.
 */
function useActionNavigation( { items, highlightedIndex, itemRefs } ) {
	const focusedIndex = ref( -1 );
	const isActive = computed( () => focusedIndex.value >= 0 );

	function getHighlightedComponent() {
		return itemRefs.value.get( highlightedIndex.value );
	}

	function focusFirst() {
		const item = getHighlightedComponent();
		if ( item && item.focusFirstButton ) {
			item.focusFirstButton();
			focusedIndex.value = 0;
		}
	}

	function focusNext() {
		const idx = highlightedIndex.value;
		const list = items.value;
		const actions = ( idx >= 0 && list[ idx ] ) ?
			list[ idx ].actions || [] : [];
		if ( focusedIndex.value < actions.length - 1 ) {
			focusedIndex.value++;
			const item = getHighlightedComponent();
			if ( item && item.focusButtonAtIndex ) {
				item.focusButtonAtIndex( focusedIndex.value );
			}
		}
	}

	function focusPrevious() {
		if ( focusedIndex.value <= 0 ) {
			focusedIndex.value = -1;
		} else {
			focusedIndex.value--;
			const item = getHighlightedComponent();
			if ( item && item.focusButtonAtIndex ) {
				item.focusButtonAtIndex( focusedIndex.value );
			}
		}
	}

	function deactivate() {
		focusedIndex.value = -1;
	}

	function clickFocused() {
		const item = getHighlightedComponent();
		if ( item && item.clickButtonAtIndex ) {
			item.clickButtonAtIndex( focusedIndex.value );
		}
	}

	return {
		isActive,
		focusedIndex,
		focusFirst,
		focusNext,
		focusPrevious,
		deactivate,
		clickFocused
	};
}

module.exports = useActionNavigation;
