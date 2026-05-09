// @vitest-environment jsdom

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createFileMode = require(
	'../../../../resources/skins.citizen.commandPalette/modes/file.js'
);

const SAMPLE_PAGES = {
	100: {
		pageid: 100,
		ns: 6,
		title: 'File:Diagram.png',
		index: 1,
		imageinfo: [ {
			url: '/wiki/File:Diagram.png',
			thumburl: '/thumb/diagram.png',
			thumbwidth: 300,
			thumbheight: 200,
			width: 1280,
			height: 960,
			size: 412000,
			mime: 'image/png',
			mediatype: 'BITMAP',
			user: 'Bob',
			timestamp: '2026-05-06T10:00:00Z',
			extmetadata: {
				LicenseShortName: { value: 'CC BY-SA 4.0' }
			}
		} ]
	},
	101: {
		pageid: 101,
		ns: 6,
		title: 'File:Lecture.mp3',
		index: 2,
		imageinfo: [ {
			url: '/wiki/File:Lecture.mp3',
			size: 5242880,
			mime: 'audio/mpeg',
			mediatype: 'AUDIO',
			user: 'Alice',
			timestamp: '2026-05-04T10:00:00Z',
			extmetadata: {}
		} ]
	},
	102: {
		pageid: 102,
		ns: 6,
		title: 'File:Manual.pdf',
		index: 3,
		imageinfo: [ {
			url: '/wiki/File:Manual.pdf',
			size: 1048576,
			mime: 'application/pdf',
			mediatype: 'OFFICE',
			user: 'Carol',
			timestamp: '2026-04-28T10:00:00Z',
			extmetadata: {}
		} ]
	}
};

describe( 'file mode', () => {
	let mockGet;
	let mode;

	beforeEach( () => {
		mockGet = vi.fn();
		const ApiConstructor = function () {
			this.get = mockGet;
		};

		mw.log.error.mockClear();

		mode = createFileMode( ApiConstructor );
	} );

	describe( 'mode definition', () => {
		it( 'has correct id and triggers', () => {
			expect( mode.id ).toBe( 'file' );
			expect( mode.triggers ).toEqual( [ '/file:', '~' ] );
		} );

		it( 'declares layout="gallery"', () => {
			expect( mode.layout ).toBe( 'gallery' );
		} );

		it( 'has emptyState with title, description, icon', () => {
			expect( mode.emptyState ).toBeDefined();
			expect( mode.emptyState.title ).toBeTruthy();
			expect( mode.emptyState.description ).toBeTruthy();
			expect( mode.emptyState.icon ).toBeDefined();
		} );

		it( 'has noResults() returning title, description, icon', () => {
			const result = mode.noResults( 'foo' );

			expect( result.title ).toBeTruthy();
			expect( result.description ).toBeTruthy();
			expect( result.icon ).toBeDefined();
		} );

		it( 'has help.description message key', () => {
			expect( mode.help.description ).toBe( 'citizen-command-palette-mode-file-description-help' );
		} );
	} );

	describe( 'getResults — empty input', () => {
		it( 'returns [] and skips the API off-article (no wgArticleId)', async () => {
			mw.config.get = vi.fn( () => null );

			const result = await mode.getResults( '', undefined );

			expect( result ).toEqual( [] );
			expect( mockGet ).not.toHaveBeenCalled();
		} );

		it( 'fetches files on the current page when on-article', async () => {
			mw.config.get = vi.fn( ( key ) => {
				if ( key === 'wgArticleId' ) {
					return 42;
				}
				if ( key === 'wgPageName' ) {
					return 'Test_Page';
				}
				return null;
			} );
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			const result = await mode.getResults( '', undefined );

			expect( mockGet ).toHaveBeenCalledTimes( 1 );
			const params = mockGet.mock.calls[ 0 ][ 0 ];
			expect( params.generator ).toBe( 'images' );
			expect( params.titles ).toBe( 'Test_Page' );
			expect( params.prop ).toBe( 'imageinfo' );
			expect( result ).toHaveLength( 3 );
			// Each adapted item retains its file shape
			expect( result.every( ( r ) => r.type === 'file' ) ).toBe( true );
		} );

		it( 'returns [] when on-article but the page has no files', async () => {
			mw.config.get = vi.fn( ( key ) => key === 'wgArticleId' ? 42 : 'Test_Page' );
			mockGet.mockResolvedValue( { query: { pages: {} } } );

			const result = await mode.getResults( '', undefined );

			expect( result ).toEqual( [] );
		} );
	} );

	describe( 'getResults — with query', () => {
		it( 'calls prefixsearch first with documented parameters', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			await mode.getResults( 'diagram', undefined );

			expect( mockGet ).toHaveBeenCalledTimes( 1 );
			const params = mockGet.mock.calls[ 0 ][ 0 ];
			expect( params.action ).toBe( 'query' );
			expect( params.generator ).toBe( 'prefixsearch' );
			expect( params.gpssearch ).toBe( 'diagram' );
			expect( params.gpsnamespace ).toBe( 6 );
			expect( params.gpslimit ).toBe( 50 );
			expect( params.prop ).toBe( 'imageinfo' );
			// The list-stage iiprop is intentionally minimal — heavier fields
			// (extmetadata, size, mime, user, timestamp) move to getItemDetail.
			expect( params.iiprop ).toBe( 'url|mediatype' );
			expect( params.iiurlwidth ).toBe( 300 );
		} );

		it( 'falls back to full-text search when prefix returns no results', async () => {
			// First call (prefix) returns empty; second call (search) returns results.
			mockGet.mockResolvedValueOnce( { query: { pages: {} } } );
			mockGet.mockResolvedValueOnce( { query: { pages: SAMPLE_PAGES } } );

			const result = await mode.getResults( 'diagram', undefined );

			expect( mockGet ).toHaveBeenCalledTimes( 2 );
			expect( mockGet.mock.calls[ 1 ][ 0 ].generator ).toBe( 'search' );
			expect( mockGet.mock.calls[ 1 ][ 0 ].gsrsearch ).toBe( 'diagram' );
			expect( result ).toHaveLength( 3 );
		} );

		it( 'skips the full-text fallback when prefix was aborted', async () => {
			// Prefix returns empty (because it was aborted) and the signal is
			// flagged aborted by the caller. The fallback must not fire.
			mockGet.mockResolvedValueOnce( { query: { pages: {} } } );
			const signal = { aborted: true };

			const result = await mode.getResults( 'diagram', signal );

			expect( mockGet ).toHaveBeenCalledTimes( 1 );
			expect( mockGet.mock.calls[ 0 ][ 0 ].generator ).toBe( 'prefixsearch' );
			expect( result ).toEqual( [] );
		} );

		it( 'skips the full-text fallback when prefix returns at least one match', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			await mode.getResults( 'diagram', undefined );

			expect( mockGet ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'preserves search ranking via the page index field', async () => {
			// Pages keyed out of order on purpose; sort should follow `index`.
			const shuffled = {
				102: SAMPLE_PAGES[ 102 ],
				100: SAMPLE_PAGES[ 100 ],
				101: SAMPLE_PAGES[ 101 ]
			};
			mockGet.mockResolvedValue( { query: { pages: shuffled } } );

			const result = await mode.getResults( 'thing', undefined );

			expect( result.map( ( r ) => r.label ) ).toEqual( [
				'Diagram.png',
				'Lecture.mp3',
				'Manual.pdf'
			] );
		} );

		it( 'maps each page to a gallery item with type="file"', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			const result = await mode.getResults( 'thing', undefined );

			expect( result ).toHaveLength( 3 );
			expect( result.every( ( r ) => r.type === 'file' ) ).toBe( true );
		} );

		it( 'carries pageid on each item so getItemDetail can request it', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			const result = await mode.getResults( 'thing', undefined );

			expect( result.map( ( r ) => r.pageid ) ).toEqual( [ 100, 101, 102 ] );
		} );

		it( 'carries mediatype on each item so getItemDetail can derive friendly type', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			const result = await mode.getResults( 'thing', undefined );

			expect( result.map( ( r ) => r.mediatype ) ).toEqual( [ 'BITMAP', 'AUDIO', 'OFFICE' ] );
		} );

		it( 'strips the File: prefix from the displayed label', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			const [ first ] = await mode.getResults( 'thing', undefined );

			expect( first.label ).toBe( 'Diagram.png' );
		} );

		it( 'sets a thumbnail object when the API returns a thumburl', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			const [ first ] = await mode.getResults( 'thing', undefined );

			expect( first.thumbnail ).toEqual( {
				url: '/thumb/diagram.png',
				width: 300,
				height: 200
			} );
		} );

		it( 'sets thumbnail to null when the API has no thumburl', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			const result = await mode.getResults( 'thing', undefined );

			const audio = result.find( ( r ) => r.label === 'Lecture.mp3' );
			expect( audio.thumbnail ).toBeNull();
			// thumbnailIcon is always assigned by adaptFileItem; the actual
			// icon glyph is wired up by MediaWiki's ResourceLoader at runtime
			// (icons.json is a stub in unit tests). Just check the field exists.
			expect( audio ).toHaveProperty( 'thumbnailIcon' );
		} );

		it( 'builds a list-stage detail.header with filename + copyValue only (no description, no pairs)', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			const result = await mode.getResults( 'thing', undefined );

			const bitmap = result.find( ( r ) => r.label === 'Diagram.png' );

			expect( bitmap.detail.header.label ).toBe( 'Diagram.png' );
			expect( bitmap.detail.header.copyValue ).toBe( 'Diagram.png' );
			// Description and pairs are populated lazily by getItemDetail.
			expect( bitmap.detail.header.description ).toBeUndefined();
			expect( bitmap.detail.pairs ).toBeUndefined();
		} );

		it( 'sets url to the File: page URL', async () => {
			mockGet.mockResolvedValue( { query: { pages: SAMPLE_PAGES } } );

			const [ first ] = await mode.getResults( 'thing', undefined );

			expect( first.url ).toContain( 'File:Diagram.png' );
		} );

		it( 'skips pages without imageinfo', async () => {
			const pages = {
				100: SAMPLE_PAGES[ 100 ],
				200: { pageid: 200, ns: 6, title: 'File:NoInfo.png', index: 2 }
			};
			mockGet.mockResolvedValue( { query: { pages } } );

			const result = await mode.getResults( 'thing', undefined );

			expect( result ).toHaveLength( 1 );
		} );
	} );

	describe( 'getItemDetail', () => {
		// Mirrors what `adaptListItem` produces from the list query: pageid
		// plus mediatype carried over so the detail query doesn't need to
		// re-request `mediatype`.
		const ITEM_100 = { pageid: 100, mediatype: 'BITMAP' };
		const ITEM_101 = { pageid: 101, mediatype: 'AUDIO' };
		const ITEM_102 = { pageid: 102, mediatype: 'OFFICE' };

		it( 'requests imageinfo by pageid with the heavy fields and a license filter', async () => {
			mockGet.mockResolvedValue( { query: { pages: { 100: SAMPLE_PAGES[ 100 ] } } } );

			await mode.getItemDetail( ITEM_100, undefined );

			expect( mockGet ).toHaveBeenCalledTimes( 1 );
			const params = mockGet.mock.calls[ 0 ][ 0 ];
			expect( params.action ).toBe( 'query' );
			expect( params.prop ).toBe( 'imageinfo' );
			expect( params.pageids ).toBe( 100 );
			expect( params.iiprop ).toBe( 'size|mime|extmetadata|user|timestamp' );
			expect( params.iiextmetadatafilter ).toBe( 'LicenseShortName' );
		} );

		it( 'returns description (friendly type) and pairs (size, uploaded, license)', async () => {
			mockGet.mockResolvedValue( { query: { pages: { 100: SAMPLE_PAGES[ 100 ] } } } );

			const detail = await mode.getItemDetail( ITEM_100, undefined );

			expect( detail.description ).toBe( 'PNG image' );
			const keys = detail.pairs.map( ( p ) => p.key );
			expect( keys ).toEqual( [ 'size', 'uploaded', 'license' ] );
		} );

		it( 'formats the size pair as "<dim> × <dim>, <bytes>" for visual files', async () => {
			mockGet.mockResolvedValue( { query: { pages: { 100: SAMPLE_PAGES[ 100 ] } } } );

			const detail = await mode.getItemDetail( ITEM_100, undefined );

			const sizePair = detail.pairs.find( ( p ) => p.key === 'size' );
			expect( sizePair.value ).toContain( '1280 × 960' );
			expect( sizePair.value ).toMatch( /KB|MB/ );
		} );

		it( 'formats the size pair as bytes-only for non-visual files', async () => {
			mockGet.mockResolvedValue( { query: { pages: { 101: SAMPLE_PAGES[ 101 ] } } } );

			const detail = await mode.getItemDetail( ITEM_101, undefined );

			const sizePair = detail.pairs.find( ( p ) => p.key === 'size' );
			expect( sizePair.value ).not.toContain( '×' );
			expect( sizePair.value ).toMatch( /MB$/ );
		} );

		it( 'omits the license pair when extmetadata.LicenseShortName is missing', async () => {
			mockGet.mockResolvedValue( { query: { pages: { 101: SAMPLE_PAGES[ 101 ] } } } );

			const detail = await mode.getItemDetail( ITEM_101, undefined );

			expect( detail.pairs.find( ( p ) => p.key === 'license' ) ).toBeUndefined();
		} );

		it( 'derives the friendly type label from mime + mediatype', async () => {
			mockGet.mockResolvedValueOnce( { query: { pages: { 101: SAMPLE_PAGES[ 101 ] } } } );
			const audio = await mode.getItemDetail( ITEM_101, undefined );
			expect( audio.description ).toBe( 'MPEG audio' );

			mockGet.mockResolvedValueOnce( { query: { pages: { 102: SAMPLE_PAGES[ 102 ] } } } );
			const office = await mode.getItemDetail( ITEM_102, undefined );
			expect( office.description ).toBe( 'PDF document' );
		} );

		it( 'preserves brand casing for WebM and WebP subtypes', async () => {
			const webmPage = {
				pageid: 1,
				title: 'File:Demo.webm',
				imageinfo: [ {
					size: 25000, width: 320, height: 240,
					mime: 'video/webm', mediatype: 'VIDEO', extmetadata: {}
				} ]
			};
			const webpPage = {
				pageid: 2,
				title: 'File:Photo.webp',
				imageinfo: [ {
					size: 50000, width: 1024, height: 768,
					mime: 'image/webp', mediatype: 'BITMAP', extmetadata: {}
				} ]
			};
			mockGet.mockResolvedValueOnce( { query: { pages: { 1: webmPage } } } );
			mockGet.mockResolvedValueOnce( { query: { pages: { 2: webpPage } } } );

			const webm = await mode.getItemDetail( { pageid: 1, mediatype: 'VIDEO' }, undefined );
			const webp = await mode.getItemDetail( { pageid: 2, mediatype: 'BITMAP' }, undefined );

			expect( webm.description ).toBe( 'WebM video' );
			expect( webp.description ).toBe( 'WebP image' );
		} );

		it( 'caches by pageid: a second call for the same item does not hit the API', async () => {
			mockGet.mockResolvedValue( { query: { pages: { 100: SAMPLE_PAGES[ 100 ] } } } );

			const first = await mode.getItemDetail( ITEM_100, undefined );
			const second = await mode.getItemDetail( ITEM_100, undefined );

			expect( mockGet ).toHaveBeenCalledTimes( 1 );
			expect( second ).toBe( first );
		} );

		it( 'caches an empty default when the response has no imageinfo (prevents retry loops)', async () => {
			mockGet.mockResolvedValueOnce( { query: { pages: {} } } );

			const detail = await mode.getItemDetail( ITEM_100, undefined );
			expect( detail ).toEqual( { description: '', pairs: [] } );

			mockGet.mockClear();
			const cached = await mode.getItemDetail( ITEM_100, undefined );
			expect( mockGet ).not.toHaveBeenCalled();
			expect( cached ).toEqual( { description: '', pairs: [] } );
		} );

		it( 'returns the empty default and skips the API when item has no pageid', async () => {
			const detail = await mode.getItemDetail( {}, undefined );

			expect( detail ).toEqual( { description: '', pairs: [] } );
			expect( mockGet ).not.toHaveBeenCalled();
		} );

		it( 'propagates AbortError without writing to the cache', async () => {
			const abortErr = new Error( 'aborted' );
			abortErr.name = 'AbortError';
			mockGet.mockRejectedValueOnce( abortErr );

			await expect( mode.getItemDetail( ITEM_100, undefined ) ).rejects.toBe( abortErr );

			// A subsequent call still hits the API — the abort did not poison the cache.
			mockGet.mockResolvedValueOnce( { query: { pages: { 100: SAMPLE_PAGES[ 100 ] } } } );
			const detail = await mode.getItemDetail( ITEM_100, undefined );
			expect( detail.description ).toBe( 'PNG image' );
			expect( mockGet ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'threads the abort signal through to the API call', async () => {
			mockGet.mockResolvedValue( { query: { pages: { 100: SAMPLE_PAGES[ 100 ] } } } );
			const signal = new AbortController().signal;

			await mode.getItemDetail( ITEM_100, signal );

			const options = mockGet.mock.calls[ 0 ][ 1 ];
			expect( options.signal ).toBe( signal );
		} );
	} );

	describe( 'onResultSelect', () => {
		it( 'returns navigate to the item url', async () => {
			const item = { url: '/wiki/File:Foo.png' };

			const action = await mode.onResultSelect( item );

			expect( action.action ).toBe( 'navigate' );
			expect( action.payload ).toBe( '/wiki/File:Foo.png' );
		} );
	} );

	describe( 'getResults — error and abort handling', () => {
		it( 'returns [] and logs when API call fails', async () => {
			mockGet.mockRejectedValue( new Error( 'network blew up' ) );

			const result = await mode.getResults( 'whatever', undefined );

			expect( result ).toEqual( [] );
			expect( mw.log.error ).toHaveBeenCalled();
		} );

		it( 'returns [] when the request is aborted, without logging', async () => {
			const abortErr = new Error( 'aborted' );
			abortErr.name = 'AbortError';
			mockGet.mockRejectedValue( abortErr );

			const result = await mode.getResults( 'whatever', undefined );

			expect( result ).toEqual( [] );
			expect( mw.log.error ).not.toHaveBeenCalled();
		} );
	} );
} );
