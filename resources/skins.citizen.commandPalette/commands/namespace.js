/**
 * Command handler for retrieving namespace suggestions.
 */

const { NamespaceResult } = require( '../types.js' );

const { CommandPaletteItem, CommandHandler } = require( '../types.js' );
const { cdxIconArticles } = require( '../icons.json' );

const namespaceClient = require( '../searchClients/NamespaceSearchClient.js' );

/**
 * @param {NamespaceResult} nsResult
 * @return {CommandPaletteItem}
 */
function adaptNamespaceResult( nsResult ) {
	return {
		id: nsResult.value,
		thumbnailIcon: cdxIconArticles,
		type: 'namespace',
		label: nsResult.label,
		value: nsResult.value,
		metadata: [
			{
				label: nsResult.value
			}
		]
	};
}

/**
 * Gets namespace suggestions based on the sub-query by calling the search client.
 *
 * @param {string} subQuery The part of the query after "/ns" or "/ns ", or the ID part (e.g., "1").
 * @return {Promise<Array<NamespaceResult>>} An array of raw namespace suggestion objects { label, value }.
 */
// eslint-disable-next-line es-x/no-async-functions
async function getNamespaceResults( subQuery ) {
	return await namespaceClient.findNamespaces( subQuery );
}

/** @type {CommandHandler} */
module.exports = {
	label: 'Search by Namespace',
	description: 'Type /ns followed by a namespace name or ID',
	getResults: getNamespaceResults,
	adaptResult: adaptNamespaceResult
};
