const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

let namespaceMode;

beforeEach( () => {
	vi.resetModules();

	mw.config.get = vi.fn( ( key ) => {
		if ( key === 'wgFormattedNamespaces' ) {
			return {
				'-2': 'Media',
				'-1': 'Special',
				0: '',
				1: 'Talk',
				2: 'User',
				3: 'User talk',
				4: 'My Wiki',
				6: 'File',
				10: 'Template',
				14: 'Category',
				100: 'Portal'
			};
		}
		// Mirrors what MediaWiki exposes: localised names, canonical English
		// names and aliases, lower-cased. Modelled on a wiki that renamed its
		// project namespace and defined the usual T and CAT aliases.
		if ( key === 'wgNamespaceIds' ) {
			return {
				media: -2,
				special: -1,
				'': 0,
				// A $wgNamespaceAliases entry pointing at the main namespace.
				main: 0,
				talk: 1,
				user: 2,
				user_talk: 3,
				// $wgMetaNamespace written with a space keys with a space too.
				'my wiki': 4,
				project: 4,
				file: 6,
				image: 6,
				template: 10,
				t: 10,
				category: 14,
				cat: 14,
				portal: 100
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

		it( 'should filter by an alias that shares no prefix with the label', async () => {
			const results = await namespaceMode.getResults( 'image' );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'File' ] );
		} );

		it( 'should filter by the canonical name of a renamed namespace', async () => {
			const results = await namespaceMode.getResults( 'project' );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'My Wiki' ] );
		} );

		it( 'should list a namespace once when its label and an alias both match', async () => {
			const results = await namespaceMode.getResults( 'cat' );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'Category' ] );
		} );

		it( 'should filter by a name written with underscores', async () => {
			const results = await namespaceMode.getResults( 'user_t' );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'User talk' ] );
		} );

		it( 'should list namespaces named after the query before ones only aliased to it', async () => {
			// "project" is a canonical name every wiki carries, so on this wiki
			// it points at My Wiki (4) — which must not outrank Portal (100).
			const results = await namespaceMode.getResults( 'p' );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'Portal', 'My Wiki' ] );
		} );

		it( 'should return empty array when no namespaces match', async () => {
			const results = await namespaceMode.getResults( 'zzz' );

			expect( results ).toEqual( [] );
		} );
	} );

	describe( 'a namespace whose configured name contains spaces', () => {
		// MediaWiki keys such a name with the space intact, so it only lines up
		// with the name on the row once both sides are normalized.
		it( 'should still be found by that name', async () => {
			const results = await namespaceMode.getResults( 'my w' );

			expect( results.map( ( r ) => r.label ) ).toEqual( [ 'My Wiki' ] );
		} );

		it( 'should still be tagged by that name', () => {
			const result = namespaceMode.tokenPattern.match( 'My Wiki:About' );

			expect( result ).toEqual( { label: 'My Wiki:', raw: 'My Wiki:' } );
		} );
	} );

	describe( 'tokenPattern.match', () => {
		it( 'should match a known namespace prefix', () => {
			const result = namespaceMode.tokenPattern.match( 'Talk:some query' );

			expect( result ).toEqual( { label: 'Talk:', raw: 'Talk:' } );
		} );

		it( 'should match case-insensitively and label with the canonical name', () => {
			const result = namespaceMode.tokenPattern.match( 'file:image.png' );

			expect( result ).toEqual( { label: 'File:', raw: 'file:' } );
		} );

		it( 'should match a namespace alias', () => {
			const result = namespaceMode.tokenPattern.match( 'T:Infobox' );

			expect( result ).toEqual( { label: 'Template:', raw: 'T:' } );
		} );

		it( 'should match an alias longer than its namespace name', () => {
			const result = namespaceMode.tokenPattern.match( 'Image:Example.png' );

			expect( result ).toEqual( { label: 'File:', raw: 'Image:' } );
		} );

		it( 'should match a canonical English name for a renamed namespace', () => {
			const result = namespaceMode.tokenPattern.match( 'Project:About' );

			expect( result ).toEqual( { label: 'My Wiki:', raw: 'Project:' } );
		} );

		it( 'should match a name written with underscores', () => {
			const result = namespaceMode.tokenPattern.match( 'User_talk:Example' );

			expect( result ).toEqual( { label: 'User talk:', raw: 'User_talk:' } );
		} );

		it( 'should consume only the text the user typed', () => {
			// An alias is a different length from the namespace it resolves to,
			// so the tokenizer would eat or strand text if `raw` were the label.
			const shorter = namespaceMode.tokenPattern.match( 'CAT:Cities' );
			const longer = namespaceMode.tokenPattern.match( 'Image:Example.png' );

			expect( 'CAT:Cities'.slice( shorter.raw.length ) ).toBe( 'Cities' );
			expect( 'Image:Example.png'.slice( longer.raw.length ) ).toBe( 'Example.png' );
		} );

		it( 'should return null for unknown prefixes', () => {
			const result = namespaceMode.tokenPattern.match( 'Unknown:stuff' );

			expect( result ).toBeNull();
		} );

		it( 'should return null for plain text', () => {
			const result = namespaceMode.tokenPattern.match( 'hello world' );

			expect( result ).toBeNull();
		} );

		it( 'should match a namespace outside the article space', () => {
			expect( namespaceMode.tokenPattern.match( 'Special:Search' ) )
				.toEqual( { label: 'Special:', raw: 'Special:' } );
			expect( namespaceMode.tokenPattern.match( 'Media:Clip.ogg' ) )
				.toEqual( { label: 'Media:', raw: 'Media:' } );
		} );

		it( 'should not match main namespace (empty string)', () => {
			const result = namespaceMode.tokenPattern.match( ':something' );

			expect( result ).toBeNull();
		} );

		it( 'should not match an alias of the main namespace', () => {
			const result = namespaceMode.tokenPattern.match( 'Main:something' );

			expect( result ).toBeNull();
		} );

		it( 'should not match names inherited from Object.prototype', () => {
			// The lookup key is user input, so a plain-object lookup would tag
			// these as namespaces.
			for ( const text of [ 'constructor:x', '__proto__:x', 'Constructor:x' ] ) {
				expect( namespaceMode.tokenPattern.match( text ) ).toBeNull();
			}
		} );

		it( 'should not match a prefix MediaWiki would not resolve either', () => {
			// MediaWiki turns spaces into underscores before resolving, so a
			// stray space next to the colon is not a namespace prefix.
			const result = namespaceMode.tokenPattern.match( 'Talk :something' );

			expect( result ).toBeNull();
		} );
	} );
} );
