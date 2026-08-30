// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const mw = require( '../mocks/mw.js' );
const { setCodexStubs } = require( '../mocks/codex.js' );
globalThis.mw = mw;

setCodexStubs( {
	CdxRadio: {
		name: 'CdxRadio',
		template: '<div class="cdx-radio"><input type="radio" /><slot /></div>',
		props: [ 'modelValue', 'inputValue', 'name' ],
		emits: [ 'update:modelValue' ]
	}
} );

let SegmentedPicker;

const SIZE_OPTIONS = [
	{ value: 'small', label: 'Small' },
	{ value: 'standard', label: 'Standard' },
	{ value: 'large', label: 'Large' },
	{ value: 'xlarge', label: 'Extra large' }
];

const WIDTH_OPTIONS = [
	{ value: 'standard', label: 'Standard' },
	{ value: 'wide', label: 'Wide' },
	{ value: 'full', label: 'Full' }
];

function mountPicker( propsOverrides = {} ) {
	return mount( SegmentedPicker, {
		props: {
			modelValue: 'standard',
			options: SIZE_OPTIONS,
			featureName: 'citizen-feature-custom-font-size',
			variant: 'font-size',
			...propsOverrides
		}
	} );
}

/**
 * Font sizes the samples are drawn at, in source order.
 *
 * @param {Object} wrapper
 * @return {number[]}
 */
function sampleSizes( wrapper ) {
	return wrapper
		.findAll( '.citizen-preferences-segmented__sample' )
		.map( ( el ) => parseFloat( el.element.style.fontSize ) );
}

beforeAll( async () => {
	const mod = await import(
		'../../../resources/skins.citizen.preferences/SegmentedPicker.vue'
	);
	SegmentedPicker = mod.default;
} );

describe( 'SegmentedPicker', () => {
	describe( 'selection', () => {
		it( 'should render one segment per option', () => {
			const wrapper = mountPicker();

			const segments = wrapper.findAllComponents( { name: 'CdxRadio' } );

			expect( segments ).toHaveLength( SIZE_OPTIONS.length );
		} );

		it( 'should pass the feature name to every segment as the radio group name', () => {
			const wrapper = mountPicker();

			const names = wrapper
				.findAllComponents( { name: 'CdxRadio' } )
				.map( ( c ) => c.props( 'name' ) );

			expect( names ).toEqual(
				Array( SIZE_OPTIONS.length ).fill( 'citizen-feature-custom-font-size' )
			);
		} );

		it( 'should emit update:modelValue when a segment is chosen', async () => {
			const wrapper = mountPicker();

			await wrapper
				.findAllComponents( { name: 'CdxRadio' } )[ 2 ]
				.vm.$emit( 'update:modelValue', 'large' );

			expect( wrapper.emitted( 'update:modelValue' ) ).toEqual( [ [ 'large' ] ] );
		} );
	} );

	describe( 'hover readout', () => {
		it( 'should emit the hovered option value on mouseenter', async () => {
			const wrapper = mountPicker();

			await wrapper.findAll( '.cdx-radio' )[ 3 ].trigger( 'mouseenter' );

			expect( wrapper.emitted( 'update:hovered' ) ).toEqual( [ [ 'xlarge' ] ] );
		} );

		it( 'should emit null when the pointer leaves the control', async () => {
			const wrapper = mountPicker();

			await wrapper.trigger( 'mouseleave' );

			expect( wrapper.emitted( 'update:hovered' ) ).toEqual( [ [ null ] ] );
		} );
	} );

	describe( 'glyphs step by rank, not by value', () => {
		it( 'should draw the font-size samples in ascending order', () => {
			const wrapper = mountPicker();

			const sizes = sampleSizes( wrapper );

			expect( sizes ).toEqual( [ ...sizes ].sort( ( a, b ) => a - b ) );
			expect( new Set( sizes ).size ).toBe( SIZE_OPTIONS.length );
		} );

		it( 'should reproduce the shipped rem ladder exactly', () => {
			const wrapper = mountPicker();

			const sizes = sampleSizes( wrapper );

			// Codex's cdx-mode-* mixins set --font-size-medium to these.
			expect( sizes ).toEqual( [ 0.875, 1, 1.125, 1.25 ] );
		} );

		it( 'should express the sample in rem so it tracks the root font size', () => {
			const wrapper = mountPicker();

			const units = wrapper
				.findAll( '.citizen-preferences-segmented__sample' )
				.map( ( el ) => el.element.style.fontSize.replace( /[\d.]/g, '' ) );

			expect( units ).toEqual( [ 'rem', 'rem', 'rem', 'rem' ] );
		} );

		it( 'should still span the full ramp for an option set it has never seen', () => {
			const wrapper = mountPicker( {
				options: [
					{ value: 'tiny', label: 'Tiny' },
					{ value: 'huge', label: 'Huge' },
					{ value: 'colossal', label: 'Colossal' },
					{ value: 'absurd', label: 'Absurd' },
					{ value: 'unreasonable', label: 'Unreasonable' }
				],
				modelValue: 'tiny'
			} );

			const sizes = sampleSizes( wrapper );

			expect( sizes ).toHaveLength( 5 );
			expect( sizes ).toEqual( [ ...sizes ].sort( ( a, b ) => a - b ) );
			expect( new Set( sizes ).size ).toBe( 5 );
		} );

		it( 'should widen the page column across the width options', () => {
			const wrapper = mountPicker( {
				options: WIDTH_OPTIONS,
				featureName: 'citizen-feature-custom-width',
				variant: 'width'
			} );

			const widths = wrapper
				.findAll( '.citizen-preferences-segmented__page-column' )
				.map( ( el ) => parseFloat( el.attributes( 'width' ) ) );

			expect( widths ).toHaveLength( WIDTH_OPTIONS.length );
			expect( widths ).toEqual( [ ...widths ].sort( ( a, b ) => a - b ) );
		} );

		it( 'should centre a lone option on the ramp rather than dividing by zero', () => {
			const wrapper = mountPicker( {
				options: [ { value: 'only', label: 'Only' } ],
				modelValue: 'only'
			} );

			const [ size ] = sampleSizes( wrapper );

			// Midway along the ramp, not an endpoint and not NaN.
			expect( size ).toBeCloseTo( ( 0.875 + 1.25 ) / 2, 5 );
		} );
	} );

	describe( 'accessible names', () => {
		it( 'should give every glyph segment a screen-reader label', () => {
			const wrapper = mountPicker();

			const labels = wrapper
				.findAll( '.citizen-preferences-segmented__srlabel' )
				.map( ( el ) => el.text() );

			expect( labels ).toEqual( [ 'Small', 'Standard', 'Large', 'Extra large' ] );
		} );

		it( 'should hide the decorative glyph from assistive technology', () => {
			const wrapper = mountPicker();

			const samples = wrapper.findAll( '.citizen-preferences-segmented__sample' );

			samples.forEach( ( el ) => {
				expect( el.attributes( 'aria-hidden' ) ).toBe( 'true' );
			} );
		} );
	} );

	describe( 'no variant', () => {
		it( 'should fall back to plain text labels', () => {
			const wrapper = mountPicker( { variant: '' } );

			const text = wrapper.text();

			expect( wrapper.findAll( '.citizen-preferences-segmented__sample' ) )
				.toHaveLength( 0 );
			expect( text ).toContain( 'Extra large' );
		} );

		it( 'should not double up the label with a screen-reader copy', () => {
			const wrapper = mountPicker( { variant: '' } );

			const srLabels = wrapper.findAll( '.citizen-preferences-segmented__srlabel' );

			expect( srLabels ).toHaveLength( 0 );
		} );

		it( 'should fall back to plain text labels for an unrecognized variant', () => {
			const wrapper = mountPicker( { variant: 'sparkles' } );

			expect( wrapper.findAll( '.citizen-preferences-segmented__sample' ) )
				.toHaveLength( 0 );
			expect( wrapper.text() ).toContain( 'Small' );
		} );
	} );
} );
