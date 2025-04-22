/**
 * Search navigation composable for the Command Palette
 * Handles navigation and action execution for search results
 */

module.exports = function useSearchNavigation( { state, history, onClose } ) {
	/**
	 * Function to close the command palette
	 */
	const closeCommandPalette = () => {
		if ( typeof onClose === 'function' ) {
			onClose();
		}
	};

	/**
	 * Select a result and navigate to it
	 *
	 * @param {Object|null} result The search result to select
	 * @return {boolean} True if navigation occurred
	 */
	const selectResult = ( result ) => {
		// Close the command palette before navigation
		closeCommandPalette();

		// Validate that we have a proper result object before proceeding
		const isValidResult = result && typeof result === 'object';

		if ( !isValidResult ) {
			const searchUrl = history.getSearchUrl();
			window.location.href = searchUrl;
			// Save the search query as a recent item when there are no results
			history.saveSearchQuery( state.searchQuery.value, searchUrl );
			return true;
		}

		// If we have a valid result with URL, navigate to it
		if ( result.url ) {
			window.location.href = result.url;
			// Save the entire result object to recent items
			history.saveRecentItem( result );
		} else {
			// If no URL, fall back to search and save the query
			const searchUrl = history.getSearchUrl();
			history.saveSearchQuery( state.searchQuery.value, searchUrl );
			window.location.href = searchUrl;
		}
		return true;
	};

	/**
	 * Handle a result action
	 *
	 * @param {Object} actionData The action data
	 * @param {string} actionData.actionUrl URL to navigate to
	 * @param {Function} actionData.onClick Click handler function
	 * @param {string} actionData.itemId ID of the item
	 * @return {boolean} True if navigation occurred
	 */
	const handleAction = ( { actionUrl, onClick, itemId } ) => {
		// Validate that we have a valid itemId
		if ( !itemId ) {
			return false;
		}

		// Find the item associated with this action
		const item = state.currentItems.value.find( ( result ) => result.id === itemId );

		// Ensure we found a valid item
		if ( !item ) {
			return false;
		}

		const hasValidAction = actionUrl || onClick;
		if ( !hasValidAction ) {
			return false;
		}

		history.saveRecentItem( item );

		// Close the command palette before navigation
		closeCommandPalette();

		// Process the action
		if ( onClick ) {
			onClick();
		} else {
			window.location.href = actionUrl;
		}

		return true;
	};

	return {
		selectResult,
		handleAction
	};
};
