// @vitest-environment jsdom

const { createShareNative } = require( '../../../resources/skins.citizen.scripts/shareNative.js' );

const NATIVE_FIXTURE = `
<div class="citizen-share-dropdown">
	<button type="button" id="citizen-share" class="citizen-share">
		<span>Share</span>
	</button>
</div>
`;

const PANEL_FIXTURE = `
<div class="citizen-share-trigger">
	<button type="button" id="citizen-share">
		<span>Share</span>
	</button>
	<dialog id="citizen-share-dialog"></dialog>
</div>
`;

describe( 'createShareNative', () => {
	let mw;
	let windowMock;
	let navigatorMock;

	beforeEach( () => {
		document.body.innerHTML = NATIVE_FIXTURE;
		mw = {
			notify: vi.fn(),
			msg: vi.fn().mockReturnValue( 'URL copied' ),
			log: { error: vi.fn() },
			util: { debounce: ( fn ) => fn }
		};
		windowMock = { location: { href: 'https://example.com/page' } };
		navigatorMock = {
			share: vi.fn().mockResolvedValue( undefined ),
			clipboard: { writeText: vi.fn().mockResolvedValue( undefined ) }
		};
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		vi.restoreAllMocks();
	} );

	describe( 'init', () => {
		it( 'no-ops when the button is missing', () => {
			document.body.innerHTML = '';

			expect( () => {
				createShareNative( { document, window: windowMock, mw, navigator: navigatorMock } ).init();
			} ).not.toThrow();
		} );

		it( 'no-ops when #citizen-share-dialog exists (panel mode owns the click)', () => {
			document.body.innerHTML = PANEL_FIXTURE;

			createShareNative( { document, window: windowMock, mw, navigator: navigatorMock } ).init();
			document.getElementById( 'citizen-share' ).click();

			expect( navigatorMock.share ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'click handler', () => {
		it( 'uses navigator.share when available', async () => {
			createShareNative( { document, window: windowMock, mw, navigator: navigatorMock } ).init();

			document.getElementById( 'citizen-share' ).click();
			await Promise.resolve();

			expect( navigatorMock.share ).toHaveBeenCalled();
			expect( navigatorMock.clipboard.writeText ).not.toHaveBeenCalled();
		} );

		it( 'falls back to clipboard when navigator.share is unavailable', async () => {
			delete navigatorMock.share;
			createShareNative( { document, window: windowMock, mw, navigator: navigatorMock } ).init();

			document.getElementById( 'citizen-share' ).click();
			await Promise.resolve();
			await Promise.resolve();

			expect( navigatorMock.clipboard.writeText ).toHaveBeenCalled();
			expect( mw.notify ).toHaveBeenCalled();
		} );

		it( 'uses the canonical URL when present', async () => {
			const link = document.createElement( 'link' );
			link.rel = 'canonical';
			link.href = 'https://example.com/canonical';
			document.head.appendChild( link );

			createShareNative( { document, window: windowMock, mw, navigator: navigatorMock } ).init();
			document.getElementById( 'citizen-share' ).click();
			await Promise.resolve();

			expect( navigatorMock.share ).toHaveBeenCalledWith( expect.objectContaining( {
				url: 'https://example.com/canonical'
			} ) );
		} );

		it( 'logs share errors without throwing', async () => {
			navigatorMock.share = vi.fn().mockRejectedValue( new Error( 'boom' ) );
			createShareNative( { document, window: windowMock, mw, navigator: navigatorMock } ).init();

			document.getElementById( 'citizen-share' ).click();
			await Promise.resolve();
			await Promise.resolve();

			expect( mw.log.error ).toHaveBeenCalled();
		} );
	} );
} );
