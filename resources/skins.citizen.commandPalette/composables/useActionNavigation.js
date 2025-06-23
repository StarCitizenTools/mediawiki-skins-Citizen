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
	 * Focuses a button element, handling both Vue components and standard elements.
	 *
	 * @param {HTMLElement|{ $el: HTMLElement }} button The button element to focus.
	 */
	function focusButton( button ) {
		if ( button?.$el ) { // For Codex CdxButton
			button.$el.focus();
		} else if ( typeof button?.focus === 'function' ) { // Fallback for standard elements
			button.focus();
		}
	}

	/**
	 * Clicks a button element, handling both Vue components and standard elements.
	 *
	 * @param {HTMLElement|{ $el: HTMLElement }} button The button element to click.
	 */
	function clickButton( button ) {
		if ( button?.$el ) { // For Codex CdxButton
			button.$el.click();
		} else if ( typeof button?.click === 'function' ) { // Fallback for standard elements
			button.click();
		}
	}

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

		const actions = actionsRef.value;
		const buttons = buttonRefs.value;
		const currentButtonIndex = actions.findIndex( ( action ) => action.id === currentActionId );

		if ( currentButtonIndex === -1 ) {
			return false;
		}

		const keyAction = {
			ArrowLeft: () => {
				if ( currentButtonIndex === 0 ) {
					emit( 'blur-actions' );
					searchStore.triggerFocusSearchInput();
				} else {
					const prevActionId = actions[ currentButtonIndex - 1 ].id;
					focusButton( buttons[ prevActionId ] );
				}
				return true;
			},
			ArrowRight: () => {
				if ( currentButtonIndex < actions.length - 1 ) {
					const nextActionId = actions[ currentButtonIndex + 1 ].id;
					focusButton( buttons[ nextActionId ] );
					return true;
				}
				return false;
			},
			ArrowUp: () => {
				emit( 'blur-actions' );
				emit( 'navigate-list', event );
				searchStore.triggerFocusSearchInput();
				return true;
			},
			ArrowDown: () => keyAction.ArrowUp(),
			Enter: () => {
				clickButton( buttons[ currentActionId ] );
				return true;
			},
			' ': () => keyAction.Enter(),
			Escape: () => {
				emit( 'blur-actions' );
				return true;
			}
		};

		if ( keyAction[ event.key ] && keyAction[ event.key ]() ) {
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
