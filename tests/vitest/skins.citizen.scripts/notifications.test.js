// @vitest-environment jsdom

const { createNotifications } = require( '../../../resources/skins.citizen.scripts/notifications.js' );
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

// Mirrors Notifications.mustache: a dropdown with a summary trigger and a
// card whose content holds the skeleton, hidden error block, and see-all link.
const FIXTURE = `
<div class="citizen-dropdown">
	<details id="citizen-notifications-details" class="citizen-dropdown-details">
		<summary class="citizen-dropdown-summary citizen-notifications-button" data-counter-text="1">Notifications</summary>
	</details>
	<div id="citizen-notifications-dropdown__card" class="citizen-menu__card">
		<div class="citizen-menu__card-content">
			<div id="citizen-notifications-content" class="citizen-notifications">
				<div class="citizen-notifications__skeleton"></div>
				<div class="citizen-notifications__error" hidden>
					<button class="citizen-notifications__retry" type="button">Retry</button>
				</div>
				<a class="citizen-notifications__see-all" href="/wiki/Special:Notifications">See all</a>
			</div>
		</div>
	</div>
</div>`;

let mockApp;
let mockRefresh;
let mockInitApp;
let resolveLoad;
let rejectLoad;

function tick() {
	return new Promise( ( r ) => setTimeout( r, 0 ) );
}

/**
 * Set the details open state and wait for jsdom to fire the `toggle` event
 * (it dispatches asynchronously on `.open` change), which the orchestrator
 * listens for. Awaiting one tick lets that handler run.
 *
 * @param {boolean} open
 * @return {Promise<void>}
 */
function setOpen( open ) {
	document.getElementById( 'citizen-notifications-details' ).open = open;
	return tick();
}

beforeEach( () => {
	document.body.innerHTML = FIXTURE;
	mw.loader.load.mockClear();
	mw.loader.using.mockReset();

	mockRefresh = vi.fn();
	mockApp = { refresh: mockRefresh };
	mockInitApp = vi.fn().mockReturnValue( mockApp );
	const req = vi.fn().mockReturnValue( { initApp: mockInitApp } );
	const usingPromise = new Promise( ( resolve, reject ) => {
		resolveLoad = () => resolve( req );
		rejectLoad = () => reject( new Error( 'load failed' ) );
	} );
	mw.loader.using.mockReturnValue( usingPromise );
} );

afterEach( () => {
	document.body.innerHTML = '';
} );

function setup() {
	const n = createNotifications( { document, mw } );
	n.init();
	return n;
}

describe( 'notifications trigger', () => {
	it( 'no-ops when the dropdown is absent', () => {
		document.body.innerHTML = '';

		expect( () => setup() ).not.toThrow();
		expect( mw.loader.using ).not.toHaveBeenCalled();
	} );

	it( 'prefetches the module on pointer intent over the summary', () => {
		setup();

		document.querySelector( '.citizen-dropdown-summary' )
			.dispatchEvent( new Event( 'pointerenter' ) );

		expect( mw.loader.load ).toHaveBeenCalledWith( 'skins.citizen.notifications' );
	} );

	it( 'lazy-loads and mounts the panel into the card on first open', async () => {
		setup();

		await setOpen( true );
		expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.notifications' );
		// Skeleton revealed while loading.
		expect( document.querySelector( '.citizen-notifications__skeleton' ).hidden ).toBe( false );

		resolveLoad();
		await tick();

		const contentEl = document.getElementById( 'citizen-notifications-content' );
		expect( mockInitApp ).toHaveBeenCalledWith( contentEl, expect.objectContaining( {
			onCountsChange: expect.any( Function )
		} ) );
	} );

	it( 'refreshes instead of reloading on subsequent opens', async () => {
		setup();

		await setOpen( true );
		resolveLoad();
		await tick();
		expect( mw.loader.using ).toHaveBeenCalledTimes( 1 );

		await setOpen( false );
		await setOpen( true );
		expect( mw.loader.using ).toHaveBeenCalledTimes( 1 );
		expect( mockRefresh ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'updates the bell badge when counts change', async () => {
		setup();
		await setOpen( true );
		resolveLoad();
		await tick();

		const onCountsChange = mockInitApp.mock.calls[ 0 ][ 1 ].onCountsChange;
		const summary = document.querySelector( '.citizen-dropdown-summary' );

		onCountsChange( { alert: 1, message: 0, total: 1 } );
		expect( summary.dataset.counterText ).toBe( '1' );

		onCountsChange( { alert: 0, message: 0, total: 0 } );
		expect( summary.dataset.counterText ).toBe( '0' );
	} );

	it( 'shows the error block (with retry) when the module fails to load', async () => {
		setup();

		await setOpen( true );
		rejectLoad();
		await tick();

		expect( document.querySelector( '.citizen-notifications__error' ).hidden ).toBe( false );
		expect( document.querySelector( '.citizen-notifications__skeleton' ).hidden ).toBe( true );

		// Retry re-attempts the load.
		document.querySelector( '.citizen-notifications__retry' ).click();
		expect( mw.loader.using ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'shows the error and stays reopenable when mounting throws', async () => {
		setup();
		mockInitApp.mockImplementationOnce( () => {
			throw new Error( 'mount failed' );
		} );

		await setOpen( true );
		resolveLoad();
		await tick();

		// The thrown mount surfaces the error instead of silently hanging.
		expect( document.querySelector( '.citizen-notifications__error' ).hidden ).toBe( false );

		// `loading` was reset, so reopening re-attempts the load (not a no-op).
		mw.loader.using.mockReturnValue( Promise.resolve(
			vi.fn().mockReturnValue( { initApp: mockInitApp } )
		) );
		await setOpen( false );
		await setOpen( true );

		expect( mw.loader.using ).toHaveBeenCalledTimes( 2 );
	} );
} );
