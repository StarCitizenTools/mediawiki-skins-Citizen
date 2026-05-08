/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createAppendQueryActions = require( '../../../../resources/skins.citizen.commandPalette/utils/appendQueryActions.js' );

describe( 'createAppendQueryActions', () => {
	beforeEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'returns items unchanged when query is empty', () => {
		const appendQueryActions = createAppendQueryActions();
		const items = [ { id: 'existing-item' } ];

		const result = appendQueryActions( items, '' );

		expect( result ).toBe( items );
	} );

	it( 'appends fulltext search action item', () => {
		const appendQueryActions = createAppendQueryActions();

		const result = appendQueryActions( [], 'test query' );

		const fulltextAction = result.find( ( item ) => item.id === 'citizen-command-palette-item-fulltext-search' );
		expect( fulltextAction ).toBeDefined();
		expect( fulltextAction.type ).toBe( 'action' );
		expect( fulltextAction.label ).toBe( 'test query' );
		expect( fulltextAction.source ).toBe( 'queryAction:fulltext-search' );
		expect( fulltextAction.url ).toBe( '/wiki/Special:Search?search=test+query' );
	} );

	it( 'no longer emits the media-search action (handled by the file mode now)', () => {
		const appendQueryActions = createAppendQueryActions();

		const result = appendQueryActions( [], 'cat photos' );

		const mediaAction = result.find( ( item ) => item.id === 'citizen-command-palette-item-media-search' );
		expect( mediaAction ).toBeUndefined();
	} );

	it( 'preserves original items at the beginning', () => {
		const appendQueryActions = createAppendQueryActions();
		const originalItems = [
			{ id: 'first-item', label: 'First' },
			{ id: 'second-item', label: 'Second' }
		];

		const result = appendQueryActions( originalItems, 'query' );

		expect( result[ 0 ] ).toEqual( originalItems[ 0 ] );
		expect( result[ 1 ] ).toEqual( originalItems[ 1 ] );
		expect( result.length ).toBeGreaterThan( originalItems.length );
	} );
} );
