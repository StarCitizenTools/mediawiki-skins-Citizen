// @vitest-environment jsdom

const { createShare } = require( '../../../resources/skins.citizen.scripts/share.js' );

const FIXTURE = `
<div class="citizen-share-dropdown">
	<details id="citizen-share-details">
		<summary id="citizen-share" class="citizen-dropdown-summary">
			<span>Share</span>
		</summary>
	</details>
	<div id="citizen-share-dropdown__card">
		<div class="citizen-menu__card-content">
			<div id="citizen-share-content" class="citizen-share">
				<div class="citizen-share-skeleton" role="status" aria-busy="true" aria-live="polite">
					<div class="citizen-share-skeleton__bar"></div>
				</div>
			</div>
		</div>
	</div>
</div>
`;

describe( 'createShare', () => {
	let mw;
	let resolveLoad;
	let rejectLoad;
	let windowMock;
	let navigatorMock;

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
			},
			config: {
				get: vi.fn().mockReturnValue( false )
			},
			notify: vi.fn(),
			msg: vi.fn().mockReturnValue( 'URL copied' ),
			log: { error: vi.fn() }
		};
		windowMock = {
			scrollTo: vi.fn(),
			location: { href: 'https://example.com/page' }
		};
		navigatorMock = {
			share: vi.fn().mockResolvedValue( undefined ),
			clipboard: { writeText: vi.fn().mockResolvedValue( undefined ) }
		};
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	} );

	function deps() {
		return { document, window: windowMock, mw, navigator: navigatorMock };
	}

	function setupAndOpen() {
		createShare( deps() ).init();
		const details = document.getElementById( 'citizen-share-details' );
		Object.defineProperty( details, 'open', { value: true, configurable: true, writable: true } );
		details.dispatchEvent( new Event( 'toggle' ) );
		return details;
	}

	describe( 'init', () => {
		it( 'no-ops when the details element is missing', () => {
			document.body.innerHTML = '';

			expect( () => {
				createShare( deps() ).init();
			} ).not.toThrow();
		} );

		it( 'no-ops when the content element is missing', () => {
			document.getElementById( 'citizen-share-content' ).remove();

			expect( () => {
				createShare( deps() ).init();
			} ).not.toThrow();
		} );

		it( 'no-ops when the summary element is missing', () => {
			document.querySelector( '#citizen-share-details summary' ).remove();

			expect( () => {
				createShare( deps() ).init();
			} ).not.toThrow();
		} );
	} );

	describe( 'intent prefetch', () => {
		it( 'fires mw.loader.load on pointerenter', () => {
			createShare( deps() ).init();
			const summary = document.querySelector( '#citizen-share-details summary' );

			summary.dispatchEvent( new Event( 'pointerenter' ) );

			expect( mw.loader.load ).toHaveBeenCalledWith( 'skins.citizen.share' );
			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'fires mw.loader.load on focus', () => {
			createShare( deps() ).init();
			const summary = document.querySelector( '#citizen-share-details summary' );

			summary.dispatchEvent( new Event( 'focus' ) );

			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'fires mw.loader.load on touchstart', () => {
			createShare( deps() ).init();
			const summary = document.querySelector( '#citizen-share-details summary' );

			summary.dispatchEvent( new Event( 'touchstart' ) );

			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'prefetches at most once across multiple intent events', () => {
			createShare( deps() ).init();
			const summary = document.querySelector( '#citizen-share-details summary' );

			summary.dispatchEvent( new Event( 'pointerenter' ) );
			summary.dispatchEvent( new Event( 'focus' ) );
			summary.dispatchEvent( new Event( 'touchstart' ) );

			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'toggle handler', () => {
		it( 'calls mw.loader.using when details opens', () => {
			setupAndOpen();

			expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.share' );
		} );

		it( 'does not call mw.loader.using when details remains closed', () => {
			createShare( deps() ).init();
			const details = document.getElementById( 'citizen-share-details' );

			details.dispatchEvent( new Event( 'toggle' ) );

			expect( mw.loader.using ).not.toHaveBeenCalled();
		} );

		it( 'does not call mw.loader.using again while a load is in flight', () => {
			const details = setupAndOpen();

			Object.defineProperty( details, 'open', { value: false, configurable: true, writable: true } );
			details.dispatchEvent( new Event( 'toggle' ) );
			Object.defineProperty( details, 'open', { value: true, configurable: true, writable: true } );
			details.dispatchEvent( new Event( 'toggle' ) );

			expect( mw.loader.using ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'scrolls to top on open when not on the main page', () => {
			setupAndOpen();

			expect( windowMock.scrollTo ).toHaveBeenCalledWith( { top: 0, left: 0, behavior: 'auto' } );
		} );

		it( 'skips scroll-to-top on the main page', () => {
			mw.config.get.mockReturnValue( true );
			setupAndOpen();

			expect( windowMock.scrollTo ).not.toHaveBeenCalled();
		} );

		it( 'does not scroll when the details element closes', () => {
			createShare( deps() ).init();
			const details = document.getElementById( 'citizen-share-details' );

			details.dispatchEvent( new Event( 'toggle' ) );

			expect( windowMock.scrollTo ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'native fallback on load failure', () => {
		it( 'closes the panel when mw.loader.using rejects', async () => {
			const details = setupAndOpen();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( details.open ).toBe( false );
		} );

		it( 'invokes navigator.share when mw.loader.using rejects', async () => {
			setupAndOpen();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( navigatorMock.share ).toHaveBeenCalled();
		} );

		it( 'falls back to clipboard when navigator.share is unavailable', async () => {
			delete navigatorMock.share;
			setupAndOpen();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( navigatorMock.clipboard.writeText ).toHaveBeenCalled();
			expect( mw.notify ).toHaveBeenCalled();
		} );

		it( 'allows a fresh load attempt after a previous failure', async () => {
			const details = setupAndOpen();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			mw.loader.using.mockClear();
			mw.loader.using.mockReturnValue( new Promise( () => {} ) );
			Object.defineProperty( details, 'open', { value: true, configurable: true, writable: true } );
			details.dispatchEvent( new Event( 'toggle' ) );

			expect( mw.loader.using ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'success path', () => {
		it( 'does not trigger native share on a successful resolve', async () => {
			setupAndOpen();
			resolveLoad();
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( navigatorMock.share ).not.toHaveBeenCalled();
		} );

		it( 'short-circuits subsequent toggles after a successful load', async () => {
			const details = setupAndOpen();
			resolveLoad();
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			mw.loader.using.mockClear();

			Object.defineProperty( details, 'open', { value: false, configurable: true, writable: true } );
			details.dispatchEvent( new Event( 'toggle' ) );
			Object.defineProperty( details, 'open', { value: true, configurable: true, writable: true } );
			details.dispatchEvent( new Event( 'toggle' ) );

			expect( mw.loader.using ).not.toHaveBeenCalled();
		} );
	} );
} );
