// @vitest-environment jsdom

const mw = require( '../mocks/mw.js' );
const { createCommandPalette } = require( '../../../resources/skins.citizen.scripts/commandPalette.js' );

const FIXTURE = `
<details id="citizen-search-details">
	<summary id="citizen-search-summary">Search</summary>
</details>
`;

describe( 'createCommandPalette', () => {
	let resolveLoad;
	let rejectLoad;
	let mockOpen;
	let mockClose;
	let mockInitApp;

	beforeEach( () => {
		document.body.innerHTML = FIXTURE;
		mw.loader.load.mockClear();
		mw.loader.using.mockReset();

		mockOpen = vi.fn();
		mockClose = vi.fn();
		mockInitApp = vi.fn().mockReturnValue( { open: mockOpen, close: mockClose } );
		// `mw.loader.using` resolves with a `req` function that returns the
		// loaded module's exports. Mirrors the real MediaWiki API contract
		// and matches the SMW-mode-load pattern in palette init.js.
		const req = vi.fn().mockReturnValue( { initApp: mockInitApp } );
		const usingPromise = new Promise( ( resolve, reject ) => {
			resolveLoad = () => resolve( req );
			rejectLoad = reject;
		} );
		mw.loader.using.mockReturnValue( usingPromise );

		mw.notify = vi.fn();
	} );

	afterEach( () => {
		vi.useRealTimers();
		document.body.innerHTML = '';
	} );

	it( 'triggerOpen from idle calls mw.loader.using and sets details.open', () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();

		cp.triggerOpen();

		const details = document.getElementById( 'citizen-search-details' );
		expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.commandPalette' );
		expect( details.open ).toBe( true );
	} );

	it( 'on resolve, creates an overlay, mounts the palette, and opens it', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();

		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		const overlay = document.getElementById( 'citizen-command-palette-overlay' );
		expect( overlay ).not.toBeNull();
		expect( mockInitApp ).toHaveBeenCalledWith( overlay, expect.objectContaining( {
			prefill: null,
			onClose: expect.any( Function )
		} ) );
		expect( mockOpen ).toHaveBeenCalledWith( null );
	} );

	it( 'forwards prefill text from triggerOpen through to palette.open', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen( 'hello world' );

		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		expect( mockOpen ).toHaveBeenCalledWith( 'hello world' );
	} );

	it( 'on reject, surfaces an mw.notify toast and resets details.open', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();

		rejectLoad( new Error( 'load failed' ) );
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		const details = document.getElementById( 'citizen-search-details' );
		expect( details.open ).toBe( false );
		expect( mw.notify ).toHaveBeenCalledWith(
			expect.any( String ),
			expect.objectContaining( { type: 'error' } )
		);
	} );

	it( 'times out after 10s and surfaces an mw.notify toast', async () => {
		vi.useFakeTimers();
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();

		await vi.advanceTimersByTimeAsync( 10001 );

		expect( mw.notify ).toHaveBeenCalledWith(
			expect.any( String ),
			expect.objectContaining( { type: 'error' } )
		);
	} );

	it( 'on close from inside Vue, resets details.open without snapping the wrapper to display:none', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		const details = document.getElementById( 'citizen-search-details' );
		expect( details.open ).toBe( true );

		// Simulate Vue's close path firing the onClose callback.
		const onCloseArg = mockInitApp.mock.calls[ 0 ][ 1 ].onClose;
		onCloseArg();

		const overlay = document.getElementById( 'citizen-command-palette-overlay' );
		expect( details.open ).toBe( false );
		// Wrapper stays unhidden so Vue's <Transition> leave animation
		// can play to completion before the inner DOM is removed by v-if.
		expect( overlay.hidden ).toBe( false );
	} );

	it( 're-trigger after mounted skips the loader and calls paletteApp.open', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		// Simulate Vue's close path.
		mockInitApp.mock.calls[ 0 ][ 1 ].onClose();

		mw.loader.using.mockClear();
		cp.triggerOpen( 'second' );

		expect( mw.loader.using ).not.toHaveBeenCalled();
		expect( mockOpen ).toHaveBeenCalledWith( 'second' );
	} );

	it( 'cp.close() from mounted state delegates to paletteApp.close', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		cp.close();

		expect( mockClose ).toHaveBeenCalled();
	} );

	it( 'Esc during loading marks the trigger cancelled, mounts silently on resolve', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();

		const details = document.getElementById( 'citizen-search-details' );
		expect( details.open ).toBe( true );

		document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Escape' } ) );
		expect( details.open ).toBe( false );

		// Bundle keeps loading; on resolve the palette mounts but does
		// not auto-open. Subsequent triggerOpen reuses the mounted instance.
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		expect( mockInitApp ).toHaveBeenCalled();
		expect( mockOpen ).not.toHaveBeenCalled();

		// Re-trigger after cancellation: this time it actually opens.
		cp.triggerOpen( 'after-cancel' );
		expect( mockOpen ).toHaveBeenCalledWith( 'after-cancel' );
	} );

	it( 'Esc during loading suppresses the failure toast if load later rejects', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();

		document.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'Escape' } ) );

		rejectLoad( new Error( 'load failed' ) );
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		// User already dismissed — no surprise toast.
		expect( mw.notify ).not.toHaveBeenCalled();
	} );

	it( 'hover on summary fires mw.loader.load via intent prefetch', () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();

		const summary = document.getElementById( 'citizen-search-summary' );
		summary.dispatchEvent( new Event( 'pointerenter' ) );

		expect( mw.loader.load ).toHaveBeenCalledWith( 'skins.citizen.commandPalette' );
	} );

	it( 'click on summary fires triggerOpen and preventDefaults the details toggle', () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();

		const summary = document.getElementById( 'citizen-search-summary' );
		const event = new MouseEvent( 'click', { bubbles: true, cancelable: true } );
		const preventDefaultSpy = vi.spyOn( event, 'preventDefault' );

		summary.dispatchEvent( event );

		expect( preventDefaultSpy ).toHaveBeenCalled();
		expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.commandPalette' );
	} );
} );
