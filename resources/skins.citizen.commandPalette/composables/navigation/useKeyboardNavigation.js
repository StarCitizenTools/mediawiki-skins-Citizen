/**
 * Keyboard navigation composable for the Command Palette
 * Main composable that combines all keyboard-related functionality
 */

const useItemNavigation = require( './useItemNavigation.js' );
const useScrollBehavior = require( '../core/useScrollBehavior.js' );
const useKeyHandlers = require( './useKeyHandlers.js' );
const useArrowNavigation = require( '../core/useArrowNavigation.js' );
const useInputUtils = require( '../core/useInputUtils.js' );

// Focus state constants - represents different possible focus states
const FOCUS_STATES = {
	NONE: 'none', // No special focus
	INPUT: 'input', // Input field is focused
	LIST_ITEM: 'list-item', // List item is highlighted
	ACTION: 'action' // Action button is focused
};

module.exports = function useKeyboardNavigation( { state, refs, selectResult, emit } ) {
	// Initialize the specialized composables
	const navigation = useItemNavigation( { state } );
	const scrollBehavior = useScrollBehavior( { refs } );
	const inputUtils = useInputUtils( { refs } );

	// Set up focus state if it doesn't exist
	if ( !state.focusState ) {
		state.focusState = { value: FOCUS_STATES.NONE };
	}

	// Initialize the generic arrow navigation for list items
	const itemNavigation = useArrowNavigation( {
		getContainer: () => refs.resultsContainer.value,
		getItems: () => state.currentItems.value,
		getActiveIndex: () => state.highlightedItemIndex.value,
		setActiveIndex: ( index ) => {
			state.highlightedItemIndex.value = index;
			// Also scroll the item into view if needed
			scrollBehavior.maybeScrollIntoView();
		},
		itemSelector: '.citizen-command-palette-list-item',
		subitemSelector: '.citizen-command-palette-list-item__action',
		verticalNavigation: true,
		horizontalNavigation: true,
		loopNavigation: true,
		onFocusChange: ( isFocused ) => {
			// Update focus state based on focus change
			state.focusState.value = isFocused ? FOCUS_STATES.ACTION : FOCUS_STATES.LIST_ITEM;

			if ( !isFocused ) {
				// Return focus to search input when leaving nested navigation
				refs.searchHeader.value?.$el.querySelector( 'input' )?.focus();
				state.focusState.value = FOCUS_STATES.INPUT;
			}
		}
	} );

	// For backward compatibility, maintain isActionButtonFocused
	state.isActionButtonFocused = {
		get value() {
			return state.focusState.value === FOCUS_STATES.ACTION;
		},
		set value( newValue ) {
			state.focusState.value = newValue ? FOCUS_STATES.ACTION : FOCUS_STATES.LIST_ITEM;
		}
	};

	// Initialize the keyboard handlers
	const keyHandlers = useKeyHandlers( {
		state,
		navigation,
		selectResult,
		itemNavigation,
		inputUtils,
		emit
	} );

	return {
		// Navigation methods
		highlightNext: itemNavigation.navigateNext,
		highlightPrevious: itemNavigation.navigatePrevious,
		highlightFirst: itemNavigation.navigateFirst,
		highlightLast: itemNavigation.navigateLast,

		// Action logic
		hasHighlightedItemWithActions: navigation.hasHighlightedItemWithActions,

		// Event handlers
		setup: itemNavigation.setupNavigation,
		onKeydown: keyHandlers.onKeydown,

		// Cleanup
		cleanup: itemNavigation.cleanupNavigation,

		// Scroll handling
		maybeScrollIntoView: scrollBehavior.maybeScrollIntoView,

		// Focus state constants - expose for external use
		FOCUS_STATES
	};
};
