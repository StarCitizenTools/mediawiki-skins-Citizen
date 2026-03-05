const { cdxIconEdit, cdxIconUserAvatar, cdxIconUserContributions, cdxIconUserTalk } = require( '../icons.json' );
const config = require( '../config.json' );
const { getNavigationAction } = require( '../utils/providerActions.js' );

/**
 * Creates the user command handler.
 *
 * @param {Function} ApiConstructor The mw.Api constructor.
 * @return {Object} The command handler.
 */
function createUserCommand( ApiConstructor ) {
	const loadedMessageKeys = new Set();

	function getUsefulUserGroups( groups, implicitgroups ) {
		const g = Array.isArray( groups ) ? groups : [];
		const ig = Array.isArray( implicitgroups ) ? implicitgroups : [];
		return g.filter( ( group ) => !ig.includes( group ) );
	}

	function getUserGroupString( groups, implicitgroups ) {
		return getUsefulUserGroups( groups, implicitgroups )
			.map( ( group ) => mw.message( 'group-' + group + '-member' ).text() )
			.join( ', ' );
	}

	function adaptUserResult( apiUser ) {
		return {
			id: 'citizen-command-palette-item-user-' + apiUser.userid,
			thumbnailIcon: cdxIconUserAvatar,
			type: 'user',
			label: apiUser.name,
			description: getUserGroupString( apiUser.groups, apiUser.implicitgroups ),
			url: mw.util.getUrl( 'User:' + apiUser.name ),
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
					url: mw.util.getUrl( 'User_talk:' + apiUser.name )
				},
				{
					id: 'contributions',
					label: mw.message( 'contributions' ).text(),
					icon: cdxIconUserContributions,
					url: mw.util.getUrl( 'Special:Contributions/' + apiUser.name )
				}
			],
			highlightQuery: true
		};
	}

	async function loadUserGroupMessages( api, users ) {
		const safeUsers = Array.isArray( users ) ? users : [];
		const allKeys = safeUsers.flatMap( ( user ) => getUsefulUserGroups( user.groups, user.implicitgroups )
			.map( ( group ) => 'group-' + group + '-member' ) );
		const uniqueKeys = new Set(
			allKeys.filter( ( key ) => !loadedMessageKeys.has( key ) )
		);

		if ( uniqueKeys.size > 0 ) {
			const keysArray = Array.from( uniqueKeys );
			await api.loadMessagesIfMissing( keysArray );
			keysArray.forEach( ( key ) => loadedMessageKeys.add( key ) );
		}
	}

	async function getUserResults( subQuery ) {
		if ( !subQuery || subQuery.trim() === '' ) {
			return [];
		}

		const api = new ApiConstructor();
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
			mw.log.error( '[commandPalette] User search failed:', error );
			return [];
		}
	}

	return {
		id: 'user',
		triggers: [ '/user:', '@' ],
		label: mw.message( 'citizen-command-palette-command-user-label' ).text(),
		description: mw.message( 'citizen-command-palette-command-user-description' ).text(),
		placeholder: mw.message( 'citizen-command-palette-mode-user-placeholder' ).text(),
		icon: cdxIconUserAvatar,
		getResults: getUserResults,
		async onResultSelect( item ) {
			return getNavigationAction( item );
		}
	};
}

module.exports = createUserCommand;
