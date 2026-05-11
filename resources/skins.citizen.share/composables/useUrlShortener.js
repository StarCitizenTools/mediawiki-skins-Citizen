const { ref } = require( 'vue' );

/**
 * UrlShortener's API returns the QR code as raw SVG markup (it calls
 * `getQrCode()` without the data-URI flag). For an `<img>` tag to render
 * it, the SVG needs to be wrapped as a data URI. Pre-wrapped data URIs
 * pass through unchanged, so the composable is forward-compatible with
 * future extension versions that might return data URIs directly.
 *
 * @param {string} qrcode
 * @return {string}
 */
function toQrDataUri( qrcode ) {
	if ( qrcode.startsWith( 'data:' ) ) {
		return qrcode;
	}
	return 'data:image/svg+xml;utf8,' + encodeURIComponent( qrcode );
}

/**
 * Wraps Extension:UrlShortener's `action=shortenurl` API for the share panel.
 *
 * - Maintains a single reactive state object: status, shortUrl, qrCode,
 *   qrCodeFor (the URL the QR encodes, used by the UI to display the
 *   correct URL beneath the QR for accessibility).
 * - Caches successful results for the lifetime of the composable instance,
 *   so closing and reopening the share dialog (which doesn't re-mount the
 *   Vue app) reuses the cached URL.
 * - Dedupes concurrent fetches with the same `withQr` value: a second
 *   fetch() while one is in flight returns the same promise. A fetch() with
 *   a different `withQr` value while another is in flight starts a separate
 *   request and supersedes the previous one for state-ownership purposes —
 *   the older request still writes its own data fields when it resolves so
 *   its caller can act on the result, but it no longer flips `status` to
 *   `'ready'` (or `'error'`), letting the newer request remain the source of
 *   truth. This prevents a stale resolution from making the QR view think
 *   the data is ready (or errored) while a fresh request is still pending.
 * - Failure preserves the cached data fields: on error, status flips to
 *   `'error'` but `shortUrl`/`qrCode`/`qrCodeFor` keep whatever the last
 *   successful fetch put there. Consumers checking for "do I have data?"
 *   should test `shortUrl !== null` rather than `status === 'ready'` so a
 *   transient error doesn't make them drop a still-usable URL.
 * - The QR API quirk: when `qrcode=1` is requested, UrlShortener only
 *   *also* shortens the URL when it's longer than
 *   `$wgUrlShortenerQrCodeShortenLimit`. For wiki page URLs that are
 *   already short, the QR encodes the original URL and no `shorturl` is
 *   in the response. `qrCodeFor` tracks that distinction.
 *
 * @return {Object} An object with `state` (a Vue ref of `{status, shortUrl,
 *   qrCode, qrCodeFor}`) and `fetch(url, { withQr })` returning a Promise.
 */
function useUrlShortener() {
	const state = ref( {
		status: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
		shortUrl: null,
		qrCode: null,
		qrCodeFor: null
	} );

	let inFlight = null;
	let inFlightWantsQr = false;

	function shouldServeFromCache( withQr ) {
		if ( state.value.status !== 'ready' ) {
			return false;
		}
		// Both code paths need a short URL. The QR-only API call doesn't
		// always return one (UrlShortener only also shortens when the
		// original URL is over the QR shorten limit), so a prior
		// `withQr: true` call can leave shortUrl null even though status
		// is 'ready' — in which case a subsequent toggle click must
		// actually fetch.
		if ( state.value.shortUrl === null ) {
			return false;
		}
		if ( withQr && state.value.qrCode === null ) {
			return false;
		}
		return true;
	}

	function fetch( url, { withQr } = { withQr: false } ) {
		if ( shouldServeFromCache( withQr ) ) {
			return Promise.resolve();
		}
		if ( inFlight && inFlightWantsQr === withQr ) {
			return inFlight;
		}

		state.value = Object.assign( {}, state.value, { status: 'loading' } );
		inFlightWantsQr = withQr;

		const params = {
			action: 'shortenurl',
			url: url,
			format: 'json'
		};
		if ( withQr ) {
			params.qrcode = 1;
		}

		// The shortenurl API rejects GET with `mustbeposted` — it's a write
		// (it creates a database row on first use of a given URL) so MW core
		// enforces POST.
		const request = new mw.Api().post( params ).then( ( response ) => {
			const data = ( response && response.shortenurl ) || {};
			const nextShortUrl = typeof data.shorturl === 'string' ?
				data.shorturl :
				state.value.shortUrl;
			const nextQrCode = typeof data.qrcode === 'string' ?
				toQrDataUri( data.qrcode ) :
				state.value.qrCode;
			// When this call requested a QR, the encoded URL is either the
			// shorturl the API just shortened (long-URL case) or the URL we
			// asked about (short-URL case, no shortening). When this call
			// didn't request a QR, leave qrCodeFor alone.
			const nextQrCodeFor = withQr ?
				( typeof data.shorturl === 'string' ? data.shorturl : url ) :
				state.value.qrCodeFor;
			// Only the latest in-flight request owns the status/inFlight
			// pointer. A cross-mode fetch that started after us (e.g. the
			// user clicked the QR button while a copy-short-URL fetch was
			// still pending) becomes the new in-flight and is the source of
			// truth for `status`. We still write the fields this request
			// owns (shortUrl for either mode; qrCode/qrCodeFor only when
			// withQr) so its caller can read its result, but we don't flip
			// `status` to 'ready' under the newer request's feet.
			const isCurrent = request === inFlight;
			state.value = {
				status: isCurrent ? 'ready' : state.value.status,
				shortUrl: nextShortUrl,
				qrCode: nextQrCode,
				qrCodeFor: nextQrCodeFor
			};
			if ( isCurrent ) {
				inFlight = null;
			}
		}, ( error ) => {
			// A superseded request's failure must not steal the status from
			// the newer one — otherwise a stale error would flip the QR
			// view into its error state while a fresh request is still in
			// flight. Either way the rejection still propagates to this
			// request's own caller.
			if ( request === inFlight ) {
				state.value = Object.assign( {}, state.value, { status: 'error' } );
				inFlight = null;
			}
			throw error;
		} );

		inFlight = request;
		return request;
	}

	return { state, fetch };
}

module.exports = { useUrlShortener };
