const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

let helpMode;

beforeEach( () => {
	vi.resetModules();

	helpMode = require(
		'../../../../resources/skins.citizen.commandPalette/modes/help.js'
	);
} );

describe( 'help mode', () => {
	it( 'has stable id "help"', () => {
		expect( helpMode.id ).toBe( 'help' );
	} );

	it( 'declares both /help and ? as triggers', () => {
		expect( helpMode.triggers ).toEqual( [ '/help', '?' ] );
	} );

	it( 'is a command (no getResults)', () => {
		expect( helpMode.getResults ).toBeUndefined();
	} );

	it( 'onResultSelect returns a toggleHelp action', () => {
		const action = helpMode.onResultSelect();

		expect( action ).toEqual( { action: 'toggleHelp' } );
	} );

	it( 'has a label and description', () => {
		expect( typeof helpMode.label ).toBe( 'string' );
		expect( helpMode.label.length ).toBeGreaterThan( 0 );
		expect( typeof helpMode.description ).toBe( 'string' );
		expect( helpMode.description.length ).toBeGreaterThan( 0 );
	} );
} );
