/**
 * Command handler for retrieving namespace suggestions.
 */
const { CommandPaletteItem, CommandPaletteCommand, CommandPaletteActionResult } = require( '../types.js' );
const { cdxIconArticles } = require( '../icons.json' );

const MAIN_NAMESPACE_ID = '0';

/**
 * @typedef {Object} NamespaceResult
 * @property {string} label The namespace label.
 * @property {number} value The namespace ID.
 */

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
		],
		highlightQuery: true
	};
}

/**
 * Gets namespace suggestions based on the sub-query by filtering local config.
 *
 * @param {string} subQuery The part of the query after "/ns" or "/ns ", or the ID part (e.g., "1").
 * @return {Promise<Array<CommandPaletteItem>>} A promise resolving to an array of adapted namespace items.
 */
function getNamespaceResults( subQuery ) {
	// Fetch namespaces from MediaWiki configuration
	const formattedNamespaces = mw.config.get( 'wgFormattedNamespaces' ) || {};
	const allNamespaces = Object.entries( formattedNamespaces ).map( ( [ id, name ] ) => ( {
		label: name,
		value: id
	} ) ).filter( ( ns ) => ns.value !== MAIN_NAMESPACE_ID ); // Use the constant here

	const lowerQuery = subQuery.toLowerCase();

	// Combine results using a Map to handle duplicates based on namespace ID (value)
	const combinedResults = new Map();

	if ( !subQuery ) {
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
			if ( ns.value.startsWith( subQuery ) ) {
				combinedResults.set( ns.value, ns );
			}
		} );
	}

	const results = Array.from( combinedResults.values(), adaptNamespaceResult );
	return Promise.resolve( results );
}

/** @type {CommandPaletteCommand} */
module.exports = {
	id: 'namespace',
	triggers: [ '/ns:', ':' ],
	label: mw.message( 'citizen-command-palette-command-ns-label' ).text(),
	description: mw.message( 'citizen-command-palette-command-ns-description' ).text(),
	getResults: getNamespaceResults,
	/**
	 * Handles selection of a namespace result item.
	 *
	 * @param {CommandPaletteItem} item The selected namespace result item.
	 * @return {CommandPaletteActionResult}
	 */
	onResultSelect( item ) {
		// Default behavior: update query with the namespace trigger (e.g., "Talk:")
		if ( item.value ) {
			return { action: 'updateQuery', payload: item.value };
		}
		return { action: 'none' };
	}
};
