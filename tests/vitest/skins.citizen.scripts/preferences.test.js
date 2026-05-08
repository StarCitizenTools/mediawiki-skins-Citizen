// @vitest-environment jsdom

const { createPreferences } = require( '../../../resources/skins.citizen.scripts/preferences.js' );

const FIXTURE = `
<div class="citizen-preferences-dropdown">
	<details id="citizen-preferences-details">
		<summary class="citizen-dropdown-summary">
			<span>Preferences</span>
		</summary>
	</details>
	<div id="citizen-preferences-dropdown__card">
		<div class="citizen-menu__card-content">
			<div id="citizen-preferences-content" class="citizen-preferences">
				<div class="citizen-preferences-skeleton" role="status" aria-busy="true" aria-live="polite">
					<div class="citizen-preferences-skeleton__heading"></div>
					<div class="citizen-preferences-skeleton__row">
						<div class="citizen-preferences-skeleton__label"></div>
						<div class="citizen-preferences-skeleton__description"></div>
					</div>
				</div>
				<div class="citizen-preferences-error" role="alert" hidden>
					<p class="citizen-preferences-error__message">Couldn't load.</p>
					<button class="cdx-button citizen-preferences-error__retry" type="button">Retry</button>
				</div>
			</div>
		</div>
	</div>
</div>
`;

describe( 'createPreferences', () => {
	let mw;
	let resolveLoad;
	let rejectLoad;

	beforeEach( () => {
		document.body.innerHTML = FIXTURE;
		const usingPromise = new Promise( ( resolve, reject ) => {
			resolveLoad = resolve;
			rejectLoad = reject;
		} );
		mw = {
			loader: {
				load: vi.fn(),
				using: vi.fn().mockReturnValue( usingPromise )
			}
		};
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		vi.useRealTimers();
		vi.restoreAllMocks();
	} );

	function setupAndOpen() {
		createPreferences( { document, mw } ).init();
		const details = document.getElementById( 'citizen-preferences-details' );
		// Override .open via a data property so we don't trigger jsdom's
		// native toggle dispatch (which queues a microtask that conflicts
		// with both fake timers and our manual dispatch).
		Object.defineProperty( details, 'open', { value: true, configurable: true } );
		details.dispatchEvent( new Event( 'toggle' ) );
		return details;
	}

	describe( 'init', () => {
		it( 'no-ops when the details element is missing', () => {
			document.body.innerHTML = '';

			expect( () => {
				createPreferences( { document, mw } ).init();
			} ).not.toThrow();
		} );

		it( 'no-ops when the content element is missing', () => {
			document.getElementById( 'citizen-preferences-content' ).remove();

			expect( () => {
				createPreferences( { document, mw } ).init();
			} ).not.toThrow();
		} );

		it( 'no-ops when the summary element is missing', () => {
			document.querySelector( '#citizen-preferences-details summary' ).remove();

			expect( () => {
				createPreferences( { document, mw } ).init();
			} ).not.toThrow();
		} );
	} );

	describe( 'intent prefetch', () => {
		it( 'fires mw.loader.load on pointerenter', () => {
			createPreferences( { document, mw } ).init();
			const summary = document.querySelector( '#citizen-preferences-details summary' );

			summary.dispatchEvent( new Event( 'pointerenter' ) );

			expect( mw.loader.load ).toHaveBeenCalledWith( 'skins.citizen.preferences' );
			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'fires mw.loader.load on focus', () => {
			createPreferences( { document, mw } ).init();
			const summary = document.querySelector( '#citizen-preferences-details summary' );

			summary.dispatchEvent( new Event( 'focus' ) );

			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'fires mw.loader.load on touchstart', () => {
			createPreferences( { document, mw } ).init();
			const summary = document.querySelector( '#citizen-preferences-details summary' );

			summary.dispatchEvent( new Event( 'touchstart' ) );

			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'prefetches at most once across multiple intent events', () => {
			createPreferences( { document, mw } ).init();
			const summary = document.querySelector( '#citizen-preferences-details summary' );

			summary.dispatchEvent( new Event( 'pointerenter' ) );
			summary.dispatchEvent( new Event( 'focus' ) );
			summary.dispatchEvent( new Event( 'touchstart' ) );

			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'toggle handler', () => {
		it( 'calls mw.loader.using when details opens', async () => {
			setupAndOpen();

			expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.preferences' );
		} );

		it( 'does not call mw.loader.using when details remains closed', async () => {
			createPreferences( { document, mw } ).init();
			const details = document.getElementById( 'citizen-preferences-details' );

			details.dispatchEvent( new Event( 'toggle' ) );

			expect( mw.loader.using ).not.toHaveBeenCalled();
		} );

		it( 'shows the skeleton initially', async () => {
			setupAndOpen();

			const skeletonEl = document.querySelector( '.citizen-preferences-skeleton' );
			const errorEl = document.querySelector( '.citizen-preferences-error' );
			expect( skeletonEl.hidden ).toBe( false );
			expect( errorEl.hidden ).toBe( true );
		} );

		it( 'does not call mw.loader.using again while a load is in flight', () => {
			const details = setupAndOpen();

			// Re-open while the original using() promise is still pending.
			Object.defineProperty( details, 'open', { value: false, configurable: true } );
			details.dispatchEvent( new Event( 'toggle' ) );
			Object.defineProperty( details, 'open', { value: true, configurable: true } );
			details.dispatchEvent( new Event( 'toggle' ) );

			expect( mw.loader.using ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'failure recovery', () => {
		it( 'swaps skeleton for error when mw.loader.using rejects', async () => {
			setupAndOpen();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			const skeletonEl = document.querySelector( '.citizen-preferences-skeleton' );
			const errorEl = document.querySelector( '.citizen-preferences-error' );
			expect( skeletonEl.hidden ).toBe( true );
			expect( errorEl.hidden ).toBe( false );
		} );

		it( 'retry button re-invokes the load and re-shows the skeleton', async () => {
			setupAndOpen();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			// Reset using() to a fresh pending promise for the retry call,
			// and reset the call counter so we measure the retry alone.
			mw.loader.using.mockClear();
			mw.loader.using.mockReturnValue( new Promise( () => {} ) );

			const retryBtn = document.querySelector( '.citizen-preferences-error__retry' );
			retryBtn.click();

			expect( mw.loader.using ).toHaveBeenCalledTimes( 1 );
			const skeletonEl = document.querySelector( '.citizen-preferences-skeleton' );
			const errorEl = document.querySelector( '.citizen-preferences-error' );
			expect( skeletonEl.hidden ).toBe( false );
			expect( errorEl.hidden ).toBe( true );
		} );
	} );

	describe( 'success path', () => {
		it( 'does not show the error state after a successful resolve', async () => {
			// Vue mount replaces children in production; we just verify that
			// our code does not show the error state on a successful resolve.
			setupAndOpen();
			resolveLoad();
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			const errorEl = document.querySelector( '.citizen-preferences-error' );
			expect( errorEl.hidden ).toBe( true );
		} );

		it( 'short-circuits subsequent toggles after a successful load', async () => {
			const details = setupAndOpen();
			resolveLoad();
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			mw.loader.using.mockClear();

			Object.defineProperty( details, 'open', { value: false, configurable: true } );
			details.dispatchEvent( new Event( 'toggle' ) );
			Object.defineProperty( details, 'open', { value: true, configurable: true } );
			details.dispatchEvent( new Event( 'toggle' ) );

			expect( mw.loader.using ).not.toHaveBeenCalled();
		} );
	} );
} );
