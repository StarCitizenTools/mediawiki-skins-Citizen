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

		const items = getItems();
		if ( !items || !items.length ) {
			return false;
		}

		const currentIndex = getActiveIndex();
		const nextIndex = loopNavigation ?
			( currentIndex + 1 ) % items.length :
			Math.min( currentIndex + 1, items.length - 1 );

		if ( nextIndex !== currentIndex ) {
			// Reset nested navigation when moving to a new item
			if ( onFocusChange ) {
				onFocusChange( false );
			}
			setActiveIndex( nextIndex );
			return true;
		}
		return false;
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

		const items = getItems();
		if ( !items || !items.length ) {
			return false;
		}

		const currentIndex = getActiveIndex();
		const prevIndex = loopNavigation ?
			( currentIndex - 1 + items.length ) % items.length :
			Math.max( currentIndex - 1, 0 );

		if ( prevIndex !== currentIndex ) {
			// Reset nested navigation when moving to a new item
			if ( onFocusChange ) {
				onFocusChange( false );
			}
			setActiveIndex( prevIndex );
			return true;
		}
		return false;
	};

	/**
	 * Navigate to first item
	 *
	 * @return {boolean} Whether navigation occurred
	 */
	const navigateFirst = () => {
		const items = getItems();
		if ( !items || !items.length ) {
			return false;
		}

		const currentIndex = getActiveIndex();
		if ( currentIndex !== 0 ) {
			// Reset nested navigation when moving to a new item
			if ( onFocusChange ) {
				onFocusChange( false );
			}
			setActiveIndex( 0 );
			return true;
		}
		return false;
	};

	/**
	 * Navigate to last item
	 *
	 * @return {boolean} Whether navigation occurred
	 */
	const navigateLast = () => {
		const items = getItems();
		if ( !items || !items.length ) {
			return false;
		}

		const lastIndex = items.length - 1;
		const currentIndex = getActiveIndex();
		if ( currentIndex !== lastIndex ) {
			// Reset nested navigation when moving to a new item
			if ( onFocusChange ) {
				onFocusChange( false );
			}
			setActiveIndex( lastIndex );
			return true;
		}
		return false;
	};

	/**
	 * Navigate right within the current item (for nested navigation)
	 *
	 * @return {boolean} Whether navigation occurred
	 */
	const navigateRight = () => {
		if ( !horizontalNavigation ) {
			return false;
		}

		const container = getContainer();
		if ( !container ) {
			return false;
		}

		// Check if we have an active/highlighted item
		const activeItem = container.querySelector( `${ itemSelector }.active` ) ||
			container.querySelector( `${ itemSelector }--highlighted` );
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

		const currentFocused = document.activeElement;

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
		if ( !horizontalNavigation ) {
			return false;
		}

		const container = getContainer();
		if ( !container ) {
			return false;
		}

		// Check if we have an active/highlighted item
		const activeItem = container.querySelector( `${ itemSelector }.active` ) ||
			container.querySelector( `${ itemSelector }--highlighted` );
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

		const currentFocused = document.activeElement;

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
		const container = getContainer();
		if ( !container ) {
			return;
		}

		container.addEventListener( 'keydown', handleKeydown );
	};

	/**
	 * Clean up event listeners
	 */
	const cleanupNavigation = () => {
		const container = getContainer();
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
