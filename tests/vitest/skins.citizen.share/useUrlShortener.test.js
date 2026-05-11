// @vitest-environment jsdom

const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

const { useUrlShortener } = require(
	'../../../resources/skins.citizen.share/composables/useUrlShortener.js'
);

const PAGE_URL = 'https://wiki.example/wiki/Page';
const SHORT_URL = 'https://w.example/s/3';
const QR_DATA_URI = 'data:image/svg+xml;base64,AAA';

function mockApi( response ) {
	const get = vi.fn().mockResolvedValue( response );
	mw.Api = function () {
		this.post = get;
	};
	return get;
}

function mockApiRejection( reason ) {
	const get = vi.fn().mockRejectedValue( reason );
	mw.Api = function () {
		this.post = get;
	};
	return get;
}

afterEach( () => {
	vi.restoreAllMocks();
} );

describe( 'useUrlShortener', () => {
	it( 'starts in idle state with null data', () => {
		const shortener = useUrlShortener();

		expect( shortener.state.value.status ).toBe( 'idle' );
		expect( shortener.state.value.shortUrl ).toBeNull();
		expect( shortener.state.value.qrCode ).toBeNull();
	} );

	it( 'fetches short URL only when withQr is false', async () => {
		const get = mockApi( { shortenurl: { shorturl: SHORT_URL } } );
		const shortener = useUrlShortener();

		await shortener.fetch( PAGE_URL, { withQr: false } );

		expect( get ).toHaveBeenCalledWith( {
			action: 'shortenurl',
			url: PAGE_URL,
			format: 'json'
		} );
		expect( shortener.state.value.status ).toBe( 'ready' );
		expect( shortener.state.value.shortUrl ).toBe( SHORT_URL );
		expect( shortener.state.value.qrCode ).toBeNull();
	} );

	it( 'fetches short URL and QR when withQr is true', async () => {
		const get = mockApi( {
			shortenurl: { shorturl: SHORT_URL, qrcode: QR_DATA_URI }
		} );
		const shortener = useUrlShortener();

		await shortener.fetch( PAGE_URL, { withQr: true } );

		expect( get ).toHaveBeenCalledWith( {
			action: 'shortenurl',
			url: PAGE_URL,
			qrcode: 1,
			format: 'json'
		} );
		expect( shortener.state.value.shortUrl ).toBe( SHORT_URL );
		expect( shortener.state.value.qrCode ).toBe( QR_DATA_URI );
	} );

	it( 'sets status to error and rejects on API failure', async () => {
		mockApiRejection( new Error( 'http' ) );
		const shortener = useUrlShortener();

		await expect( shortener.fetch( PAGE_URL, { withQr: false } ) ).rejects.toThrow();

		expect( shortener.state.value.status ).toBe( 'error' );
		expect( shortener.state.value.shortUrl ).toBeNull();
	} );

	it( 'preserves cached short URL when a later QR fetch fails', async () => {
		const get = vi.fn()
			.mockResolvedValueOnce( { shortenurl: { shorturl: SHORT_URL } } )
			.mockRejectedValueOnce( new Error( 'qr-fail' ) );
		mw.Api = vi.fn( function () {
			this.post = get;
		} );
		const shortener = useUrlShortener();

		await shortener.fetch( PAGE_URL, { withQr: false } );
		await expect( shortener.fetch( PAGE_URL, { withQr: true } ) ).rejects.toThrow();

		expect( shortener.state.value.status ).toBe( 'error' );
		expect( shortener.state.value.shortUrl ).toBe( SHORT_URL );
		expect( shortener.state.value.qrCode ).toBeNull();
	} );

	it( 'dedupes concurrent calls', async () => {
		const get = mockApi( { shortenurl: { shorturl: SHORT_URL } } );
		const shortener = useUrlShortener();

		const p1 = shortener.fetch( PAGE_URL, { withQr: false } );
		const p2 = shortener.fetch( PAGE_URL, { withQr: false } );
		await Promise.all( [ p1, p2 ] );

		expect( get ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'reuses cached short URL on subsequent calls', async () => {
		const get = mockApi( { shortenurl: { shorturl: SHORT_URL } } );
		const shortener = useUrlShortener();

		await shortener.fetch( PAGE_URL, { withQr: false } );
		await shortener.fetch( PAGE_URL, { withQr: false } );

		expect( get ).toHaveBeenCalledTimes( 1 );
	} );

	it( 're-fetches when QR is needed but not cached', async () => {
		const get = vi.fn()
			.mockResolvedValueOnce( { shortenurl: { shorturl: SHORT_URL } } )
			.mockResolvedValueOnce( {
				shortenurl: { shorturl: SHORT_URL, qrcode: QR_DATA_URI }
			} );
		mw.Api = function () {
			this.post = get;
		};
		const shortener = useUrlShortener();

		await shortener.fetch( PAGE_URL, { withQr: false } );
		await shortener.fetch( PAGE_URL, { withQr: true } );

		expect( get ).toHaveBeenCalledTimes( 2 );
		expect( shortener.state.value.qrCode ).toBe( QR_DATA_URI );
	} );

	it( 'wraps raw SVG markup from the API as a data URI', async () => {
		// REL1_43+ UrlShortener returns the qrcode as raw SVG (no data
		// URI). The composable must wrap it so <img :src> works.
		const rawSvg = '<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"></svg>';
		mockApi( { shortenurl: { shorturl: SHORT_URL, qrcode: rawSvg } } );
		const shortener = useUrlShortener();

		await shortener.fetch( PAGE_URL, { withQr: true } );

		expect( shortener.state.value.qrCode ).toBe(
			'data:image/svg+xml;utf8,' + encodeURIComponent( rawSvg )
		);
	} );

	it( 'tracks qrCodeFor as the API-returned shorturl when shortening happened', async () => {
		// Long URL case: API returns both shorturl and qrcode. The QR
		// encodes the shorturl.
		mockApi( { shortenurl: { shorturl: SHORT_URL, qrcode: QR_DATA_URI } } );
		const shortener = useUrlShortener();

		await shortener.fetch( PAGE_URL, { withQr: true } );

		expect( shortener.state.value.qrCodeFor ).toBe( SHORT_URL );
	} );

	it( 'tracks qrCodeFor as the request URL when API did not shorten', async () => {
		// Short URL case: API returns qrcode only (URL was below the
		// QR shorten limit). The QR encodes the original URL.
		mockApi( { shortenurl: { qrcode: QR_DATA_URI } } );
		const shortener = useUrlShortener();

		await shortener.fetch( PAGE_URL, { withQr: true } );

		expect( shortener.state.value.qrCodeFor ).toBe( PAGE_URL );
		expect( shortener.state.value.shortUrl ).toBeNull();
	} );

	it( 'cross-mode race: superseded non-QR success writes its field without flipping status', async () => {
		// User clicks "Copy short URL" (fetch A, withQr=false) then clicks
		// "Show QR" before A resolves (fetch B, withQr=true). A then
		// resolves first. A must write its shortUrl so its caller can
		// copy it, but must not flip status to 'ready' under B's feet —
		// otherwise the QR view would briefly render with qrCode=null.
		let resolveA;
		let resolveB;
		const get = vi.fn()
			.mockReturnValueOnce( new Promise( ( r ) => {
				resolveA = r;
			} ) )
			.mockReturnValueOnce( new Promise( ( r ) => {
				resolveB = r;
			} ) );
		mw.Api = function () {
			this.post = get;
		};
		const shortener = useUrlShortener();

		const pA = shortener.fetch( PAGE_URL, { withQr: false } );
		const pB = shortener.fetch( PAGE_URL, { withQr: true } );

		resolveA( { shortenurl: { shorturl: SHORT_URL } } );
		await pA;

		expect( shortener.state.value.shortUrl ).toBe( SHORT_URL );
		expect( shortener.state.value.status ).toBe( 'loading' );
		expect( shortener.state.value.qrCode ).toBeNull();

		resolveB( { shortenurl: { shorturl: SHORT_URL, qrcode: QR_DATA_URI } } );
		await pB;

		expect( shortener.state.value.status ).toBe( 'ready' );
		expect( shortener.state.value.qrCode ).toBe( QR_DATA_URI );
	} );

	it( 'cross-mode race: superseded failure rejects its caller without flipping status to error', async () => {
		// Same setup as above but A errors. The QR view (which is now
		// waiting on B) must not flash its error state because of A's
		// failure. A's caller still receives the rejection.
		let rejectA;
		let resolveB;
		const get = vi.fn()
			.mockReturnValueOnce( new Promise( ( _, r ) => {
				rejectA = r;
			} ) )
			.mockReturnValueOnce( new Promise( ( r ) => {
				resolveB = r;
			} ) );
		mw.Api = function () {
			this.post = get;
		};
		const shortener = useUrlShortener();

		const pA = shortener.fetch( PAGE_URL, { withQr: false } );
		const pB = shortener.fetch( PAGE_URL, { withQr: true } );

		rejectA( new Error( 'a-fail' ) );
		await expect( pA ).rejects.toThrow();

		expect( shortener.state.value.status ).toBe( 'loading' );

		resolveB( { shortenurl: { shorturl: SHORT_URL, qrcode: QR_DATA_URI } } );
		await pB;

		expect( shortener.state.value.status ).toBe( 'ready' );
		expect( shortener.state.value.qrCode ).toBe( QR_DATA_URI );
	} );

	it( 'fetches short URL after a QR-only response that left shortUrl null', async () => {
		// Regression for the cache-check bug: a withQr:true call can land
		// in status='ready' with shortUrl=null (URL was short). A
		// subsequent withQr:false call must actually fetch, not serve a
		// no-op resolve from cache.
		const get = vi.fn()
			.mockResolvedValueOnce( { shortenurl: { qrcode: QR_DATA_URI } } )
			.mockResolvedValueOnce( { shortenurl: { shorturl: SHORT_URL } } );
		mw.Api = function () {
			this.post = get;
		};
		const shortener = useUrlShortener();

		await shortener.fetch( PAGE_URL, { withQr: true } );
		expect( shortener.state.value.shortUrl ).toBeNull();

		await shortener.fetch( PAGE_URL, { withQr: false } );

		expect( get ).toHaveBeenCalledTimes( 2 );
		expect( shortener.state.value.shortUrl ).toBe( SHORT_URL );
	} );
} );
