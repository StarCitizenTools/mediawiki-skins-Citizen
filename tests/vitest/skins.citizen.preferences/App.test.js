// @vitest-environment jsdom

const { mount, flushPromises } = require( '@vue/test-utils' );
const { reactive } = require( 'vue' );
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

// Stub Codex components before loading App.vue
mw.loader.require = vi.fn( () => ( {
	CdxField: {
		name: 'CdxField',
		template: '<fieldset :id="id" class="cdx-field citizen-preferences-group"><div class="cdx-label"><slot name="label" /></div><div class="cdx-label__description"><slot name="description" /></div><slot /></fieldset>',
		props: [ 'id', 'isFieldset' ]
	},
	CdxRadio: {
		name: 'CdxRadio',
		template: '<div class="cdx-radio"><input type="radio" /><slot /></div>',
		props: [ 'modelValue', 'inputValue', 'name' ],
		emits: [ 'update:modelValue' ]
	},
	CdxSelect: {
		name: 'CdxSelect',
		template: '<select class="cdx-select"></select>',
		props: [ 'menuItems', 'selected' ],
		emits: [ 'update:selected' ]
	},
	CdxToggleSwitch: {
		name: 'CdxToggleSwitch',
		template: '<span :id="id" class="cdx-toggle-switch citizen-preferences-group"><input type="checkbox" /><span class="cdx-label__label__text"><slot /></span><span class="cdx-label__description"><slot name="description" /></span></span>',
		props: [ 'id', 'modelValue' ],
		emits: [ 'update:modelValue' ]
	}
} ) );

// Mock getComputedStyle to return fake CSS custom property values
const originalGetComputedStyle = globalThis.getComputedStyle;
globalThis.getComputedStyle = vi.fn( () => ( {
	getPropertyValue: vi.fn( ( prop ) => {
		if ( prop === '--color-surface-0' ) {
			return '#ffffff';
		}
		if ( prop === '--color-base' ) {
			return '#000000';
		}
		return '';
	} )
} ) );

// jsdom does not provide matchMedia; stub it so useVisibility's onMounted works
globalThis.matchMedia = vi.fn( () => ( {
	matches: false,
	addEventListener: vi.fn(),
	removeEventListener: vi.fn()
} ) );

let App;

/**
 * Build a normalized default config for testing.
 * Uses the real getDefaultConfig + normalizeConfig to test integration.
 *
 * @return {Object}
 */
function getTestConfig() {
	const getDefaultConfig = require( '../../../resources/skins.citizen.preferences/defaultConfig.js' );
	const { normalizeConfig } = require( '../../../resources/skins.citizen.preferences/configRegistry.js' );
	return normalizeConfig( getDefaultConfig() );
}

/**
 * Set up document.documentElement.className with the given clientpref classes.
 *
 * @param {string[]} prefClasses Array of full clientpref class strings
 */
function setClassList( prefClasses ) {
	document.documentElement.className = prefClasses.join( ' ' );
}

/**
 * Mount App with a specific set of active preference classes and optional config.
 * Must be called after setting the classList (before mount reads it in setup()).
 *
 * @param {string[]} prefClasses Array of full clientpref class strings
 * @param {Object} [configOverride] Optional config to inject instead of default
 * @return {import('@vue/test-utils').VueWrapper}
 */
function mountApp( prefClasses, configOverride ) {
	setClassList( prefClasses );
	const config = configOverride || getTestConfig();
	// Wrap in reactive() so computed() in App.vue tracks mutations
	const reactiveConfig = reactive( config );
	return mount( App, {
		global: {
			provide: {
				preferencesConfig: reactiveConfig,
				themeDefault: 'os'
			}
		}
	} );
}

/**
 * Default set of all preference classes representing a typical page state.
 */
const ALL_PREF_CLASSES = [
	'skin-theme-clientpref-os',
	'citizen-feature-custom-font-size-clientpref-standard',
	'citizen-feature-custom-width-clientpref-standard',
	'citizen-feature-pure-black-clientpref-0',
	'citizen-feature-autohide-navigation-clientpref-0',
	'citizen-feature-performance-mode-clientpref-0'
];

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.preferences/App.vue' );
	App = mod.default;
} );

afterEach( () => {
	document.documentElement.className = '';
	vi.clearAllMocks();
} );

afterAll( () => {
	globalThis.getComputedStyle = originalGetComputedStyle;
} );

describe( 'App', () => {
	describe( 'sections', () => {
		it( 'should render section headings', () => {
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const headings = wrapper.findAll( '.citizen-preferences-section__heading' );

			expect( headings ).toHaveLength( 2 );
			// mw.message mock returns the key as text
			expect( headings[ 0 ].text() ).toBe( 'citizen-preferences-section-appearance' );
			expect( headings[ 1 ].text() ).toBe( 'citizen-preferences-section-behavior' );
		} );

		it( 'should hide sections with no preferences assigned', () => {
			const config = getTestConfig();
			// Remove all preferences that belong to 'behavior' section
			for ( const [ key, pref ] of Object.entries( config.preferences ) ) {
				if ( pref.section === 'behavior' ) {
					delete config.preferences[ key ];
				}
			}

			const wrapper = mountApp( ALL_PREF_CLASSES, config );

			const headings = wrapper.findAll( '.citizen-preferences-section__heading' );

			expect( headings ).toHaveLength( 1 );
			expect( headings[ 0 ].text() ).toBe( 'citizen-preferences-section-appearance' );
		} );

		it( 'should group preferences under correct sections', () => {
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const sections = wrapper.findAll( '.citizen-preferences-section' );

			// Appearance section: skin-theme, custom-font-size, custom-width, pure-black
			const appearanceGroups = sections[ 0 ].findAll( '.citizen-preferences-group' );
			expect( appearanceGroups ).toHaveLength( 4 );

			// Behavior section: autohide-navigation, performance-mode
			const behaviorGroups = sections[ 1 ].findAll( '.citizen-preferences-group' );
			expect( behaviorGroups ).toHaveLength( 2 );
		} );
	} );

	describe( 'rendering', () => {
		it( 'should render preference groups for all active preferences', () => {
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const groups = wrapper.findAll( '.citizen-preferences-group' );

			expect( groups ).toHaveLength( 6 );
		} );

		it( 'should hide conditionally invisible groups via v-show', () => {
			// matchMedia defaults to matches:false, so dark-theme (pure-black)
			// and tablet-viewport (autohide-navigation) are hidden.
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const pureBlack = wrapper.find(
				'#skin-client-prefs-citizen-feature-pure-black'
			);

			expect( pureBlack.attributes( 'style' ) ).toContain( 'display: none' );
		} );

		it( 'should render all config preferences regardless of classList', () => {
			// Even with no clientpref classes, all preferences should render
			const wrapper = mountApp( [] );

			const groups = wrapper.findAll( '.citizen-preferences-group' );

			expect( groups ).toHaveLength( 6 );
		} );

		it( 'should render CdxToggleSwitch for switch-type preferences', async () => {
			// Enable matchMedia so tablet-viewport condition passes for autohide-navigation
			const savedMatchMedia = globalThis.matchMedia;
			globalThis.matchMedia = vi.fn( () => ( {
				matches: true,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			} ) );

			// Use night theme so dark-theme condition passes for pure-black
			const nightClasses = ALL_PREF_CLASSES.map( ( cls ) =>
				cls.replace( 'skin-theme-clientpref-os', 'skin-theme-clientpref-night' )
			);

			const wrapper = mountApp( nightClasses );
			// useVisibility sets reactive refs in onMounted from matchMedia;
			// Vue needs a tick to flush the DOM update from those ref changes.
			await flushPromises();

			const switches = wrapper.findAllComponents( { name: 'CdxToggleSwitch' } );

			// pure-black (dark-theme), autohide-navigation (tablet-viewport),
			// performance-mode (always) are switch types
			expect( switches ).toHaveLength( 3 );

			globalThis.matchMedia = savedMatchMedia;
		} );

		it( 'should render RadioGroup for radio-type preferences', () => {
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const radioGroups = wrapper.findAllComponents( { name: 'RadioGroup' } );

			// Only skin-theme is a radio type
			expect( radioGroups ).toHaveLength( 1 );
		} );

		it( 'should render CdxSelect for select-type preferences', () => {
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const selects = wrapper.findAllComponents( { name: 'CdxSelect' } );

			// custom-font-size, custom-width are select types
			expect( selects ).toHaveLength( 2 );
		} );
	} );

	describe( 'initialization', () => {
		it( 'should initialize values from classList', () => {
			const classes = ALL_PREF_CLASSES.map( ( cls ) =>
				cls.replace( 'skin-theme-clientpref-os', 'skin-theme-clientpref-night' )
					.replace(
						'citizen-feature-custom-font-size-clientpref-standard',
						'citizen-feature-custom-font-size-clientpref-large'
					)
			);
			const wrapper = mountApp( classes );

			const themeGroup = wrapper.findComponent( { name: 'RadioGroup' } );
			const fontSelects = wrapper.findAllComponents( { name: 'CdxSelect' } );
			const fontSelect = fontSelects.find(
				( c ) => c.props( 'selected' ) === 'large'
			);

			expect( themeGroup.props( 'modelValue' ) ).toBe( 'night' );
			expect( fontSelect ).toBeTruthy();
		} );
	} );

	describe( 'setValue', () => {
		/**
		 * Find a CdxToggleSwitch component by its rendered id attribute.
		 *
		 * @param {import('@vue/test-utils').VueWrapper} wrapper
		 * @param {string} id
		 * @return {import('@vue/test-utils').VueWrapper}
		 */
		function findToggleById( wrapper, id ) {
			return wrapper
				.findAllComponents( { name: 'CdxToggleSwitch' } )
				.find( ( c ) => c.props( 'id' ) === id );
		}

		it( 'should call clientPrefs.set when a value changes', async () => {
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const toggle = findToggleById(
				wrapper, 'skin-client-prefs-citizen-feature-performance-mode'
			);
			toggle.vm.$emit( 'update:modelValue', true );
			await wrapper.vm.$nextTick();

			// The polyfill set method modifies document.documentElement.classList
			// and calls mw.storage.set — verify the class was updated
			expect( document.documentElement.classList.contains(
				'citizen-feature-performance-mode-clientpref-1'
			) ).toBe( true );
		} );

		it( 'should dispatch resize event when a value changes', async () => {
			const resizeSpy = vi.fn();
			window.addEventListener( 'resize', resizeSpy );

			const wrapper = mountApp( ALL_PREF_CLASSES );

			const toggle = findToggleById(
				wrapper, 'skin-client-prefs-citizen-feature-performance-mode'
			);
			toggle.vm.$emit( 'update:modelValue', true );
			await wrapper.vm.$nextTick();

			expect( resizeSpy ).toHaveBeenCalled();

			window.removeEventListener( 'resize', resizeSpy );
		} );

		it( 'should fire citizen.preferences.changed hook when a value changes', async () => {
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const toggle = findToggleById(
				wrapper, 'skin-client-prefs-citizen-feature-performance-mode'
			);
			toggle.vm.$emit( 'update:modelValue', true );
			await wrapper.vm.$nextTick();

			const hook = mw.hook( 'citizen.preferences.changed' );
			expect( hook.fire ).toHaveBeenCalledWith(
				'citizen-feature-performance-mode', '1'
			);
		} );

		it( 'should show dark-theme preference when theme changes to night', async () => {
			// pure-black has dark-theme visibility condition;
			// with os theme and matchMedia=false it is hidden via v-show.
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const pureBlack = wrapper.find(
				'#skin-client-prefs-citizen-feature-pure-black'
			);

			expect( pureBlack.attributes( 'style' ) ).toContain( 'display: none' );

			// Changing theme to night makes dark-theme conditions visible.
			const radioGroup = wrapper.findComponent( { name: 'RadioGroup' } );
			radioGroup.vm.$emit( 'update:modelValue', 'night' );
			await wrapper.vm.$nextTick();

			expect( pureBlack.attributes( 'style' ) ).not.toContain( 'display: none' );
		} );
	} );

	describe( 'resolveLabel integration', () => {
		it( 'should use labelMsg keys from config for preference headings', () => {
			mountApp( ALL_PREF_CLASSES );

			// mw.message is called with the labelMsg from the config
			const calls = mw.message.mock.calls;
			const themeNameCall = calls.find(
				( args ) => args[ 0 ] === 'citizen-theme-name'
			);

			expect( themeNameCall ).toBeTruthy();
		} );

		it( 'should use descriptionMsg keys from config for descriptions', () => {
			mountApp( ALL_PREF_CLASSES );

			const calls = mw.message.mock.calls;
			const descriptionCall = calls.find(
				( args ) => args[ 0 ] === 'citizen-theme-description'
			);

			expect( descriptionCall ).toBeTruthy();
		} );

		it( 'should use labelMsg keys from config for option labels', () => {
			mountApp( ALL_PREF_CLASSES );

			const calls = mw.message.mock.calls;
			const optionCall = calls.find(
				( args ) => args[ 0 ] === 'citizen-theme-os-label'
			);

			expect( optionCall ).toBeTruthy();
		} );
	} );

	describe( 'dynamic registration', () => {
		it( 'should render a dynamically added preference', async () => {
			const config = reactive( getTestConfig() );
			const wrapper = mountApp( ALL_PREF_CLASSES, config );

			// Dynamically add a new preference
			config.sections[ 'dynamic' ] = { label: 'Dynamic Section' };
			config.preferences[ 'my-dynamic-feature' ] = {
				section: 'dynamic',
				options: [ { value: '0' }, { value: '1' } ],
				type: 'switch',
				labelMsg: 'my-dynamic-feature-name'
			};
			await wrapper.vm.$nextTick();

			const headings = wrapper.findAll( '.citizen-preferences-section__heading' );
			const dynamicHeading = headings.find( ( h ) => h.text() === 'Dynamic Section' );

			expect( dynamicHeading ).toBeTruthy();
		} );

		it( 'should render a dynamically added section with preferences', async () => {
			const config = reactive( getTestConfig() );
			const wrapper = mountApp( ALL_PREF_CLASSES, config );

			config.sections[ 'gadget' ] = { label: 'Gadgets' };
			config.preferences[ 'gadget-toggle' ] = {
				section: 'gadget',
				options: [ { value: '0' }, { value: '1' } ],
				type: 'switch',
				label: 'My Gadget'
			};
			await wrapper.vm.$nextTick();

			const groups = wrapper.findAll( '.citizen-preferences-group' );

			expect( groups ).toHaveLength( 7 );
		} );
	} );
} );
