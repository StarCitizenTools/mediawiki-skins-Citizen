// @vitest-environment jsdom

const { mount, flushPromises } = require( '@vue/test-utils' );
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

// Stub Codex components used by App.vue
mw.loader.require = vi.fn( () => ( {
	CdxButton: {
		name: 'CdxButton',
		template: '<button :aria-label="ariaLabel" :disabled="disabled" @click="$emit(\'click\', $event)"><slot /></button>',
		props: [ 'disabled', 'weight', 'size', 'ariaLabel' ],
		emits: [ 'click' ]
	},
	CdxIcon: { name: 'CdxIcon', template: '<span class="cdx-icon"></span>', props: [ 'icon' ] },
	CdxTextInput: {
		name: 'CdxTextInput',
		// Bind `value` via `.attr` so wrapper.attributes('value') returns the
		// current model value in jsdom — Vue normally sets only the DOM
		// property for <input value>.
		template: '<input :value.attr="modelValue" />',
		props: [ 'modelValue', 'readonly' ]
	}
} ) );

const PAGE_URL_ATTR = 'https://wiki.example/wiki/Page';
const SHORT_URL = 'https://w.example/s/3';

let App;
let writeText;

beforeAll( async () => {
	delete window.location;
	window.location = {
		protocol: 'https:',
		host: 'wiki.example',
		pathname: '/wiki/Page',
		search: ''
	};
	document.title = 'Page';
	writeText = vi.fn().mockResolvedValue( undefined );
	Object.defineProperty( navigator, 'clipboard', {
		configurable: true,
		value: { writeText }
	} );
	const mod = await import( '../../../resources/skins.citizen.share/App.vue' );
	App = mod.default;
} );

function mountApp(
	urlShortener = { available: false, qrAvailable: false },
	services = []
) {
	return mount( App, {
		global: {
			provide: {
				shareServiceOptions: services,
				urlShortenerConfig: urlShortener
			}
		}
	} );
}

function mockApi( response ) {
	const post = vi.fn().mockResolvedValue( response );
	mw.Api = vi.fn( function () {
		this.post = post;
	} );
	return post;
}

function mockApiRejection( reason ) {
	const post = vi.fn().mockRejectedValue( reason );
	mw.Api = vi.fn( function () {
		this.post = post;
	} );
	return post;
}

afterEach( () => {
	// `mw.notify` and `navigator.clipboard.writeText` are shared `vi.fn()`s
	// from the mw mock / beforeAll setup — `restoreAllMocks` won't reset
	// their call histories, so clear them explicitly between tests.
	mw.notify.mockClear();
	writeText.mockClear();
	vi.restoreAllMocks();
} );

describe( 'App.vue — UrlShortener disabled', () => {
	it( 'renders the copy field but no short-URL or QR buttons', () => {
		const wrapper = mountApp();

		expect( wrapper.find( 'input' ).exists() ).toBe( true );
		expect( wrapper.text() ).not.toContain( 'citizen-share-copy-short-url' );
		expect( wrapper.text() ).not.toContain( 'citizen-share-show-qr' );
	} );

	it( 'copy-link button always writes the canonical page URL', async () => {
		const wrapper = mountApp();

		await wrapper.findAll( 'button' )
			.find( ( b ) => b.attributes( 'aria-label' ) === 'citizen-share-copy-link' )
			.trigger( 'click' );
		await flushPromises();

		expect( writeText ).toHaveBeenCalledWith( PAGE_URL_ATTR );
	} );
} );

describe( 'App.vue — Copy short URL button', () => {
	it( 'renders the button when UrlShortener is available', () => {
		const wrapper = mountApp( { available: true, qrAvailable: false } );

		expect( wrapper.text() ).toContain( 'citizen-share-copy-short-url' );
	} );

	it( 'writes the fetched short URL to the clipboard on click', async () => {
		mockApi( { shortenurl: { shorturl: SHORT_URL } } );
		const wrapper = mountApp( { available: true, qrAvailable: false } );

		await wrapper.findAll( 'button' )
			.find( ( b ) => b.text().includes( 'citizen-share-copy-short-url' ) )
			.trigger( 'click' );
		await flushPromises();

		expect( writeText ).toHaveBeenCalledWith( SHORT_URL );
		// The button label flips to the confirmation while the timer is running.
		expect( wrapper.text() ).toContain( 'citizen-share-short-url-copied' );
		// The copy-link field stays showing the long URL throughout.
		expect( wrapper.find( 'input' ).attributes( 'value' ) ).toBe( PAGE_URL_ATTR );
	} );

	it( 'serves from cache on a second click', async () => {
		const post = mockApi( { shortenurl: { shorturl: SHORT_URL } } );
		const wrapper = mountApp( { available: true, qrAvailable: false } );

		const button = () => wrapper.findAll( 'button' )
			.find( ( b ) => b.text().includes( 'citizen-share-copy-short-url' ) ||
				b.text().includes( 'citizen-share-short-url-copied' ) );

		await button().trigger( 'click' );
		await flushPromises();
		await button().trigger( 'click' );
		await flushPromises();

		expect( post ).toHaveBeenCalledTimes( 1 );
		expect( writeText ).toHaveBeenCalledTimes( 2 );
		expect( writeText ).toHaveBeenLastCalledWith( SHORT_URL );
	} );

	it( 'disables the button while the fetch is in flight', async () => {
		const post = vi.fn().mockReturnValue( new Promise( () => {} ) );
		mw.Api = vi.fn( function () {
			this.post = post;
		} );
		const wrapper = mountApp( { available: true, qrAvailable: false } );

		const button = () => wrapper.findAll( 'button' )
			.find( ( b ) => b.text().includes( 'citizen-share-copy-short-url' ) );

		expect( button().attributes( 'disabled' ) ).toBeUndefined();

		await button().trigger( 'click' );

		expect( button().attributes( 'disabled' ) ).toBeDefined();
	} );

	it( 'on fetch failure: notifies and hides the button', async () => {
		mockApiRejection( new Error( 'fail' ) );
		const wrapper = mountApp( { available: true, qrAvailable: false } );

		await wrapper.findAll( 'button' )
			.find( ( b ) => b.text().includes( 'citizen-share-copy-short-url' ) )
			.trigger( 'click' );
		await flushPromises();

		expect( mw.notify ).toHaveBeenCalled();
		expect( wrapper.text() ).not.toContain( 'citizen-share-copy-short-url' );
		expect( writeText ).not.toHaveBeenCalled();
	} );

	it( 'social tile {{url}} always substitutes the canonical page URL', async () => {
		mockApi( { shortenurl: { shorturl: SHORT_URL } } );
		const wrapper = mountApp(
			{ available: true, qrAvailable: false },
			[ { name: 'fb', label: 'Facebook', url: 'https://fb/share?u={{url}}', color: '#000' } ]
		);

		// Copy the short URL first — should NOT affect what the social tile shares.
		await wrapper.findAll( 'button' )
			.find( ( b ) => b.text().includes( 'citizen-share-copy-short-url' ) )
			.trigger( 'click' );
		await flushPromises();

		const windowOpen = vi.spyOn( window, 'open' ).mockReturnValue( null );
		await wrapper.findAll( 'button' )
			.find( ( b ) => b.attributes( 'aria-label' ) === 'Facebook' )
			.trigger( 'click' );

		expect( windowOpen ).toHaveBeenCalledWith(
			expect.stringContaining( encodeURIComponent( PAGE_URL_ATTR ) ),
			expect.anything(),
			expect.anything()
		);
		expect( windowOpen.mock.calls[ 0 ][ 0 ] ).not.toContain(
			encodeURIComponent( SHORT_URL )
		);
	} );
} );

describe( 'App.vue — QR view', () => {
	const QR_DATA_URI = 'data:image/svg+xml;base64,AAA';

	it( 'does not render the QR button when qrAvailable is false', () => {
		const wrapper = mountApp( { available: true, qrAvailable: false } );

		expect( wrapper.text() ).not.toContain( 'citizen-share-show-qr' );
	} );

	it( 'renders the QR button when qrAvailable is true', () => {
		const wrapper = mountApp( { available: true, qrAvailable: true } );

		expect( wrapper.text() ).toContain( 'citizen-share-show-qr' );
	} );

	it( 'swaps to the QR view on click and renders the QR image', async () => {
		mockApi( { shortenurl: { shorturl: SHORT_URL, qrcode: QR_DATA_URI } } );
		const wrapper = mountApp( { available: true, qrAvailable: true } );

		await wrapper.findAll( 'button' )
			.find( ( b ) => b.text().includes( 'citizen-share-show-qr' ) )
			.trigger( 'click' );
		await flushPromises();

		// Default view should be gone (v-if, not v-show)
		expect( wrapper.text() ).not.toContain( 'citizen-share-copy-short-url' );
		// QR image visible
		expect( wrapper.find( 'img' ).attributes( 'src' ) ).toBe( QR_DATA_URI );
		// Short URL plain text visible
		expect( wrapper.text() ).toContain( SHORT_URL );
	} );

	it( 'back arrow returns to the default view', async () => {
		mockApi( { shortenurl: { shorturl: SHORT_URL, qrcode: QR_DATA_URI } } );
		const wrapper = mountApp( { available: true, qrAvailable: true } );

		await wrapper.findAll( 'button' )
			.find( ( b ) => b.text().includes( 'citizen-share-show-qr' ) )
			.trigger( 'click' );
		await flushPromises();
		await wrapper.findAll( 'button' )
			.find( ( b ) => b.attributes( 'aria-label' ) === 'citizen-share-back' )
			.trigger( 'click' );

		expect( wrapper.text() ).toContain( 'citizen-share-copy-short-url' );
		expect( wrapper.find( 'img' ).exists() ).toBe( false );
	} );

	it( 'shows an error state with retry on fetch failure', async () => {
		const post = vi.fn()
			.mockRejectedValueOnce( new Error( 'fail' ) )
			.mockResolvedValueOnce( { shortenurl: { shorturl: SHORT_URL, qrcode: QR_DATA_URI } } );
		mw.Api = vi.fn( function () {
			this.post = post;
		} );
		const wrapper = mountApp( { available: true, qrAvailable: true } );

		await wrapper.findAll( 'button' )
			.find( ( b ) => b.text().includes( 'citizen-share-show-qr' ) )
			.trigger( 'click' );
		await flushPromises();

		expect( wrapper.text() ).toContain( 'citizen-share-qr-error' );

		await wrapper.findAll( 'button' )
			.find( ( b ) => b.text().includes( 'citizen-share-qr-retry' ) )
			.trigger( 'click' );
		await flushPromises();

		expect( wrapper.find( 'img' ).attributes( 'src' ) ).toBe( QR_DATA_URI );
	} );
} );
