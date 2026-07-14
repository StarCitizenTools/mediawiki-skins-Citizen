// @vitest-environment jsdom

const { mount, shallowMount, flushPromises } = require( '@vue/test-utils' );
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

// Mock getComputedStyle to return fake CSS custom property values and a
// resolved color-scheme (which useVisibility's dark-theme condition reads).
let mockColorScheme = 'light';
const originalGetComputedStyle = globalThis.getComputedStyle;
globalThis.getComputedStyle = vi.fn( () => ( {
	colorScheme: mockColorScheme,
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

const getDefaultConfig = require( '../../../resources/skins.citizen.preferences/defaultConfig.js' );
const { normalizeConfig } = require( '../../../resources/skins.citizen.preferences/configRegistry.js' );
const BASE_CONFIG = normalizeConfig( getDefaultConfig() );

/**
 * Build a normalized default config for testing.
 * Returns a deep clone of the cached base config so tests can mutate safely.
 *
 * @return {Object}
 */
function getTestConfig() {
	return JSON.parse( JSON.stringify( BASE_CONFIG ) );
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
 * Internal helper that mounts App with the given mount function.
 *
 * @param {Function} mountFn mount or shallowMount from @vue/test-utils
 * @param {string[]} prefClasses Array of full clientpref class strings
 * @param {Object} [configOverride] Optional config to inject instead of default
 * @return {import('@vue/test-utils').VueWrapper}
 */
function doMount( mountFn, prefClasses, configOverride ) {
	setClassList( prefClasses );
	const config = configOverride || getTestConfig();
	// Wrap in reactive() so computed() in App.vue tracks mutations
	const reactiveConfig = reactive( config );
	return mountFn( App, {
		global: {
			provide: {
				preferencesConfig: reactiveConfig,
				themeDefault: 'os'
			}
		}
	} );
}

/**
 * Full mount — renders child components. Use when tests need
 * findComponent/findAllComponents on child component instances.
 *
 * @param {string[]} prefClasses
 * @param {Object} [configOverride]
 * @return {import('@vue/test-utils').VueWrapper}
 */
function mountApp( prefClasses, configOverride ) {
	return doMount( mount, prefClasses, configOverride );
}

/**
 * Shallow mount — stubs child components. Faster for tests that
 * only query DOM structure (classes, attributes, text).
 *
 * @param {string[]} prefClasses
 * @param {Object} [configOverride]
 * @return {import('@vue/test-utils').VueWrapper}
 */
function shallowMountApp( prefClasses, configOverride ) {
	return doMount( shallowMount, prefClasses, configOverride );
}

/**
 * Default set of all preference classes representing a typical page state.
 */
const ALL_PREF_CLASSES = [
	'skin-theme-clientpref-os',
	'citizen-feature-custom-font-size-clientpref-standard',
	'citizen-feature-custom-width-clientpref-standard',
	'citizen-feature-pure-black-clientpref-0',
	'citizen-feature-image-dimming-clientpref-0',
	'citizen-feature-autohide-navigation-clientpref-0',
	'citizen-feature-performance-mode-clientpref-0'
];

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.preferences/App.vue' );
	App = mod.default;
} );

afterEach( () => {
	document.documentElement.className = '';
	mockColorScheme = 'light';
	vi.clearAllMocks();
} );

afterAll( () => {
	globalThis.getComputedStyle = originalGetComputedStyle;
} );

describe( 'App', () => {
	describe( 'sections', () => {
		it( 'should render section headings', () => {
			const wrapper = shallowMountApp( ALL_PREF_CLASSES );

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

			const wrapper = shallowMountApp( ALL_PREF_CLASSES, config );

			const headings = wrapper.findAll( '.citizen-preferences-section__heading' );

			expect( headings ).toHaveLength( 1 );
			expect( headings[ 0 ].text() ).toBe( 'citizen-preferences-section-appearance' );
		} );

		it( 'should group preferences under correct sections', () => {
			const wrapper = shallowMountApp( ALL_PREF_CLASSES );

			const sections = wrapper.findAll( '.citizen-preferences-section' );

			// Appearance section: skin-theme, custom-font-size, custom-width, pure-black, image-dimming
			const appearanceGroups = sections[ 0 ].findAll( '.citizen-preferences-group' );
			expect( appearanceGroups ).toHaveLength( 5 );

			// Behavior section: autohide-navigation, performance-mode
			const behaviorGroups = sections[ 1 ].findAll( '.citizen-preferences-group' );
			expect( behaviorGroups ).toHaveLength( 2 );
		} );
	} );

	describe( 'rendering', () => {
		it( 'should render preference groups for all active preferences', () => {
			const wrapper = shallowMountApp( ALL_PREF_CLASSES );

			const groups = wrapper.findAll( '.citizen-preferences-group' );

			expect( groups ).toHaveLength( 7 );
		} );

		it( 'should hide conditionally invisible groups via v-show', () => {
			// matchMedia defaults to matches:false, so dark-theme (pure-black)
			// and tablet-viewport (autohide-navigation) are hidden.
			const wrapper = shallowMountApp( ALL_PREF_CLASSES );

			const pureBlack = wrapper.find(
				'#skin-client-prefs-citizen-feature-pure-black'
			);

			expect( pureBlack.attributes( 'style' ) ).toContain( 'display: none' );
		} );

		it( 'should render all config preferences regardless of classList', () => {
			// Even with no clientpref classes, all preferences should render
			const wrapper = shallowMountApp( [] );

			const groups = wrapper.findAll( '.citizen-preferences-group' );

			expect( groups ).toHaveLength( 7 );
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

			// pure-black (dark-theme), image-dimming (dark-theme),
			// autohide-navigation (tablet-viewport), performance-mode (always) are switch types
			expect( switches ).toHaveLength( 4 );

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

	describe( 'preview channel (citizen-v4)', () => {
		beforeEach( () => {
			document.documentElement.classList.add( 'citizen-v4' );
		} );

		afterEach( () => {
			document.documentElement.classList.remove( 'citizen-v4' );
		} );

		it( 'should render ThemePicker for skin-theme under citizen-v4', () => {
			// Build fresh instead of reusing BASE_CONFIG — the cached base
			// was built without the citizen-v4 class, so it has the legacy
			// three-theme shape.
			const v4Config = normalizeConfig( getDefaultConfig() );

			// citizen-v4 must be IN the class list: setClassList overwrites
			// className, wiping the class the describe's beforeEach added, and
			// App.vue reads isV4 from the root class at mount.
			const wrapper = mountApp( [ 'citizen-v4', ...ALL_PREF_CLASSES ], v4Config );

			expect( wrapper.findAllComponents( { name: 'ThemePicker' } ) ).toHaveLength( 1 );
			expect( wrapper.findAllComponents( { name: 'RadioGroup' } ) ).toHaveLength( 0 );
		} );

		it( 'should render a custom radio pref as RadioGroup, not ThemePicker', () => {
			// `radio` is a general preference type: a wiki can register a
			// custom radio pref that is not the theme picker. Only skin-theme
			// should route through ThemePicker; everything else uses RadioGroup.
			const v4Config = normalizeConfig( getDefaultConfig() );
			v4Config.preferences[ 'test-radio' ] = {
				section: 'appearance',
				type: 'radio',
				options: [
					{ value: 'a', label: 'A' },
					{ value: 'b', label: 'B' },
					{ value: 'c', label: 'C' }
				],
				label: 'Test Radio',
				visibilityCondition: 'always'
			};

			const wrapper = mountApp( [ 'citizen-v4', ...ALL_PREF_CLASSES ], v4Config );

			// Only skin-theme routes through ThemePicker.
			expect( wrapper.findAllComponents( { name: 'ThemePicker' } ) ).toHaveLength( 1 );
			// The custom radio pref falls through to RadioGroup.
			const radioGroups = wrapper.findAllComponents( { name: 'RadioGroup' } );
			expect( radioGroups ).toHaveLength( 1 );
			expect( radioGroups[ 0 ].props( 'featureName' ) ).toBe( 'test-radio' );
		} );

		it( 'should preview the black theme as a chip wearing its theme class', () => {
			// Under v4 the ThemePicker paints the real theme: each chip wears
			// the bare .skin-theme-clientpref-<value> class instead of the
			// legacy inline color-scheme swatch.
			const v4Config = normalizeConfig( getDefaultConfig() );

			const wrapper = mountApp( [ 'citizen-v4', ...ALL_PREF_CLASSES ], v4Config );

			expect( wrapper.find( '.skin-theme-clientpref-black' ).exists() ).toBe( true );
		} );

		describe( 'unregistered active theme (citizen-v4)', () => {
			it( 'shows a synthetic, selected card for an unregistered theme', () => {
				const v4Config = normalizeConfig( getDefaultConfig() );
				const classes = [ 'citizen-v4', ...ALL_PREF_CLASSES.map( ( cls ) =>
					cls.replace( 'skin-theme-clientpref-os', 'skin-theme-clientpref-ocean' ) ) ];

				const wrapper = mountApp( classes, v4Config );

				const picker = wrapper.findComponent( { name: 'ThemePicker' } );
				const oceanOption = picker.props( 'options' ).find( ( o ) => o.value === 'ocean' );
				expect( oceanOption ).toEqual( { value: 'ocean', label: 'Ocean' } );
				expect( picker.props( 'modelValue' ) ).toBe( 'ocean' );
			} );

			it( 'adds no synthetic card when the active theme is registered', () => {
				const v4Config = normalizeConfig( getDefaultConfig() );

				const wrapper = mountApp( [ 'citizen-v4', ...ALL_PREF_CLASSES ], v4Config );

				const picker = wrapper.findComponent( { name: 'ThemePicker' } );
				expect( picker.props( 'options' ).map( ( o ) => o.value ) )
					.toEqual( [ 'os', 'day', 'night', 'black' ] );
			} );

			it( 'does not duplicate the card when the theme is registered at runtime', async () => {
				const config = reactive( normalizeConfig( getDefaultConfig() ) );
				const classes = [ 'citizen-v4', ...ALL_PREF_CLASSES.map( ( cls ) =>
					cls.replace( 'skin-theme-clientpref-os', 'skin-theme-clientpref-ocean' ) ) ];
				const wrapper = mountApp( classes, config );

				// A synthetic 'ocean' card is showing; register a real 'ocean'
				// option after mount — the dedupe guard must collapse the two.
				config.preferences[ 'skin-theme' ].options.push( { value: 'ocean', label: 'Ocean' } );
				await wrapper.vm.$nextTick();

				const picker = wrapper.findComponent( { name: 'ThemePicker' } );
				const oceanOptions = picker.props( 'options' ).filter( ( o ) => o.value === 'ocean' );
				expect( oceanOptions ).toHaveLength( 1 );
			} );
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
			// with a light resolved color-scheme it is hidden via v-show.
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const pureBlack = wrapper.find(
				'#skin-client-prefs-citizen-feature-pure-black'
			);

			expect( pureBlack.attributes( 'style' ) ).toContain( 'display: none' );

			// Changing the theme swaps the root class, so the computed
			// color-scheme resolves to dark and dark-theme conditions show.
			mockColorScheme = 'dark';
			const radioGroup = wrapper.findComponent( { name: 'RadioGroup' } );
			radioGroup.vm.$emit( 'update:modelValue', 'night' );
			await wrapper.vm.$nextTick();

			expect( pureBlack.attributes( 'style' ) ).not.toContain( 'display: none' );
		} );
	} );

	describe( 'resolveLabel integration', () => {
		it( 'should use labelMsg keys from config for preference headings', () => {
			shallowMountApp( ALL_PREF_CLASSES );

			// mw.message is called with the labelMsg from the config
			const calls = mw.message.mock.calls;
			const themeNameCall = calls.find(
				( args ) => args[ 0 ] === 'citizen-theme-name'
			);

			expect( themeNameCall ).toBeTruthy();
		} );

		it( 'should use descriptionMsg keys from config for descriptions', () => {
			shallowMountApp( ALL_PREF_CLASSES );

			const calls = mw.message.mock.calls;
			const descriptionCall = calls.find(
				( args ) => args[ 0 ] === 'citizen-theme-description'
			);

			expect( descriptionCall ).toBeTruthy();
		} );

		it( 'should use labelMsg keys from config for option labels', () => {
			shallowMountApp( ALL_PREF_CLASSES );

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
			const wrapper = shallowMountApp( ALL_PREF_CLASSES, config );

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
			const wrapper = shallowMountApp( ALL_PREF_CLASSES, config );

			config.sections[ 'gadget' ] = { label: 'Gadgets' };
			config.preferences[ 'gadget-toggle' ] = {
				section: 'gadget',
				options: [ { value: '0' }, { value: '1' } ],
				type: 'switch',
				label: 'My Gadget'
			};
			await wrapper.vm.$nextTick();

			const groups = wrapper.findAll( '.citizen-preferences-group' );

			expect( groups ).toHaveLength( 8 );
		} );
	} );
} );
