const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const useTokenizedInput = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useTokenizedInput.js'
);

describe( 'useTokenizedInput', () => {
	it( 'should initialize with empty state', () => {
		const ti = useTokenizedInput( () => [] );

		expect( ti.tokens.value ).toEqual( [] );
		expect( ti.freeText.value ).toBe( '' );
		expect( ti.selectedIndex.value ).toBe( -1 );
		expect( ti.fullQuery.value ).toBe( '' );
	} );

	describe( 'addToken', () => {
		it( 'should add a token and update fullQuery', () => {
			const ti = useTokenizedInput( () => [] );

			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace' } );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'Talk:' );
			expect( ti.tokens.value[ 0 ].id ).toBeDefined();
			expect( ti.fullQuery.value ).toBe( 'Talk:' );
		} );

		it( 'should concatenate multiple tokens with freeText', () => {
			const ti = useTokenizedInput( () => [] );

			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace' } );
			ti.freeText.value = 'Main Page';

			expect( ti.fullQuery.value ).toBe( 'Talk:Main Page' );
		} );
	} );

	describe( 'removeToken', () => {
		it( 'should remove a token by index', () => {
			const ti = useTokenizedInput( () => [] );
			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace' } );
			ti.addToken( { label: 'User:', raw: 'User:', modeId: 'namespace' } );

			ti.removeToken( 0 );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'User:' );
		} );

		it( 'should reset selectedIndex after removal', () => {
			const ti = useTokenizedInput( () => [] );
			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace' } );
			ti.selectToken( 0 );

			ti.removeToken( 0 );

			expect( ti.selectedIndex.value ).toBe( -1 );
		} );
	} );

	describe( 'selectToken / deselectToken', () => {
		it( 'should set selectedIndex', () => {
			const ti = useTokenizedInput( () => [] );
			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace' } );

			ti.selectToken( 0 );

			expect( ti.selectedIndex.value ).toBe( 0 );
		} );

		it( 'should deselect', () => {
			const ti = useTokenizedInput( () => [] );
			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace' } );
			ti.selectToken( 0 );

			ti.deselectToken();

			expect( ti.selectedIndex.value ).toBe( -1 );
		} );
	} );

	describe( 'clear', () => {
		it( 'should reset all state', () => {
			const ti = useTokenizedInput( () => [] );
			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace' } );
			ti.freeText.value = 'test';
			ti.selectToken( 0 );

			ti.clear();

			expect( ti.tokens.value ).toEqual( [] );
			expect( ti.freeText.value ).toBe( '' );
			expect( ti.selectedIndex.value ).toBe( -1 );
			expect( ti.fullQuery.value ).toBe( '' );
		} );

		it( 'should reset suppressDetection so detection works after clear', () => {
			const pattern = {
				modeId: 'namespace',
				position: 'prefix',
				activeIn: 'root',
				match: ( text ) => {
					const m = text.match( /^(Talk):/ );
					return m ? { label: m[ 1 ] + ':', raw: m[ 1 ] + ':' } : null;
				}
			};
			const ti = useTokenizedInput( () => [ pattern ] );
			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace', position: 'prefix' } );
			ti.removeToken( 0 ); // sets suppressDetection = true

			ti.clear();
			ti.setFreeText( 'Talk:Main Page' );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'Talk:' );
			expect( ti.freeText.value ).toBe( 'Main Page' );
		} );
	} );

	describe( 'setFreeText / auto-detection', () => {
		it( 'should detect a token from a matching pattern', () => {
			const pattern = {
				modeId: 'namespace',
				position: 'prefix',
				activeIn: 'root',
				match: ( text ) => {
					const m = text.match( /^(Talk):/ );
					return m ? { label: m[ 1 ] + ':', raw: m[ 1 ] + ':' } : null;
				}
			};
			const ti = useTokenizedInput( () => [ pattern ] );

			ti.setFreeText( 'Talk:Main Page' );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'Talk:' );
			expect( ti.freeText.value ).toBe( 'Main Page' );
		} );

		it( 'should not detect when no pattern matches', () => {
			const pattern = {
				modeId: 'namespace',
				position: 'prefix',
				activeIn: 'root',
				match: () => null
			};
			const ti = useTokenizedInput( () => [ pattern ] );

			ti.setFreeText( 'hello world' );

			expect( ti.tokens.value ).toHaveLength( 0 );
			expect( ti.freeText.value ).toBe( 'hello world' );
		} );

		it( 'should detect multiple tokens from pasted text', () => {
			const nsPattern = {
				modeId: 'namespace',
				position: 'prefix',
				activeIn: 'root',
				match: ( text ) => {
					const m = text.match( /^(Talk):/ );
					return m ? { label: m[ 1 ] + ':', raw: m[ 1 ] + ':' } : null;
				}
			};
			const cirrusPattern = {
				modeId: 'cirrus',
				position: 'any',
				activeIn: 'root',
				match: ( text ) => {
					const m = text.match( /^(intitle:\S+)\s?/ );
					return m ? { label: m[ 1 ], raw: m[ 0 ] } : null;
				}
			};
			const ti = useTokenizedInput( () => [ nsPattern, cirrusPattern ] );

			ti.setFreeText( 'Talk:intitle:foo query' );

			expect( ti.tokens.value ).toHaveLength( 2 );
			expect( ti.freeText.value ).toBe( 'query' );
		} );

		it( 'should detect tokens separated by whitespace in pasted text', () => {
			const { ref } = require( 'vue' );
			const activeMode = ref( { id: 'smw' } );
			const smwPattern = {
				modeId: 'smw',
				position: 'any',
				activeIn: 'smw',
				match: ( text ) => {
					const m = text.match( /^\[\[([^\]]+)\]\]/ );
					return m ? { label: m[ 1 ], raw: m[ 0 ] } : null;
				}
			};
			const ti = useTokenizedInput( () => [ smwPattern ], activeMode );

			ti.setFreeText( '[[Category:City]] [[Located in::Germany]]' );

			expect( ti.tokens.value ).toHaveLength( 2 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'Category:City' );
			expect( ti.tokens.value[ 1 ].label ).toBe( 'Located in::Germany' );
			expect( ti.freeText.value ).toBe( '' );
		} );

		it( 'should strip leading whitespace when followed by a matching token', () => {
			const { ref } = require( 'vue' );
			const activeMode = ref( { id: 'smw' } );
			const smwPattern = {
				modeId: 'smw',
				position: 'any',
				activeIn: 'smw',
				match: ( text ) => {
					const m = text.match( /^\[\[([^\]]+)\]\]/ );
					return m ? { label: m[ 1 ], raw: m[ 0 ] } : null;
				}
			};
			const ti = useTokenizedInput( () => [ smwPattern ], activeMode );

			ti.setFreeText( ' [[Located in::Germany]]' );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'Located in::Germany' );
			expect( ti.freeText.value ).toBe( '' );
		} );

		it( 'should preserve whitespace before non-token text', () => {
			const { ref } = require( 'vue' );
			const activeMode = ref( { id: 'smw' } );
			const smwPattern = {
				modeId: 'smw',
				position: 'any',
				activeIn: 'smw',
				match: ( text ) => {
					const m = text.match( /^\[\[([^\]]+)\]\]/ );
					return m ? { label: m[ 1 ], raw: m[ 0 ] } : null;
				}
			};
			const ti = useTokenizedInput( () => [ smwPattern ], activeMode );

			ti.setFreeText( '[[Category:City]] some text' );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.freeText.value ).toBe( ' some text' );
		} );

		it( 'should suppress detection after removeToken', () => {
			const pattern = {
				modeId: 'namespace',
				position: 'prefix',
				activeIn: 'root',
				match: ( text ) => {
					const m = text.match( /^(Talk):/ );
					return m ? { label: m[ 1 ] + ':', raw: m[ 1 ] + ':' } : null;
				}
			};
			const ti = useTokenizedInput( () => [ pattern ] );
			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace', position: 'prefix' } );

			ti.removeToken( 0 );
			ti.setFreeText( 'Talk:Main Page' );

			// Detection suppressed: no new token created
			expect( ti.tokens.value ).toHaveLength( 0 );
			expect( ti.freeText.value ).toBe( 'Talk:Main Page' );
		} );

		it( 'should resume detection after one suppressed call', () => {
			const pattern = {
				modeId: 'namespace',
				position: 'prefix',
				activeIn: 'root',
				match: ( text ) => {
					const m = text.match( /^(Talk):/ );
					return m ? { label: m[ 1 ] + ':', raw: m[ 1 ] + ':' } : null;
				}
			};
			const ti = useTokenizedInput( () => [ pattern ] );
			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace', position: 'prefix' } );
			ti.removeToken( 0 );
			ti.setFreeText( 'Talk:Main Page' ); // suppressed

			ti.setFreeText( 'Talk:Main Page' ); // should detect now

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'Talk:' );
			expect( ti.freeText.value ).toBe( 'Main Page' );
		} );

		it( 'should not infinite loop on empty raw match', () => {
			const pattern = {
				modeId: 'test',
				position: 'any',
				activeIn: 'root',
				match: () => ( { label: 'x', raw: '' } )
			};
			const ti = useTokenizedInput( () => [ pattern ] );

			ti.setFreeText( 'hello' );

			expect( ti.freeText.value ).toBe( 'hello' );
		} );

		it( 'should not match prefix pattern when non-prefix tokens exist', () => {
			const nsPattern = {
				modeId: 'namespace',
				position: 'prefix',
				activeIn: 'root',
				match: ( text ) => {
					const m = text.match( /^(Talk):/ );
					return m ? { label: m[ 1 ] + ':', raw: m[ 1 ] + ':' } : null;
				}
			};
			const ti = useTokenizedInput( () => [ nsPattern ] );
			// Add an 'any' position token first
			ti.addToken( { label: 'intitle:foo', raw: 'intitle:foo ', modeId: 'cirrus', position: 'any' } );

			ti.setFreeText( 'Talk:Main Page' );

			// Prefix pattern should not match because non-prefix token exists
			expect( ti.tokens.value ).toHaveLength( 1 ); // only the manually added one
			expect( ti.freeText.value ).toBe( 'Talk:Main Page' );
		} );
	} );

	describe( 'namespace tokenPattern integration', () => {
		let namespaceMode;

		beforeEach( () => {
			mw.config.get.mockImplementation( ( key ) => {
				if ( key === 'wgFormattedNamespaces' ) {
					return {
						0: '',
						1: 'Talk',
						2: 'User',
						3: 'User talk',
						4: 'Project'
					};
				}
				return null;
			} );
			namespaceMode = require(
				'../../../../resources/skins.citizen.commandPalette/modes/namespace.js'
			);
		} );

		afterEach( () => {
			mw.config.get.mockReset();
		} );

		it( 'should detect a namespace prefix using the real tokenPattern', () => {
			const ti = useTokenizedInput( () => [ namespaceMode.tokenPattern ] );

			ti.setFreeText( 'User:Example' );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'User:' );
			expect( ti.tokens.value[ 0 ].modeId ).toBe( 'namespace' );
			expect( ti.freeText.value ).toBe( 'Example' );
			expect( ti.fullQuery.value ).toBe( 'User:Example' );
		} );

		it( 'should match case-insensitively but return the canonical name', () => {
			const ti = useTokenizedInput( () => [ namespaceMode.tokenPattern ] );

			ti.setFreeText( 'talk:Main Page' );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'Talk:' );
			expect( ti.freeText.value ).toBe( 'Main Page' );
		} );

		it( 'should match multi-word namespace names', () => {
			const ti = useTokenizedInput( () => [ namespaceMode.tokenPattern ] );

			ti.setFreeText( 'User talk:SomePage' );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'User talk:' );
			expect( ti.freeText.value ).toBe( 'SomePage' );
		} );

		it( 'should not match unknown namespace prefixes', () => {
			const ti = useTokenizedInput( () => [ namespaceMode.tokenPattern ] );

			ti.setFreeText( 'Bogus:Something' );

			expect( ti.tokens.value ).toHaveLength( 0 );
			expect( ti.freeText.value ).toBe( 'Bogus:Something' );
		} );

		it( 'should not match the main namespace', () => {
			const ti = useTokenizedInput( () => [ namespaceMode.tokenPattern ] );

			ti.setFreeText( ':SomePage' );

			expect( ti.tokens.value ).toHaveLength( 0 );
			expect( ti.freeText.value ).toBe( ':SomePage' );
		} );
	} );

	describe( 'activeIn filtering', () => {
		it( 'should skip root-only patterns when a mode is active', () => {
			const { ref } = require( 'vue' );
			const activeMode = ref( { id: 'someMode' } );
			const pattern = {
				modeId: 'namespace',
				position: 'prefix',
				activeIn: 'root',
				match: ( text ) => {
					const m = text.match( /^(Talk):/ );
					return m ? { label: m[ 1 ] + ':', raw: m[ 1 ] + ':' } : null;
				}
			};
			const ti = useTokenizedInput( () => [ pattern ], activeMode );

			ti.setFreeText( 'Talk:Main Page' );

			expect( ti.tokens.value ).toHaveLength( 0 );
			expect( ti.freeText.value ).toBe( 'Talk:Main Page' );
		} );

		it( 'should match root-only patterns when no mode is active', () => {
			const { ref } = require( 'vue' );
			const activeMode = ref( null );
			const pattern = {
				modeId: 'namespace',
				position: 'prefix',
				activeIn: 'root',
				match: ( text ) => {
					const m = text.match( /^(Talk):/ );
					return m ? { label: m[ 1 ] + ':', raw: m[ 1 ] + ':' } : null;
				}
			};
			const ti = useTokenizedInput( () => [ pattern ], activeMode );

			ti.setFreeText( 'Talk:Main Page' );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'Talk:' );
			expect( ti.freeText.value ).toBe( 'Main Page' );
		} );

		it( 'should skip mode-specific patterns when a different mode is active', () => {
			const { ref } = require( 'vue' );
			const activeMode = ref( { id: 'otherMode' } );
			const pattern = {
				modeId: 'smw',
				position: 'any',
				activeIn: 'smw',
				match: ( text ) => {
					const m = text.match( /^\[\[([^\]]+)\]\]/ );
					return m ? { label: m[ 1 ], raw: m[ 0 ] } : null;
				}
			};
			const ti = useTokenizedInput( () => [ pattern ], activeMode );

			ti.setFreeText( '[[Category:City]]rest' );

			expect( ti.tokens.value ).toHaveLength( 0 );
			expect( ti.freeText.value ).toBe( '[[Category:City]]rest' );
		} );

		it( 'should skip mode-specific patterns in root mode', () => {
			const { ref } = require( 'vue' );
			const activeMode = ref( null );
			const pattern = {
				modeId: 'smw',
				position: 'any',
				activeIn: 'smw',
				match: ( text ) => {
					const m = text.match( /^\[\[([^\]]+)\]\]/ );
					return m ? { label: m[ 1 ], raw: m[ 0 ] } : null;
				}
			};
			const ti = useTokenizedInput( () => [ pattern ], activeMode );

			ti.setFreeText( '[[Category:City]]rest' );

			expect( ti.tokens.value ).toHaveLength( 0 );
			expect( ti.freeText.value ).toBe( '[[Category:City]]rest' );
		} );

		it( 'should match mode-specific patterns when the correct mode is active', () => {
			const { ref } = require( 'vue' );
			const activeMode = ref( { id: 'smw' } );
			const pattern = {
				modeId: 'smw',
				position: 'any',
				activeIn: 'smw',
				match: ( text ) => {
					const m = text.match( /^\[\[([^\]]+)\]\]/ );
					return m ? { label: m[ 1 ], raw: m[ 0 ] } : null;
				}
			};
			const ti = useTokenizedInput( () => [ pattern ], activeMode );

			ti.setFreeText( '[[Category:City]]rest' );

			expect( ti.tokens.value ).toHaveLength( 1 );
			expect( ti.tokens.value[ 0 ].label ).toBe( 'Category:City' );
			expect( ti.freeText.value ).toBe( 'rest' );
		} );
	} );

	describe( 'fullQuery serialization', () => {
		it( 'should put prefix tokens before any-position tokens', () => {
			const ti = useTokenizedInput( () => [] );
			ti.addToken( { label: 'intitle:foo', raw: 'intitle:foo ', modeId: 'cirrus', position: 'any' } );
			ti.addToken( { label: 'Talk:', raw: 'Talk:', modeId: 'namespace', position: 'prefix' } );
			ti.freeText.value = 'query';

			expect( ti.fullQuery.value ).toBe( 'Talk:intitle:foo query' );
		} );
	} );
} );
