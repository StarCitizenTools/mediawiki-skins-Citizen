// @vitest-environment jsdom
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

// Add MediaWiki's createMwApp to Vue so init.js can call it.
// In production, ResourceLoader patches this onto the Vue object.
const Vue = require( 'vue' );
const mockMount = vi.fn();
const mockProvide = vi.fn();
Vue.createMwApp = vi.fn( () => ( { provide: mockProvide, mount: mockMount } ) );

// Mutable mock — modify .overrides/.messages between tests
const overridesMock = require( '../mocks/preferencesOverrides.js' );

let initApp;

beforeAll( async () => {
	const mod = await import(
		'../../../resources/skins.citizen.preferences/init.js'
	);
	( { initApp } = mod.default || mod );
} );

afterEach( () => {
	vi.restoreAllMocks();
	// Re-attach createMwApp after restoreAllMocks clears the spy
	Vue.createMwApp = vi.fn( () => ( { provide: mockProvide, mount: mockMount } ) );
	mockMount.mockClear();
	mockProvide.mockClear();
	mw.messages.set.mockClear();
	document.body.innerHTML = '';
	// Reset overrides mock to defaults
	overridesMock.overrides = null;
	overridesMock.messages = {};
	// Reset register hook between tests
	mw.hook( 'citizen.preferences.register' )._reset();
} );

describe( 'initApp', () => {
	it( 'should not crash when mount point is missing', () => {
		expect( () => initApp() ).not.toThrow();
	} );

	it( 'should mount Vue app at #citizen-preferences-content', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';

		initApp();

		expect( Vue.createMwApp ).toHaveBeenCalled();
		expect( mockMount ).toHaveBeenCalledWith(
			document.getElementById( 'citizen-preferences-content' )
		);
	} );

	it( 'should provide default config when no overrides exist', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';

		initApp();

		expect( mockProvide ).toHaveBeenCalledWith(
			'preferencesConfig',
			expect.objectContaining( {
				sections: expect.objectContaining( {
					appearance: expect.any( Object ),
					behavior: expect.any( Object )
				} ),
				preferences: expect.any( Object )
			} )
		);
	} );

	it( 'should merge overrides into default config', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';
		overridesMock.overrides = {
			sections: { custom: { labelMsg: 'custom-label' } }
		};

		initApp();

		expect( mockProvide ).toHaveBeenCalledWith(
			'preferencesConfig',
			expect.objectContaining( {
				sections: expect.objectContaining( {
					appearance: expect.any( Object ),
					behavior: expect.any( Object ),
					custom: expect.objectContaining( { labelMsg: 'custom-label' } )
				} )
			} )
		);
	} );

	it( 'should register pre-resolved messages from overrides', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';
		overridesMock.messages = { 'custom-label': 'Custom Section' };

		initApp();

		expect( mw.messages.set ).toHaveBeenCalledWith( {
			'custom-label': 'Custom Section'
		} );
	} );

	it( 'should not call mw.messages.set when messages are empty', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';

		initApp();

		expect( mw.messages.set ).not.toHaveBeenCalled();
	} );

	it( 'should provide themeDefault mapped from server config', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';

		initApp();

		// preferencesConfig.js mock has wgCitizenThemeDefault: 'auto' → maps to 'os'
		expect( mockProvide ).toHaveBeenCalledWith( 'themeDefault', 'os' );
	} );

	it( 'should fire citizen.preferences.register hook', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';

		initApp();

		const hook = mw.hook( 'citizen.preferences.register' );
		expect( hook.fire ).toHaveBeenCalledWith( expect.any( Function ) );
	} );

	it( 'should replay register function to late subscribers', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';

		initApp();

		// Add subscriber AFTER fire() has already been called
		const registerSpy = vi.fn();
		mw.hook( 'citizen.preferences.register' ).add( ( register ) => {
			registerSpy( register );
		} );

		expect( registerSpy ).toHaveBeenCalledWith( expect.any( Function ) );
	} );

	it( 'should warn and skip malformed registrations', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';

		mw.hook( 'citizen.preferences.register' ).add( ( register ) => {
			register( null );
			register( 'garbage' );
			register( [ 'an', 'array' ] );
		} );

		initApp();

		expect( mw.log.warn ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'should accept registrations via the register function', () => {
		document.body.innerHTML = '<div id="citizen-preferences-content"></div>';

		// Add a listener before init
		const registerSpy = vi.fn();
		mw.hook( 'citizen.preferences.register' ).add( ( register ) => {
			register( {
				sections: { gadget: { label: 'Gadgets' } },
				preferences: {
					'my-gadget': {
						section: 'gadget',
						options: [ '0', '1' ],
						label: 'My Gadget'
					}
				}
			} );
			registerSpy();
		} );

		initApp();

		expect( registerSpy ).toHaveBeenCalled();
		// Verify the config provided to the Vue app includes the registered preference
		const configCall = mockProvide.mock.calls.find(
			( args ) => args[ 0 ] === 'preferencesConfig'
		);
		expect( configCall[ 1 ].preferences ).toHaveProperty( 'my-gadget' );
		expect( configCall[ 1 ].sections ).toHaveProperty( 'gadget' );
	} );
} );
