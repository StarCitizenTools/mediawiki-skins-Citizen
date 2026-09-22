const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createPaletteRegistry = require( '../../../../resources/skins.citizen.commandPalette/services/paletteRegistry.js' );
const { createHelpMode, HELP_MODE_ID } = require( '../../../../resources/skins.citizen.commandPalette/modes/help.js' );

describe( 'help mode', () => {
	let registry;
	let helpMode;

	beforeEach( () => {
		registry = createPaletteRegistry();
		registry.register( { id: 'category', triggers: [ '/cat:', '#' ], label: 'Categories', description: 'Search and explore categories', getResults: () => [] } );
		registry.register( { id: 'user', triggers: [ '/user:', '@' ], label: 'Users', description: 'Search for a user', getResults: () => [] } );
		helpMode = createHelpMode( registry );
		registry.register( helpMode );
	} );

	it( 'is a mode opened by /help and ?', () => {
		expect( helpMode.id ).toBe( HELP_MODE_ID );
		expect( helpMode.triggers ).toEqual( [ '/help', '?' ] );
		expect( registry.findModeByTrigger( '?' ) ).toBe( helpMode );
	} );

	it( 'is found by a query that is its trigger', () => {
		expect( registry.findModeByQuery( '?' ) ).toEqual( { mode: helpMode, trigger: '?' } );
		expect( registry.findModeByQuery( '/help' ) ).toEqual( { mode: helpMode, trigger: '/help' } );
	} );

	it( 'lists every other mode, without itself', async () => {
		const items = await helpMode.getResults( '' );

		expect( items.map( ( item ) => item.source ) ).toEqual( [ 'command:category', 'command:user' ] );
	} );

	it( 'narrows the list by what is typed', async () => {
		const items = await helpMode.getResults( 'cat' );

		expect( items.map( ( item ) => item.source ) ).toEqual( [ 'command:category' ] );
	} );

	it( 'describes each mode in the detail pane', async () => {
		const [ category ] = await helpMode.getResults( '#' );

		expect( category.detail.header.label ).toBe( 'Categories' );
		expect( category.detail.pairs[ 0 ].keys ).toEqual( [ '#', '/cat:' ] );
	} );

	it( 'opens the picked mode', async () => {
		const [ category ] = await helpMode.getResults( 'cat' );

		const action = await helpMode.onResultSelect( category );

		expect( action ).toEqual( { action: 'exitWithQuery', payload: '/cat:' } );
	} );

	it( 'filters without the default debounce', () => {
		expect( helpMode.debounceMs ).toBe( 0 );
		expect( helpMode.compactResults ).toBe( true );
	} );

	it( 'shows its own placeholder', () => {
		expect( helpMode.placeholder ).toBe( 'citizen-command-palette-help-placeholder' );
	} );
} );
