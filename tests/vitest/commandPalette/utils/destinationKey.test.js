// @vitest-environment jsdom
/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;
const mwTitle = require( '../../mocks/mwTitle.js' );

const destinationKey = require( '../../../../resources/skins.citizen.commandPalette/utils/destinationKey.js' );

function withPaths( articlePath, script ) {
	vi.spyOn( mw.config, 'get' ).mockImplementation( ( key ) => ( {
		wgArticlePath: articlePath,
		wgScript: script
	} )[ key ] ?? null );
}

const keyOf = ( url ) => destinationKey( { id: 'x', url } );

describe( 'destinationKey', () => {
	beforeEach( () => {
		mw.Title = mwTitle;
		withPaths( '/wiki/$1', '/w/index.php' );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'gives every link to a page the key of its normalised title', () => {
		const keys = [
			'/wiki/Main_Page',
			'/w/index.php?title=Main_Page',
			'http://localhost:3000/wiki/Main_Page',
			'/wiki/main_Page#History'
		].map( keyOf );

		expect( new Set( keys ) ).toEqual( new Set( [ 'page:Main Page' ] ) );
	} );

	it( 'decodes the title in the path', () => {
		expect( keyOf( '/wiki/Caf%C3%A9' ) ).toBe( 'page:Café' );
	} );

	it( 'treats the aliases of a namespace as one page', () => {
		expect( keyOf( '/wiki/Benutzerin:Foo' ) ).toBe( keyOf( '/wiki/User:Foo' ) );
	} );

	it( 'reads a script-style article path', () => {
		withPaths( '/index.php/$1', '/index.php' );

		expect( keyOf( '/index.php/Main_Page' ) ).toBe( 'page:Main Page' );
		expect( keyOf( '/index.php?title=Main_Page' ) ).toBe( 'page:Main Page' );
	} );

	it( 'counts Special:Search without fulltext as the page its query names', () => {
		expect( keyOf( '/w/index.php?title=Special:Search&search=akita' ) ).toBe( 'page:Akita' );
	} );

	it( 'keys anything that is not a page view by its link', () => {
		const links = [
			'/w/index.php?title=Special:Search&search=Akita&fulltext=1',
			'/w/index.php?title=Special:Search',
			'/w/index.php?title=Akita&action=edit',
			'/w/index.php?title=Akita&oldid=12',
			'/w/api.php?title=Akita',
			'https://example.org/wiki/Akita'
		];

		for ( const url of links ) {
			expect( keyOf( url ) ).toBe( `url:${ new URL( url, 'http://localhost:3000/' ).href }` );
		}
	} );

	it( 'keys a title mw.Title rejects, or cannot decode, by its link', () => {
		expect( keyOf( '/wiki/%7B%7BNavbox%7D%7D' ) ).toMatch( /^url:/ );
		expect( keyOf( '/wiki/%E0%A4%A' ) ).toMatch( /^url:/ );
	} );

	it( 'keys an item without a link by its id', () => {
		expect( destinationKey( { id: 'command-1' } ) ).toBe( 'id:command-1' );
	} );
} );
