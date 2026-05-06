const { computeDiff, formatMarkdownTable } = require( '../../scripts/diff-tokens.mjs' );

describe( 'computeDiff', () => {
	it( 'returns empty diff for identical token sets', () => {
		const a = { tokens: { '--color-base': '#000', '--color-emphasized': '#111' } };
		const b = { tokens: { '--color-base': '#000', '--color-emphasized': '#111' } };

		const diff = computeDiff( a, b );

		expect( diff ).toEqual( [] );
	} );

	it( 'detects value changes', () => {
		const a = { tokens: { '--color-base': '#000' } };
		const b = { tokens: { '--color-base': '#fff' } };

		const diff = computeDiff( a, b );

		expect( diff ).toHaveLength( 1 );
		expect( diff[ 0 ] ).toMatchObject( {
			token: '--color-base',
			a: '#000',
			b: '#fff',
			status: 'changed'
		} );
	} );

	it( 'detects tokens added in b', () => {
		const a = { tokens: {} };
		const b = { tokens: { '--color-primary-500': 'oklch(55% 0.17 262)' } };

		const diff = computeDiff( a, b );

		expect( diff ).toHaveLength( 1 );
		expect( diff[ 0 ] ).toMatchObject( {
			token: '--color-primary-500',
			status: 'added'
		} );
	} );

	it( 'detects tokens removed in b', () => {
		const a = { tokens: { '--color-progressive-hsl__h': '220' } };
		const b = { tokens: {} };

		const diff = computeDiff( a, b );

		expect( diff ).toHaveLength( 1 );
		expect( diff[ 0 ] ).toMatchObject( {
			token: '--color-progressive-hsl__h',
			status: 'removed'
		} );
	} );

	it( 'sorts diff alphabetically by token name', () => {
		const a = { tokens: { '--color-z': '1' } };
		const b = { tokens: { '--color-a': '2' } };

		const diff = computeDiff( a, b );

		expect( diff.map( ( d ) => d.token ) ).toEqual( [ '--color-a', '--color-z' ] );
	} );
} );

describe( 'formatMarkdownTable', () => {
	it( 'formats diff as a markdown table', () => {
		const diff = [
			{ token: '--color-base', a: '#000', b: '#fff', status: 'changed' }
		];

		const md = formatMarkdownTable( diff );

		expect( md ).toContain( '| Token | A | B | Status |' );
		expect( md ).toContain( '| `--color-base` | `#000` | `#fff` | changed |' );
	} );

	it( 'emits empty-state message when diff is empty', () => {
		const md = formatMarkdownTable( [] );

		expect( md ).toContain( 'No differences' );
	} );
} );
