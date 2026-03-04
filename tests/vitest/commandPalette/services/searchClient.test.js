/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createRestSearchClient = require( '../../../../resources/skins.citizen.commandPalette/services/searchClient.js' );

describe( 'createRestSearchClient', () => {
	let client;

	beforeEach( () => {
		vi.restoreAllMocks();
		client = createRestSearchClient( '/w' );
	} );

	describe( 'processQuery', () => {
		it( 'converts template syntax to Template namespace', () => {
			expect( client.processQuery( '{{Infobox}}' ) ).toBe( 'Template:Infobox' );
		} );

		it( 'converts partial template syntax (no closing braces)', () => {
			expect( client.processQuery( '{{Navbox' ) ).toBe( 'Template:Navbox' );
		} );

		it( 'converts wikilink syntax to plain title', () => {
			expect( client.processQuery( '[[Main Page]]' ) ).toBe( 'Main Page' );
		} );

		it( 'converts partial wikilink syntax (no closing brackets)', () => {
			expect( client.processQuery( '[[Main Page' ) ).toBe( 'Main Page' );
		} );

		it( 'returns plain queries unchanged', () => {
			expect( client.processQuery( 'cats' ) ).toBe( 'cats' );
		} );
	} );

	describe( 'fetchByQuery', () => {
		/**
		 * Build a minimal REST API response fixture.
		 *
		 * @param {Array} pages
		 * @return {Object}
		 */
		function makeResponse( pages ) {
			return { pages };
		}

		function stubFetch( body, status = 200 ) {
			global.fetch = vi.fn( () => Promise.resolve( {
				ok: status >= 200 && status < 300,
				status,
				json: () => Promise.resolve( body )
			} ) );
		}

		it( 'builds the correct URL from scriptPath and query', async () => {
			stubFetch( makeResponse( [] ) );

			await client.fetchByQuery( 'cats', 5 );

			expect( global.fetch ).toHaveBeenCalledWith(
				'/w/rest.php/v1/search/title?q=cats&limit=5',
				expect.objectContaining( {
					headers: { accept: 'application/json' }
				} )
			);
		} );

		it( 'processes template syntax before building URL', async () => {
			stubFetch( makeResponse( [] ) );

			await client.fetchByQuery( '{{Infobox}}', 10 );

			expect( global.fetch ).toHaveBeenCalledWith(
				expect.stringContaining( 'q=Template%3AInfobox' ),
				expect.anything()
			);
		} );

		it( 'passes the abort signal to fetch', async () => {
			stubFetch( makeResponse( [] ) );
			const controller = new AbortController();

			await client.fetchByQuery( 'test', 10, controller.signal );

			expect( global.fetch ).toHaveBeenCalledWith(
				expect.any( String ),
				expect.objectContaining( { signal: controller.signal } )
			);
		} );

		it( 'throws on non-ok responses', async () => {
			stubFetch( {}, 404 );

			await expect( client.fetchByQuery( 'test', 10 ) )
				.rejects.toThrow( 'Network request failed with HTTP code 404' );
		} );

		it( 'adapts a basic page result', async () => {
			stubFetch( makeResponse( [
				{
					id: 1,
					key: 'Cat',
					title: 'Cat',
					matched_title: null,
					description: 'A small animal',
					thumbnail: null
				}
			] ) );

			const result = await client.fetchByQuery( 'cat', 10 );

			expect( result.query ).toBe( 'cat' );
			expect( result.results ).toHaveLength( 1 );

			const item = result.results[ 0 ];
			expect( item.id ).toBe( 'citizen-command-palette-item-page-Cat' );
			expect( item.type ).toBe( 'page' );
			expect( item.label ).toBe( 'Cat' );
			expect( item.description ).toBe( 'A small animal' );
			expect( item.url ).toBe( '/wiki/Cat' );
			expect( item.thumbnail ).toBeUndefined();
			expect( item.metadata ).toBeUndefined();
			expect( item.highlightQuery ).toBe( true );
		} );

		it( 'adapts a page with thumbnail', async () => {
			stubFetch( makeResponse( [
				{
					id: 2,
					key: 'Dog',
					title: 'Dog',
					matched_title: null,
					thumbnail: {
						url: 'https://example.com/dog.jpg',
						width: 200,
						height: 150
					}
				}
			] ) );

			const result = await client.fetchByQuery( 'dog', 10 );
			const item = result.results[ 0 ];

			expect( item.thumbnail ).toEqual( {
				url: 'https://example.com/dog.jpg',
				width: 200,
				height: 150
			} );
		} );

		it( 'adapts a redirect with metadata', async () => {
			stubFetch( makeResponse( [
				{
					id: 3,
					key: 'Kitty',
					title: 'Cat',
					matched_title: 'Kitty',
					thumbnail: null
				}
			] ) );

			const result = await client.fetchByQuery( 'kitty', 10 );
			const item = result.results[ 0 ];

			expect( item.url ).toBe( '/wiki/Kitty' );
			expect( item.metadata ).toHaveLength( 1 );
			expect( item.metadata[ 0 ].label ).toBe( 'Kitty' );
			expect( item.metadata[ 0 ].highlightQuery ).toBe( true );
		} );

		it( 'includes edit action with navigate type', async () => {
			stubFetch( makeResponse( [
				{
					id: 4,
					key: 'Fox',
					title: 'Fox',
					matched_title: null,
					thumbnail: null
				}
			] ) );

			const result = await client.fetchByQuery( 'fox', 10 );
			const action = result.results[ 0 ].actions[ 0 ];

			expect( action.id ).toBe( 'edit' );
			expect( action.type ).toBe( 'navigate' );
			expect( action.label ).toBe( 'action-edit' );
			expect( action.url ).toBe( '/wiki/Fox?action=edit' );
		} );

		it( 'omits descriptions when showDescription is false', async () => {
			stubFetch( makeResponse( [
				{
					id: 5,
					key: 'Ant',
					title: 'Ant',
					matched_title: null,
					description: 'An insect',
					thumbnail: null
				}
			] ) );

			const result = await client.fetchByQuery( 'ant', 10, undefined, false );
			const item = result.results[ 0 ];

			expect( item.description ).toBeUndefined();
		} );
	} );
} );
