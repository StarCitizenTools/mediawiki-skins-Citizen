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
	let helpInput;

	beforeEach( () => {
		vi.useFakeTimers();
		const decorator = Object.assign( ( items ) => items, {
			leadActions: () => [],
			trailActions: () => []
		} );
		orchestrator = useProviderOrchestration( [], decorator );
		const tokenInput = useTokenizedInput( () => [], orchestrator.activeMode );
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
} );
