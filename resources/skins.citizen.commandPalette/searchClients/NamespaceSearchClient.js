/**
 * Search client for retrieving and filtering MediaWiki namespaces from configuration.
 * TODO: Clean up the implementation for this, and think of a better way to organize the search clients.
 */

const { NamespaceResult } = require( '../types.js' );

/**
 * Represents a raw namespace result before adaptation.
 */

// Define the main namespace ID constant
const MAIN_NAMESPACE_ID = '0';

/**
 * @class NamespaceSearchClient
 * Search client focused on retrieving namespace data from mw.config.
 */
class NamespaceSearchClient {
	/**
	 * Fetches and filters namespaces based on a query string, checking both label and ID prefixes.
	 *
	 * @param {string} query The search query for namespace labels or IDs.
	 * @return {Promise<Array<NamespaceResult>>} An array of raw namespace suggestion objects { label, value }.
	 */
	// eslint-disable-next-line es-x/no-async-functions
	async findNamespaces( query ) {
		// Fetch namespaces from MediaWiki configuration
		const formattedNamespaces = mw.config.get( 'wgFormattedNamespaces' ) || {};
		const allNamespaces = Object.entries( formattedNamespaces ).map( ( [ id, name ] ) => ( {
			label: name,
			value: id
		} ) ).filter( ( ns ) => ns.value !== MAIN_NAMESPACE_ID ); // Use the constant here

		const trimmedQuery = query.trim();
		const lowerQuery = trimmedQuery.toLowerCase();

		// Combine results using a Map to handle duplicates based on namespace ID (value)
		const combinedResults = new Map();

		if ( !trimmedQuery ) {
			// If the query is empty, return all namespaces
			allNamespaces.forEach( ( ns ) => combinedResults.set( ns.value, ns ) );
		} else {
			// If query is not empty, filter by label and ID prefixes
			allNamespaces.forEach( ( ns ) => {
				// Check label prefix (case-insensitive)
				if ( ns.label.toLowerCase().startsWith( lowerQuery ) ) {
					combinedResults.set( ns.value, ns );
				}
				// Check ID prefix (case-sensitive)
				if ( ns.value.startsWith( trimmedQuery ) ) {
					combinedResults.set( ns.value, ns );
				}
			} );
		}

		return Array.from( combinedResults.values() );
	}
}

// Export a singleton instance
module.exports = new NamespaceSearchClient();
