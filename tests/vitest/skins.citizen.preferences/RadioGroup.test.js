// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const mw = require( '../mocks/mw.js' );
globalThis.mw = mw;

// Mock CdxRadio before loading the component
mw.loader.require = vi.fn( () => ( {
	CdxRadio: {
		name: 'CdxRadio',
		template: '<div class="cdx-radio"><input type="radio" /><slot /></div>',
		props: [ 'modelValue', 'inputValue', 'name' ],
		emits: [ 'update:modelValue' ]
	}
} ) );

// .vue files are processed by Vite as ESM; use dynamic import() in beforeAll
// rather than require(), and access the component via mod.default.
let RadioGroup;

const DEFAULT_OPTIONS = [
	{ value: 'auto', label: 'Auto' },
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' }
];

function mountRadioGroup( propsOverrides = {} ) {
	return mount( RadioGroup, {
		props: {
			modelValue: 'auto',
			options: DEFAULT_OPTIONS,
			featureName: 'skin-citizen-theme',
			...propsOverrides
		}
	} );
}

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.preferences/RadioGroup.vue' );
	RadioGroup = mod.default;
} );

afterEach( () => {
	vi.restoreAllMocks();
} );

describe( 'RadioGroup', () => {
	describe( 'rendering', () => {
		it( 'should render a CdxRadio for each option', () => {
			const wrapper = mountRadioGroup();

			const radios = wrapper.findAllComponents( { name: 'CdxRadio' } );

			expect( radios ).toHaveLength( 3 );
		} );

		it( 'should pass modelValue to each CdxRadio', () => {
			const wrapper = mountRadioGroup( { modelValue: 'dark' } );

			const radios = wrapper.findAllComponents( { name: 'CdxRadio' } );

			radios.forEach( ( radio ) => {
				expect( radio.props( 'modelValue' ) ).toBe( 'dark' );
			} );
		} );

		it( 'should pass inputValue from option.value to each CdxRadio', () => {
			const wrapper = mountRadioGroup();

			const radios = wrapper.findAllComponents( { name: 'CdxRadio' } );

			expect( radios[ 0 ].props( 'inputValue' ) ).toBe( 'auto' );
			expect( radios[ 1 ].props( 'inputValue' ) ).toBe( 'light' );
			expect( radios[ 2 ].props( 'inputValue' ) ).toBe( 'dark' );
		} );

		it( 'should pass featureName as name prop to each CdxRadio', () => {
			const wrapper = mountRadioGroup( { featureName: 'skin-citizen-font-size' } );

			const radios = wrapper.findAllComponents( { name: 'CdxRadio' } );

			radios.forEach( ( radio ) => {
				expect( radio.props( 'name' ) ).toBe( 'skin-citizen-font-size' );
			} );
		} );
	} );

	describe( 'events', () => {
		it( 'should emit update:modelValue when a radio changes', () => {
			const wrapper = mountRadioGroup();

			const radios = wrapper.findAllComponents( { name: 'CdxRadio' } );
			radios[ 1 ].vm.$emit( 'update:modelValue', 'light' );

			expect( wrapper.emitted( 'update:modelValue' ) ).toHaveLength( 1 );
			expect( wrapper.emitted( 'update:modelValue' )[ 0 ] ).toEqual( [ 'light' ] );
		} );
	} );

	describe( 'grid layout', () => {
		it( 'should default to 2 columns', () => {
			const wrapper = mountRadioGroup();

			const style = wrapper.element.style;

			expect( style.getPropertyValue( '--pref-columns' ) ).toBe( '2' );
		} );

		it( 'should use the columns prop for grid layout', () => {
			const wrapper = mountRadioGroup( { columns: 3 } );

			const style = wrapper.element.style;

			expect( style.getPropertyValue( '--pref-columns' ) ).toBe( '3' );
		} );
	} );

	describe( 'card previews', () => {
		it( 'should render theme preview with color lines when option has previewColors', () => {
			const optionsWithPreview = [
				{
					value: 'light',
					label: 'Light',
					previewColors: { surface: '#fff', text: '#000' }
				},
				{
					value: 'dark',
					label: 'Dark',
					previewColors: { surface: '#1a1a1a', text: '#fff' }
				}
			];

			const wrapper = mountRadioGroup( { options: optionsWithPreview } );

			const previews = wrapper.findAll( '.citizen-pref-card__preview--theme' );

			expect( previews ).toHaveLength( 2 );
			expect( previews[ 0 ].element.style.getPropertyValue( '--preview-bg' ) ).toBe( '#fff' );
			expect( previews[ 0 ].element.style.getPropertyValue( '--preview-text' ) ).toBe( '#000' );
			expect( previews[ 0 ].findAll( '.citizen-pref-card__line' ) ).toHaveLength( 3 );
		} );

		it( 'should not render preview when options have no preview data', () => {
			const wrapper = mountRadioGroup();

			const previews = wrapper.findAll( '.citizen-pref-card__preview' );

			expect( previews ).toHaveLength( 0 );
		} );

		it( 'should render labels for all cards', () => {
			const wrapper = mountRadioGroup();

			const labels = wrapper.findAll( '.citizen-pref-card__label' );

			expect( labels ).toHaveLength( 3 );
			expect( labels[ 0 ].text() ).toBe( 'Auto' );
			expect( labels[ 1 ].text() ).toBe( 'Light' );
			expect( labels[ 2 ].text() ).toBe( 'Dark' );
		} );
	} );
} );
