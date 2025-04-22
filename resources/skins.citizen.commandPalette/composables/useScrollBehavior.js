/**
 * Scroll behavior composable for the Command Palette
 * Handles scrolling to keep the highlighted item in view
 */

module.exports = function useScrollBehavior( { refs } ) {
	// Scroll handling for highlighted items
	const maybeScrollIntoView = () => {
		if ( !refs.resultsContainer.value ) {
			return;
		}

		const isResultsScrollable =
			refs.resultsContainer.value.scrollHeight > refs.resultsContainer.value.clientHeight;

		if ( !isResultsScrollable ) {
			return;
		}

		const highlightedElement = refs.resultsContainer.value.querySelector( '.citizen-command-palette-list-item--highlighted' );
		highlightedElement?.scrollIntoView( {
			block: 'nearest',
			behavior: 'smooth'
		} );
	};

	return {
		maybeScrollIntoView
	};
};
