/**
 * Command handler for retrieving namespace suggestions.
 */
const { CommandPaletteItem, PaletteMode, CommandPaletteUpdateQueryAction, CommandPaletteNoneAction } = require( '../types.js' );
const { cdxIconArticles } = require( '../icons.json' );

const MAIN_NAMESPACE_ID = '0';

/**
 * Cached namespace entries (excludes main namespace).
 * Lazily populated on first use from wgFormattedNamespaces.
 */
let cachedNamespaceEntries = null;

/**
 * Returns namespace entries from MediaWiki config, excluding the main namespace.
 * Results are cached after the first call.
 *
 * @return {Array<{id: string, name: string}>}
 */
function getNamespaceEntries() {
	if ( !cachedNamespaceEntries ) {
		const formattedNamespaces = mw.config.get( 'wgFormattedNamespaces' ) || {};
		cachedNamespaceEntries = Object.entries( formattedNamespaces )
			.filter( ( [ id, name ] ) => id !== MAIN_NAMESPACE_ID && name )
			.map( ( [ id, name ] ) => ( { id, name } ) );
	}
	return cachedNamespaceEntries;
}

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
	const allNamespaces = getNamespaceEntries().map( ( entry ) => ( {
		label: entry.name,
		value: entry.id
	} ) );

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

/**
 * Matches a known namespace prefix at the start of the given text.
 * Uses wgFormattedNamespaces from MediaWiki config, excluding the main namespace.
 *
 * @param {string} text The input text to check.
 * @return {{ label: string, raw: string } | null} Match result or null.
 */
function matchNamespacePrefix( text ) {
	const lowerText = text.toLowerCase();

	for ( const entry of getNamespaceEntries() ) {
		const prefix = entry.name.toLowerCase() + ':';
		if ( lowerText.startsWith( prefix ) ) {
			return { label: entry.name + ':', raw: entry.name + ':' };
		}
	}

	return null;
}

/** @type {PaletteMode} */
module.exports = {
	id: 'namespace',
	triggers: [ '/ns:', ':' ],
	label: mw.message( 'citizen-command-palette-command-ns-label' ).text(),
	description: mw.message( 'citizen-command-palette-command-ns-description' ).text(),
	placeholder: mw.message( 'citizen-command-palette-mode-ns-placeholder' ).text(),
	icon: cdxIconArticles,
	tokenPattern: {
		modeId: 'namespace',
		position: 'prefix',
		activeIn: 'root',
		match: matchNamespacePrefix
	},
	getResults: getNamespaceResults,
	/**
	 * Handles selection of a namespace result item.
	 *
	 * @param {CommandPaletteItem} item The selected namespace result item.
	 * @return {CommandPaletteUpdateQueryAction | CommandPaletteNoneAction}
	 */
	onResultSelect( item ) {
		// Default behavior: update query with the namespace trigger (e.g., "Talk:")
		if ( item.value && typeof item.value === 'string' ) {
			return { action: 'updateQuery', payload: item.value };
		}
		return { action: 'none' };
	}
};
