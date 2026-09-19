const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

const createCatalog = require(
	'../../../resources/skins.citizen.commandPalette.bucket/catalog.js'
);

const BUCKET_NS = 9592;

/**
 * Builds a formatversion=2 query response for the given bucket pages.
 *
 * @param {Array<{title: string, content: ?string}>} pages
 * @return {Object}
 */
function apiResponse( pages, continuation ) {
	const response = continuation ? { continue: continuation } : {};
	return Object.assign( response, {
		query: {
			pages: pages.map( ( page ) => {
				const entry = { title: page.title };
				if ( page.content !== null ) {
					entry.revisions = [ { slots: { main: { content: page.content } } } ];
				}
				return entry;
			} )
		}
	} );
}

const ITEM_SCHEMA = JSON.stringify( {
	item_type: { type: 'TEXT', index: true, repeated: false },
	value: { type: 'INTEGER', index: false, repeated: false },
	tags: { type: 'TEXT', index: true, repeated: true }
} );

describe( 'bucket catalog', () => {
	let mockGet;
	let catalog;

	beforeEach( () => {
		mockGet = vi.fn();
		const ApiConstructor = function () {
			this.get = mockGet;
		};
		mw.log.error.mockClear();
		mw.log.warn.mockClear();
		catalog = createCatalog( ApiConstructor, BUCKET_NS );
	} );

	it( 'fetches every bucket page and its schema in a single request', async () => {
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Item', content: ITEM_SCHEMA }
		] ) );

		await catalog.getBuckets();

		expect( mockGet ).toHaveBeenCalledTimes( 1 );
		expect( mockGet.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			action: 'query',
			formatversion: 2,
			generator: 'allpages',
			gapnamespace: BUCKET_NS,
			prop: 'revisions',
			rvprop: 'content',
			rvslots: 'main'
		} );
	} );

	it( 'derives the Lua bucket name from the page title, lowercased', async () => {
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Item', content: ITEM_SCHEMA }
		] ) );

		const buckets = await catalog.getBuckets();

		expect( buckets[ 0 ].name ).toBe( 'item' );
		expect( buckets[ 0 ].title ).toBe( 'Bucket:Item' );
	} );

	// The API normalises titles to prefixed *text*, so a multi-word bucket
	// page arrives spaced. Bucket's own name for it is the underscored,
	// lowercased page key, and querying the spaced form fails outright
	// with "Bucket name item drop is invalid".
	it( 'queries a multi-word bucket by its underscored name', async () => {
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Item drop', content: ITEM_SCHEMA }
		] ) );

		const buckets = await catalog.getBuckets();

		expect( buckets[ 0 ].name ).toBe( 'item_drop' );
		expect( buckets[ 0 ].label ).toBe( 'Item drop' );
	} );

	it( 'lowercases a capitalised field name, the way Bucket stores it', async () => {
		mockGet.mockResolvedValue( apiResponse( [ {
			title: 'Bucket:Item drop',
			content: JSON.stringify( {
				Quantity: { type: 'INTEGER', index: true, repeated: false }
			} )
		} ] ) );

		const buckets = await catalog.getBuckets();

		expect( buckets[ 0 ].fields[ 0 ].name ).toBe( 'quantity' );
	} );

	it( 'treats a field with no index flag as indexed, as Bucket does', async () => {
		mockGet.mockResolvedValue( apiResponse( [ {
			title: 'Bucket:Item',
			content: JSON.stringify( { quantity: { type: 'INTEGER', repeated: false } } )
		} ] ) );

		const buckets = await catalog.getBuckets();

		expect( buckets[ 0 ].fields[ 0 ].indexed ).toBe( true );
	} );

	it( 'skips a schema page whose JSON is not an object', async () => {
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Listy', content: '[ "not", "a", "schema" ]' },
			{ title: 'Bucket:Item', content: ITEM_SCHEMA }
		] ) );

		const buckets = await catalog.getBuckets();

		expect( buckets.map( ( b ) => b.name ) ).toEqual( [ 'item' ] );
		expect( mw.log.warn ).toHaveBeenCalled();
	} );

	it( 'does not tie the shared catalog request to one caller\'s abort signal', async () => {
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Item', content: ITEM_SCHEMA }
		] ) );
		const controller = new AbortController();

		await catalog.getBuckets( controller.signal );

		const ajaxOptions = mockGet.mock.calls[ 0 ][ 1 ];
		expect( ajaxOptions && ajaxOptions.signal ).toBeUndefined();
	} );

	it( 'exposes each schema field with its type, repeated and indexed flags', async () => {
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Item', content: ITEM_SCHEMA }
		] ) );

		const buckets = await catalog.getBuckets();

		expect( buckets[ 0 ].fields ).toEqual( [
			{ name: 'item_type', type: 'TEXT', repeated: false, indexed: true },
			{ name: 'value', type: 'INTEGER', repeated: false, indexed: false },
			{ name: 'tags', type: 'TEXT', repeated: true, indexed: true }
		] );
	} );

	it( 'hides internal underscore-prefixed columns from the field list', async () => {
		mockGet.mockResolvedValue( apiResponse( [ {
			title: 'Bucket:Item',
			content: JSON.stringify( {
				_page_id: { type: 'INTEGER', index: false, repeated: false },
				item_type: { type: 'TEXT', index: true, repeated: false }
			} )
		} ] ) );

		const buckets = await catalog.getBuckets();

		expect( buckets[ 0 ].fields.map( ( f ) => f.name ) ).toEqual( [ 'item_type' ] );
	} );

	it( 'skips a bucket page holding invalid JSON but keeps the rest', async () => {
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Broken', content: 'not json{' },
			{ title: 'Bucket:Item', content: ITEM_SCHEMA }
		] ) );

		const buckets = await catalog.getBuckets();

		expect( buckets.map( ( b ) => b.name ) ).toEqual( [ 'item' ] );
		expect( mw.log.warn ).toHaveBeenCalled();
	} );

	it( 'skips a bucket page with no readable revision content', async () => {
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Empty', content: null },
			{ title: 'Bucket:Item', content: ITEM_SCHEMA }
		] ) );

		const buckets = await catalog.getBuckets();

		expect( buckets.map( ( b ) => b.name ) ).toEqual( [ 'item' ] );
	} );

	it( 'follows continuation so a wiki past one API page is listed in full', async () => {
		mockGet
			.mockResolvedValueOnce( apiResponse(
				[ { title: 'Bucket:Item', content: ITEM_SCHEMA } ],
				{ gapcontinue: 'Skill', continue: 'gapcontinue||' }
			) )
			.mockResolvedValueOnce( apiResponse(
				[ { title: 'Bucket:Skill', content: ITEM_SCHEMA } ]
			) );

		const buckets = await catalog.getBuckets();

		expect( buckets.map( ( b ) => b.name ) ).toEqual( [ 'item', 'skill' ] );
		expect( mockGet ).toHaveBeenCalledTimes( 2 );
		expect( mockGet.mock.calls[ 1 ][ 0 ] ).toMatchObject( {
			gapcontinue: 'Skill',
			continue: 'gapcontinue||',
			gapnamespace: BUCKET_NS
		} );
	} );

	it( 'stops following continuation rather than looping forever', async () => {
		// A server that always says "there is more" must not hang the palette.
		mockGet.mockResolvedValue( apiResponse(
			[ { title: 'Bucket:Item', content: ITEM_SCHEMA } ],
			{ gapcontinue: 'Next', continue: 'gapcontinue||' }
		) );

		const buckets = await catalog.getBuckets();

		expect( mockGet.mock.calls.length ).toBeLessThanOrEqual( 20 );
		expect( buckets.length ).toBeGreaterThan( 0 );
		expect( mw.log.warn ).toHaveBeenCalled();
	} );

	it( 'keeps the buckets it already read when a later page fails', async () => {
		mockGet
			.mockResolvedValueOnce( apiResponse(
				[ { title: 'Bucket:Item', content: ITEM_SCHEMA } ],
				{ gapcontinue: 'Skill', continue: 'gapcontinue||' }
			) )
			.mockRejectedValueOnce( new Error( 'http' ) );

		const buckets = await catalog.getBuckets();

		expect( buckets.map( ( b ) => b.name ) ).toEqual( [ 'item' ] );
	} );

	it( 'reuses the first result instead of refetching the catalog', async () => {
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Item', content: ITEM_SCHEMA }
		] ) );

		await catalog.getBuckets();
		const buckets = await catalog.getBuckets();

		expect( mockGet ).toHaveBeenCalledTimes( 1 );
		expect( buckets[ 0 ].name ).toBe( 'item' );
	} );

	it( 'returns an empty list and logs when the request fails', async () => {
		mockGet.mockRejectedValue( new Error( 'http' ) );

		const buckets = await catalog.getBuckets();

		expect( buckets ).toEqual( [] );
		expect( mw.log.error ).toHaveBeenCalled();
	} );

	it( 'retries the catalog after a failure rather than caching the error', async () => {
		mockGet.mockRejectedValueOnce( new Error( 'http' ) );
		mockGet.mockResolvedValue( apiResponse( [
			{ title: 'Bucket:Item', content: ITEM_SCHEMA }
		] ) );

		await catalog.getBuckets();
		const buckets = await catalog.getBuckets();

		expect( buckets.map( ( b ) => b.name ) ).toEqual( [ 'item' ] );
	} );

	it( 'stays quiet when the request is aborted', async () => {
		const abort = new Error( 'aborted' );
		abort.name = 'AbortError';
		mockGet.mockRejectedValue( abort );

		const buckets = await catalog.getBuckets();

		expect( buckets ).toEqual( [] );
		expect( mw.log.error ).not.toHaveBeenCalled();
	} );

	it( 'returns an empty list when the wiki has no bucket pages', async () => {
		mockGet.mockResolvedValue( { batchcomplete: true } );

		const buckets = await catalog.getBuckets();

		expect( buckets ).toEqual( [] );
	} );
} );
