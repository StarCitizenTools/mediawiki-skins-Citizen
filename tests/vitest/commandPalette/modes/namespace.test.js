const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

let namespaceMode;

beforeEach( () => {
	vi.resetModules();

	mw.config.get = vi.fn( ( key ) => {
		if ( key === 'wgFormattedNamespaces' ) {
			return {
				0: '',
				1: 'Talk',
				2: 'User',
				3: 'User talk',
				6: 'File',
				10: 'Template',
				14: 'Category'
			};
		}
		return null;
	} );

	namespaceMode = require(
		'../../../../resources/skins.citizen.commandPalette/modes/namespace.js'
	);
} );

describe( 'namespace mode', () => {
	describe( 'mode definition', () => {
		it( 'should have correct id and triggers', () => {
			expect( namespaceMode.id ).toBe( 'namespace' );
			expect( namespaceMode.triggers ).toEqual( [ '/ns:', ':' ] );
		} );

		it( 'should have tokenPattern with prefix position and root activeIn', () => {
			expect( namespaceMode.tokenPattern.position ).toBe( 'prefix' );
			expect( namespaceMode.tokenPattern.modeId ).toBe( 'namespace' );
			expect( namespaceMode.tokenPattern.activeIn ).toBe( 'root' );
		} );
	} );

	describe( 'onResultSelect', () => {
		it( 'should return exitWithQuery action for items with a string value', () => {
			const result = namespaceMode.onResultSelect( { value: 'Talk:' } );

			expect( result ).toEqual( { action: 'exitWithQuery', payload: 'Talk:' } );
		} );

		it( 'should return none action for items without a value', () => {
			const result = namespaceMode.onResultSelect( {} );

			expect( result ).toEqual( { action: 'none' } );
		} );
	} );

	describe( 'getResults', () => {
		it( 'should return all namespaces except main when query is empty', async () => {
			const results = await namespaceMode.getResults( '' );

			const labels = results.map( ( r ) => r.label );
			expect( labels ).toContain( 'Talk' );
			expect( labels ).toContain( 'User' );
			expect( labels ).toContain( 'File' );
			expect( labels ).not.toContain( '' );
		} );

		it( 'should filter by label prefix case-insensitively', async () => {
			const results = await namespaceMode.getResults( 'us' );

			const labels = results.map( ( r ) => r.label );
			expect( labels ).toContain( 'User' );
			expect( labels ).toContain( 'User talk' );
			expect( labels ).not.toContain( 'Talk' );
			expect( labels ).not.toContain( 'File' );
		} );

		it( 'should filter by namespace ID prefix', async () => {
			const results = await namespaceMode.getResults( '1' );

			const ids = results.map( ( r ) => r.metadata[ 0 ].label );
			expect( ids ).toContain( '1' );
			expect( ids ).toContain( '10' );
			expect( ids ).toContain( '14' );
		} );

		it( 'should deduplicate results matched by both label and ID', async () => {
			// "1" matches Talk (id=1) by ID, and also Template (id=10), Category (id=14)
			const results = await namespaceMode.getResults( '1' );

			const idSet = new Set( results.map( ( r ) => r.metadata[ 0 ].label ) );
			expect( idSet.size ).toBe( results.length );
		} );

		it( 'should adapt results with correct shape', async () => {
			const results = await namespaceMode.getResults( 'Talk' );

			expect( results[ 0 ] ).toMatchObject( {
				id: expect.stringContaining( 'citizen-command-palette-item-namespace-' ),
				type: 'namespace',
				label: 'Talk',
				value: 'Talk:',
				highlightQuery: true,
				metadata: [ { label: '1' } ]
			} );
		} );

		it( 'should return empty array when no namespaces match', async () => {
			const results = await namespaceMode.getResults( 'zzz' );

			expect( results ).toEqual( [] );
		} );
	} );

	describe( 'tokenPattern.match', () => {
		it( 'should match a known namespace prefix', () => {
			const result = namespaceMode.tokenPattern.match( 'Talk:some query' );

			expect( result ).toEqual( { label: 'Talk:', raw: 'Talk:' } );
		} );

		it( 'should match case-insensitively', () => {
			const result = namespaceMode.tokenPattern.match( 'file:image.png' );

			expect( result ).toEqual( { label: 'File:', raw: 'File:' } );
		} );

		it( 'should return null for unknown prefixes', () => {
			const result = namespaceMode.tokenPattern.match( 'Unknown:stuff' );

			expect( result ).toBeNull();
		} );

		it( 'should return null for plain text', () => {
			const result = namespaceMode.tokenPattern.match( 'hello world' );

			expect( result ).toBeNull();
		} );

		it( 'should not match main namespace (empty string)', () => {
			const result = namespaceMode.tokenPattern.match( ':something' );

			expect( result ).toBeNull();
		} );
	} );
} );
