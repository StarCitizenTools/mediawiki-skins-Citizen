const parseIncompleteCondition = require( '../../../resources/skins.citizen.commandPalette.smw/queryParser.js' );

describe( 'parseIncompleteCondition', () => {
	it( 'returns null for empty string', () => {
		expect( parseIncompleteCondition( '' ) ).toBeNull();
	} );

	it( 'returns null for plain text without brackets', () => {
		expect( parseIncompleteCondition( 'plain text' ) ).toBeNull();
	} );

	it( 'returns null when all conditions are closed', () => {
		expect( parseIncompleteCondition( '[[Foo]]' ) ).toBeNull();
	} );

	it( 'returns null for multiple closed conditions', () => {
		expect( parseIncompleteCondition( '[[Foo]][[Bar]]' ) ).toBeNull();
	} );

	it( 'detects property stage for unclosed bracket', () => {
		expect( parseIncompleteCondition( '[[Has pop' ) ).toEqual( {
			stage: 'property',
			fragment: 'Has pop'
		} );
	} );

	it( 'detects property stage for empty fragment after [[', () => {
		expect( parseIncompleteCondition( '[[' ) ).toEqual( {
			stage: 'property',
			fragment: ''
		} );
	} );

	it( 'detects property stage after a closed condition', () => {
		expect( parseIncompleteCondition( '[[Foo]][[Bar' ) ).toEqual( {
			stage: 'property',
			fragment: 'Bar'
		} );
	} );

	it( 'detects category stage', () => {
		expect( parseIncompleteCondition( '[[Category:Ci' ) ).toEqual( {
			stage: 'category',
			fragment: 'Ci'
		} );
	} );

	it( 'detects category stage with empty fragment', () => {
		expect( parseIncompleteCondition( '[[Category:' ) ).toEqual( {
			stage: 'category',
			fragment: ''
		} );
	} );

	it( 'detects value stage', () => {
		expect( parseIncompleteCondition( '[[Located in::G' ) ).toEqual( {
			stage: 'value',
			property: 'Located in',
			fragment: 'G'
		} );
	} );

	it( 'detects value stage with empty fragment', () => {
		expect( parseIncompleteCondition( '[[Prop::' ) ).toEqual( {
			stage: 'value',
			property: 'Prop',
			fragment: ''
		} );
	} );

	it( 'handles value stage after closed condition', () => {
		expect( parseIncompleteCondition( '[[Foo]][[Bar::baz' ) ).toEqual( {
			stage: 'value',
			property: 'Bar',
			fragment: 'baz'
		} );
	} );
} );
