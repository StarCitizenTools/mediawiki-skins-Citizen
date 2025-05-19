/**
 * Command handler for retrieving user suggestions.
 */
const { CommandPaletteItem, CommandPaletteCommand, CommandPaletteActionResult } = require( '../types.js' );
const { cdxIconEdit, cdxIconUserAvatar, cdxIconUserContributions, cdxIconUserTalk } = require( '../icons.json' );
const config = require( '../config.json' );
const { getNavigationAction } = require( '../utils/providerActions.js' );

/** @type {Set<string>} */
const loadedMessageKeys = new Set();

/**
 * @typedef {Object} UserResult Represents a user object returned by the MediaWiki API.
 * @property {string} name The user's name.
 * @property {number} userid The user's ID.
 * @property {Array<string>} groups The user's groups.
 * @property {Array<string>} implicitgroups The user's implicit groups.
 * @property {number} editcount The user's edit count.
 */

/**
 * Implicit groups are often not useful for the user, so we filter them out.
 *
 * @param {Array<string>|undefined} groups The user's groups.
 * @param {Array<string>|undefined} implicitgroups The user's implicit groups.
 * @return {Array<string>} The filtered list of "useful" groups.
 */
function getUsefulUserGroups( groups, implicitgroups ) {
	const g = Array.isArray( groups ) ? groups : [];
	const ig = Array.isArray( implicitgroups ) ? implicitgroups : [];
	return g.filter( ( group ) => !ig.includes( group ) );
}

/**
 * @param {Array<string>} groups
 * @param {Array<string>} implicitgroups
 * @return {string}
 */
function getUserGroupString( groups, implicitgroups ) {
	return getUsefulUserGroups( groups, implicitgroups )
		.map( ( group ) => mw.message( `group-${ group }-member` ).text() )
		.join( ', ' );
}

/**
 * @param {UserResult} apiUser The user object from the API.
 * @return {CommandPaletteItem}
 */
function adaptUserResult( apiUser ) {
	return {
		id: `citizen-command-palette-item-user-${ apiUser.userid }`,
		thumbnailIcon: cdxIconUserAvatar,
		type: 'user',
		label: apiUser.name,
		description: getUserGroupString( apiUser.groups, apiUser.implicitgroups ),
		url: mw.util.getUrl( `User:${ apiUser.name }` ),
		metadata: [
			{
				label: mw.language.convertNumber( apiUser.editcount ),
				icon: cdxIconEdit
			}
		],
		actions: [
			{
				id: 'talk',
				label: mw.message( 'talk' ).text(),
				icon: cdxIconUserTalk,
				url: mw.util.getUrl( `User_talk:${ apiUser.name }` )
			},
			{
				id: 'contributions',
				label: mw.message( 'contributions' ).text(),
				icon: cdxIconUserContributions,
				url: mw.util.getUrl( `Special:Contributions/${ apiUser.name }` )
			}
		],
		highlightQuery: true
	};
}

/**
 * Ensures that all necessary i18n messages for user groups are loaded.
 *
 * @param {mw.Api} api The mw.Api instance.
 * @param {Array<UserResult>} users Array of user objects from the API.
 * @return {Promise<void>}
 */
async function loadUserGroupMessages( api, users ) {
	const safeUsers = Array.isArray( users ) ? users : [];

	const allMessageKeysFromUsefulGroups = safeUsers.flatMap( ( user ) => getUsefulUserGroups(
		user.groups,
		user.implicitgroups
	).map( ( group ) => `group-${ group }-member` ) );

	const uniqueMessageKeysToFetch = new Set(
		allMessageKeysFromUsefulGroups.filter( ( key ) => !loadedMessageKeys.has( key ) )
	);

	if ( uniqueMessageKeysToFetch.size > 0 ) {
		const keysArray = Array.from( uniqueMessageKeysToFetch );
		await api.loadMessagesIfMissing( keysArray );
		keysArray.forEach( ( key ) => loadedMessageKeys.add( key ) );
	}
}

/**
 * Gets user suggestions based on the sub-query by calling the MediaWiki API.
 *
 * @param {string} subQuery The part of the query after "/user:" or "@", used as the prefix.
 * @return {Promise<Array<CommandPaletteItem>>} A promise resolving to an array of adapted user items.
 */
async function getUserResults( subQuery ) {
	if ( !subQuery || subQuery.trim() === '' ) {
		return [];
	}

	const api = new mw.Api();
	try {
		const data = await api.get( {
			action: 'query',
			format: 'json',
			list: 'allusers',
			auprefix: subQuery,
			aulimit: 10,
			auprop: 'editcount|groups|implicitgroups',
			maxage: config.wgSearchSuggestCacheExpiry,
			smaxage: config.wgSearchSuggestCacheExpiry
		} );

		if ( !data?.query?.allusers?.length ) {
			return [];
		}

		const usersFromApi = data.query.allusers;

		await loadUserGroupMessages( api, usersFromApi );

		return usersFromApi.map( adaptUserResult );
	} catch ( error ) {
		return [];
	}
}

/** @type {CommandPaletteCommand} */
module.exports = {
	id: 'user',
	triggers: [ '/user:', '@' ],
	label: mw.message( 'citizen-command-palette-command-user-label' ).text(),
	description: mw.message( 'citizen-command-palette-command-user-description' ).text(),
	getResults: getUserResults,
	/**
	 * Handles selection of a user result item.
	 *
	 * @param {CommandPaletteItem} item The selected user result item.
	 * @return {Promise<CommandPaletteActionResult>}
	 */
	async onResultSelect( item ) {
		return getNavigationAction( item );
	}
};
