// @vitest-environment jsdom
/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;
const icons = require( '../../mocks/commandPaletteIcons.js' );

const userActions = require( '../../../../resources/skins.citizen.commandPalette/utils/userActions.js' );

describe( 'userActions', () => {
	it( 'gives the talk and contributions actions for a user', () => {
		const actions = userActions( 'Alice' );

		expect( actions.map( ( a ) => [ a.id, a.url, a.icon ] ) ).toEqual( [
			[ 'talk', '/wiki/User_talk:Alice', icons.cdxIconUserTalk ],
			[ 'contributions', '/wiki/Special:Contributions/Alice', icons.cdxIconUserContributions ]
		] );
	} );
} );
