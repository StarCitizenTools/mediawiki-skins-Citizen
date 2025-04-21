/**
 * Search result transformer composable for the Command Palette
 * Handles transforming raw search results into UI-ready items
 */

module.exports = function useSearchResultTransformer() {
	/**
	 * Transform search results into UI-ready items with enhanced actions
	 *
	 * @param {Array} results Raw search results from API
	 * @param {Function} enhanceActionsWithHints Function to enhance actions with keyboard hints
	 * @return {Array} Transformed items ready for display
	 */
	const transformSearchResults = ( results, enhanceActionsWithHints ) => {
		if ( !results || !Array.isArray( results ) ) {
			return [];
		}

		return results
			.map( ( result ) => {
				if ( !result || typeof result !== 'object' ) {
					return null;
				}

				// Enhance actions with keyboard hints
				const enhancedActions = enhanceActionsWithHints( result.actions );

				return {
					type: 'page',
					id: `citizen-command-palette-result-page-${ result.id || result.title }`,
					label: result.label || result.title,
					description: result.description,
					url: result.url,
					thumbnail: result.thumbnail,
					thumbnailIcon: result.thumbnailIcon,
					metadata: result.metadata || [],
					actions: enhancedActions
				};
			} )
			.filter( Boolean );
	};

	return {
		transformSearchResults
	};
};
