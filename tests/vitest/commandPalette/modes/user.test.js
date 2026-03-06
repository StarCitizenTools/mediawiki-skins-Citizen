const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createUserCommand = require(
	'../../../../resources/skins.citizen.commandPalette/modes/user.js'
);

describe( 'user mode', () => {
	let mockGet;
	let mockLoadMessages;
	let loadMessagesCalls;
	let mode;

	beforeEach( () => {
		mockGet = vi.fn();
		loadMessagesCalls = [];
		mockLoadMessages = vi.fn( ( keys ) => {
			loadMessagesCalls.push( [ ...keys ] );
			return Promise.resolve();
		} );
		const ApiConstructor = function () {
			this.get = mockGet;
			this.loadMessagesIfMissing = mockLoadMessages;
		};

		mode = createUserCommand( ApiConstructor );
	} );

	describe( 'mode definition', () => {
		it( 'should have correct id and triggers', () => {
			expect( mode.id ).toBe( 'user' );
			expect( mode.triggers ).toEqual( [ '/user:', '@' ] );
		} );

		it( 'should have emptyState', () => {
			expect( mode.emptyState ).toBeDefined();
			expect( mode.emptyState.title ).toBeTruthy();
			expect( mode.emptyState.description ).toBeTruthy();
		} );

		it( 'should have noResults function', () => {
			const result = mode.noResults();

			expect( result.title ).toBeTruthy();
			expect( result.description ).toBeTruthy();
		} );

		it( 'should return navigate action for items with url', async () => {
			const result = await mode.onResultSelect( { url: '/wiki/User:Alice' } );

			expect( result ).toEqual( { action: 'navigate', payload: '/wiki/User:Alice' } );
		} );

		it( 'should return none action for items without url', async () => {
			const result = await mode.onResultSelect( {} );

			expect( result ).toEqual( { action: 'none' } );
		} );
	} );

	describe( 'getResults', () => {
		it( 'should return empty array for empty query', async () => {
			const results = await mode.getResults( '' );

			expect( results ).toEqual( [] );
			expect( mockGet ).not.toHaveBeenCalled();
		} );

		it( 'should return empty array for whitespace-only query', async () => {
			const results = await mode.getResults( '   ' );

			expect( results ).toEqual( [] );
		} );

		it( 'should call API with correct parameters', async () => {
			mockGet.mockResolvedValue( { query: { allusers: [] } } );

			await mode.getResults( 'Ali' );

			expect( mockGet ).toHaveBeenCalledWith(
				expect.objectContaining( {
					action: 'query',
					list: 'allusers',
					auprefix: 'Ali',
					aulimit: 10,
					auprop: 'editcount|groups|implicitgroups'
				} )
			);
		} );

		it( 'should return empty array when API returns no users', async () => {
			mockGet.mockResolvedValue( { query: { allusers: [] } } );

			const results = await mode.getResults( 'nonexistent' );

			expect( results ).toEqual( [] );
		} );

		it( 'should adapt user results with correct shape', async () => {
			mockGet.mockResolvedValue( {
				query: {
					allusers: [ {
						userid: 42,
						name: 'Alice',
						editcount: 1500,
						groups: [ 'sysop', '*' ],
						implicitgroups: [ '*' ]
					} ]
				}
			} );

			const results = await mode.getResults( 'Ali' );

			expect( results[ 0 ] ).toMatchObject( {
				id: 'citizen-command-palette-item-user-42',
				type: 'user',
				label: 'Alice',
				highlightQuery: true,
				metadata: [ { label: '1500' } ]
			} );
			expect( results[ 0 ].url ).toContain( 'User:Alice' );
		} );

		it( 'should include talk and contributions actions', async () => {
			mockGet.mockResolvedValue( {
				query: {
					allusers: [ {
						userid: 1,
						name: 'Bob',
						editcount: 10,
						groups: [ '*' ],
						implicitgroups: [ '*' ]
					} ]
				}
			} );

			const results = await mode.getResults( 'Bob' );

			const actionIds = results[ 0 ].actions.map( ( a ) => a.id );
			expect( actionIds ).toEqual( [ 'talk', 'contributions' ] );
			expect( results[ 0 ].actions[ 0 ].url ).toContain( 'User_talk:Bob' );
			expect( results[ 0 ].actions[ 1 ].url ).toContain( 'Special:Contributions/Bob' );
		} );

		it( 'should filter out implicit groups from description', async () => {
			mockGet.mockResolvedValue( {
				query: {
					allusers: [ {
						userid: 1,
						name: 'Admin',
						editcount: 100,
						groups: [ 'sysop', 'bureaucrat', '*', 'user', 'autoconfirmed' ],
						implicitgroups: [ '*', 'user', 'autoconfirmed' ]
					} ]
				}
			} );

			const results = await mode.getResults( 'Admin' );

			// mw.message returns the key as text in our mock
			// The description should only contain non-implicit groups
			expect( results[ 0 ].description ).toContain( 'group-sysop-member' );
			expect( results[ 0 ].description ).toContain( 'group-bureaucrat-member' );
			expect( results[ 0 ].description ).not.toContain( 'group-*-member' );
		} );

		it( 'should return empty array on API error', async () => {
			mockGet.mockRejectedValue( new Error( 'Network error' ) );

			const results = await mode.getResults( 'test' );

			expect( results ).toEqual( [] );
		} );
	} );

	describe( 'loadUserGroupMessages', () => {
		it( 'should load messages for user groups', async () => {
			mockGet.mockResolvedValue( {
				query: {
					allusers: [ {
						userid: 1,
						name: 'Alice',
						editcount: 10,
						groups: [ 'sysop', '*' ],
						implicitgroups: [ '*' ]
					} ]
				}
			} );

			await mode.getResults( 'Ali' );

			expect( mockLoadMessages ).toHaveBeenCalledWith( [ 'group-sysop-member' ] );
		} );

		it( 'should not reload already-loaded message keys', async () => {
			mockGet.mockResolvedValue( {
				query: {
					allusers: [ {
						userid: 1,
						name: 'Alice',
						editcount: 10,
						groups: [ 'sysop', '*' ],
						implicitgroups: [ '*' ]
					} ]
				}
			} );

			await mode.getResults( 'Ali' );
			await mode.getResults( 'Ali' );

			// Only called once — second call has no new keys so it skips entirely
			expect( loadMessagesCalls ).toHaveLength( 1 );
			expect( loadMessagesCalls[ 0 ] ).toEqual( [ 'group-sysop-member' ] );
		} );

		it( 'should deduplicate message keys across users', async () => {
			mockGet.mockResolvedValue( {
				query: {
					allusers: [
						{
							userid: 1,
							name: 'Alice',
							editcount: 10,
							groups: [ 'sysop', '*' ],
							implicitgroups: [ '*' ]
						},
						{
							userid: 2,
							name: 'Adam',
							editcount: 5,
							groups: [ 'sysop', '*' ],
							implicitgroups: [ '*' ]
						}
					]
				}
			} );

			await mode.getResults( 'A' );

			expect( mockLoadMessages ).toHaveBeenCalledWith( [ 'group-sysop-member' ] );
		} );
	} );
} );
