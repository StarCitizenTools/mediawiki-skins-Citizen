// @vitest-environment jsdom

const { createShare } = require( '../../../resources/skins.citizen.scripts/share.js' );

const FIXTURE = `
<div class="citizen-share-trigger">
	<button type="button" id="citizen-share">
		<span>Share</span>
	</button>
	<dialog id="citizen-share-dialog" class="citizen-share-dialog">
		<div id="citizen-share-dialog-content" class="citizen-share-dialog__content">
			<div class="citizen-share-skeleton" role="status" aria-busy="true" aria-live="polite">
				<div class="citizen-share-skeleton__bar"></div>
			</div>
		</div>
	</dialog>
</div>
`;

describe( 'createShare', () => {
	let mw;
	let resolveLoad;
	let rejectLoad;
	let windowMock;
	let navigatorMock;
	let nativeDialog;
	let initAppMock;

	beforeEach( () => {
		document.body.innerHTML = FIXTURE;
		// jsdom doesn't implement HTMLDialogElement; stub the methods we use.
		nativeDialog = document.getElementById( 'citizen-share-dialog' );
		nativeDialog.showModal = vi.fn( function () {
			this.open = true;
		} );
		nativeDialog.close = vi.fn( function () {
			this.open = false;
		} );

		initAppMock = vi.fn();
		const usingPromise = new Promise( ( resolve, reject ) => {
			resolveLoad = () => resolve( () => ( { initApp: initAppMock } ) );
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

	function setupAndClick() {
		createShare( deps() ).init();
		document.getElementById( 'citizen-share' ).click();
	}

	describe( 'init', () => {
		it( 'no-ops when the trigger button is missing', () => {
			document.body.innerHTML = '';

			expect( () => {
				createShare( deps() ).init();
			} ).not.toThrow();
		} );

		it( 'no-ops when the dialog is missing', () => {
			nativeDialog.remove();

			expect( () => {
				createShare( deps() ).init();
			} ).not.toThrow();
		} );

		it( 'no-ops when the mount point is missing', () => {
			document.getElementById( 'citizen-share-dialog-content' ).remove();

			expect( () => {
				createShare( deps() ).init();
			} ).not.toThrow();
		} );
	} );

	describe( 'intent prefetch', () => {
		it( 'fires mw.loader.load on pointerenter', () => {
			createShare( deps() ).init();
			const trigger = document.getElementById( 'citizen-share' );

			trigger.dispatchEvent( new Event( 'pointerenter' ) );

			expect( mw.loader.load ).toHaveBeenCalledWith( 'skins.citizen.share' );
			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'fires mw.loader.load on focus', () => {
			createShare( deps() ).init();
			const trigger = document.getElementById( 'citizen-share' );

			trigger.dispatchEvent( new Event( 'focus' ) );

			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'fires mw.loader.load on touchstart', () => {
			createShare( deps() ).init();
			const trigger = document.getElementById( 'citizen-share' );

			trigger.dispatchEvent( new Event( 'touchstart' ) );

			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'prefetches at most once across multiple intent events', () => {
			createShare( deps() ).init();
			const trigger = document.getElementById( 'citizen-share' );

			trigger.dispatchEvent( new Event( 'pointerenter' ) );
			trigger.dispatchEvent( new Event( 'focus' ) );
			trigger.dispatchEvent( new Event( 'touchstart' ) );

			expect( mw.loader.load ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'click handler', () => {
		it( 'opens the dialog and starts loading on first click', () => {
			setupAndClick();

			expect( nativeDialog.showModal ).toHaveBeenCalledTimes( 1 );
			expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.share' );
		} );

		it( 'mounts Vue once the bundle resolves', async () => {
			setupAndClick();
			resolveLoad();
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( initAppMock ).toHaveBeenCalledTimes( 1 );
			expect( initAppMock.mock.calls[ 0 ][ 0 ] ).toBe(
				document.getElementById( 'citizen-share-dialog-content' )
			);
		} );

		it( 'reopens the same dialog on subsequent clicks without remounting Vue', async () => {
			setupAndClick();
			resolveLoad();
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			nativeDialog.close();
			document.getElementById( 'citizen-share' ).click();

			expect( nativeDialog.showModal ).toHaveBeenCalledTimes( 2 );
			expect( initAppMock ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'scrolls to top on open when not on the main page', () => {
			setupAndClick();

			expect( windowMock.scrollTo ).toHaveBeenCalledWith( { top: 0, left: 0, behavior: 'auto' } );
		} );

		it( 'skips scroll-to-top on the main page', () => {
			mw.config.get.mockReturnValue( true );
			setupAndClick();

			expect( windowMock.scrollTo ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'backdrop click', () => {
		it( 'closes the dialog when the user clicks the dialog backdrop', () => {
			setupAndClick();

			// Click target === dialog itself means the user clicked the dim area
			// outside the dialog content box.
			nativeDialog.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );

			expect( nativeDialog.close ).toHaveBeenCalled();
		} );

		it( 'does not close when a child element is clicked', () => {
			setupAndClick();

			const child = document.getElementById( 'citizen-share-dialog-content' );
			child.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );

			expect( nativeDialog.close ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'native fallback on load failure', () => {
		it( 'closes the dialog when mw.loader.using rejects', async () => {
			setupAndClick();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( nativeDialog.close ).toHaveBeenCalled();
		} );

		it( 'invokes navigator.share on load failure', async () => {
			setupAndClick();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( navigatorMock.share ).toHaveBeenCalled();
		} );

		it( 'falls back to clipboard when navigator.share is unavailable', async () => {
			delete navigatorMock.share;
			setupAndClick();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( navigatorMock.clipboard.writeText ).toHaveBeenCalled();
			expect( mw.notify ).toHaveBeenCalled();
		} );

		it( 'allows a fresh load attempt after a previous failure', async () => {
			setupAndClick();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			mw.loader.using.mockClear();
			mw.loader.using.mockReturnValue( new Promise( () => {} ) );
			document.getElementById( 'citizen-share' ).click();

			expect( mw.loader.using ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
