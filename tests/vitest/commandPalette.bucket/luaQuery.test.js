const {
	escapeLuaString,
	formatLuaValue,
	buildQuery
} = require(
	'../../../resources/skins.citizen.commandPalette.bucket/luaQuery.js'
);

describe( 'escapeLuaString', () => {
	it( 'leaves a plain string untouched', () => {
		expect( escapeLuaString( 'Weapon' ) ).toBe( 'Weapon' );
	} );

	it( 'escapes a single quote so it cannot close the literal', () => {
		expect( escapeLuaString( "Rune scimitar's" ) ).toBe( "Rune scimitar\\'s" );
	} );

	it( 'escapes a backslash before anything else', () => {
		expect( escapeLuaString( 'a\\b' ) ).toBe( 'a\\\\b' );
	} );

	it( 'escapes a backslash followed by a quote', () => {
		expect( escapeLuaString( "a\\'b" ) ).toBe( "a\\\\\\'b" );
	} );

	it( 'escapes newlines and carriage returns', () => {
		expect( escapeLuaString( 'a\nb\rc' ) ).toBe( 'a\\nb\\rc' );
	} );
} );

describe( 'formatLuaValue', () => {
	it( 'quotes a TEXT value', () => {
		expect( formatLuaValue( 'Weapon', 'TEXT' ) ).toBe( "'Weapon'" );
	} );

	it( 'quotes a PAGE value', () => {
		expect( formatLuaValue( 'Abyssal whip', 'PAGE' ) ).toBe( "'Abyssal whip'" );
	} );

	it( 'emits a numeric INTEGER value unquoted', () => {
		expect( formatLuaValue( '1000', 'INTEGER' ) ).toBe( '1000' );
	} );

	it( 'emits a numeric DOUBLE value unquoted', () => {
		expect( formatLuaValue( 2.5, 'DOUBLE' ) ).toBe( '2.5' );
	} );

	it( 'quotes a non-numeric value on a numeric field rather than emitting a bare word', () => {
		expect( formatLuaValue( 'heavy', 'INTEGER' ) ).toBe( "'heavy'" );
	} );

	it( 'emits BOOLEAN values as Lua booleans', () => {
		expect( formatLuaValue( true, 'BOOLEAN' ) ).toBe( 'true' );
		expect( formatLuaValue( 'false', 'BOOLEAN' ) ).toBe( 'false' );
	} );
} );

describe( 'buildQuery', () => {
	it( 'builds a select + limit query with no filters', () => {
		const query = buildQuery( {
			bucket: 'item',
			select: [ 'page_name' ],
			limit: 20
		} );

		expect( query ).toBe( "bucket('item').select('page_name').limit(20).run()" );
	} );

	it( 'selects several fields in order', () => {
		const query = buildQuery( {
			bucket: 'item',
			select: [ 'page_name', 'item_type' ],
			limit: 20
		} );

		expect( query ).toBe(
			"bucket('item').select('page_name','item_type').limit(20).run()"
		);
	} );

	it( 'appends orderBy before limit when given', () => {
		const query = buildQuery( {
			bucket: 'item',
			select: [ 'page_name' ],
			orderBy: 'page_name',
			limit: 20
		} );

		expect( query ).toBe(
			"bucket('item').select('page_name').orderBy('page_name').limit(20).run()"
		);
	} );

	it( 'serialises a text filter as a three-argument where', () => {
		const query = buildQuery( {
			bucket: 'item',
			select: [ 'page_name' ],
			filters: [ { field: 'item_type', op: '=', value: 'Weapon', type: 'TEXT' } ],
			limit: 20
		} );

		expect( query ).toBe(
			"bucket('item').select('page_name').where('item_type','=','Weapon').limit(20).run()"
		);
	} );

	it( 'chains one where per filter', () => {
		const query = buildQuery( {
			bucket: 'item',
			select: [ 'page_name' ],
			filters: [
				{ field: 'item_type', op: '=', value: 'Weapon', type: 'TEXT' },
				{ field: 'value', op: '>', value: '1000', type: 'INTEGER' }
			],
			limit: 20
		} );

		expect( query ).toBe(
			"bucket('item').select('page_name')" +
			".where('item_type','=','Weapon').where('value','>',1000).limit(20).run()"
		);
	} );

	it( 'emits a boolean filter without quotes', () => {
		const query = buildQuery( {
			bucket: 'item',
			select: [ 'page_name' ],
			filters: [ { field: 'members', op: '=', value: true, type: 'BOOLEAN' } ],
			limit: 20
		} );

		expect( query ).toBe(
			"bucket('item').select('page_name').where('members','=',true).limit(20).run()"
		);
	} );

	it( 'escapes a quote in a filter value so the Lua literal stays closed', () => {
		const query = buildQuery( {
			bucket: 'item',
			select: [ 'page_name' ],
			filters: [
				{ field: 'page_name', op: '=', value: "Verac's flail", type: 'PAGE' }
			],
			limit: 20
		} );

		expect( query ).toBe(
			"bucket('item').select('page_name')" +
			".where('page_name','=','Verac\\'s flail').limit(20).run()"
		);
	} );

	it( 'escapes the bucket and field identifiers too', () => {
		const query = buildQuery( {
			bucket: "it'em",
			select: [ "pa'ge" ],
			filters: [ { field: "ty'pe", op: '=', value: 'x', type: 'TEXT' } ],
			limit: 5
		} );

		expect( query ).toBe(
			"bucket('it\\'em').select('pa\\'ge').where('ty\\'pe','=','x').limit(5).run()"
		);
	} );

	it( 'omits the limit clause entirely when no limit is asked for', () => {
		const query = buildQuery( {
			bucket: 'item',
			select: [ 'page_name' ],
			filters: [ { field: 'item_type', op: '=', value: 'Weapon', type: 'TEXT' } ]
		} );

		expect( query ).toBe(
			"bucket('item').select('page_name').where('item_type','=','Weapon').run()"
		);
	} );

	it( 'falls back to a default limit for values that are not usable', () => {
		const spec = { bucket: 'item', select: [ 'page_name' ] };

		expect( buildQuery( Object.assign( {}, spec, { limit: 'abc' } ) ) )
			.toContain( '.limit(20)' );
		expect( buildQuery( Object.assign( {}, spec, { limit: 0 } ) ) )
			.toContain( '.limit(20)' );
		expect( buildQuery( Object.assign( {}, spec, { limit: -5 } ) ) )
			.toContain( '.limit(20)' );
	} );

	it( 'coerces a non-integer limit to a safe integer', () => {
		const query = buildQuery( {
			bucket: 'item',
			select: [ 'page_name' ],
			limit: '20; os.exit()'
		} );

		expect( query ).toBe( "bucket('item').select('page_name').limit(20).run()" );
	} );
} );
