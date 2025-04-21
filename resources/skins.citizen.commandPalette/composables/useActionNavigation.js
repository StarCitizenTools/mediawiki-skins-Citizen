/**
 * Action navigation composable for the Command Palette
 * Handles navigation between action buttons and managing their focus state
 */

module.exports = function useActionNavigation( { state, refs } ) {
	// Check if input cursor is at the end of text
	const isCursorAtInputEnd = () => {
		const inputEl = refs.searchHeader.value?.$el.querySelector( 'input' );
		return inputEl?.selectionStart === inputEl?.value.length;
	};

	// Find and get the first action button of the highlighted item
	const getFirstActionButton = () => refs.resultsContainer.value.querySelector(
		'.citizen-command-palette-list-item--highlighted .citizen-command-palette-list-item__action'
	);

	// Focus the action button of the highlighted item
	const focusActionButton = ( hasHighlightedItemWithActions ) => {
		// Check preconditions
		if ( !isCursorAtInputEnd() || !hasHighlightedItemWithActions() ) {
			return false;
		}

		// Find the button
		const actionButton = getFirstActionButton();
		if ( !actionButton ) {
			return false;
		}

		// Move focus from input to the action button
		const inputEl = refs.searchHeader.value?.$el.querySelector( 'input' );
		if ( inputEl ) {
			inputEl.blur();
		}
		actionButton.focus();
		state.isActionButtonFocused.value = true;
		return true;
	};

	// Event handlers for action button navigation
	const keydownHandler = ( event ) => {
		// Check if the event target is an action button
		if ( event.target.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
			if ( event.key === 'ArrowLeft' ) {
				const prevButton = event.target.previousElementSibling;
				if ( prevButton && prevButton.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
					// Focus previous action button if it exists
					prevButton.focus();
				} else {
					// If no previous action button, return focus to the highlighted item and search input
					event.target.blur();
					refs.searchHeader.value?.$el.querySelector( 'input' )?.focus();
					state.isActionButtonFocused.value = false;
				}
				event.preventDefault();
			} else if ( event.key === 'ArrowRight' ) {
				const nextButton = event.target.nextElementSibling;
				if ( nextButton && nextButton.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
					// Focus next action button if it exists
					nextButton.focus();
					event.preventDefault();
				}
			}
		}
	};

	const focusinHandler = ( event ) => {
		if ( event.target.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
			state.isActionButtonFocused.value = true;
		}
	};

	const focusoutHandler = ( event ) => {
		if ( event.target.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
			// Only set to false if we're not focusing another action button
			if ( !event.relatedTarget || !event.relatedTarget.classList.contains( 'citizen-command-palette-list-item__action' ) ) {
				state.isActionButtonFocused.value = false;
			}
		}
	};

	// Setup event listeners for action button key navigation
	const setupActionButtonKeyNavigation = () => {
		// Use event delegation on the results container
		const resultsContainer = refs.resultsContainer.value;
		if ( !resultsContainer ) {
			return;
		}

		// Add event listeners
		resultsContainer.addEventListener( 'keydown', keydownHandler );
		resultsContainer.addEventListener( 'focusin', focusinHandler );
		resultsContainer.addEventListener( 'focusout', focusoutHandler );
	};

	// Clean up event listeners
	const cleanupActionButtonKeyNavigation = () => {
		const resultsContainer = refs.resultsContainer.value;
		if ( !resultsContainer ) {
			return;
		}

		// Remove event listeners
		resultsContainer.removeEventListener( 'keydown', keydownHandler );
		resultsContainer.removeEventListener( 'focusin', focusinHandler );
		resultsContainer.removeEventListener( 'focusout', focusoutHandler );
	};

	return {
		focusActionButton,
		setupActionButtonKeyNavigation,
		cleanupActionButtonKeyNavigation
	};
};
