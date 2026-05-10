// @vitest-environment jsdom

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const { ref } = require( 'vue' );

const useResultRouter = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useResultRouter.js'
);

/**
 * Build a minimal but realistic dependency bundle. Each test overrides
 * the bits it cares about and leaves the rest at the defaults.
 *
 * @param {Object} overrides
 * @return {Object}
 */
function makeDeps( overrides = {} ) {
	const orchestrator = {
		activeMode: ref( null ),
		helpVisible: ref( false ),
		query: ref( '' ),
		handleSelection: vi.fn().mockResolvedValue( { action: 'none' } ),
		enterMode: vi.fn(),
		exitMode: vi.fn(),
		pushModeContext: vi.fn(),
		closeHelp: vi.fn(),
		toggleHelp: vi.fn(),
		dismissRecentItem: vi.fn(),
		updateQuery: vi.fn(),
		...( overrides.orchestrator || {} )
	};
	const tokenInput = {
		tokens: ref( [] ),
		freeText: ref( '' ),
		fullQuery: ref( '' ),
		setFreeText: vi.fn(),
		clear: vi.fn(),
		addToken: vi.fn(),
		removeToken: vi.fn(),
		...( overrides.tokenInput || {} )
	};
	const navigation = {
		findModeByQuery: vi.fn(),
		...( overrides.navigation || {} )
	};
	const control = {
		focusInput: vi.fn(),
		close: vi.fn(),
		paletteRoot: ref( null ),
		...( overrides.control || {} )
	};
	const preview = {
		isAvailable: vi.fn().mockReturnValue( false ),
		triggerForAnchor: vi.fn(),
		...( overrides.preview || {} )
	};
	return { orchestrator, tokenInput, navigation, control, preview };
}

beforeEach( () => {
	mw.log.warn.mockClear();
} );

describe( 'useResultRouter — selectResult', () => {
	it( 'calls handleSelection with the result', async () => {
		const deps = makeDeps();
		const { selectResult } = useResultRouter( deps );

		await selectResult( { id: 'foo' } );

		expect( deps.orchestrator.handleSelection ).toHaveBeenCalledWith( { id: 'foo' } );
	} );

	describe( 'navigate', () => {
		it( 'sets window.location.href and closes the palette for keyboard activation', async () => {
			const deps = makeDeps( {
				orchestrator: {
					handleSelection: vi.fn().mockResolvedValue( { action: 'navigate', payload: '/wiki/Foo' } )
				}
			} );
			const setLocation = vi.fn();
			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { set href( v ) { setLocation( v ); } }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( { id: 'foo' } );

			expect( setLocation ).toHaveBeenCalledWith( '/wiki/Foo' );
			expect( deps.control.close ).toHaveBeenCalled();
		} );

		it( 'does not set window.location for mouse clicks (browser already handled the <a>)', async () => {
			const deps = makeDeps( {
				orchestrator: {
					handleSelection: vi.fn().mockResolvedValue( { action: 'navigate', payload: '/wiki/Foo' } )
				}
			} );
			const setLocation = vi.fn();
			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { set href( v ) { setLocation( v ); } }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( { id: 'foo', isMouseClick: true } );

			expect( setLocation ).not.toHaveBeenCalled();
			expect( deps.control.close ).toHaveBeenCalled();
		} );
	} );

	describe( 'navigate with preview', () => {
		it( 'triggers the preview anchor for keyboard activation when available + previewable + non-modifier', async () => {
			const root = document.createElement( 'div' );
			const anchor = document.createElement( 'a' );
			anchor.classList.add( 'citizen-command-palette-list-item--highlighted' );
			const inner = document.createElement( 'a' );
			anchor.appendChild( inner );
			root.appendChild( anchor );

			const deps = makeDeps( {
				orchestrator: {
					handleSelection: vi.fn().mockResolvedValue( { action: 'navigate', payload: '/wiki/Foo' } )
				},
				control: { paletteRoot: ref( root ), focusInput: vi.fn(), close: vi.fn() },
				preview: { isAvailable: vi.fn().mockReturnValue( true ), triggerForAnchor: vi.fn() }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( { previewable: true } );

			expect( deps.preview.triggerForAnchor ).toHaveBeenCalledWith( inner );
			expect( deps.control.close ).not.toHaveBeenCalled();
		} );

		it( 'falls through to navigate when modifierClick is set', async () => {
			const deps = makeDeps( {
				orchestrator: {
					handleSelection: vi.fn().mockResolvedValue( { action: 'navigate', payload: '/wiki/Foo' } )
				},
				preview: { isAvailable: vi.fn().mockReturnValue( true ), triggerForAnchor: vi.fn() }
			} );
			const setLocation = vi.fn();
			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { set href( v ) { setLocation( v ); } }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( { previewable: true, modifierClick: true } );

			expect( deps.preview.triggerForAnchor ).not.toHaveBeenCalled();
			expect( setLocation ).toHaveBeenCalledWith( '/wiki/Foo' );
		} );

		it( 'does not call triggerForAnchor on mouse click (browser already fired one)', async () => {
			const deps = makeDeps( {
				orchestrator: {
					handleSelection: vi.fn().mockResolvedValue( { action: 'navigate', payload: '/wiki/Foo' } )
				},
				control: { paletteRoot: ref( null ), focusInput: vi.fn(), close: vi.fn() },
				preview: { isAvailable: vi.fn().mockReturnValue( true ), triggerForAnchor: vi.fn() }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( { previewable: true, isMouseClick: true } );

			expect( deps.preview.triggerForAnchor ).not.toHaveBeenCalled();
			expect( deps.control.close ).not.toHaveBeenCalled();
		} );

		it( 'keeps the palette open without error when no anchor is found in the DOM', async () => {
			// Pin the no-anchor branch: if the highlighted-row CSS class is
			// renamed in the future, this test catches the silent no-op.
			const root = document.createElement( 'div' );
			const deps = makeDeps( {
				orchestrator: {
					handleSelection: vi.fn().mockResolvedValue( { action: 'navigate', payload: '/wiki/Foo' } )
				},
				control: { paletteRoot: ref( root ), focusInput: vi.fn(), close: vi.fn() },
				preview: { isAvailable: vi.fn().mockReturnValue( true ), triggerForAnchor: vi.fn() }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( { previewable: true } );

			expect( deps.preview.triggerForAnchor ).not.toHaveBeenCalled();
			expect( deps.control.close ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'exitWithQuery', () => {
		it( 'inside a mode, exits and seeds freeText', async () => {
			const deps = makeDeps( {
				orchestrator: {
					activeMode: ref( { id: 'cat' } ),
					handleSelection: vi.fn().mockResolvedValue( { action: 'exitWithQuery', payload: 'Foo:' } ),
					exitMode: vi.fn(),
					helpVisible: ref( false ),
					closeHelp: vi.fn()
				}
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( {} );

			expect( deps.orchestrator.exitMode ).toHaveBeenCalled();
			expect( deps.tokenInput.setFreeText ).toHaveBeenCalledWith( 'Foo:' );
		} );

		it( 'at root, enters a matching mode if found', async () => {
			const matchedMode = { id: 'smw' };
			const deps = makeDeps( {
				orchestrator: {
					activeMode: ref( null ),
					handleSelection: vi.fn().mockResolvedValue( { action: 'exitWithQuery', payload: '/smw:' } )
				},
				navigation: { findModeByQuery: vi.fn().mockReturnValue( { mode: matchedMode } ) }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( {} );

			expect( deps.tokenInput.clear ).toHaveBeenCalled();
			expect( deps.orchestrator.enterMode ).toHaveBeenCalledWith( matchedMode );
		} );

		it( 'at root, closes help before entering mode if help was visible', async () => {
			const deps = makeDeps( {
				orchestrator: {
					activeMode: ref( null ),
					helpVisible: ref( true ),
					handleSelection: vi.fn().mockResolvedValue( { action: 'exitWithQuery', payload: '/smw:' } )
				},
				navigation: { findModeByQuery: vi.fn().mockReturnValue( { mode: { id: 'smw' } } ) }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( {} );

			expect( deps.orchestrator.closeHelp ).toHaveBeenCalled();
		} );

		it( 'at root, no-ops if no matching mode is found', async () => {
			const deps = makeDeps( {
				orchestrator: {
					activeMode: ref( null ),
					handleSelection: vi.fn().mockResolvedValue( { action: 'exitWithQuery', payload: 'random' } )
				},
				navigation: { findModeByQuery: vi.fn().mockReturnValue( null ) }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( {} );

			expect( deps.orchestrator.enterMode ).not.toHaveBeenCalled();
		} );
	} );

	it( 'updateQuery sets freeText', async () => {
		const deps = makeDeps( {
			orchestrator: {
				handleSelection: vi.fn().mockResolvedValue( { action: 'updateQuery', payload: 'foo' } )
			}
		} );

		const { selectResult } = useResultRouter( deps );
		await selectResult( {} );

		expect( deps.tokenInput.setFreeText ).toHaveBeenCalledWith( 'foo' );
	} );

	it( 'addToken adds the token, clears freeText, and forces a query refresh', async () => {
		const deps = makeDeps( {
			orchestrator: {
				handleSelection: vi.fn().mockResolvedValue( { action: 'addToken', payload: { raw: 'Cat:' } } )
			},
			tokenInput: {
				fullQuery: ref( 'Cat: anything' ),
				addToken: vi.fn(),
				setFreeText: vi.fn(),
				clear: vi.fn()
			}
		} );

		const { selectResult } = useResultRouter( deps );
		await selectResult( {} );

		expect( deps.tokenInput.addToken ).toHaveBeenCalledWith( { raw: 'Cat:' } );
		expect( deps.tokenInput.setFreeText ).toHaveBeenCalledWith( '' );
		expect( deps.orchestrator.updateQuery ).toHaveBeenCalledWith( 'Cat: anything' );
	} );

	it( 'pushModeContext pushes and clears tokens', async () => {
		const deps = makeDeps( {
			orchestrator: {
				handleSelection: vi.fn().mockResolvedValue( { action: 'pushModeContext', payload: { title: 'Mammals' } } )
			}
		} );

		const { selectResult } = useResultRouter( deps );
		await selectResult( {} );

		expect( deps.orchestrator.pushModeContext ).toHaveBeenCalledWith( { title: 'Mammals' } );
		expect( deps.tokenInput.clear ).toHaveBeenCalled();
	} );

	it( 'toggleHelp toggles and clears tokens', async () => {
		const deps = makeDeps( {
			orchestrator: {
				handleSelection: vi.fn().mockResolvedValue( { action: 'toggleHelp' } )
			}
		} );

		const { selectResult } = useResultRouter( deps );
		await selectResult( {} );

		expect( deps.orchestrator.toggleHelp ).toHaveBeenCalled();
		expect( deps.tokenInput.clear ).toHaveBeenCalled();
	} );

	it( 'none and unknown actions no-op', async () => {
		const deps = makeDeps( {
			orchestrator: {
				handleSelection: vi.fn().mockResolvedValue( { action: 'none' } )
			}
		} );

		const { selectResult } = useResultRouter( deps );
		await selectResult( {} );

		expect( deps.control.close ).not.toHaveBeenCalled();
		expect( deps.tokenInput.setFreeText ).not.toHaveBeenCalled();
	} );

	describe( 'help auto-dismiss', () => {
		it( 'closes help after a non-toggle/non-navigate/non-exit action when help was visible', async () => {
			const deps = makeDeps( {
				orchestrator: {
					helpVisible: ref( true ),
					handleSelection: vi.fn().mockResolvedValue( { action: 'updateQuery', payload: 'foo' } )
				}
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( {} );

			expect( deps.orchestrator.closeHelp ).toHaveBeenCalled();
		} );

		it( 'does NOT close help on toggleHelp (the toggle handles it)', async () => {
			const deps = makeDeps( {
				orchestrator: {
					helpVisible: ref( true ),
					handleSelection: vi.fn().mockResolvedValue( { action: 'toggleHelp' } )
				}
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( {} );

			expect( deps.orchestrator.closeHelp ).not.toHaveBeenCalled();
		} );

		it( 'does NOT close help on navigate (the palette closes anyway)', async () => {
			const deps = makeDeps( {
				orchestrator: {
					helpVisible: ref( true ),
					handleSelection: vi.fn().mockResolvedValue( { action: 'navigate', payload: '/wiki/Foo' } )
				}
			} );
			Object.defineProperty( window, 'location', {
				configurable: true,
				value: { set href( _v ) {} }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( {} );

			expect( deps.orchestrator.closeHelp ).not.toHaveBeenCalled();
		} );

		it( 'does NOT close help on exitWithQuery (it closed it explicitly before entering mode)', async () => {
			const deps = makeDeps( {
				orchestrator: {
					activeMode: ref( null ),
					helpVisible: ref( true ),
					handleSelection: vi.fn().mockResolvedValue( { action: 'exitWithQuery', payload: '/smw:' } )
				},
				navigation: { findModeByQuery: vi.fn().mockReturnValue( { mode: { id: 'smw' } } ) }
			} );

			const { selectResult } = useResultRouter( deps );
			await selectResult( {} );

			// Closed exactly once (the explicit closeHelp before enterMode), not the auto-dismiss path.
			expect( deps.orchestrator.closeHelp ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );

describe( 'useResultRouter — handleAction', () => {
	it( 'dismiss with itemId calls dismissRecentItem', () => {
		const deps = makeDeps();
		const { handleAction } = useResultRouter( deps );

		handleAction( { type: 'dismiss', itemId: 42 } );

		expect( deps.orchestrator.dismissRecentItem ).toHaveBeenCalledWith( 42 );
	} );

	it( 'dismiss without itemId logs a warning', () => {
		const deps = makeDeps();
		const { handleAction } = useResultRouter( deps );

		handleAction( { type: 'dismiss' } );

		expect( mw.log.warn ).toHaveBeenCalledWith(
			expect.stringContaining( 'Dismiss action missing itemId' ),
			expect.any( Object )
		);
		expect( deps.orchestrator.dismissRecentItem ).not.toHaveBeenCalled();
	} );

	it( 'navigate with url sets location and closes', () => {
		const deps = makeDeps();
		const setLocation = vi.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			value: { set href( v ) { setLocation( v ); } }
		} );
		const { handleAction } = useResultRouter( deps );

		handleAction( { type: 'navigate', url: '/wiki/Foo' } );

		expect( setLocation ).toHaveBeenCalledWith( '/wiki/Foo' );
		expect( deps.control.close ).toHaveBeenCalled();
	} );

	it( 'navigate without url logs a warning', () => {
		const deps = makeDeps();
		const { handleAction } = useResultRouter( deps );

		handleAction( { type: 'navigate' } );

		expect( mw.log.warn ).toHaveBeenCalledWith(
			expect.stringContaining( 'Navigate action missing url' ),
			expect.any( Object )
		);
	} );

	it( 'event no-ops', () => {
		const deps = makeDeps();
		const { handleAction } = useResultRouter( deps );

		handleAction( { type: 'event' } );

		expect( mw.log.warn ).not.toHaveBeenCalled();
	} );

	it( 'unknown type logs a warning', () => {
		const deps = makeDeps();
		const { handleAction } = useResultRouter( deps );

		handleAction( { type: 'unknown' } );

		expect( mw.log.warn ).toHaveBeenCalledWith(
			expect.stringContaining( 'Unknown or missing action type' ),
			expect.any( Object )
		);
	} );
} );
