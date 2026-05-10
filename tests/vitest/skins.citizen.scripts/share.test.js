// @vitest-environment jsdom

const { createShare } = require( '../../../resources/skins.citizen.scripts/share.js' );

const PANEL_FIXTURE = `
<div class="citizen-share-trigger">
	<button type="button" id="citizen-share">
		<span>Share</span>
	</button>
	<dialog id="citizen-share-dialog" class="citizen-share-dialog">
		<div id="citizen-share-dialog-content" class="citizen-share-dialog__content">
			<div class="citizen-share-skeleton"></div>
		</div>
	</dialog>
</div>
`;

const NATIVE_FIXTURE = `
<div class="citizen-share-trigger">
	<button type="button" id="citizen-share">
		<span>Share</span>
	</button>
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
		document.body.innerHTML = PANEL_FIXTURE;
		nativeDialog = document.getElementById( 'citizen-share-dialog' );
		// jsdom doesn't implement HTMLDialogElement; stub the methods we use.
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
			location: { href: 'https://example.com/page' },
			navigator: undefined
		};
		navigatorMock = {
			share: vi.fn().mockResolvedValue( undefined ),
			clipboard: { writeText: vi.fn().mockResolvedValue( undefined ) }
		};
		windowMock.navigator = navigatorMock;
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	} );

	function deps( mode ) {
		return { document, window: windowMock, mw, navigator: navigatorMock, mode };
	}

	function click() {
		document.getElementById( 'citizen-share' ).click();
	}

	describe( 'init', () => {
		it( 'no-ops when the trigger button is missing', () => {
			document.body.innerHTML = '';

			expect( () => {
				createShare( deps( 'auto' ) ).init();
			} ).not.toThrow();
		} );
	} );

	describe( 'mode: native', () => {
		beforeEach( () => {
			document.body.innerHTML = NATIVE_FIXTURE;
		} );

		it( 'calls navigator.share on click', async () => {
			createShare( deps( 'native' ) ).init();
			click();
			await Promise.resolve();

			expect( navigatorMock.share ).toHaveBeenCalled();
		} );

		it( 'falls back to clipboard when navigator.share is unavailable', async () => {
			delete navigatorMock.share;
			createShare( deps( 'native' ) ).init();
			click();
			await Promise.resolve();
			await Promise.resolve();

			expect( navigatorMock.clipboard.writeText ).toHaveBeenCalled();
			expect( mw.notify ).toHaveBeenCalled();
		} );

		it( 'does not bind intent prefetch', () => {
			createShare( deps( 'native' ) ).init();
			const trigger = document.getElementById( 'citizen-share' );

			trigger.dispatchEvent( new Event( 'pointerenter' ) );

			expect( mw.loader.load ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'mode: panel', () => {
		it( 'prefetches on intent', () => {
			createShare( deps( 'panel' ) ).init();
			const trigger = document.getElementById( 'citizen-share' );

			trigger.dispatchEvent( new Event( 'pointerenter' ) );

			expect( mw.loader.load ).toHaveBeenCalledWith( 'skins.citizen.share' );
		} );

		it( 'opens the dialog on click, even when navigator.share exists', () => {
			createShare( deps( 'panel' ) ).init();
			click();

			expect( nativeDialog.showModal ).toHaveBeenCalled();
			expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.share' );
			expect( navigatorMock.share ).not.toHaveBeenCalled();
		} );

		it( 'mounts Vue once the bundle resolves', async () => {
			createShare( deps( 'panel' ) ).init();
			click();
			resolveLoad();
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( initAppMock ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'reopens the same dialog on subsequent clicks without remounting Vue', async () => {
			createShare( deps( 'panel' ) ).init();
			click();
			resolveLoad();
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			nativeDialog.close();

			click();

			expect( nativeDialog.showModal ).toHaveBeenCalledTimes( 2 );
			expect( initAppMock ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'falls back to native share when the bundle fails to load', async () => {
			createShare( deps( 'panel' ) ).init();
			click();
			rejectLoad( new Error( 'network' ) );
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( nativeDialog.close ).toHaveBeenCalled();
			expect( navigatorMock.share ).toHaveBeenCalled();
		} );
	} );

	describe( 'mode: auto', () => {
		it( 'uses navigator.share when available', async () => {
			createShare( deps( 'auto' ) ).init();
			click();
			await Promise.resolve();

			expect( navigatorMock.share ).toHaveBeenCalled();
			expect( nativeDialog.showModal ).not.toHaveBeenCalled();
		} );

		it( 'opens the panel when navigator.share is unavailable', () => {
			delete navigatorMock.share;
			createShare( deps( 'auto' ) ).init();
			click();

			expect( nativeDialog.showModal ).toHaveBeenCalled();
			expect( mw.loader.using ).toHaveBeenCalled();
		} );

		it( 'prefetches the panel bundle in case fallback is needed', () => {
			createShare( deps( 'auto' ) ).init();
			const trigger = document.getElementById( 'citizen-share' );

			trigger.dispatchEvent( new Event( 'pointerenter' ) );

			expect( mw.loader.load ).toHaveBeenCalledWith( 'skins.citizen.share' );
		} );
	} );

	describe( 'mode: default (omitted)', () => {
		it( 'behaves like auto', async () => {
			createShare( { document, window: windowMock, mw, navigator: navigatorMock } ).init();
			click();
			await Promise.resolve();

			expect( navigatorMock.share ).toHaveBeenCalled();
		} );
	} );

	describe( 'backdrop click', () => {
		it( 'closes the dialog when the user clicks the dialog backdrop', () => {
			createShare( deps( 'panel' ) ).init();
			click();

			nativeDialog.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );

			expect( nativeDialog.close ).toHaveBeenCalled();
		} );

		it( 'does not close when a child element is clicked', () => {
			createShare( deps( 'panel' ) ).init();
			click();

			const child = document.getElementById( 'citizen-share-dialog-content' );
			child.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );

			expect( nativeDialog.close ).not.toHaveBeenCalled();
		} );
	} );

} );
