// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const mw = require( '../../mocks/mw.js' );
const { setCodexStubs } = require( '../../mocks/codex.js' );
globalThis.mw = mw;

setCodexStubs( {
	CdxButton: {
		name: 'CdxButton',
		template: '<button><slot></slot></button>'
	},
	CdxIcon: {
		name: 'CdxIcon',
		template: '<span class="cdx-icon-stub"></span>',
		props: [ 'icon', 'size' ]
	},
	CdxThumbnail: {
		name: 'CdxThumbnail',
		props: [ 'placeholderIcon' ],
		template: '<div class="cdx-thumbnail-stub"></div>'
	}
} );

let CommandPaletteDetailPanel;

function mountPanel( detail, slots = {} ) {
	return mount( CommandPaletteDetailPanel, {
		props: { detail },
		slots,
		global: { stubs: { CommandPaletteImage: true } }
	} );
}

beforeAll( async () => {
	CommandPaletteDetailPanel = (
		await import( '../../../../resources/skins.citizen.commandPalette/components/CommandPaletteDetailPanel.vue' )
	).default;
} );

describe( 'CommandPaletteDetailPanel', () => {
	it( 'renders a pair of keys as key caps', () => {
		const wrapper = mountPanel( { pairs: [ { key: 'triggers', label: 'Triggers', keys: [ '#', '/cat:' ] } ] } );

		const caps = wrapper.findAll( 'kbd.citizen-keyboard-hint-key--literal' ).map( ( k ) => k.text() );

		expect( caps ).toEqual( [ '#', '/cat:' ] );
	} );

	it( 'renders a pair of trusted markup as markup', () => {
		const wrapper = mountPanel( { pairs: [ { key: 'description', label: 'Description', html: 'Type <code>Talk:</code>' } ] } );

		expect( wrapper.find( '.citizen-command-palette-detail-panel__value code' ).text() ).toBe( 'Talk:' );
	} );

	it( 'draws the header icon when one is given', () => {
		const withIcon = mountPanel( { header: { label: 'Categories', icon: 'cdxIconTag' } } );
		const without = mountPanel( { header: { label: 'Categories' } } );

		expect( withIcon.getComponent( { name: 'CdxThumbnail' } ).props( 'placeholderIcon' ) ).toBe( 'cdxIconTag' );
		expect( without.findComponent( { name: 'CdxThumbnail' } ).exists() ).toBe( false );
	} );

	it( 'lets a named slot override a pair', () => {
		const wrapper = mountPanel(
			{ pairs: [ { key: 'triggers', label: 'Triggers', keys: [ '#' ] } ] },
			{ triggers: '<span class="custom">custom</span>' }
		);

		expect( wrapper.find( '.custom' ).exists() ).toBe( true );
		expect( wrapper.find( 'kbd' ).exists() ).toBe( false );
	} );
} );
