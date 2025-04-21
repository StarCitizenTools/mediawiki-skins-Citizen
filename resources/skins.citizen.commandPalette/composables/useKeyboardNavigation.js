/**
 * Keyboard navigation composable for the Command Palette
 * Main composable that combines all keyboard-related functionality
 */

const useItemNavigation = require( './useItemNavigation.js' );
const useActionNavigation = require( './useActionNavigation.js' );
const useScrollBehavior = require( './useScrollBehavior.js' );
const useKeyHandlers = require( './useKeyHandlers.js' );

module.exports = function useKeyboardNavigation( { state, refs, selectResult } ) {
	// Initialize the specialized composables
	const navigation = useItemNavigation( { state } );
	const actionNav = useActionNavigation( { state, refs } );
	const scrollBehavior = useScrollBehavior( { refs } );
	const keyHandlers = useKeyHandlers( {
		state,
		navigation,
		actionNav,
		selectResult
	} );

	// Cleanup function to remove all event listeners
	const cleanup = () => {
		actionNav.cleanupActionButtonKeyNavigation();
	};

	return {
		// Navigation methods
		highlightNext: navigation.highlightNext,
		highlightPrevious: navigation.highlightPrevious,
		highlightFirst: navigation.highlightFirst,
		highlightLast: navigation.highlightLast,

		// Focus handling
		focusActionButton: () => actionNav.focusActionButton( navigation.hasHighlightedItemWithActions ),

		// Action logic
		hasHighlightedItemWithActions: navigation.hasHighlightedItemWithActions,

		// Event handlers
		onKeydown: keyHandlers.onKeydown,
		setupActionButtonKeyNavigation: actionNav.setupActionButtonKeyNavigation,
		cleanupActionButtonKeyNavigation: actionNav.cleanupActionButtonKeyNavigation,

		// Cleanup
		cleanup,

		// Scroll handling
		maybeScrollIntoView: scrollBehavior.maybeScrollIntoView
	};
};
