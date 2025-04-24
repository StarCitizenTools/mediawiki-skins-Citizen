/**
 * Command handler for retrieving namespace suggestions.
 */
const { CommandPaletteItem, CommandHandler, NamespaceResult } = require( '../types.js' );
const { cdxIconArticles } = require( '../icons.json' );

const MAIN_NAMESPACE_ID = '0';

/**
 * @param {NamespaceResult} nsResult
 * @return {CommandPaletteItem}
 */
function adaptNamespaceResult( nsResult ) {
	return {
		id: `citizen-command-palette-item-namespace-${ nsResult.value }`,
		thumbnailIcon: cdxIconArticles,
		type: 'namespace',
		label: nsResult.label,
		value: `${ nsResult.label }:`,
		metadata: [
			{
				label: nsResult.value
			}
		]
	};
}

/**
 * Gets namespace suggestions based on the sub-query by filtering local config.
 *
 * @param {string} subQuery The part of the query after "/ns" or "/ns ", or the ID part (e.g., "1").
 * @return {Array<NamespaceResult>} An array of raw namespace suggestion objects { label, value }.
 */
function getNamespaceResults( subQuery ) {
	// Fetch namespaces from MediaWiki configuration
	const formattedNamespaces = mw.config.get( 'wgFormattedNamespaces' ) || {};
	const allNamespaces = Object.entries( formattedNamespaces ).map( ( [ id, name ] ) => ( {
		label: name,
		value: id
	} ) ).filter( ( ns ) => ns.value !== MAIN_NAMESPACE_ID ); // Use the constant here

	const trimmedQuery = subQuery.trim();
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

	return Array.from( combinedResults.values(), adaptNamespaceResult );
}

/** @type {CommandHandler} */
module.exports = {
	label: mw.msg( 'citizen-command-palette-command-namespace-label' ),
	description: mw.msg( 'citizen-command-palette-command-namespace-description' ),
	getResults: getNamespaceResults
};
