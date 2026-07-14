// @vitest-environment jsdom

const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

const { createLastModified, formatTimeAgo, DIVISIONS } = require( '../../../resources/skins.citizen.scripts/lastModified.js' );

describe( 'formatTimeAgo', () => {
	let rtf;

	beforeEach( () => {
		rtf = { format: vi.fn( ( value, unit ) => `${ value } ${ unit } ago` ) };
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'should format seconds ago', () => {
		const nowMs = 1000000;
		const timestampSeconds = ( nowMs / 1000 ) - 30;

		const result = formatTimeAgo( String( timestampSeconds ), nowMs, rtf, DIVISIONS );

		expect( rtf.format ).toHaveBeenCalledWith( -30, 'seconds' );
		expect( result ).toBe( '-30 seconds ago' );
	} );

	it( 'should format minutes ago', () => {
		const nowMs = 1000000;
		const timestampSeconds = ( nowMs / 1000 ) - 120;

		const result = formatTimeAgo( String( timestampSeconds ), nowMs, rtf, DIVISIONS );

		expect( rtf.format ).toHaveBeenCalledWith( -2, 'minutes' );
		expect( result ).toBe( '-2 minutes ago' );
	} );

	it( 'should format hours ago', () => {
		const nowMs = 10000000;
		const timestampSeconds = ( nowMs / 1000 ) - 7200;

		const result = formatTimeAgo( String( timestampSeconds ), nowMs, rtf, DIVISIONS );

		expect( rtf.format ).toHaveBeenCalledWith( -2, 'hours' );
		expect( result ).toBe( '-2 hours ago' );
	} );

	it( 'should format days ago', () => {
		const nowMs = 100000000;
		const timestampSeconds = ( nowMs / 1000 ) - 259200;

		const result = formatTimeAgo( String( timestampSeconds ), nowMs, rtf, DIVISIONS );

		expect( rtf.format ).toHaveBeenCalledWith( -3, 'days' );
		expect( result ).toBe( '-3 days ago' );
	} );

	it( 'should format years ago', () => {
		const nowMs = 1000000000000;
		const timestampSeconds = ( nowMs / 1000 ) - 63072000;

		formatTimeAgo( String( timestampSeconds ), nowMs, rtf, DIVISIONS );

		expect( rtf.format ).toHaveBeenCalledWith( expect.any( Number ), 'years' );
	} );

	it( 'should return undefined for invalid timestamp', () => {
		const result = formatTimeAgo( 'not-a-number', 1000000, rtf, DIVISIONS );

		expect( result ).toBeUndefined();
		expect( rtf.format ).not.toHaveBeenCalled();
	} );

	it( 'should return undefined for empty string', () => {
		const result = formatTimeAgo( '', 1000000, rtf, DIVISIONS );

		expect( result ).toBeUndefined();
		expect( rtf.format ).not.toHaveBeenCalled();
	} );

	it( 'should handle boundary between seconds and minutes (59s)', () => {
		const nowMs = 1000000;
		const timestampSeconds = ( nowMs / 1000 ) - 59;

		formatTimeAgo( String( timestampSeconds ), nowMs, rtf, DIVISIONS );

		expect( rtf.format ).toHaveBeenCalledWith( -59, 'seconds' );
	} );

	it( 'should handle exact boundary at 60 seconds as minutes', () => {
		const nowMs = 1000000;
		const timestampSeconds = ( nowMs / 1000 ) - 60;

		formatTimeAgo( String( timestampSeconds ), nowMs, rtf, DIVISIONS );

		expect( rtf.format ).toHaveBeenCalledWith( -1, 'minutes' );
	} );
} );

describe( 'createLastModified', () => {
	afterEach( () => {
		document.body.innerHTML = '';
		document.documentElement.removeAttribute( 'lang' );
		mw.log.warn.mockClear();
	} );

	it( 'should not throw when the page language is not a valid BCP 47 tag', () => {
		document.body.innerHTML = '<span id="citizen-lastmod-relative" data-timestamp="1000000">3 January 2020</span>';
		document.documentElement.setAttribute( 'lang', 'x-xss' );

		const lastModified = createLastModified( { document, Intl } );

		expect( () => lastModified.init() ).not.toThrow();
	} );

	it( 'should leave the server-rendered timestamp in place and warn when the language tag is invalid', () => {
		document.body.innerHTML = '<span id="citizen-lastmod-relative" data-timestamp="1000000">3 January 2020</span>';
		document.documentElement.setAttribute( 'lang', 'x-xss' );

		createLastModified( { document, Intl } ).init();

		expect( document.getElementById( 'citizen-lastmod-relative' ).textContent ).toBe( '3 January 2020' );
		expect( mw.log.warn ).toHaveBeenCalled();
	} );

	it( 'should replace the timestamp with a relative time for a valid language tag', () => {
		const nowSeconds = Math.floor( Date.now() / 1000 );
		document.body.innerHTML = `<span id="citizen-lastmod-relative" data-timestamp="${ nowSeconds - 30 }">3 January 2020</span>`;
		document.documentElement.setAttribute( 'lang', 'en' );

		createLastModified( { document, Intl } ).init();

		const text = document.getElementById( 'citizen-lastmod-relative' ).textContent;
		expect( text ).not.toBe( '3 January 2020' );
		expect( text ).toMatch( /second/i );
	} );
} );
