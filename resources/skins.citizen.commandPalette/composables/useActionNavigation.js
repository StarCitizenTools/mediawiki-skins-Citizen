const { ref, nextTick } = require( 'vue' );

/**
 * Composable for handling keyboard navigation and focus within action buttons of a list item.
 *
 * @param {import('vue').Ref<Array<{id: string}>>} actionsRef Reactive reference to the list of actions for the item.
 * @param {import('vue').Ref<Record<string, HTMLElement|null>>} buttonRefs Reactive reference to the object mapping action IDs to DOM elements.
 * @param {Function} emit The component's emit function.
 * @return {Object} { handleActionButtonKeydown, onButtonFocus, focusFirstButton }
 */
function useActionNavigation( actionsRef, buttonRefs, emit ) {
	const activeButtonId = ref( null );

	/**
	 * Focuses the first available action button based on the current order in actionsRef.
	 */
	function focusFirstButton() {
		if ( actionsRef.value && actionsRef.value.length > 0 ) {
			const firstActionId = actionsRef.value[ 0 ].id;
			if ( firstActionId ) {
				nextTick( () => {
					const firstButton = buttonRefs.value[ firstActionId ];
					if ( firstButton?.$el ) { // For Codex CdxButton
						firstButton.$el.focus();
					} else if ( typeof firstButton?.focus === 'function' ) { // Fallback for standard elements
						firstButton.focus();
					}
				} );
			}
		}
	}

	/**
	 * Handles keydown events specifically when focus is within the action buttons.
	 *
	 * @param {KeyboardEvent} event The keydown event.
	 * @return {boolean} True if the event was handled, false otherwise.
	 */
	function handleActionButtonKeydown( event ) {
		const currentActionId = activeButtonId.value;
		if ( !currentActionId ) {
			// Should not be called if no action button is focused, but check defensively.
			return false;
		}

		let handled = false;
		const actions = actionsRef.value;
		const buttons = buttonRefs.value;
		const currentButtonIndex = actions.findIndex( ( action ) => action.id === currentActionId );

		if ( currentButtonIndex === -1 ) {
			// Action ID not found in current actions, should not happen
			return false;
		}

		switch ( event.key ) {
			case 'ArrowLeft':
				if ( currentButtonIndex === 0 ) {
					// Signal to parent component (ListItem) to focus the input
					emit( 'focus-input' );
				} else {
					const prevActionId = actions[ currentButtonIndex - 1 ].id;
					const prevButton = buttons[ prevActionId ];
					if ( prevButton?.$el ) {
						prevButton.$el.focus();
					} else if ( typeof prevButton?.focus === 'function' ) {
						prevButton.focus();
					}
				}
				handled = true;
				break;
			case 'ArrowRight':
				if ( currentButtonIndex < actions.length - 1 ) {
					const nextActionId = actions[ currentButtonIndex + 1 ].id;
					const nextButton = buttons[ nextActionId ];
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
					const currentButton = buttons[ currentActionId ];
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
	 * Updates the ID of the currently focused action button.
	 * Should be called from the button's focus handler.
	 *
	 * @param {string} actionId The ID of the action button that received focus.
	 */
	function onButtonFocus( actionId ) {
		activeButtonId.value = actionId;
	}

	return {
		handleActionButtonKeydown,
		onButtonFocus,
		focusFirstButton
	};
}

module.exports = useActionNavigation;
