const { parseVersion, findViolations, WINDOW } = require( '../../../scripts/compat-lint.mjs' );

describe( 'parseVersion', () => {
	it( 'parses slice filenames', () => {
		expect( parseVersion( '3.20.less' ) ).toEqual( { major: 3, minor: 20 } );
		expect( parseVersion( '3.20.js' ) ).toEqual( { major: 3, minor: 20 } );
		expect( parseVersion( '3.20.1.less' ) ).toEqual( { major: 3, minor: 20 } );
	} );

	it( 'rejects non-version names', () => {
		expect( parseVersion( 'notes.less' ) ).toBeNull();
	} );
} );

describe( 'findViolations', () => {
	const current = { major: 3, minor: 26 };

	it( 'passes slices within the window', () => {
		expect( findViolations( [ '3.20.less' ], {}, [], current ) ).toEqual( [] );
	} );

	it( 'flags slices older than the window', () => {
		const violations = findViolations( [ `3.${ 26 - WINDOW - 1 }.less` ], {}, [], current );
		expect( violations ).toHaveLength( 1 );
		expect( violations[ 0 ] ).toContain( '3.19.less' );
	} );

	it( 'flags slices from a previous major', () => {
		expect( findViolations( [ '2.30.less' ], {}, [], current ) ).toHaveLength( 1 );
	} );

	it( 'flags unparseable compat files', () => {
		expect( findViolations( [ 'oops.less' ], {}, [], current ) ).toHaveLength( 1 );
	} );

	it( 'ignores README.md and stubs.json', () => {
		expect( findViolations( [ 'README.md', 'stubs.json' ], {}, [], current ) ).toEqual( [] );
	} );

	it( 'flags expired or dangling stubs', () => {
		const stubs = { 'skins.citizen.old': '3.19', 'skins.citizen.gone': '3.24' };
		const moduleNames = [ 'skins.citizen.old' ];
		const violations = findViolations( [], stubs, moduleNames, current );
		// 3.19 is expired; skins.citizen.gone is not declared in skin.json
		expect( violations ).toHaveLength( 2 );
	} );
} );
