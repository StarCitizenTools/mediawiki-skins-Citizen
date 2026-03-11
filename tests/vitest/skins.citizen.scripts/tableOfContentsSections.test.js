const { getTableOfContentsSectionsData } = require(
	'../../../resources/skins.citizen.scripts/tableOfContentsSections.js'
);

describe( 'getTableOfContentsSectionsData', () => {
	it( 'should return flat sections at the same level', () => {
		const sections = [
			{ toclevel: 1, anchor: 'A', line: 'A' },
			{ toclevel: 1, anchor: 'B', line: 'B' }
		];

		const result = getTableOfContentsSectionsData( sections, 1 );

		expect( result ).toHaveLength( 2 );
		expect( result[ 0 ][ 'is-top-level-section' ] ).toBe( true );
		expect( result[ 0 ][ 'is-parent-section' ] ).toBe( false );
		expect( result[ 0 ][ 'array-sections' ] ).toEqual( [] );
		expect( result[ 1 ][ 'is-top-level-section' ] ).toBe( true );
		expect( result[ 1 ][ 'is-parent-section' ] ).toBe( false );
	} );

	it( 'should nest child sections under their parent', () => {
		const sections = [
			{ toclevel: 1, anchor: 'Parent', line: 'Parent' },
			{ toclevel: 2, anchor: 'Child1', line: 'Child1' },
			{ toclevel: 2, anchor: 'Child2', line: 'Child2' }
		];

		const result = getTableOfContentsSectionsData( sections, 1 );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ][ 'is-parent-section' ] ).toBe( true );
		expect( result[ 0 ][ 'array-sections' ] ).toHaveLength( 2 );
		expect( result[ 0 ][ 'array-sections' ][ 0 ].anchor ).toBe( 'Child1' );
		expect( result[ 0 ][ 'array-sections' ][ 1 ].anchor ).toBe( 'Child2' );
	} );

	it( 'should handle deep nesting (3 levels)', () => {
		const sections = [
			{ toclevel: 1, anchor: 'L1', line: 'L1' },
			{ toclevel: 2, anchor: 'L2', line: 'L2' },
			{ toclevel: 3, anchor: 'L3', line: 'L3' }
		];

		const result = getTableOfContentsSectionsData( sections, 1 );

		expect( result ).toHaveLength( 1 );
		const level2 = result[ 0 ][ 'array-sections' ];
		expect( level2 ).toHaveLength( 1 );
		expect( level2[ 0 ][ 'is-top-level-section' ] ).toBe( false );
		expect( level2[ 0 ][ 'is-parent-section' ] ).toBe( true );
		const level3 = level2[ 0 ][ 'array-sections' ];
		expect( level3 ).toHaveLength( 1 );
		expect( level3[ 0 ].anchor ).toBe( 'L3' );
		expect( level3[ 0 ][ 'is-top-level-section' ] ).toBe( false );
		expect( level3[ 0 ][ 'is-parent-section' ] ).toBe( false );
	} );

	it( 'should stop collecting children when a higher-level section appears', () => {
		const sections = [
			{ toclevel: 1, anchor: 'A', line: 'A' },
			{ toclevel: 2, anchor: 'A.1', line: 'A.1' },
			{ toclevel: 1, anchor: 'B', line: 'B' },
			{ toclevel: 2, anchor: 'B.1', line: 'B.1' }
		];

		const result = getTableOfContentsSectionsData( sections, 1 );

		expect( result ).toHaveLength( 2 );
		expect( result[ 0 ][ 'array-sections' ] ).toHaveLength( 1 );
		expect( result[ 0 ][ 'array-sections' ][ 0 ].anchor ).toBe( 'A.1' );
		expect( result[ 1 ][ 'array-sections' ] ).toHaveLength( 1 );
		expect( result[ 1 ][ 'array-sections' ][ 0 ].anchor ).toBe( 'B.1' );
	} );

	it( 'should return empty array for empty input', () => {
		const result = getTableOfContentsSectionsData( [], 1 );

		expect( result ).toEqual( [] );
	} );

	it( 'should set is-top-level-section false for non-level-1 sections', () => {
		const sections = [
			{ toclevel: 2, anchor: 'Sub', line: 'Sub' }
		];

		const result = getTableOfContentsSectionsData( sections, 2 );

		expect( result ).toHaveLength( 1 );
		expect( result[ 0 ][ 'is-top-level-section' ] ).toBe( false );
	} );

	it( 'should handle mixed parent and childless sections', () => {
		const sections = [
			{ toclevel: 1, anchor: 'NoChildren', line: 'NoChildren' },
			{ toclevel: 1, anchor: 'HasChildren', line: 'HasChildren' },
			{ toclevel: 2, anchor: 'Child', line: 'Child' },
			{ toclevel: 1, anchor: 'AlsoNoChildren', line: 'AlsoNoChildren' }
		];

		const result = getTableOfContentsSectionsData( sections, 1 );

		expect( result ).toHaveLength( 3 );
		expect( result[ 0 ][ 'is-parent-section' ] ).toBe( false );
		expect( result[ 1 ][ 'is-parent-section' ] ).toBe( true );
		expect( result[ 1 ][ 'array-sections' ] ).toHaveLength( 1 );
		expect( result[ 2 ][ 'is-parent-section' ] ).toBe( false );
	} );

	it( 'should skip sections with non-contiguous toclevel gap', () => {
		const sections = [
			{ toclevel: 1, anchor: 'A', line: 'A' },
			{ toclevel: 3, anchor: 'A.deep', line: 'A.deep' }
		];

		const result = getTableOfContentsSectionsData( sections, 1 );

		expect( result ).toHaveLength( 1 );
		// Level 3 is not level 2, so it's not collected as a direct child
		expect( result[ 0 ][ 'array-sections' ] ).toHaveLength( 0 );
		expect( result[ 0 ][ 'is-parent-section' ] ).toBe( false );
	} );
} );
