const { ref, nextTick } = require( 'vue' );
const { useSearchStore } = require( '../stores/searchStore.js' );

/**
 * Composable for handling keyboard navigation and focus within action buttons of a list item.
 *
 * @param {import('vue').Ref<Array<{id: string}>>} actionsRef Reactive reference to the list of actions for the item.
 * @param {import('vue').Ref<Record<string, HTMLElement|null>>} buttonRefs Reactive reference to the object mapping action IDs to DOM elements.
 * @param {Function} emit The component's emit function.
 * @return {Object} { handleActionButtonKeydown, onButtonFocus, focusFirstButton }
 */
function useActionNavigation( actionsRef, buttonRefs, emit ) {
	const searchStore = useSearchStore();
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
			return false;
		}

		let handled = false;
		const actions = actionsRef.value;
		const buttons = buttonRefs.value;
		const currentButtonIndex = actions.findIndex( ( action ) => action.id === currentActionId );

		if ( currentButtonIndex === -1 ) {
			return false;
		}

		switch ( event.key ) {
			case 'ArrowLeft':
				if ( currentButtonIndex === 0 ) {
					// On the first button, blur actions and let parent focus input
					emit( 'blur-actions' );
					searchStore.triggerFocusSearchInput();
				} else {
					// Move focus to the previous button
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
					// Move focus to the next button
					const nextButton = buttons[ actions[ currentButtonIndex + 1 ].id ];
					if ( nextButton?.$el ) {
						nextButton.$el.focus();
					} else if ( typeof nextButton?.focus === 'function' ) {
						nextButton.focus();
					}
					handled = true;
					// If on the last button, ArrowRight is not handled here, allowing potential browser behavior or parent handling
				}
				break;
			case 'ArrowUp':
			case 'ArrowDown':
				// Blur actions, signal parent list navigation, and focus input
				emit( 'blur-actions' );
				emit( 'navigate-list', event );
				searchStore.triggerFocusSearchInput();
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
			case 'Escape':
				// Blur actions and let the parent component (App.vue) decide what to do (e.g., close palette)
				emit( 'blur-actions' );
				// We don't call close() or focusInput() here, let the global handler in App.vue manage Escape.
				handled = true;
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
	 * Updates the ID of the currently focused action button and emits focus event.
	 * Should be called from the button's focus handler.
	 *
	 * @param {string} actionId The ID of the action button that received focus.
	 */
	function onButtonFocus( actionId ) {
		activeButtonId.value = actionId;
		const actions = actionsRef.value;
		const index = actions.findIndex( ( action ) => action.id === actionId );
		const isFirst = index === 0;
		emit( 'focus-action', { isFirst: isFirst, index: index } );
	}

	return {
		handleActionButtonKeydown,
		onButtonFocus,
		focusFirstButton
	};
}

module.exports = useActionNavigation;
