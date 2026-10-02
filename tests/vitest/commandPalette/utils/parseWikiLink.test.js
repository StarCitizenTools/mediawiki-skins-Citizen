// @vitest-environment jsdom
/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;
const mwTitle = require( '../../mocks/mwTitle.js' );

const parseWikiLink = require( '../../../../resources/skins.citizen.commandPalette/utils/parseWikiLink.js' );

const parse = ( url ) => parseWikiLink( new URL( url, window.location.href ) );

describe( 'parseWikiLink', () => {
	beforeEach( () => {
		mw.Title = mwTitle;
		vi.spyOn( mw.config, 'get' ).mockImplementation( ( key ) => ( {
			wgArticlePath: '/wiki/$1',
			wgScript: '/w/index.php'
		} )[ key ] ?? null );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'reads the title from the article path', () => {
		const parsed = parse( '/wiki/Main_Page' );

		expect( parsed.title.getPrefixedText() ).toBe( 'Main Page' );
		expect( parsed.params.toString() ).toBe( '' );
	} );

	it( 'reads the title from index.php and keeps the other parameters', () => {
		const parsed = parse( '/w/index.php?title=Help:Contents&action=edit' );

		expect( parsed.title.getPrefixedText() ).toBe( 'Help:Contents' );
		expect( parsed.params.toString() ).toBe( 'action=edit' );
	} );

	it( 'decodes the title in the path', () => {
		const parsed = parse( '/wiki/Caf%C3%A9' );

		expect( parsed.title.getPrefixedText() ).toBe( 'Café' );
	} );

	it( 'ignores a link to another site', () => {
		expect( parse( 'https://example.org/wiki/Main_Page' ) ).toBeNull();
	} );

	it( 'ignores a path outside the article path', () => {
		expect( parse( '/static/logo.png' ) ).toBeNull();
	} );

	it( 'ignores a title parameter on any path but index.php', () => {
		expect( parse( '/w/api.php?title=Main_Page' ) ).toBeNull();
	} );

	it( 'ignores a title the wiki cannot have', () => {
		expect( parse( '/wiki/%7B%7BNavbox%7D%7D' ) ).toBeNull();
	} );

	it( 'ignores a path that cannot be decoded', () => {
		expect( parse( '/wiki/%E0%A4%A' ) ).toBeNull();
	} );
} );
