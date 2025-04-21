/**
 * Input utilities composable for the Command Palette
 * Provides utility functions related to input elements
 */

module.exports = function useInputUtils( { refs } ) {
	/**
	 * Check if the search input cursor is at the end of the text
	 * Used to determine if right arrow navigation should be enabled
	 *
	 * @return {boolean} True if cursor is at the end of input text
	 */
	const isCursorAtInputEnd = () => {
		const searchHeaderEl = refs.searchHeader?.value;
		if ( !searchHeaderEl || !searchHeaderEl.$el ) {
			return false;
		}

		const inputEl = searchHeaderEl.$el.querySelector( 'input' );
		if ( !inputEl ) {
			return false;
		}

		return inputEl.selectionStart === inputEl.value.length;
	};

	return {
		isCursorAtInputEnd
	};
};
