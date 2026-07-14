// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

mw.loader.require = vi.fn( () => ( {
	CdxRadio: {
		name: 'CdxRadio',
		template: '<div class="cdx-radio"><input type="radio" /><slot /></div>',
		props: [ 'modelValue', 'inputValue', 'name' ],
		emits: [ 'update:modelValue' ]
	}
} ) );

// Knob values served to the baseline measurement (themePreviewBaseline.js).
// The module caches its one getComputedStyle read at module level, so the
// spy below must serve these for whichever mount happens to fill the cache.
const BASELINE_KNOBS = {
	'--color-primary-oklch__h': '30',
	'--color-progressive-hsl__h': '210'
};

let ThemePicker;

const OPTIONS = [
	{ value: 'os', label: 'Auto' },
	{ value: 'day', label: 'Light' },
	{ value: 'night', label: 'Dark' },
	{ value: 'black', label: 'Black' }
];

function mountThemePicker( propsOverrides = {} ) {
	return mount( ThemePicker, {
		props: {
			modelValue: 'os',
			options: OPTIONS,
			featureName: 'skin-theme',
			...propsOverrides
		}
	} );
}

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.preferences/ThemePicker.vue' );
	ThemePicker = mod.default;
} );

beforeEach( () => {
	vi.spyOn( window, 'getComputedStyle' ).mockImplementation( () => ( {
		getPropertyValue: ( name ) => BASELINE_KNOBS[ name ] || ''
	} ) );
} );

afterEach( () => {
	vi.restoreAllMocks();
} );

describe( 'ThemePicker', () => {
	it( 'renders a CdxRadio per option', () => {
		const wrapper = mountThemePicker();

		expect( wrapper.findAllComponents( { name: 'CdxRadio' } ) ).toHaveLength( 4 );
	} );

	it( 'wears the theme class on non-os circles', () => {
		const wrapper = mountThemePicker();

		const circles = wrapper.findAll( '.citizen-preferences-themecircle' );
		expect( circles[ 1 ].classes() ).toContain( 'skin-theme-clientpref-day' );
		expect( circles[ 2 ].classes() ).toContain( 'skin-theme-clientpref-night' );
		expect( circles[ 3 ].classes() ).toContain( 'skin-theme-clientpref-black' );
	} );

	it( 'renders the os circle as an adaptive split, not a theme class', () => {
		const wrapper = mountThemePicker();

		const osCircle = wrapper.findAll( '.citizen-preferences-themecircle' )[ 0 ];
		expect( osCircle.classes() ).toContain( 'citizen-preferences-themecircle--adaptive' );
		expect( osCircle.classes() ).not.toContain( 'skin-theme-clientpref-os' );
	} );

	it( 'wears the theme-preview token scope on every circle', () => {
		const wrapper = mountThemePicker();

		const circles = wrapper.findAll( '.citizen-preferences-themecircle' );
		expect( circles ).toHaveLength( 4 );
		circles.forEach( ( circle ) => {
			expect( circle.classes() ).toContain( 'citizen-theme-preview' );
		} );
	} );

	it( 'publishes the measured identity baseline on the picker root', () => {
		const wrapper = mountThemePicker();

		const style = wrapper.find( '.citizen-preferences-themepicker' ).element.style;
		expect(
			style.getPropertyValue( '--citizen-preview-color-primary-oklch__h' )
		).toBe( '30' );
		expect(
			style.getPropertyValue( '--citizen-preview-color-progressive-hsl__h' )
		).toBe( '210' );
	} );

	it( 'gives each option a screen-reader label', () => {
		const wrapper = mountThemePicker();

		const labels = wrapper.findAll( '.citizen-preferences-themepicker__srlabel' );
		expect( labels.map( ( l ) => l.text() ) ).toEqual( [ 'Auto', 'Light', 'Dark', 'Black' ] );
	} );

	it( 'readout shows the selected theme by default', () => {
		const wrapper = mountThemePicker( { modelValue: 'night' } );

		const readout = wrapper.find( '.citizen-preferences-themepicker__readout' );
		expect( readout.text() ).toBe( 'Dark' );
	} );

	it( 'readout previews a theme on hover and reverts on mouseleave', async () => {
		const wrapper = mountThemePicker( { modelValue: 'os' } );
		const readout = wrapper.find( '.citizen-preferences-themepicker__readout' );

		expect( readout.text() ).toBe( 'Auto' );

		await wrapper.findAllComponents( { name: 'CdxRadio' } )[ 3 ].trigger( 'mouseenter' );
		expect( readout.text() ).toBe( 'Black' );

		await wrapper.find( '.citizen-preferences-themepicker__grid' ).trigger( 'mouseleave' );
		expect( readout.text() ).toBe( 'Auto' );
	} );

	it( 'readout follows a selection change made while hovering (keyboard)', async () => {
		const wrapper = mountThemePicker(); // modelValue 'os' -> 'Auto'
		const readout = wrapper.find( '.citizen-preferences-themepicker__readout' );

		await wrapper.findAllComponents( { name: 'CdxRadio' } )[ 3 ].trigger( 'mouseenter' );
		expect( readout.text() ).toBe( 'Black' );

		await wrapper.setProps( { modelValue: 'day' } );
		expect( readout.text() ).toBe( 'Light' );
	} );

	it( 'emits update:modelValue when a radio changes', () => {
		const wrapper = mountThemePicker();

		wrapper.findAllComponents( { name: 'CdxRadio' } )[ 2 ].vm.$emit( 'update:modelValue', 'night' );

		expect( wrapper.emitted( 'update:modelValue' )[ 0 ] ).toEqual( [ 'night' ] );
	} );

	describe( 'CdxRadio forwarding', () => {
		it( 'forwards modelValue to every CdxRadio', () => {
			const wrapper = mountThemePicker( { modelValue: 'night' } );

			wrapper.findAllComponents( { name: 'CdxRadio' } ).forEach( ( radio ) => {
				expect( radio.props( 'modelValue' ) ).toBe( 'night' );
			} );
		} );

		it( 'forwards each option value as inputValue and featureName as name', () => {
			const wrapper = mountThemePicker();

			const radios = wrapper.findAllComponents( { name: 'CdxRadio' } );
			expect( radios.map( ( r ) => r.props( 'inputValue' ) ) )
				.toEqual( [ 'os', 'day', 'night', 'black' ] );
			radios.forEach( ( radio ) => {
				expect( radio.props( 'name' ) ).toBe( 'skin-theme' );
			} );
		} );
	} );
} );
