// @vitest-environment jsdom
/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;
const mwTitle = require( '../../mocks/mwTitle.js' );
const icons = require( '../../mocks/commandPaletteIcons.js' );

const { isPlaceLink, entryFromLink, rowFromEntry, rankOf } = require( '../../../../resources/skins.citizen.commandPalette/utils/recentEntry.js' );

describe( 'recentEntry', () => {
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

	describe( 'isPlaceLink', () => {
		it( 'accepts a wiki path and a web address', () => {
			expect( isPlaceLink( '/wiki/X' ) ).toBe( true );
			expect( isPlaceLink( 'https://example.org/x' ) ).toBe( true );
		} );

		it( 'rejects a fragment, an empty link and a script', () => {
			expect( isPlaceLink( '#x' ) ).toBe( false );
			expect( isPlaceLink( '' ) ).toBe( false );
			expect( isPlaceLink( 'javascript:alert(1)' ) ).toBe( false );
		} );
	} );

	describe( 'entryFromLink', () => {
		it( 'names a page view by its title', () => {
			const row = { label: 'Elsewhere', url: '/wiki/Other' };

			const entry = entryFromLink( '/wiki/Main_Page', row, 5 );

			expect( entry ).toEqual( {
				kind: 'page',
				key: 'page:Main Page',
				label: 'Main Page',
				url: '/wiki/Main_Page',
				savedAt: 5
			} );
		} );

		it( 'keeps the row label for the page the row itself links to', () => {
			const row = { label: 'United States', url: '/wiki/USA' };

			const entry = entryFromLink( '/wiki/USA', row, 1 );

			expect( entry.label ).toBe( 'United States' );
			expect( entry.key ).toBe( 'page:USA' );
		} );

		it( 'keeps a special page under its local name', () => {
			const entry = entryFromLink( '/wiki/Special:ImageList', {}, 1 );

			expect( entry.kind ).toBe( 'special' );
			expect( entry.label ).toBe( 'Special:ListFiles' );
		} );

		it( 'reads a go link as the query it searched for', () => {
			const entry = entryFromLink( '/wiki/Special:Search?search=main+page', { label: 'main page' }, 1 );

			expect( entry.kind ).toBe( 'go' );
			expect( entry.label ).toBe( 'main page' );
			expect( entry.key ).toBe( 'page:Main page' );
		} );

		it( 'reads a full-text search link as a search', () => {
			const entry = entryFromLink( '/wiki/Special:Search?search=cats&fulltext=1', {}, 1 );

			expect( entry.kind ).toBe( 'search' );
			expect( entry.label ).toBe( 'cats' );
		} );

		it( 'keeps a search link with anything else in it as a link', () => {
			const row = { label: 'cats in articles', url: '/w/index.php?title=Special:Search&search=cats&fulltext=1&ns0=1' };

			const entry = entryFromLink( row.url, row, 1 );

			expect( entry ).toMatchObject( { kind: 'link', label: 'cats in articles' } );
		} );

		it( 'names the page an edit link opens, whatever the row was called', () => {
			const row = { label: 'Edit', url: '/w/index.php?title=Help:Contents&action=edit' };

			const entry = entryFromLink( row.url, row, 1 );

			expect( entry.kind ).toBe( 'edit' );
			expect( entry.label ).toBe( 'Help:Contents' );
		} );

		it( 'names the page a section edit link opens', () => {
			const row = { label: 'Edit section', url: '/w/index.php?title=Main_Page&action=edit&section=2' };

			const entry = entryFromLink( row.url, row, 1 );

			expect( entry ).toMatchObject( { kind: 'edit', label: 'Main Page' } );
		} );

		it( 'counts a red link\'s edit link as an edit', () => {
			const entry = entryFromLink( '/w/index.php?title=New_Page&action=edit&redlink=1', {}, 1 );

			expect( entry ).toMatchObject( { kind: 'edit', label: 'New Page' } );
		} );

		it( 'reads an empty search as the search page itself', () => {
			const entry = entryFromLink( '/w/index.php?title=Special:Search&search=', {}, 1 );

			expect( entry ).toMatchObject( { kind: 'special', label: 'Special:Search' } );
		} );

		it( 'names the page a visual or source editor link opens', () => {
			const row = { label: 'Edit source', url: '/w/index.php?title=Help:Contents&veaction=editsource' };

			const source = entryFromLink( row.url, row, 1 );
			const visual = entryFromLink( '/w/index.php?title=Help:Contents&veaction=edit', row, 1 );

			expect( source ).toMatchObject( { kind: 'edit', label: 'Help:Contents' } );
			expect( visual ).toMatchObject( { kind: 'edit', label: 'Help:Contents' } );
		} );

		it( 'keeps an editor link with anything else in it as a link', () => {
			const row = { label: 'Edit source', url: '/w/index.php?title=Help:Contents&veaction=editsource&foo=1' };

			const extra = entryFromLink( row.url, row, 1 );
			const otherAction = entryFromLink( '/w/index.php?title=Help:Contents&action=history&veaction=edit', row, 1 );

			expect( extra ).toMatchObject( { kind: 'link', label: 'Edit source', context: 'Help:Contents' } );
			expect( otherAction ).toMatchObject( { kind: 'link', context: 'Help:Contents' } );
		} );

		it( 'names the page a revision or diff link shows', () => {
			const row = { label: '5m · Alice', url: '/w/index.php?title=Main_Page&oldid=123' };

			const entry = entryFromLink( '/w/index.php?title=Main_Page&diff=prev&oldid=123', row, 1 );

			expect( entry.kind ).toBe( 'revision' );
			expect( entry.label ).toBe( 'Main Page' );
			expect( entry.url ).toBe( '/w/index.php?title=Main_Page&diff=prev&oldid=123' );
		} );

		it( 'keeps any other wiki link as a link that names the page it acts on', () => {
			const row = { label: 'History', url: '/w/index.php?title=Help:Contents&action=history' };

			const entry = entryFromLink( row.url, row, 1 );

			expect( entry ).toMatchObject( { kind: 'link', label: 'History', context: 'Help:Contents' } );
		} );

		it( 'keeps a link to another site under the row label', () => {
			const entry = entryFromLink( 'https://example.org/x', { label: 'Example' }, 1 );

			expect( entry ).toMatchObject( { kind: 'link', label: 'Example' } );
			expect( entry ).not.toHaveProperty( 'context' );
		} );

		it( 'names a page from the link when the row led somewhere else', () => {
			const row = { label: 'Shortcut', url: '/wiki/A' };

			const entry = entryFromLink( '/wiki/B', row, 1 );

			expect( entry.label ).toBe( 'B' );
		} );

		it( 'remembers nothing for a row without a real link', () => {
			expect( entryFromLink( '#', { label: 'Purge' }, 1 ) ).toBeNull();
			expect( entryFromLink( '', { label: 'Empty' }, 1 ) ).toBeNull();
			expect( entryFromLink( undefined, { label: 'None' }, 1 ) ).toBeNull();
			expect( entryFromLink( 'javascript:alert(1)', { label: 'Script' }, 1 ) ).toBeNull();
		} );

		it( 'remembers nothing for a link to another site without a label', () => {
			expect( entryFromLink( 'https://example.org/x', {}, 1 ) ).toBeNull();
		} );
	} );

	describe( 'rowFromEntry', () => {
		it( 'shows a page with the page icon and its edit button', () => {
			const entry = { kind: 'page', key: 'page:Main Page', label: 'Main Page', url: '/wiki/Main_Page', savedAt: 1 };

			const row = rowFromEntry( entry );

			expect( row ).toMatchObject( {
				id: 'citizen-command-palette-recent-page%3AMain%20Page',
				type: 'page',
				label: 'Main Page',
				url: '/wiki/Main_Page',
				thumbnailIcon: icons.cdxIconArticle
			} );
			expect( row.actions.map( ( a ) => a.id ) ).toEqual( [ 'edit' ] );
			expect( row.actions[ 0 ].url ).toBe( '/wiki/Main Page?action=edit' );
		} );

		it( 'points the edit button at the linked page, not the label', () => {
			const entry = { kind: 'page', key: 'page:User:Alice', label: 'Alice', url: '/wiki/User:Alice', savedAt: 1 };

			const row = rowFromEntry( entry );

			expect( row.actions[ 0 ].url ).toBe( '/wiki/Benutzer:Alice?action=edit' );
		} );

		it( 'gives no edit button to a page that holds no wikitext', () => {
			const entry = { kind: 'special', key: 'page:Special:ListFiles', label: 'Special:ListFiles', url: '/wiki/Special:ListFiles', savedAt: 1 };

			const row = rowFromEntry( entry );

			expect( row.actions ).toEqual( [] );
			expect( row.thumbnailIcon ).toBe( icons.cdxIconSpecialPages );
		} );

		it( 'describes a search and an edit in the current language', () => {
			const search = rowFromEntry( { kind: 'search', key: 'url:s', label: 'cats', url: '/wiki/Special:Search?search=cats&fulltext=1', savedAt: 1 } );
			const edit = rowFromEntry( { kind: 'edit', key: 'url:e', label: 'Foo', url: '/w/index.php?title=Foo&action=edit', savedAt: 1 } );

			expect( search.description ).toBe( 'citizen-command-palette-queryaction-fulltext-search-description' );
			expect( search.thumbnailIcon ).toBe( icons.cdxIconArticleSearch );
			expect( edit.description ).toBe( 'citizen-command-palette-queryaction-page-edit-description' );
			expect( edit.thumbnailIcon ).toBe( icons.cdxIconEdit );
		} );

		it( 'shows a go as the query alone, with the search icon', () => {
			const row = rowFromEntry( { kind: 'go', key: 'page:Zzqx', label: 'zzqx', url: '/wiki/Special:Search?search=zzqx', savedAt: 1 } );

			expect( row.label ).toBe( 'zzqx' );
			expect( row ).not.toHaveProperty( 'description' );
			expect( row.thumbnailIcon ).toBe( icons.cdxIconSearch );
		} );

		it( 'shows a link with the page it acts on', () => {
			const row = rowFromEntry( { kind: 'link', key: 'url:h', label: 'History', url: '/w/index.php?title=Help:Contents&action=history', savedAt: 1, context: 'Help:Contents' } );

			expect( row.description ).toBe( 'Help:Contents' );
			expect( row.thumbnailIcon ).toBe( icons.cdxIconPlay );
		} );
	} );

	describe( 'rankOf', () => {
		it( 'ranks a go below everything that names its place outright', () => {
			expect( rankOf( { kind: 'go' } ) ).toBe( 0 );
			expect( rankOf( { kind: 'page' } ) ).toBe( 1 );
			expect( rankOf( { kind: 'link' } ) ).toBe( 1 );
		} );
	} );
} );
