const { buildSpecRules } = require( '../../../resources/skins.citizen.scripts/speculationRules.js' );

describe( 'buildSpecRules', () => {
	it( 'should create prerender rules with correct article path pattern', () => {
		const rules = buildSpecRules( '/wiki/', 'Special' );

		const where = rules.prerender[ 0 ].where.and;
		expect( where[ 0 ] ).toEqual( { href_matches: '/wiki/*' } );
	} );

	it( 'should exclude the special namespace with wildcard', () => {
		const rules = buildSpecRules( '/wiki/', 'Special' );

		const where = rules.prerender[ 0 ].where.and;
		expect( where[ 1 ] ).toEqual( { not: { href_matches: { pathname: '/wiki/Special\\:*' } } } );
	} );

	it( 'should exclude PHP files', () => {
		const rules = buildSpecRules( '/wiki/', 'Special' );

		const where = rules.prerender[ 0 ].where.and;
		expect( where[ 2 ] ).toEqual( { not: { href_matches: '/.*.php' } } );
	} );

	it( 'should exclude URLs with query strings', () => {
		const rules = buildSpecRules( '/wiki/', 'Special' );

		const where = rules.prerender[ 0 ].where.and;
		expect( where[ 3 ] ).toEqual( { not: { href_matches: '/*\\?*(^|&)*=*' } } );
	} );

	it( 'should exclude nofollow links', () => {
		const rules = buildSpecRules( '/wiki/', 'Special' );

		const where = rules.prerender[ 0 ].where.and;
		expect( where[ 4 ] ).toEqual( { not: { selector_matches: '[rel~=nofollow]' } } );
	} );

	it( 'should set eagerness to moderate', () => {
		const rules = buildSpecRules( '/wiki/', 'Special' );

		expect( rules.prerender[ 0 ].eagerness ).toBe( 'moderate' );
	} );

	it( 'should handle different article paths', () => {
		const rules = buildSpecRules( '/w/index.php/', 'Special' );

		const where = rules.prerender[ 0 ].where.and;
		expect( where[ 0 ] ).toEqual( { href_matches: '/w/index.php/*' } );
	} );

	it( 'should handle localized special namespace', () => {
		const rules = buildSpecRules( '/wiki/', 'Spezial' );

		const where = rules.prerender[ 0 ].where.and;
		expect( where[ 1 ] ).toEqual( { not: { href_matches: { pathname: '/wiki/Spezial\\:*' } } } );
	} );
} );
