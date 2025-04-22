const { ref, nextTick } = require( 'vue' );

/**
 * Composable for handling keyboard navigation and focus within action buttons of a list item.
 *
 * @param {import('vue').Ref<Array>} actionsRef Reactive reference to the list of actions for the item.
 * @param {import('vue').Ref<Array<HTMLElement|null>>} buttonRefs Reactive reference to the array of DOM elements for the action buttons.
 * @param {Function} emit The component's emit function.
 * @return {object} { handleActionButtonKeydown, onButtonFocus, focusFirstButton }
 */
function useActionNavigation( actionsRef, buttonRefs, emit ) {
	const activeButtonIndex = ref( -1 );

	/**
	 * Focuses the first available action button.
	 */
	function focusFirstButton() {
		if ( actionsRef.value && actionsRef.value.length > 0 && buttonRefs.value.length > 0 ) {
			nextTick( () => {
				const firstButton = buttonRefs.value[ 0 ];
				if ( firstButton?.$el ) { // For Codex CdxButton
					firstButton.$el.focus();
				} else if ( typeof firstButton?.focus === 'function' ) { // Fallback for standard elements
					firstButton.focus();
				}
			} );
		}
	}

	/**
	 * Handles keydown events specifically when focus is within the action buttons.
	 *
	 * @param {KeyboardEvent} event The keydown event.
	 * @return {boolean} True if the event was handled, false otherwise.
	 */
	function handleActionButtonKeydown( event ) {
		const hasActions = actionsRef.value && actionsRef.value.length > 0;
		if ( !hasActions || activeButtonIndex.value === -1 ) {
			// Should not be called if no actions or none are focused, but check defensively.
			return false;
		}

		let handled = false;
		const currentButtonIndex = activeButtonIndex.value;
		const buttons = buttonRefs.value;

		switch ( event.key ) {
			case 'ArrowLeft':
				if ( currentButtonIndex === 0 ) {
					// Signal to parent component (ListItem) to focus the input
					emit( 'focus-input' );
				} else {
					const prevButton = buttons[ currentButtonIndex - 1 ];
					if ( prevButton?.$el ) {
						prevButton.$el.focus();
					} else if ( typeof prevButton?.focus === 'function' ) {
						prevButton.focus();
					}
				}
				handled = true;
				break;
			case 'ArrowRight':
				if ( currentButtonIndex < buttons.length - 1 ) {
					const nextButton = buttons[ currentButtonIndex + 1 ];
					if ( nextButton?.$el ) {
						nextButton.$el.focus();
					} else if ( typeof nextButton?.focus === 'function' ) {
						nextButton.focus();
					}
				} // else: do nothing, stay on last button
				handled = true;
				break;
			case 'ArrowUp':
			case 'ArrowDown':
				// Signal to parent component (ListItem) to navigate the main list
				emit( 'navigate-list', event ); // Pass the original event
				handled = true;
				break;
			case 'Enter':
			case ' ': // Space key
				{
					// Trigger click on the currently focused button
					const currentButton = buttons[ currentButtonIndex ];
					if ( currentButton?.$el ) {
						currentButton.$el.click();
					} else if ( typeof currentButton?.click === 'function' ) {
						currentButton.click();
					}
					handled = true;
				}
				break;
		}

		if ( handled ) {
			event.preventDefault();
			event.stopPropagation();
			return true;
		}
		return false;
	}

	/**
	 * Updates the index of the currently focused action button.
	 * Should be called from the button's focus handler.
	 *
	 * @param {number} index The index of the button that received focus.
	 */
	function onButtonFocus( index ) {
		activeButtonIndex.value = index;
	}

	return {
		handleActionButtonKeydown,
		onButtonFocus,
		focusFirstButton
	};
}

module.exports = useActionNavigation;
