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
		template: '<span class="cdx-icon"></span>',
		props: [ 'icon', 'size' ]
	},
	CdxSearchResultTitle: {
		name: 'CdxSearchResultTitle',
		template: '<span class="cdx-search-result-title">{{ title }}</span>',
		props: [ 'title', 'searchQuery' ]
	},
	CdxThumbnail: {
		name: 'CdxThumbnail',
		template: '<div class="cdx-thumbnail"></div>',
		props: [ 'thumbnail', 'placeholderIcon' ]
	}
} );

let CommandPaletteListItem;

const BASE_PROPS = {
	id: 'row-1',
	type: 'page',
	label: 'Foo',
	url: '/wiki/Foo'
};

function mountRow( propsOverrides = {} ) {
	return mount( CommandPaletteListItem, {
		props: { ...BASE_PROPS, ...propsOverrides }
	} );
}

function middleClick( element, button = 1 ) {
	element.dispatchEvent( new MouseEvent( 'auxclick', { button, bubbles: true } ) );
}

beforeAll( async () => {
	const mod = await import(
		'../../../../resources/skins.citizen.commandPalette/components/CommandPaletteListItem.vue'
	);
	CommandPaletteListItem = mod.default;
} );

describe( 'CommandPaletteListItem', () => {
	describe( 'middle click', () => {
		it( 'selects the row as a modifier click', async () => {
			const wrapper = mountRow();

			middleClick( wrapper.find( 'a' ).element );
			await wrapper.vm.$nextTick();

			const emitted = wrapper.emitted( 'select' );
			expect( emitted ).toHaveLength( 1 );
			expect( emitted[ 0 ][ 0 ] ).toMatchObject( {
				id: 'row-1',
				url: '/wiki/Foo',
				isMouseClick: true,
				modifierClick: true
			} );
		} );

		it( 'ignores a right click', async () => {
			const wrapper = mountRow();

			middleClick( wrapper.find( 'a' ).element, 2 );
			await wrapper.vm.$nextTick();

			expect( wrapper.emitted( 'select' ) ).toBeUndefined();
		} );

		it( 'ignores a middle click on a row without a link', async () => {
			const wrapper = mountRow( { url: '' } );

			middleClick( wrapper.find( '.citizen-command-palette-list-item__content' ).element );
			await wrapper.vm.$nextTick();

			expect( wrapper.emitted( 'select' ) ).toBeUndefined();
		} );
	} );
} );
