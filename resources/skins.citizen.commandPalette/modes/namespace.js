/**
 * Command handler for retrieving namespace suggestions.
 */

const { cdxIconArticles } = require( '../icons.json' );
const { defineMode } = require( '../services/defineMode.js' );

const MAIN_NAMESPACE_ID = '0';

/**
 * Cached namespace entries (excludes main namespace).
 * Lazily populated on first use from wgFormattedNamespaces.
 */
let cachedNamespaceEntries = null;

/**
 * Cached lookup of every name a namespace answers to, keyed by that name.
 * Lazily populated on first use from wgFormattedNamespaces and wgNamespaceIds.
 */
let cachedNamespaceIndex = null;

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
 * Normalizes a namespace name so that names differing only in case, or in
 * spaces versus underscores, compare equal — MediaWiki treats `Template`,
 * `template` and `User_talk` / `User talk` as the same name.
 *
 * @param {string} name
 * @return {string}
 */
function normalizeNamespaceName( name ) {
	return name.replace( / /g, '_' ).toLowerCase();
}

/**
 * Returns every name that resolves to a namespace, keyed by normalized name.
 *
 * wgNamespaceIds is MediaWiki's own name-to-ID table and carries the whole set:
 * the wiki's names, the canonical English ones, and every alias (`T`, `CAT`,
 * `Image`). The display names are seeded first so the lookup still degrades to
 * the pre-alias behaviour if that config is ever unavailable, and because
 * wgNamespaceIds is applied second it wins wherever the two disagree.
 *
 * Results are cached after the first call.
 *
 * @return {Map<string, string>} Normalized name to namespace ID.
 */
function getNamespaceIndex() {
	if ( !cachedNamespaceIndex ) {
		cachedNamespaceIndex = new Map();
		getNamespaceEntries().forEach( ( entry ) => {
			cachedNamespaceIndex.set( normalizeNamespaceName( entry.name ), entry.id );
		} );
		const namespaceIds = mw.config.get( 'wgNamespaceIds' ) || {};
		Object.entries( namespaceIds ).forEach( ( [ name, id ] ) => {
			cachedNamespaceIndex.set( normalizeNamespaceName( name ), String( id ) );
		} );
	}
	return cachedNamespaceIndex;
}

/**
 * @typedef {Object} NamespaceResult
 * @property {string} label The namespace label.
 * @property {number} value The namespace ID.
 */

/**
 * @param {NamespaceResult} nsResult
 * @return {import('../types.js').CommandPaletteItem}
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
				label: String( nsResult.value )
			}
		],
		highlightQuery: true
	};
}

/**
 * Gets namespace suggestions based on the sub-query by filtering local config.
 *
 * @param {string} subQuery The part of the query after "/ns" or "/ns ", or the ID part (e.g., "1").
 * @return {Promise<Array<import('../types.js').CommandPaletteItem>>} A promise resolving to an array of adapted namespace items.
 */
function getNamespaceResults( subQuery ) {
	const allNamespaces = getNamespaceEntries().map( ( entry ) => ( {
		label: entry.name,
		value: entry.id
	} ) );

	// Combine results using a Map to handle duplicates based on namespace ID (value)
	const combinedResults = new Map();

	if ( !subQuery ) {
		// If the query is empty, return all namespaces
		allNamespaces.forEach( ( ns ) => combinedResults.set( ns.value, ns ) );
	} else {
		// Namespaces with any name matching the query, so "cat" finds Category
		// and "image" finds File. Resolved to IDs up front, in one pass over the
		// index, because the loop below runs per namespace and this runs on
		// every keystroke.
		const normalizedQuery = normalizeNamespaceName( subQuery );
		const matchedIds = new Set();
		getNamespaceIndex().forEach( ( id, name ) => {
			if ( name.startsWith( normalizedQuery ) ) {
				matchedIds.add( id );
			}
		} );

		// Namespaces the query visibly resembles go first, then the ones it only
		// reached through an alias. Every wiki carries the canonical English
		// names, so without the split a renamed namespace would take the top row
		// -- and the default Enter target -- from a namespace whose own name
		// starts with what was typed.
		const aliasedOnly = [];
		allNamespaces.forEach( ( ns ) => {
			if (
				// Check name prefix (case, space and underscore insensitive)
				normalizeNamespaceName( ns.label ).startsWith( normalizedQuery ) ||
				// Check ID prefix (case-sensitive)
				ns.value.startsWith( subQuery )
			) {
				combinedResults.set( ns.value, ns );
			} else if ( matchedIds.has( ns.value ) ) {
				aliasedOnly.push( ns );
			}
		} );
		aliasedOnly.forEach( ( ns ) => combinedResults.set( ns.value, ns ) );
	}

	const results = Array.from( combinedResults.values(), adaptNamespaceResult );
	return Promise.resolve( results );
}

/**
 * Matches a known namespace prefix at the start of the given text.
 *
 * The candidate is the text before the first colon, resolved through the
 * namespace index, so aliases ("T:", "CAT:") and canonical English names are
 * recognised alongside the names the wiki shows in page titles.
 *
 * @param {string} text The input text to check.
 * @return {{ label: string, raw: string } | null} Match result or null.
 */
function matchNamespacePrefix( text ) {
	const colonIndex = text.indexOf( ':' );
	if ( colonIndex < 1 ) {
		// No colon, or a leading colon, which is the main namespace.
		return null;
	}

	const id = getNamespaceIndex().get( normalizeNamespaceName( text.slice( 0, colonIndex ) ) );
	if ( id === undefined || id === MAIN_NAMESPACE_ID ) {
		return null;
	}

	// `raw` is exactly the text that was consumed — the tokenizer strips it off
	// the input by length, and removing the tag types it back. That leaves
	// `label` free to carry the display name, so typing an alias shows the
	// namespace it resolved to.
	const raw = text.slice( 0, colonIndex + 1 );
	const name = ( mw.config.get( 'wgFormattedNamespaces' ) || {} )[ id ];
	return { label: name ? `${ name }:` : raw, raw };
}

/** @type {import('../types.js').PaletteMode|null} */
module.exports = defineMode( {
	id: 'namespace',
	triggers: [ '/ns:', ':' ],
	label: mw.message( 'citizen-command-palette-command-ns-label' ).text(),
	description: mw.message( 'citizen-command-palette-command-ns-description' ).text(),
	placeholder: mw.message( 'citizen-command-palette-mode-ns-placeholder' ).text(),
	icon: cdxIconArticles,
	compactResults: true,
	tokenPattern: {
		modeId: 'namespace',
		position: 'prefix',
		activeIn: 'root',
		match: matchNamespacePrefix
	},
	help: {
		description: 'citizen-command-palette-mode-namespace-description-help'
	},
	getResults: getNamespaceResults,
	/**
	 * Handles selection of a namespace result item.
	 *
	 * @param {import('../types.js').CommandPaletteItem} item The selected namespace result item.
	 * @return {import('../types.js').CommandPaletteExitWithQueryAction | import('../types.js').CommandPaletteNoneAction}
	 */
	onResultSelect( item ) {
		// Default behavior: update query with the namespace trigger (e.g., "Talk:")
		if ( item.value && typeof item.value === 'string' ) {
			return { action: 'exitWithQuery', payload: item.value };
		}
		return { action: 'none' };
	}
} );
