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
	let mockFocus;
	let mockClose;
	let mockInitApp;

	beforeEach( () => {
		document.body.innerHTML = FIXTURE;
		mw.loader.load.mockClear();
		mw.loader.using.mockReset();

		mockOpen = vi.fn();
		mockClose = vi.fn();
		mockFocus = vi.fn();
		mockInitApp = vi.fn().mockReturnValue( {
			open: mockOpen,
			focus: mockFocus,
			close: mockClose
		} );
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
		// Exact match: initApp only reads `onClose`; prefill is delivered
		// via `open()` and must not creep back into the mount options.
		expect( mockInitApp ).toHaveBeenCalledWith( overlay, {
			onClose: expect.any( Function )
		} );
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

	it( 'a repeat trigger on an open palette restores focus without resetting it', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );
		mockOpen.mockClear();

		cp.triggerOpen();

		expect( mockOpen ).not.toHaveBeenCalled();
		expect( mockFocus ).toHaveBeenCalled();
	} );

	it( 'a repeat trigger carrying a prefill still replaces the query', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );
		mockOpen.mockClear();

		cp.triggerOpen( 'Ship:' );

		expect( mockOpen ).toHaveBeenCalledWith( 'Ship:' );
		expect( mockFocus ).not.toHaveBeenCalled();
	} );

	it( 'closing returns focus to the search trigger', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();
		cp.triggerOpen();
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );
		document.body.focus();

		mockInitApp.mock.calls[ 0 ][ 1 ].onClose();

		expect( document.activeElement.id ).toBe( 'citizen-search-summary' );
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

	it( 'hover on summary starts the module load via intent prefetch', () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();

		const summary = document.getElementById( 'citizen-search-summary' );
		summary.dispatchEvent( new Event( 'pointerenter' ) );

		expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.commandPalette' );
	} );

	it( 'hover prefetch mounts the palette at idle without opening it', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();

		const summary = document.getElementById( 'citizen-search-summary' );
		summary.dispatchEvent( new Event( 'pointerenter' ) );
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		// Shared mock runs the idle callback immediately.
		expect( mockInitApp ).toHaveBeenCalled();
		expect( mockOpen ).not.toHaveBeenCalled();
		expect( document.getElementById( 'citizen-search-details' ).open ).toBe( false );
	} );

	it( 'click after an idle mount opens without another loader round-trip', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();

		const summary = document.getElementById( 'citizen-search-summary' );
		summary.dispatchEvent( new Event( 'pointerenter' ) );
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );
		mw.loader.using.mockClear();

		summary.dispatchEvent( new MouseEvent( 'click', { bubbles: true, cancelable: true } ) );

		expect( mw.loader.using ).not.toHaveBeenCalled();
		expect( mockOpen ).toHaveBeenCalledWith( null );
	} );

	it( 'touchstart prefetch loads the module but does not idle-mount', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();

		const summary = document.getElementById( 'citizen-search-summary' );
		summary.dispatchEvent( new Event( 'touchstart' ) );
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.commandPalette' );
		expect( mockInitApp ).not.toHaveBeenCalled();
	} );

	it( 'mounting via the click path disarms the leftover intent listeners', async () => {
		const cp = createCommandPalette( { document, mw } );
		cp.init();

		// Open via click with no prior hover — the intent listeners are
		// still armed when the mount completes.
		const summary = document.getElementById( 'citizen-search-summary' );
		summary.dispatchEvent( new MouseEvent( 'click', { bubbles: true, cancelable: true } ) );
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );
		mw.loader.using.mockClear();

		summary.dispatchEvent( new Event( 'pointerenter' ) );

		expect( mw.loader.using ).not.toHaveBeenCalled();
	} );

	it( 'click before the idle callback fires wins; the idle callback no-ops', async () => {
		let idleCallback = null;
		mw.requestIdleCallback.mockImplementationOnce( ( fn ) => {
			idleCallback = fn;
		} );
		const cp = createCommandPalette( { document, mw } );
		cp.init();

		const summary = document.getElementById( 'citizen-search-summary' );
		summary.dispatchEvent( new Event( 'pointerenter' ) );
		resolveLoad();
		await new Promise( ( r ) => setTimeout( r, 0 ) );

		// Idle callback captured but not yet run — the user clicks first.
		summary.dispatchEvent( new MouseEvent( 'click', { bubbles: true, cancelable: true } ) );
		await new Promise( ( r ) => setTimeout( r, 0 ) );
		expect( mockOpen ).toHaveBeenCalledWith( null );

		idleCallback();

		expect( mockInitApp ).toHaveBeenCalledTimes( 1 );
		expect( mockOpen ).toHaveBeenCalledTimes( 1 );
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
