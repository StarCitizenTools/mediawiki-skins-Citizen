// @vitest-environment jsdom
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

let mergeConfigs, normalizeConfig, resolveLabel;

beforeAll( async () => {
	const mod = await import(
		'../../../resources/skins.citizen.preferences/configRegistry.js'
	);
	( { mergeConfigs, normalizeConfig, resolveLabel } =
		mod.default || mod );
} );

afterEach( () => {
	vi.restoreAllMocks();
} );

describe( 'mergeConfigs', () => {
	it( 'should return defaults unchanged when overrides is null', () => {
		const defaults = {
			sections: { a: { labelMsg: 'a-label' } },
			preferences: { p1: { section: 'a', type: 'switch' } }
		};

		const result = mergeConfigs( defaults, null );

		expect( result ).toBe( defaults );
	} );

	it( 'should return defaults unchanged when overrides is undefined', () => {
		const defaults = {
			sections: { a: { labelMsg: 'a-label' } },
			preferences: { p1: { section: 'a', type: 'switch' } }
		};

		const result = mergeConfigs( defaults, undefined );

		expect( result ).toBe( defaults );
	} );

	it( 'should preserve preferences not mentioned in overrides', () => {
		const defaults = {
			sections: {},
			preferences: {
				p1: { section: 'a', type: 'switch' },
				p2: { section: 'a', type: 'select' }
			}
		};
		const overrides = {
			preferences: {
				p1: { type: 'radio' }
			}
		};

		const result = mergeConfigs( defaults, overrides );

		expect( result.preferences.p2 ).toEqual( { section: 'a', type: 'select' } );
	} );

	it( 'should replace specified fields and keep unspecified from default', () => {
		const defaults = {
			sections: {},
			preferences: {
				p1: { section: 'a', type: 'switch', labelMsg: 'old-label' }
			}
		};
		const overrides = {
			preferences: {
				p1: { labelMsg: 'new-label' }
			}
		};

		const result = mergeConfigs( defaults, overrides );

		expect( result.preferences.p1 ).toEqual( {
			section: 'a',
			type: 'switch',
			labelMsg: 'new-label'
		} );
	} );

	it( 'should replace options arrays wholesale', () => {
		const defaults = {
			sections: {},
			preferences: {
				p1: {
					section: 'a',
					options: [
						{ value: 'x', labelMsg: 'x-label' },
						{ value: 'y', labelMsg: 'y-label' }
					]
				}
			}
		};
		const overrides = {
			preferences: {
				p1: {
					options: [ { value: 'z' } ]
				}
			}
		};

		const result = mergeConfigs( defaults, overrides );

		expect( result.preferences.p1.options ).toEqual( [ { value: 'z' } ] );
	} );

	it( 'should remove a preference when set to null', () => {
		const defaults = {
			sections: {},
			preferences: {
				p1: { section: 'a', type: 'switch' },
				p2: { section: 'a', type: 'select' }
			}
		};
		const overrides = {
			preferences: {
				p1: null
			}
		};

		const result = mergeConfigs( defaults, overrides );

		expect( result.preferences ).not.toHaveProperty( 'p1' );
		expect( result.preferences ).toHaveProperty( 'p2' );
	} );

	it( 'should add new preferences from overrides', () => {
		const defaults = {
			sections: {},
			preferences: {
				p1: { section: 'a', type: 'switch' }
			}
		};
		const overrides = {
			preferences: {
				p2: { section: 'a', type: 'select', options: [ '0', '1', '2' ] }
			}
		};

		const result = mergeConfigs( defaults, overrides );

		expect( result.preferences.p2 ).toEqual( {
			section: 'a',
			type: 'select',
			options: [ '0', '1', '2' ]
		} );
	} );

	it( 'should add new sections from overrides', () => {
		const defaults = {
			sections: { a: { labelMsg: 'a-label' } },
			preferences: {}
		};
		const overrides = {
			sections: { b: { labelMsg: 'b-label' } }
		};

		const result = mergeConfigs( defaults, overrides );

		expect( result.sections.a ).toEqual( { labelMsg: 'a-label' } );
		expect( result.sections.b ).toEqual( { labelMsg: 'b-label' } );
	} );

	it( 'should replace a section definition when overridden', () => {
		const defaults = {
			sections: { a: { labelMsg: 'old-label' } },
			preferences: {}
		};
		const overrides = {
			sections: { a: { labelMsg: 'new-label' } }
		};

		const result = mergeConfigs( defaults, overrides );

		expect( result.sections.a ).toEqual( { labelMsg: 'new-label' } );
	} );

	it( 'should allow null section values for normalizeConfig to filter', () => {
		const defaults = {
			sections: { a: { labelMsg: 'a-label' }, b: { labelMsg: 'b-label' } },
			preferences: {}
		};
		const overrides = {
			sections: { a: null }
		};

		const result = mergeConfigs( defaults, overrides );

		expect( result.sections.a ).toBeNull();
		expect( result.sections.b ).toEqual( { labelMsg: 'b-label' } );
	} );
} );

describe( 'normalizeConfig', () => {
	it( 'should auto-detect type as switch when 2 options and type omitted', () => {
		const config = {
			sections: {},
			preferences: {
				p1: { section: 'a', options: [ '0', '1' ] }
			}
		};

		const result = normalizeConfig( config );

		expect( result.preferences.p1.type ).toBe( 'switch' );
	} );

	it( 'should auto-detect type as select when 3+ options and type omitted', () => {
		const config = {
			sections: {},
			preferences: {
				p1: { section: 'a', options: [ 'a', 'b', 'c' ] }
			}
		};

		const result = normalizeConfig( config );

		expect( result.preferences.p1.type ).toBe( 'select' );
	} );

	it( 'should keep explicitly set type even if option count suggests otherwise', () => {
		const config = {
			sections: {},
			preferences: {
				p1: { section: 'a', type: 'radio', options: [ 'a', 'b' ] }
			}
		};

		const result = normalizeConfig( config );

		expect( result.preferences.p1.type ).toBe( 'radio' );
	} );

	it( 'should normalize short-form options to long-form objects', () => {
		const config = {
			sections: {},
			preferences: {
				p1: { section: 'a', options: [ '0', '1' ] }
			}
		};

		const result = normalizeConfig( config );

		expect( result.preferences.p1.options ).toEqual( [
			{ value: '0' },
			{ value: '1' }
		] );
	} );

	it( 'should leave long-form options as-is', () => {
		const config = {
			sections: {},
			preferences: {
				p1: {
					section: 'a',
					options: [
						{ value: 'x', labelMsg: 'x-label' },
						{ value: 'y', labelMsg: 'y-label' }
					]
				}
			}
		};

		const result = normalizeConfig( config );

		expect( result.preferences.p1.options ).toEqual( [
			{ value: 'x', labelMsg: 'x-label' },
			{ value: 'y', labelMsg: 'y-label' }
		] );
	} );

	it( 'should normalize mixed arrays with strings and objects', () => {
		const config = {
			sections: {},
			preferences: {
				p1: {
					section: 'a',
					options: [ '0', { value: '1', labelMsg: 'on-label' } ]
				}
			}
		};

		const result = normalizeConfig( config );

		expect( result.preferences.p1.options ).toEqual( [
			{ value: '0' },
			{ value: '1', labelMsg: 'on-label' }
		] );
	} );

	it( 'should filter out null section entries', () => {
		const config = {
			sections: {
				a: { labelMsg: 'a-label' },
				b: null,
				c: { labelMsg: 'c-label' }
			},
			preferences: {}
		};

		const result = normalizeConfig( config );

		expect( result.sections ).toEqual( {
			a: { labelMsg: 'a-label' },
			c: { labelMsg: 'c-label' }
		} );
	} );

	it( 'should not share sections reference with input config', () => {
		const config = {
			sections: { a: { labelMsg: 'a-label' } },
			preferences: {}
		};

		const result = normalizeConfig( config );
		result.sections.b = { labelMsg: 'b-label' };

		expect( config.sections ).not.toHaveProperty( 'b' );
	} );
} );

describe( 'resolveLabel', () => {
	it( 'should return mw.message(labelMsg).text() when labelMsg is present', () => {
		const item = { labelMsg: 'some-msg-key' };

		const result = resolveLabel( item, 'label' );

		expect( mw.message ).toHaveBeenCalledWith( 'some-msg-key' );
		expect( result ).toBe( 'some-msg-key' );
	} );

	it( 'should return literal label when no labelMsg', () => {
		const item = { label: 'My Label' };

		const result = resolveLabel( item, 'label' );

		expect( result ).toBe( 'My Label' );
	} );

	it( 'should return empty string when neither labelMsg nor label present', () => {
		const item = {};

		const result = resolveLabel( item, 'label' );

		expect( result ).toBe( '' );
	} );

	it( 'should return mw.message(descriptionMsg).text() when descriptionMsg is present', () => {
		const item = { descriptionMsg: 'desc-msg-key' };

		const result = resolveLabel( item, 'description' );

		expect( mw.message ).toHaveBeenCalledWith( 'desc-msg-key' );
		expect( result ).toBe( 'desc-msg-key' );
	} );

	it( 'should return literal description when no descriptionMsg', () => {
		const item = { description: 'My Description' };

		const result = resolveLabel( item, 'description' );

		expect( result ).toBe( 'My Description' );
	} );

	it( 'should return empty string when neither descriptionMsg nor description present', () => {
		const item = {};

		const result = resolveLabel( item, 'description' );

		expect( result ).toBe( '' );
	} );
} );
