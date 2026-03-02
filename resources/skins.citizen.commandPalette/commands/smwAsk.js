/**
 * Command handler for Semantic MediaWiki Ask API search.
 * Allows users to type "/ask <query>" to search using SMW.
 */
const { CommandPaletteItem, CommandPaletteCommand, CommandPaletteActionResult } = require( '../types.js' );
const SmwAskApiSearchClient = require( '../searchClients/SmwAskApiSearchClient.js' );
const { getNavigationAction } = require( '../utils/providerActions.js' );

/** @type {SmwAskApiSearchClient|null} */
let searchClient = null;

/**
 * Get or create the SMW search client instance.
 *
 * @return {SmwAskApiSearchClient}
 */
function getSearchClient() {
	if ( !searchClient ) {
		searchClient = new SmwAskApiSearchClient();
	}
	return searchClient;
}

/**
 * Performs SMW search and returns results as CommandPaletteItems.
 *
 * @param {string} subQuery The part of the query after "/ask ".
 * @return {Promise<Array<CommandPaletteItem>>}
 */
async function getSmwResults( subQuery ) {
	if ( !subQuery ) {
		return [];
	}

	const client = getSearchClient();
	const { fetch } = client.fetchByQuery( subQuery );

	try {
		const searchResponse = await fetch;
		return searchResponse.results ?? [];
	} catch ( error ) {
		if ( error.name === 'AbortError' ) {
			return [];
		}
		throw error;
	}
}

/** @type {CommandPaletteCommand} */
module.exports = {
	id: 'smwAsk',
	triggers: [ '/ask ' ],
	label: mw.message( 'citizen-command-palette-command-smwask-label' ).exists() ?
		mw.message( 'citizen-command-palette-command-smwask-label' ).text() :
		'Semantic search',
	description: mw.message( 'citizen-command-palette-command-smwask-description' ).exists() ?
		mw.message( 'citizen-command-palette-command-smwask-description' ).text() :
		'Search using Semantic MediaWiki',
	getResults: getSmwResults,

	/**
	 * Handles selection of a search result item.
	 *
	 * @param {CommandPaletteItem} item The selected item.
	 * @return {CommandPaletteActionResult}
	 */
	onResultSelect( item ) {
		return getNavigationAction( item );
	}
};
