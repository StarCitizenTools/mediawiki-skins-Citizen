/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createAppendQueryActions = require( '../../../../resources/skins.citizen.commandPalette/utils/appendQueryActions.js' );

describe( 'createAppendQueryActions', () => {
	beforeEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'returns items unchanged when query is empty', () => {
		const appendQueryActions = createAppendQueryActions( { isMediaSearchExtensionEnabled: true } );
		const items = [ { id: 'existing-item' } ];

		const result = appendQueryActions( items, '' );

		expect( result ).toBe( items );
	} );

	it( 'appends fulltext search action item', () => {
		const appendQueryActions = createAppendQueryActions( { isMediaSearchExtensionEnabled: false } );

		const result = appendQueryActions( [], 'test query' );

		const fulltextAction = result.find( ( item ) => item.id === 'citizen-command-palette-item-fulltext-search' );
		expect( fulltextAction ).toBeDefined();
		expect( fulltextAction.type ).toBe( 'action' );
		expect( fulltextAction.label ).toBe( 'test query' );
		expect( fulltextAction.source ).toBe( 'queryAction:fulltext-search' );
		expect( fulltextAction.url ).toBe( '/wiki/Special:Search?search=test+query' );
	} );

	it( 'appends media search action when extension is enabled', () => {
		const appendQueryActions = createAppendQueryActions( { isMediaSearchExtensionEnabled: true } );

		const result = appendQueryActions( [], 'cat photos' );

		const mediaAction = result.find( ( item ) => item.id === 'citizen-command-palette-item-media-search' );
		expect( mediaAction ).toBeDefined();
		expect( mediaAction.source ).toBe( 'queryAction:media-search' );
		expect( mediaAction.url ).toBe( '/wiki/Special:MediaSearch?search=cat+photos&type=image' );
	} );

	it( 'does not append media search when extension is disabled', () => {
		const appendQueryActions = createAppendQueryActions( { isMediaSearchExtensionEnabled: false } );

		const result = appendQueryActions( [], 'cat photos' );

		const mediaAction = result.find( ( item ) => item.id === 'citizen-command-palette-item-media-search' );
		expect( mediaAction ).toBeUndefined();
	} );

	it( 'preserves original items at the beginning', () => {
		const appendQueryActions = createAppendQueryActions( { isMediaSearchExtensionEnabled: true } );
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
