/**
 * Generic Arrow Navigation composable
 * Provides a reusable navigation system for UI components
 * that need keyboard arrow navigation functionality
 */

module.exports = function useArrowNavigation( options ) {
	const {
		getContainer,
		getItems,
		getActiveIndex,
		setActiveIndex,
		onFocusChange,
		onVerticalNavigation,
		itemSelector,
		subitemSelector,
		verticalNavigation = true,
		horizontalNavigation = true,
		loopNavigation = true
	} = options;

	/**
	 * Helper function to validate items and prepare for navigation
	 *
	 * @return {Object|false} Object with items and currentIndex if valid, false otherwise
	 */
	const prepareItemNavigation = () => {
		const items = getItems();
		if ( !items || !items.length ) {
			return false;
		}
		return {
			items,
			currentIndex: getActiveIndex()
		};
	};

	/**
	 * Helper function to handle changing the active item
	 *
	 * @param {number} newIndex The new index to set
	 * @param {number} currentIndex The current index for comparison
	 * @return {boolean} Whether navigation occurred
	 */
	const changeActiveItem = ( newIndex, currentIndex ) => {
		if ( newIndex !== currentIndex ) {
			// Reset nested navigation when moving to a new item
			if ( onFocusChange ) {
				onFocusChange( false );
			}
			setActiveIndex( newIndex );
			return true;
		}
		return false;
	};

	/**
	 * Helper function to get container and validate it exists
	 *
	 * @return {Element|false} The container element if it exists, false otherwise
	 */
	const getValidContainer = () => {
		const container = getContainer();
		return container || false;
	};

	/**
	 * Helper function to prepare for horizontal navigation
	 *
	 * @return {Object|false} Object with elements needed for navigation if valid, false otherwise
	 */
	const prepareHorizontalNavigation = () => {
		if ( !horizontalNavigation ) {
			return false;
		}

		const container = getValidContainer();
		if ( !container ) {
			return false;
		}

		// Check if we have an active/highlighted item
		const activeItem = container.querySelector( `${ itemSelector }--highlighted` );
		if ( !activeItem ) {
			return false;
		}

		// Check if the item has focusable elements (like action buttons)
		if ( !subitemSelector ) {
			return false;
		}

		const focusableElements = activeItem.querySelectorAll( subitemSelector );
		if ( !focusableElements || !focusableElements.length ) {
			return false;
		}

		return {
			container,
			activeItem,
			focusableElements,
			currentFocused: document.activeElement
		};
	};

	/**
	 * Navigate to next item in vertical navigation
	 *
	 * @return {boolean} Whether navigation occurred
	 */
	const navigateNext = () => {
		if ( !verticalNavigation ) {
			return false;
		}

		// If there's a custom vertical navigation handler, use it
		if ( onVerticalNavigation && typeof onVerticalNavigation === 'function' ) {
			return onVerticalNavigation( 'down' );
		}

		const prepared = prepareItemNavigation();
		if ( !prepared ) {
			return false;
		}

		const { items, currentIndex } = prepared;
		const nextIndex = loopNavigation ?
			( currentIndex + 1 ) % items.length :
			Math.min( currentIndex + 1, items.length - 1 );

		return changeActiveItem( nextIndex, currentIndex );
	};

	/**
	 * Navigate to previous item in vertical navigation
	 *
	 * @return {boolean} Whether navigation occurred
	 */
	const navigatePrevious = () => {
		if ( !verticalNavigation ) {
			return false;
		}

		// If there's a custom vertical navigation handler, use it
		if ( onVerticalNavigation && typeof onVerticalNavigation === 'function' ) {
			return onVerticalNavigation( 'up' );
		}

		const prepared = prepareItemNavigation();
		if ( !prepared ) {
			return false;
		}

		const { items, currentIndex } = prepared;
		const prevIndex = loopNavigation ?
			( currentIndex - 1 + items.length ) % items.length :
			Math.max( currentIndex - 1, 0 );

		return changeActiveItem( prevIndex, currentIndex );
	};

	/**
	 * Navigate to first item
	 *
	 * @return {boolean} Whether navigation occurred
	 */
	const navigateFirst = () => {
		const prepared = prepareItemNavigation();
		if ( !prepared ) {
			return false;
		}

		const { currentIndex } = prepared;
		return changeActiveItem( 0, currentIndex );
	};

	/**
	 * Navigate to last item
	 *
	 * @return {boolean} Whether navigation occurred
	 */
	const navigateLast = () => {
		const prepared = prepareItemNavigation();
		if ( !prepared ) {
			return false;
		}

		const { items, currentIndex } = prepared;
		const lastIndex = items.length - 1;
		return changeActiveItem( lastIndex, currentIndex );
	};

	/**
	 * Navigate right within the current item (for nested navigation)
	 *
	 * @return {boolean} Whether navigation occurred
	 */
	const navigateRight = () => {
		const prepared = prepareHorizontalNavigation();
		if ( !prepared ) {
			return false;
		}

		const { activeItem, focusableElements, currentFocused } = prepared;

		// If nothing is focused within the item yet, focus the first element
		if ( !activeItem.contains( currentFocused ) ) {
			// Only attempt to focus if the element has a focus method
			if ( typeof focusableElements[ 0 ].focus === 'function' ) {
				focusableElements[ 0 ].focus();
				if ( onFocusChange ) {
					onFocusChange( true );
				}
				return true;
			}
			return false;
		}

		// Find the index of the currently focused element
		const currentIndex = Array.from( focusableElements ).indexOf( currentFocused );

		// If we found the current element and there's a next one
		if ( currentIndex >= 0 && currentIndex < focusableElements.length - 1 ) {
			// Only attempt to focus if the element has a focus method
			if ( typeof focusableElements[ currentIndex + 1 ].focus === 'function' ) {
				focusableElements[ currentIndex + 1 ].focus();
				return true;
			}
		}

		return false;
	};

	/**
	 * Navigate left within the current item (for nested navigation)
	 *
	 * @return {boolean} Whether navigation occurred
	 */
	const navigateLeft = () => {
		const prepared = prepareHorizontalNavigation();
		if ( !prepared ) {
			return false;
		}

		const { activeItem, focusableElements, currentFocused } = prepared;

		// If focused element is not within the item, do nothing
		if ( !activeItem.contains( currentFocused ) ) {
			return false;
		}

		// Find the index of the currently focused element
		const currentIndex = Array.from( focusableElements ).indexOf( currentFocused );

		// If we found the current element and there's a previous one
		if ( currentIndex > 0 ) {
			// Only attempt to focus if the element has a focus method
			if ( typeof focusableElements[ currentIndex - 1 ].focus === 'function' ) {
				focusableElements[ currentIndex - 1 ].focus();
				return true;
			}
		} else if ( currentIndex === 0 ) {
			// If we're at the first element, exit focus mode
			currentFocused.blur();
			if ( onFocusChange ) {
				onFocusChange( false );
				// Return true to indicate that we've handled the navigation
				return true;
			}
		}

		return false;
	};

	/**
	 * Unified keyboard event handle
	 *
	 * @param {Event} event The keyboard event
	 * @return {boolean} Whether the event was handled
	 */
	const handleKeydown = ( event ) => {
		let handled = false;

		switch ( event.key ) {
			case 'ArrowDown':
				handled = navigateNext();
				break;
			case 'ArrowUp':
				handled = navigatePrevious();
				break;
			case 'ArrowRight':
				handled = navigateRight();
				break;
			case 'ArrowLeft':
				handled = navigateLeft();
				break;
			case 'Home':
				handled = navigateFirst();
				break;
			case 'End':
				handled = navigateLast();
				break;
		}

		if ( handled ) {
			event.preventDefault();
		}

		return handled;
	};

	/**
	 * Set up event listeners for navigation
	 */
	const setupNavigation = () => {
		const container = getValidContainer();
		if ( !container ) {
			return;
		}

		container.addEventListener( 'keydown', handleKeydown );
	};

	/**
	 * Clean up event listeners
	 */
	const cleanupNavigation = () => {
		const container = getValidContainer();
		if ( !container ) {
			return;
		}

		container.removeEventListener( 'keydown', handleKeydown );
	};

	return {
		navigateNext,
		navigatePrevious,
		navigateFirst,
		navigateLast,
		navigateRight,
		navigateLeft,
		handleKeydown,
		setupNavigation,
		cleanupNavigation
	};
};
