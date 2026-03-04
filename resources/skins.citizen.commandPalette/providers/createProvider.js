const { getNavigationAction } = require( '../utils/providerActions.js' );

/** @type {Object} */
const DEFAULT_CONFIG = {
	debounceMs: 250,
	keepStaleResults: false
};

/**
 * Creates a validated, frozen provider object.
 *
 * Validates the provider contract at registration time: id must be a
 * non-empty string, handler must supply canProvide and getResults as
 * functions. An optional onResultSelect defaults to navigating to the
 * item's URL via getNavigationAction.
 *
 * @param {string} id Unique provider identifier.
 * @param {Object} handler Object with canProvide, getResults, and optional onResultSelect.
 * @param {Object} [config] Optional configuration overrides.
 * @return {Object} Frozen provider object.
 * @throws {Error} If id is missing/empty or required handler methods are absent.
 */
function createProvider( id, handler, config ) {
	if ( typeof id !== 'string' || id.trim() === '' ) {
		throw new Error( 'createProvider: id must be a non-empty string' );
	}

	if ( typeof handler.canProvide !== 'function' ) {
		throw new Error( `createProvider (${ id }): handler.canProvide must be a function` );
	}

	if ( typeof handler.getResults !== 'function' ) {
		throw new Error( `createProvider (${ id }): handler.getResults must be a function` );
	}

	const onResultSelect = typeof handler.onResultSelect === 'function' ?
		handler.onResultSelect :
		( item ) => getNavigationAction( item );

	const merged = Object.assign( {}, DEFAULT_CONFIG, config );

	return Object.freeze( {
		id,
		canProvide: handler.canProvide,
		getResults: handler.getResults,
		onResultSelect,
		debounceMs: merged.debounceMs,
		keepStaleResults: merged.keepStaleResults
	} );
}

module.exports = createProvider;
