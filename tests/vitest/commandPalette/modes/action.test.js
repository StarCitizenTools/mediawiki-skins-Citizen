const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createActionCommand = require(
	'../../../../resources/skins.citizen.commandPalette/modes/action.js'
);

describe( 'action mode', () => {
	let mode;
	let documentRef;

	beforeEach( () => {
		documentRef = {
			getElementById: vi.fn( () => null )
		};

		mode = createActionCommand( documentRef, [] );
	} );

	describe( 'mode definition', () => {
		it( 'should have correct id and triggers', () => {
			expect( mode.id ).toBe( 'action' );
			expect( mode.triggers ).toEqual( [ '/action:', '>' ] );
		} );

		it( 'should return navigate action for items with url', async () => {
			const result = await mode.onResultSelect( { url: '/wiki/Special:RecentChanges' } );

			expect( result ).toEqual( { action: 'navigate', payload: '/wiki/Special:RecentChanges' } );
		} );

		it( 'should return none action for items without url', async () => {
			const result = await mode.onResultSelect( {} );

			expect( result ).toEqual( { action: 'none' } );
		} );
	} );

	describe( 'special pages via getResults', () => {
		it( 'should list a page that has no alias under its canonical name', async () => {
			mode = createActionCommand( documentRef, [ 'Pinyinconvert' ] );

			const results = await mode.getResults( '' );

			expect( results ).toHaveLength( 1 );
			expect( results[ 0 ] ).toMatchObject( {
				label: 'Pinyinconvert',
				url: '/wiki/Special:Pinyinconvert'
			} );
		} );

		it( 'should label a page with its alias, replacing underscores with spaces', async () => {
			mode = createActionCommand( documentRef, [ [ 'Recentchanges', 'Recent_changes' ] ] );

			const results = await mode.getResults( '' );

			expect( results[ 0 ].label ).toBe( 'Recent changes' );
		} );

		it( 'should sort special pages by label', async () => {
			mode = createActionCommand( documentRef, [
				'Watchlist',
				[ 'Allpages', 'All_pages' ],
				'Log'
			] );

			const results = await mode.getResults( '' );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'All pages', 'Log', 'Watchlist' ] );
		} );

		it( 'should adapt special page items with correct shape', async () => {
			mode = createActionCommand( documentRef, [ [ 'Recentchanges', 'RecentChanges' ] ] );

			const results = await mode.getResults( '' );

			expect( results[ 0 ] ).toMatchObject( {
				id: 'special-recentchanges',
				type: 'special-page',
				label: 'RecentChanges',
				url: '/wiki/Special:Recentchanges',
				value: '/action:Recentchanges',
				highlightQuery: true
			} );
		} );
	} );

	describe( 'fetchMenuItems via getResults', () => {
		function makePortlet( id, heading, links ) {
			const linkElements = links.map( ( link ) => {
				const li = {
					id: link.liId || '',
					closest: vi.fn( () => li )
				};
				const a = {
					getAttribute: vi.fn( ( attr ) => {
						if ( attr === 'href' ) {
							return link.href;
						}
						if ( attr === 'title' ) {
							return link.title || null;
						}
						return null;
					} ),
					closest: vi.fn( () => li ),
					querySelector: vi.fn( ( sel ) => {
						if ( sel === 'span:not([class*="icon"])' && link.label ) {
							return { textContent: link.label };
						}
						return null;
					} )
				};
				return a;
			} );

			return {
				querySelector: vi.fn( () => ( {
					textContent: heading
				} ) ),
				querySelectorAll: vi.fn( () => linkElements )
			};
		}

		it( 'should extract menu items from portlets', async () => {
			const portlet = makePortlet( 'p-views', 'Views', [
				{ liId: 'ca-edit', href: '/wiki/edit', label: 'Edit', title: 'Edit this page [e]' }
			] );
			documentRef.getElementById = vi.fn( ( id ) => {
				if ( id === 'p-views' ) {
					return portlet;
				}
				return null;
			} );

			mode = createActionCommand( documentRef, [] );

			const results = await mode.getResults( '' );

			expect( results ).toEqual(
				expect.arrayContaining( [
					expect.objectContaining( {
						type: 'menu-item',
						label: 'Edit'
					} )
				] )
			);
		} );

		it( 'should carry the portlet heading as the item metadata', async () => {
			const portlet = makePortlet( 'p-views', 'Views', [
				{ liId: 'ca-edit', href: '/wiki/edit', label: 'Edit' }
			] );
			documentRef.getElementById = vi.fn( ( id ) => ( id === 'p-views' ? portlet : null ) );
			mode = createActionCommand( documentRef, [] );

			const results = await mode.getResults( '' );

			expect( results[ 0 ].metadata ).toEqual( [ { label: 'Views' } ] );
		} );

		it( 'should omit metadata when the portlet has no heading', async () => {
			const portlet = makePortlet( 'p-views', undefined, [
				{ liId: 'ca-edit', href: '/wiki/edit', label: 'Edit' }
			] );
			documentRef.getElementById = vi.fn( ( id ) => ( id === 'p-views' ? portlet : null ) );
			mode = createActionCommand( documentRef, [] );

			const results = await mode.getResults( '' );

			expect( results[ 0 ].metadata ).toBeUndefined();
		} );

		it( 'should deduplicate menu items by URL', async () => {
			const portlet = makePortlet( 'p-views', 'Views', [
				{ liId: 'ca-edit', href: '/wiki/edit', label: 'Edit' },
				{ liId: 'ca-edit-dup', href: '/wiki/edit', label: 'Edit Again' }
			] );
			documentRef.getElementById = vi.fn( ( id ) => {
				if ( id === 'p-views' ) {
					return portlet;
				}
				return null;
			} );

			mode = createActionCommand( documentRef, [] );

			const results = await mode.getResults( '' );
			const menuItems = results.filter( ( r ) => r.type === 'menu-item' );

			expect( menuItems ).toHaveLength( 1 );
		} );

		it( 'should strip keyboard shortcut hints from title attribute', async () => {
			const portlet = makePortlet( 'p-views', 'Views', [
				{ liId: 'ca-edit', href: '/wiki/edit', label: 'Edit', title: 'Edit this page [e]' }
			] );
			documentRef.getElementById = vi.fn( ( id ) => {
				if ( id === 'p-views' ) {
					return portlet;
				}
				return null;
			} );

			mode = createActionCommand( documentRef, [] );

			const results = await mode.getResults( '' );
			const editItem = results.find( ( r ) => r.label === 'Edit' );

			expect( editItem.description ).toBe( 'Edit this page' );
		} );

		it( 'should skip links without a label element', async () => {
			const portlet = makePortlet( 'p-views', 'Views', [
				{ liId: 'ca-icon-only', href: '/wiki/icon-only', label: null },
				{ liId: 'ca-edit', href: '/wiki/edit', label: 'Edit' }
			] );
			documentRef.getElementById = vi.fn( ( id ) => {
				if ( id === 'p-views' ) {
					return portlet;
				}
				return null;
			} );

			mode = createActionCommand( documentRef, [] );

			const results = await mode.getResults( '' );
			const menuItems = results.filter( ( r ) => r.type === 'menu-item' );

			expect( menuItems ).toHaveLength( 1 );
			expect( menuItems[ 0 ].label ).toBe( 'Edit' );
		} );

		it( 'should cache menu items across calls', async () => {
			const portlet = makePortlet( 'p-views', 'Views', [
				{ liId: 'ca-edit', href: '/wiki/edit', label: 'Edit' }
			] );
			const getElementById = vi.fn( ( id ) => {
				if ( id === 'p-views' ) {
					return portlet;
				}
				return null;
			} );
			documentRef.getElementById = getElementById;

			mode = createActionCommand( documentRef, [] );

			await mode.getResults( '' );
			await mode.getResults( '' );

			expect( getElementById ).toHaveBeenCalledTimes( 5 );
		} );
	} );

	describe( 'filtering', () => {
		it( 'should filter results by label match', async () => {
			mode = createActionCommand( documentRef, [
				[ 'Recentchanges', 'Recent_changes' ],
				[ 'Allpages', 'All_pages' ],
				'Log'
			] );

			const results = await mode.getResults( 'log' );

			expect( results ).toHaveLength( 1 );
			expect( results[ 0 ].label ).toBe( 'Log' );
		} );

		it( 'should match the canonical name when the label is localized', async () => {
			mode = createActionCommand( documentRef, [
				[ 'Recentchanges', '最近更改' ],
				[ 'Allpages', '所有页面' ]
			] );

			const results = await mode.getResults( 'recentchanges' );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ '最近更改' ] );
		} );

		it( 'should return all items when subQuery is empty', async () => {
			mode = createActionCommand( documentRef, [ 'A', 'B' ] );

			const results = await mode.getResults( '' );

			expect( results ).toHaveLength( 2 );
		} );
	} );
} );
