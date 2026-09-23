const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const useTokenizedInput = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useTokenizedInput.js'
);
const useProviderOrchestration = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useProviderOrchestration.js'
);
const useHelpInput = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useHelpInput.js'
);

describe( 'useHelpInput', () => {
	const categoryMode = { id: 'category', triggers: [ '#' ], getResults: () => [] };
	const helpMode = { id: 'help', triggers: [ '?' ], getResults: () => [] };
	let orchestrator;
	let tokenInput;
	let helpInput;

	beforeEach( () => {
		vi.useFakeTimers();
		const decorator = Object.assign( ( items ) => items, {
			leadActions: () => [],
			trailActions: () => []
		} );
		orchestrator = useProviderOrchestration( [], decorator );
		tokenInput = useTokenizedInput( () => [], orchestrator.activeMode );
		helpInput = useHelpInput( { orchestrator, tokenInput } );
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	describe( 'helpAvailable', () => {
		it( 'is false at root, where help is a mode of its own', () => {
			expect( helpInput.helpAvailable.value ).toBe( false );
		} );

		it( 'is true inside a mode other than help', () => {
			orchestrator.enterMode( categoryMode );

			expect( helpInput.helpAvailable.value ).toBe( true );
		} );

		it( 'is false inside help mode, which has nothing further to describe', () => {
			orchestrator.enterMode( helpMode );

			expect( helpInput.helpAvailable.value ).toBe( false );
		} );
	} );

	describe( 'handleText', () => {
		it( 'toggles the overlay on a "?" typed into a mode\'s empty input', () => {
			orchestrator.enterMode( categoryMode );

			const consumed = helpInput.handleText( '?' );

			expect( consumed ).toBe( true );
			expect( orchestrator.helpVisible.value ).toBe( true );
		} );

		it( 'closes the overlay on a second "?"', () => {
			orchestrator.enterMode( categoryMode );
			orchestrator.openHelp();

			const consumed = helpInput.handleText( '?' );

			expect( consumed ).toBe( true );
			expect( orchestrator.helpVisible.value ).toBe( false );
		} );

		it( 'closes the overlay and hands other text to the mode', () => {
			orchestrator.enterMode( categoryMode );
			orchestrator.openHelp();

			const consumed = helpInput.handleText( 'a' );

			expect( consumed ).toBe( false );
			expect( orchestrator.helpVisible.value ).toBe( false );
		} );

		it( 'does not fetch the mode\'s empty state for text that brings its own query', async () => {
			const getResults = vi.fn( () => [] );
			orchestrator.enterMode( { id: 'file', triggers: [ '~' ], getResults } );
			orchestrator.openHelp();
			getResults.mockClear();

			helpInput.handleText( 'a' );
			// What App.vue's query watcher does with text handleText passes on.
			orchestrator.updateQuery( 'a' );
			await vi.runAllTimersAsync();

			expect( getResults.mock.calls.map( ( [ query ] ) => query ) ).toEqual( [ 'a' ] );
		} );

		it( 'brings the mode\'s results back when the text empties the input', () => {
			const getResults = vi.fn( () => [] );
			orchestrator.enterMode( { id: 'file', triggers: [ '~' ], getResults } );
			orchestrator.openHelp();
			getResults.mockClear();

			helpInput.handleText( '' );

			expect( orchestrator.helpVisible.value ).toBe( false );
			expect( getResults.mock.calls.map( ( [ query ] ) => query ) ).toEqual( [ '' ] );
		} );

		it( 'leaves "?" alone at root, where help is a mode', () => {
			const consumed = helpInput.handleText( '?' );

			expect( consumed ).toBe( false );
			expect( orchestrator.helpVisible.value ).toBe( false );
		} );

		it( 'leaves "?" alone inside help mode, where it is text', () => {
			orchestrator.enterMode( helpMode );

			const consumed = helpInput.handleText( '?' );

			expect( consumed ).toBe( false );
			expect( orchestrator.helpVisible.value ).toBe( false );
			expect( orchestrator.activeMode.value.id ).toBe( 'help' );
		} );

		it( 'types "?" once the mode has a query', () => {
			orchestrator.enterMode( categoryMode );
			tokenInput.setFreeText( 'what' );

			const consumed = helpInput.handleText( 'what?' );

			expect( consumed ).toBe( false );
			expect( orchestrator.helpVisible.value ).toBe( false );
		} );
	} );
} );
