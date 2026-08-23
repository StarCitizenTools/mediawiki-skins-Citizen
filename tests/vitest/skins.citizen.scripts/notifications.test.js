// @vitest-environment jsdom

const { createNotifications } = require( '../../../resources/skins.citizen.scripts/notifications.js' );
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

// Mirrors Notifications.mustache: a dropdown with a summary trigger and a card
// whose content holds the placeholder frame (header, rows, footer) and the
// hidden error block.
const FIXTURE = `
<div class="citizen-dropdown">
	<details id="citizen-notifications-details" class="citizen-dropdown-details">
		<summary class="citizen-dropdown-summary citizen-notifications-button" data-counter-text="1">Notifications</summary>
	</details>
	<div id="citizen-notifications-dropdown__card" class="citizen-menu__card">
		<div class="citizen-menu__card-content">
			<div id="citizen-notifications-content" class="citizen-notifications">
				<div class="citizen-notifications__placeholder">
					<div class="citizen-notifications__placeholder-header">
						<h2 class="citizen-notifications__placeholder-title">Notifications</h2>
					</div>
					<div class="citizen-notifications__placeholder-body">
						<div class="citizen-notifications__placeholder-item"></div>
					</div>
					<div class="citizen-notifications__error" hidden>
						<button class="citizen-notifications__retry" type="button">Retry</button>
					</div>
					<footer class="citizen-notifications__placeholder-footer">
						<a class="citizen-notifications__placeholder-history" href="/wiki/Special:Notifications">See all</a>
						<a class="citizen-notifications__placeholder-prefs" href="/wiki/Special:Preferences#mw-prefsection-echo">Preferences</a>
					</footer>
				</div>
			</div>
		</div>
	</div>
</div>`;

let mockApp;
let mockRefresh;
let mockMarkSeen;
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

/**
 * Fire an intent event on the bell.
 *
 * @param {string} type
 */
function intent( type ) {
	document.querySelector( '.citizen-dropdown-summary' )
		.dispatchEvent( new Event( type ) );
}

// The preview the error stands in for; the frame around it stays put.
function preview() {
	return document.querySelector( '.citizen-notifications__placeholder-body' );
}

function footerLinks() {
	return Array.from(
		document.querySelectorAll( '.citizen-notifications__placeholder-footer a' )
	);
}

beforeEach( () => {
	document.body.innerHTML = FIXTURE;
	mw.loader.load.mockClear();
	mw.loader.using.mockReset();
	mw.requestIdleCallback.mockClear();

	mockRefresh = vi.fn();
	mockMarkSeen = vi.fn();
	mockApp = { refresh: mockRefresh, markSeen: mockMarkSeen };
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

	it( 'mounts the panel on pointer intent, before the card is opened', async () => {
		setup();

		intent( 'pointerenter' );
		resolveLoad();
		await tick();

		expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.notifications' );
		expect( mockInitApp ).toHaveBeenCalledTimes( 1 );
		expect( document.getElementById( 'citizen-notifications-details' ).open ).toBe( false );
	} );

	it( 'defers a pointer-intent mount to idle', async () => {
		setup();

		intent( 'pointerenter' );
		resolveLoad();
		await tick();

		expect( mw.requestIdleCallback ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'mounts synchronously on touch intent, where an idle callback would lose the race', async () => {
		setup();

		intent( 'touchstart' );
		resolveLoad();
		await tick();

		expect( mockInitApp ).toHaveBeenCalledTimes( 1 );
		expect( mw.requestIdleCallback ).not.toHaveBeenCalled();
	} );

	it( 'does not mark the streams seen on intent alone', async () => {
		setup();

		intent( 'pointerenter' );
		resolveLoad();
		await tick();

		expect( mockMarkSeen ).not.toHaveBeenCalled();

		await setOpen( true );

		expect( mockMarkSeen ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'refreshes the already-mounted panel when opened after intent', async () => {
		setup();

		intent( 'pointerenter' );
		resolveLoad();
		await tick();
		await setOpen( true );

		expect( mw.loader.using.mock.calls.filter( ( [ name ] ) => name !== 'vue' ) ).toHaveLength( 1 );
		expect( mockRefresh ).toHaveBeenCalledTimes( 1 );
	} );

	// The two halves of the `app || loading` guard on the deferred mount, one
	// test each: a click can beat the intent mount, or be beaten by it.
	it( 'mounts once when a click beats the intent-driven mount', async () => {
		setup();

		intent( 'pointerenter' );
		// The card opens while the module is still in flight, so the click path
		// takes over the mount the intent path had queued.
		await setOpen( true );
		resolveLoad();
		await tick();

		expect( mockInitApp ).toHaveBeenCalledTimes( 1 );
		expect( mockMarkSeen ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'mounts once when the idle mount lands after a click already mounted', async () => {
		// Hold the idle callback rather than running it inline, so the deferred
		// mount genuinely lands after the click-driven one.
		let idleCallback = null;
		mw.requestIdleCallback.mockImplementationOnce( ( fn ) => {
			idleCallback = fn;
		} );
		setup();

		intent( 'pointerenter' );
		await setOpen( true );
		resolveLoad();
		await tick();

		expect( mockInitApp ).toHaveBeenCalledTimes( 1 );

		// `loading` is back to false by now, so only the mounted app itself can
		// stop this second mount.
		idleCallback();

		expect( mockInitApp ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'lazy-loads and mounts the panel into the card on first open', async () => {
		setup();

		await setOpen( true );
		expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.notifications' );
		// Placeholder revealed while loading.
		expect( preview().hidden ).toBe( false );

		resolveLoad();
		await tick();

		const contentEl = document.getElementById( 'citizen-notifications-content' );
		expect( mockInitApp ).toHaveBeenCalledWith( contentEl, expect.objectContaining( {
			onCountsChange: expect.any( Function )
		} ) );
		expect( mockMarkSeen ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'hands the panel the unread count the server rendered', async () => {
		setup();

		await setOpen( true );
		resolveLoad();
		await tick();

		expect( mockInitApp.mock.calls[ 0 ][ 1 ].initialCount ).toBe( 1 );
	} );

	it( 'reports an unknown count as null rather than guessing', async () => {
		// Markup cached before the counter attribute existed.
		document.querySelector( '.citizen-dropdown-summary' )
			.removeAttribute( 'data-counter-text' );
		setup();

		await setOpen( true );
		resolveLoad();
		await tick();

		expect( mockInitApp.mock.calls[ 0 ][ 1 ].initialCount ).toBeNull();
	} );

	it( 'refreshes instead of reloading on subsequent opens', async () => {
		setup();

		await setOpen( true );
		resolveLoad();
		await tick();
		expect( mw.loader.using.mock.calls.filter( ( [ name ] ) => name !== 'vue' ) ).toHaveLength( 1 );

		await setOpen( false );
		await setOpen( true );

		expect( mw.loader.using.mock.calls.filter( ( [ name ] ) => name !== 'vue' ) ).toHaveLength( 1 );
		expect( mockRefresh ).toHaveBeenCalledTimes( 1 );
		expect( mockMarkSeen ).toHaveBeenCalledTimes( 2 );
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
		expect( preview().hidden ).toBe( true );

		// Retry re-attempts the load.
		document.querySelector( '.citizen-notifications__retry' ).click();
		expect( mw.loader.using.mock.calls.filter( ( [ name ] ) => name !== 'vue' ) ).toHaveLength( 2 );
	} );

	it( 'keeps the footer links reachable when the module fails to load', async () => {
		setup();

		await setOpen( true );
		rejectLoad();
		await tick();

		// The error replaces the preview, not the frame around it: with the
		// module unreachable these links are the only way left to get to the
		// notifications and preferences pages.
		const links = footerLinks();
		expect( links.length ).toBeGreaterThan( 0 );
		links.forEach( ( link ) => {
			expect( link.closest( '[hidden]' ) ).toBeNull();
		} );
	} );

	it( 'stays silent when an intent-driven load fails', async () => {
		setup();

		intent( 'pointerenter' );
		rejectLoad();
		await tick();

		// Nothing was asked for yet, so the error block stays hidden; the
		// click path owns surfacing it.
		expect( document.querySelector( '.citizen-notifications__error' ).hidden ).toBe( true );
		expect( preview().hidden ).toBe( false );
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
		// A mount that never completed must not be marked seen.
		expect( mockMarkSeen ).not.toHaveBeenCalled();

		// `loading` was reset, so reopening re-attempts the load (not a no-op).
		mw.loader.using.mockReturnValue( Promise.resolve(
			vi.fn().mockReturnValue( { initApp: mockInitApp } )
		) );
		await setOpen( false );
		await setOpen( true );

		expect( mw.loader.using.mock.calls.filter( ( [ name ] ) => name !== 'vue' ) ).toHaveLength( 2 );
	} );
} );
