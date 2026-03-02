// @vitest-environment jsdom

const { mount, flushPromises } = require( '@vue/test-utils' );
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

// Stub Codex components before loading App.vue
mw.loader.require = vi.fn( () => ( {
	CdxField: {
		name: 'CdxField',
		template: '<fieldset :id="id" class="cdx-field citizen-pref-group"><div class="cdx-label"><slot name="label" /></div><div class="cdx-label__description"><slot name="description" /></div><slot /></fieldset>',
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
		template: '<span :id="id" class="cdx-toggle-switch citizen-pref-group"><input type="checkbox" /><span class="cdx-label__label__text"><slot /></span><span class="cdx-label__description"><slot name="description" /></span></span>',
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
 * Set up document.documentElement.className with the given clientpref classes.
 *
 * @param {string[]} prefClasses Array of full clientpref class strings
 */
function setClassList( prefClasses ) {
	document.documentElement.className = prefClasses.join( ' ' );
}

/**
 * Mount App with a specific set of active preference classes.
 * Must be called after setting the classList (before mount reads it in setup()).
 *
 * @param {string[]} prefClasses Array of full clientpref class strings
 * @return {import('@vue/test-utils').VueWrapper}
 */
function mountApp( prefClasses ) {
	setClassList( prefClasses );
	return mount( App );
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
	describe( 'rendering', () => {
		it( 'should render preference groups for all active preferences', () => {
			const wrapper = mountApp( ALL_PREF_CLASSES );

			const groups = wrapper.findAll( '.citizen-pref-group' );

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

		it( 'should not render preferences absent from classList', () => {
			const wrapper = mountApp( [
				'skin-theme-clientpref-os'
			] );

			const groups = wrapper.findAll( '.citizen-pref-group' );

			expect( groups ).toHaveLength( 1 );
			expect( groups[ 0 ].attributes( 'id' ) ).toBe( 'skin-client-prefs-skin-theme' );
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
			const wrapper = mountApp( [
				'skin-theme-clientpref-night',
				'citizen-feature-custom-font-size-clientpref-large'
			] );

			const themeGroup = wrapper.findComponent( { name: 'RadioGroup' } );
			const fontSelect = wrapper.findComponent( { name: 'CdxSelect' } );

			expect( themeGroup.props( 'modelValue' ) ).toBe( 'night' );
			expect( fontSelect.props( 'selected' ) ).toBe( 'large' );
		} );
	} );

	describe( 'setValue', () => {
		it( 'should call clientPrefs.set when a value changes', async () => {
			const wrapper = mountApp( [
				'citizen-feature-performance-mode-clientpref-0'
			] );

			const toggle = wrapper.findComponent( { name: 'CdxToggleSwitch' } );
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

			const wrapper = mountApp( [
				'citizen-feature-performance-mode-clientpref-0'
			] );

			const toggle = wrapper.findComponent( { name: 'CdxToggleSwitch' } );
			toggle.vm.$emit( 'update:modelValue', true );
			await wrapper.vm.$nextTick();

			expect( resizeSpy ).toHaveBeenCalled();

			window.removeEventListener( 'resize', resizeSpy );
		} );

		it( 'should show dark-theme preference when theme changes to night', async () => {
			// pure-black has dark-theme visibility condition;
			// with os theme and matchMedia=false it is hidden via v-show.
			const wrapper = mountApp( [
				'skin-theme-clientpref-os',
				'citizen-feature-pure-black-clientpref-0'
			] );

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

	describe( 'getMessage', () => {
		it( 'should translate skin-theme- keys to citizen-theme-', () => {
			mountApp( [ 'skin-theme-clientpref-os' ] );

			// mw.message is called with citizen-theme- prefix for skin-theme- keys.
			// The mock returns the key as text, so we check what was passed.
			const calls = mw.message.mock.calls;
			const themeNameCall = calls.find(
				( args ) => args[ 0 ] === 'citizen-theme-name'
			);

			expect( themeNameCall ).toBeTruthy();
		} );

		it( 'should not translate non-skin-theme keys', () => {
			mountApp( [ 'citizen-feature-custom-font-size-clientpref-standard' ] );

			const calls = mw.message.mock.calls;
			const fontSizeCall = calls.find(
				( args ) => args[ 0 ] === 'citizen-feature-custom-font-size-name'
			);

			expect( fontSizeCall ).toBeTruthy();
		} );
	} );
} );
