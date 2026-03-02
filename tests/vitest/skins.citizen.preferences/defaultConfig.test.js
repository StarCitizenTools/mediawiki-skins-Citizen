// @vitest-environment jsdom
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

let getDefaultConfig;

beforeAll( async () => {
	const mod = await import(
		'../../../resources/skins.citizen.preferences/defaultConfig.js'
	);
	getDefaultConfig = mod.default || mod;
} );

describe( 'defaultConfig', () => {
	it( 'should return sections with appearance and behavior', () => {
		const config = getDefaultConfig();

		expect( config.sections ).toHaveProperty( 'appearance' );
		expect( config.sections ).toHaveProperty( 'behavior' );
		expect( config.sections.appearance ).toHaveProperty( 'labelMsg' );
		expect( config.sections.behavior ).toHaveProperty( 'labelMsg' );
	} );

	it( 'should return all 6 built-in preferences', () => {
		const config = getDefaultConfig();
		const keys = Object.keys( config.preferences );

		expect( keys ).toHaveLength( 6 );
		expect( keys ).toContain( 'skin-theme' );
		expect( keys ).toContain( 'citizen-feature-custom-font-size' );
		expect( keys ).toContain( 'citizen-feature-custom-width' );
		expect( keys ).toContain( 'citizen-feature-pure-black' );
		expect( keys ).toContain( 'citizen-feature-autohide-navigation' );
		expect( keys ).toContain( 'citizen-feature-performance-mode' );
	} );

	it( 'should assign appearance prefs to appearance section', () => {
		const config = getDefaultConfig();

		expect( config.preferences[ 'skin-theme' ].section ).toBe( 'appearance' );
		expect( config.preferences[ 'citizen-feature-custom-font-size' ].section )
			.toBe( 'appearance' );
		expect( config.preferences[ 'citizen-feature-custom-width' ].section )
			.toBe( 'appearance' );
		expect( config.preferences[ 'citizen-feature-pure-black' ].section )
			.toBe( 'appearance' );
	} );

	it( 'should assign behavior prefs to behavior section', () => {
		const config = getDefaultConfig();

		expect( config.preferences[ 'citizen-feature-autohide-navigation' ].section )
			.toBe( 'behavior' );
		expect( config.preferences[ 'citizen-feature-performance-mode' ].section )
			.toBe( 'behavior' );
	} );

	it( 'should use long-form options with labelMsg for skin-theme', () => {
		const config = getDefaultConfig();
		const themeOpts = config.preferences[ 'skin-theme' ].options;

		expect( themeOpts ).toHaveLength( 3 );
		expect( themeOpts[ 0 ] ).toEqual( {
			value: 'os',
			labelMsg: 'citizen-theme-os-label'
		} );
	} );

	it( 'should use short-form options for switch prefs', () => {
		const config = getDefaultConfig();
		const opts = config.preferences[ 'citizen-feature-pure-black' ].options;

		expect( opts ).toEqual( [ '0', '1' ] );
	} );

	it( 'should include type and visibilityCondition', () => {
		const config = getDefaultConfig();

		expect( config.preferences[ 'skin-theme' ].type ).toBe( 'radio' );
		expect( config.preferences[ 'citizen-feature-pure-black' ].type )
			.toBe( 'switch' );
		expect( config.preferences[ 'citizen-feature-pure-black' ].visibilityCondition )
			.toBe( 'dark-theme' );
	} );
} );
