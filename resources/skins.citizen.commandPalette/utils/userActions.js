const { cdxIconUserContributions, cdxIconUserTalk } = require( '../icons.json' );

/**
 * The talk and contributions actions for a user.
 *
 * @param {string} name User name.
 * @return {import('../types.js').CommandPaletteItemAction[]}
 */
function userActions( name ) {
	return [
		{
			id: 'talk',
			label: mw.message( 'talk' ).text(),
			icon: cdxIconUserTalk,
			url: mw.util.getUrl( 'User_talk:' + name )
		},
		{
			id: 'contributions',
			label: mw.message( 'contributions' ).text(),
			icon: cdxIconUserContributions,
			url: mw.util.getUrl( 'Special:Contributions/' + name )
		}
	];
}

module.exports = userActions;
