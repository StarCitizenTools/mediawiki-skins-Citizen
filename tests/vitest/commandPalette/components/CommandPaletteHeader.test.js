// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const mw = require( '../../mocks/mw.js' );
const { setCodexStubs } = require( '../../mocks/codex.js' );
globalThis.mw = mw;

// CdxTextInput sets `inheritAttrs: false` so that ARIA attributes land on the
// real <input> rather than the wrapper. The stub has to do the same, or these
// tests would pass against markup a screen reader never sees.
setCodexStubs( {
	CdxButton: {
		name: 'CdxButton',
		template: '<button><slot></slot></button>'
	},
	CdxInfoChip: {
		name: 'CdxInfoChip',
		template: '<div class="cdx-info-chip-stub"><slot></slot></div>'
	},
	CdxIcon: {
		name: 'CdxIcon',
		template: '<span class="cdx-icon-stub"></span>',
		props: [ 'icon', 'size' ]
	},
	CdxTextInput: {
		name: 'CdxTextInput',
		inheritAttrs: false,
		props: [ 'modelValue', 'inputType', 'clearable', 'placeholder' ],
		template: '<div class="cdx-text-input-stub"><input v-bind="$attrs"></div>'
	}
} );

let CommandPaletteHeader;

function mountHeader( props = {} ) {
	return mount( CommandPaletteHeader, {
		props: {
			tokens: [],
			freeText: '',
			...props
		},
		global: {
			mocks: { $i18n: ( key ) => ( { text: () => key } ) }
		}
	} );
}

beforeAll( async () => {
	CommandPaletteHeader = (
		await import( '../../../../resources/skins.citizen.commandPalette/components/CommandPaletteHeader.vue' )
	).default;
} );

describe( 'CommandPaletteHeader combobox wiring', () => {
	it( 'marks the input as a combobox controlling the listbox', () => {
		const wrapper = mountHeader();

		const input = wrapper.get( 'input' );
		expect( input.attributes( 'role' ) ).toBe( 'combobox' );
		expect( input.attributes( 'aria-autocomplete' ) ).toBe( 'list' );
		expect( input.attributes( 'aria-controls' ) ).toBe( 'citizen-command-palette-listbox' );
	} );

	it( 'reflects whether results are showing in aria-expanded', () => {
		expect( mountHeader( { expanded: false } ).get( 'input' ).attributes( 'aria-expanded' ) )
			.toBe( 'false' );
		expect( mountHeader( { expanded: true } ).get( 'input' ).attributes( 'aria-expanded' ) )
			.toBe( 'true' );
	} );

	it( 'points aria-activedescendant at the highlighted option', () => {
		const wrapper = mountHeader( { activeDescendantId: 'citizen-command-palette-item-page-Foo' } );

		expect( wrapper.get( 'input' ).attributes( 'aria-activedescendant' ) )
			.toBe( 'citizen-command-palette-item-page-Foo' );
	} );

	it( 'reports expanded while the help overlay is up, which also lists options', () => {
		// The help view renders the same command-palette-list, so a listbox is
		// on screen; saying aria-expanded="false" there would be a lie.
		const wrapper = mountHeader( { helpVisible: true, expanded: true } );

		expect( wrapper.get( 'input' ).attributes( 'aria-expanded' ) ).toBe( 'true' );
	} );

	it( 'omits aria-activedescendant when nothing is highlighted', () => {
		// An empty or stringified value ("[object Object]" from an unwrapped
		// ref) resolves to no element, which is worse than omitting it.
		const wrapper = mountHeader( { activeDescendantId: null } );

		expect( wrapper.get( 'input' ).attributes( 'aria-activedescendant' ) ).toBeUndefined();
	} );
} );
