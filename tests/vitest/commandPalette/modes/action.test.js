const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createActionCommand = require(
	'../../../../resources/skins.citizen.commandPalette/modes/action.js'
);

describe( 'action mode', () => {
	let mockGet;
	let mode;
	let documentRef;

	beforeEach( () => {
		mockGet = vi.fn();
		const ApiConstructor = function () {
			this.get = mockGet;
		};

		documentRef = {
			getElementById: vi.fn( () => null )
		};

		mode = createActionCommand( documentRef, ApiConstructor );
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

	describe( 'fetchSpecialPages via getResults', () => {
		it( 'should fetch and adapt special pages from API', async () => {
			mockGet.mockResolvedValue( {
				query: {
					specialpagealiases: [
						{ realname: 'RecentChanges', aliases: [ 'Recent_changes', 'RC' ] },
						{ realname: 'AllPages', aliases: [ 'All_pages' ] }
					]
				}
			} );

			const results = await mode.getResults( '' );

			expect( mockGet ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					meta: 'siteinfo',
					siprop: 'specialpagealiases'
				} )
			);
			const labels = results.map( ( r ) => r.label );
			expect( labels ).toContain( 'All pages' );
			expect( labels ).toContain( 'Recent changes' );
		} );

		it( 'should sort special pages alphabetically', async () => {
			mockGet.mockResolvedValue( {
				query: {
					specialpagealiases: [
						{ realname: 'Watchlist', aliases: [ 'Watchlist' ] },
						{ realname: 'AllPages', aliases: [ 'All_pages' ] },
						{ realname: 'Log', aliases: [ 'Log' ] }
					]
				}
			} );

			const results = await mode.getResults( '' );

			const labels = results.map( ( r ) => r.label );
			expect( labels ).toEqual( [ ...labels ].sort() );
		} );

		it( 'should replace underscores with spaces in aliases', async () => {
			mockGet.mockResolvedValue( {
				query: {
					specialpagealiases: [
						{ realname: 'RecentChanges', aliases: [ 'Recent_changes' ] }
					]
				}
			} );

			const results = await mode.getResults( '' );

			expect( results[ 0 ].label ).toBe( 'Recent changes' );
		} );

		it( 'should cache API results on subsequent calls', async () => {
			mockGet.mockResolvedValue( {
				query: { specialpagealiases: [] }
			} );

			await mode.getResults( '' );
			await mode.getResults( '' );

			expect( mockGet ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should return empty array and clear cache on API error', async () => {
			mockGet.mockRejectedValue( new Error( 'Network error' ) );

			const results = await mode.getResults( '' );

			expect( results ).toEqual( [] );
		} );

		it( 'should adapt special page items with correct shape', async () => {
			mockGet.mockResolvedValue( {
				query: {
					specialpagealiases: [
						{ realname: 'RecentChanges', aliases: [ 'Recent_changes' ] }
					]
				}
			} );

			const results = await mode.getResults( '' );

			expect( results[ 0 ] ).toMatchObject( {
				id: 'special-recentchanges',
				type: 'special-page',
				label: 'Recent changes',
				value: '/action:RecentChanges',
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
			mockGet.mockResolvedValue( { query: { specialpagealiases: [] } } );

			const portlet = makePortlet( 'p-views', 'Views', [
				{ liId: 'ca-edit', href: '/wiki/edit', label: 'Edit', title: 'Edit this page [e]' }
			] );
			documentRef.getElementById = vi.fn( ( id ) => {
				if ( id === 'p-views' ) {
					return portlet;
				}
				return null;
			} );

			mode = createActionCommand( documentRef, function () {
				this.get = mockGet;
			} );

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

		it( 'should deduplicate menu items by URL', async () => {
			mockGet.mockResolvedValue( { query: { specialpagealiases: [] } } );

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

			mode = createActionCommand( documentRef, function () {
				this.get = mockGet;
			} );

			const results = await mode.getResults( '' );
			const menuItems = results.filter( ( r ) => r.type === 'menu-item' );

			expect( menuItems ).toHaveLength( 1 );
		} );

		it( 'should strip keyboard shortcut hints from title attribute', async () => {
			mockGet.mockResolvedValue( { query: { specialpagealiases: [] } } );

			const portlet = makePortlet( 'p-views', 'Views', [
				{ liId: 'ca-edit', href: '/wiki/edit', label: 'Edit', title: 'Edit this page [e]' }
			] );
			documentRef.getElementById = vi.fn( ( id ) => {
				if ( id === 'p-views' ) {
					return portlet;
				}
				return null;
			} );

			mode = createActionCommand( documentRef, function () {
				this.get = mockGet;
			} );

			const results = await mode.getResults( '' );
			const editItem = results.find( ( r ) => r.label === 'Edit' );

			expect( editItem.description ).toBe( 'Edit this page' );
		} );

		it( 'should skip links without a label element', async () => {
			mockGet.mockResolvedValue( { query: { specialpagealiases: [] } } );

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

			mode = createActionCommand( documentRef, function () {
				this.get = mockGet;
			} );

			const results = await mode.getResults( '' );
			const menuItems = results.filter( ( r ) => r.type === 'menu-item' );

			expect( menuItems ).toHaveLength( 1 );
			expect( menuItems[ 0 ].label ).toBe( 'Edit' );
		} );

		it( 'should cache menu items across calls', async () => {
			mockGet.mockResolvedValue( { query: { specialpagealiases: [] } } );

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

			mode = createActionCommand( documentRef, function () {
				this.get = mockGet;
			} );

			await mode.getResults( '' );
			await mode.getResults( '' );

			expect( getElementById ).toHaveBeenCalledTimes( 5 );
		} );
	} );

	describe( 'filtering', () => {
		it( 'should filter results by label match', async () => {
			mockGet.mockResolvedValue( {
				query: {
					specialpagealiases: [
						{ realname: 'RecentChanges', aliases: [ 'Recent_changes' ] },
						{ realname: 'AllPages', aliases: [ 'All_pages' ] },
						{ realname: 'Log', aliases: [ 'Log' ] }
					]
				}
			} );

			const results = await mode.getResults( 'log' );

			expect( results ).toHaveLength( 1 );
			expect( results[ 0 ].label ).toBe( 'Log' );
		} );

		it( 'should filter results by id match', async () => {
			mockGet.mockResolvedValue( {
				query: {
					specialpagealiases: [
						{ realname: 'RecentChanges', aliases: [ 'Recent_changes' ] },
						{ realname: 'AllPages', aliases: [ 'All_pages' ] }
					]
				}
			} );

			const results = await mode.getResults( 'recent' );

			const labels = results.map( ( r ) => r.label );
			expect( labels ).toContain( 'Recent changes' );
		} );

		it( 'should return all items when subQuery is empty', async () => {
			mockGet.mockResolvedValue( {
				query: {
					specialpagealiases: [
						{ realname: 'A', aliases: [ 'A' ] },
						{ realname: 'B', aliases: [ 'B' ] }
					]
				}
			} );

			const results = await mode.getResults( '' );

			expect( results.length ).toBeGreaterThanOrEqual( 2 );
		} );
	} );
} );
