// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

mw.loader.require = vi.fn( () => ( {
	CdxThumbnail: {
		name: 'CdxThumbnail',
		template: '<div class="cdx-thumbnail-stub"></div>',
		props: [ 'thumbnail', 'placeholderIcon' ]
	}
} ) );

let CommandPaletteGalleryItem;

const BASE_PROPS = {
	id: 'test-1',
	type: 'file',
	label: 'Foo.png',
	url: '/wiki/File:Foo.png'
};

function mountTile( propsOverrides = {} ) {
	return mount( CommandPaletteGalleryItem, {
		props: { ...BASE_PROPS, ...propsOverrides }
	} );
}

beforeAll( async () => {
	const mod = await import(
		'../../../../resources/skins.citizen.commandPalette/components/CommandPaletteGalleryItem.vue'
	);
	CommandPaletteGalleryItem = mod.default;
} );

describe( 'CommandPaletteGalleryItem', () => {
	describe( 'thumbnail rendering', () => {
		it( 'forwards the thumbnail object to CdxThumbnail', () => {
			const thumb = { url: '/img/foo.png', width: 300, height: 200 };
			const wrapper = mountTile( { thumbnail: thumb } );

			const cdxThumb = wrapper.findComponent( { name: 'CdxThumbnail' } );
			expect( cdxThumb.exists() ).toBe( true );
			expect( cdxThumb.props( 'thumbnail' ) ).toEqual( thumb );
		} );

		it( 'forwards the placeholder icon to CdxThumbnail', () => {
			const wrapper = mountTile( { thumbnailIcon: 'icon-name' } );

			const cdxThumb = wrapper.findComponent( { name: 'CdxThumbnail' } );
			expect( cdxThumb.exists() ).toBe( true );
			expect( cdxThumb.props( 'placeholderIcon' ) ).toBe( 'icon-name' );
		} );

		it( 'omits the placeholder icon prop when thumbnailIcon is empty', () => {
			const wrapper = mountTile( { thumbnailIcon: '' } );

			const cdxThumb = wrapper.findComponent( { name: 'CdxThumbnail' } );
			// Empty string maps to undefined so CdxThumbnail uses its default.
			expect( cdxThumb.props( 'placeholderIcon' ) ).toBeUndefined();
		} );
	} );

	describe( 'label', () => {
		it( 'exposes the label as a hover title for visual context', () => {
			const wrapper = mountTile();

			expect( wrapper.attributes( 'title' ) ).toBe( 'Foo.png' );
		} );

		it( 'does not render the label as visible text inside the tile', () => {
			const wrapper = mountTile();

			expect( wrapper.find( '.citizen-command-palette-gallery-item__label' ).exists() ).toBe( false );
		} );
	} );

	describe( 'highlighted state', () => {
		it( 'applies the highlighted class when prop is true', () => {
			const wrapper = mountTile( { highlighted: true } );

			expect( wrapper.classes() ).toContain( 'citizen-command-palette-gallery-item--highlighted' );
		} );

		it( 'omits the highlighted class when prop is false', () => {
			const wrapper = mountTile( { highlighted: false } );

			expect( wrapper.classes() ).not.toContain( 'citizen-command-palette-gallery-item--highlighted' );
		} );
	} );

	describe( 'click handling', () => {
		it( 'emits select with the item payload on click', async () => {
			const wrapper = mountTile();

			await wrapper.trigger( 'click' );

			const emitted = wrapper.emitted( 'select' );
			expect( emitted ).toBeTruthy();
			expect( emitted[ 0 ][ 0 ].id ).toBe( 'test-1' );
			expect( emitted[ 0 ][ 0 ].label ).toBe( 'Foo.png' );
			expect( emitted[ 0 ][ 0 ].url ).toBe( '/wiki/File:Foo.png' );
			expect( emitted[ 0 ][ 0 ].isMouseClick ).toBe( true );
		} );

		it( 'reports modifierClick=true on Ctrl+click', async () => {
			const wrapper = mountTile();
			const event = new MouseEvent( 'click', { ctrlKey: true } );

			wrapper.element.dispatchEvent( event );
			await wrapper.vm.$nextTick();

			expect( wrapper.emitted( 'select' )[ 0 ][ 0 ].modifierClick ).toBe( true );
		} );

		it( 'reports modifierClick=false on plain click', async () => {
			const wrapper = mountTile();

			await wrapper.trigger( 'click' );

			expect( wrapper.emitted( 'select' )[ 0 ][ 0 ].modifierClick ).toBe( false );
		} );
	} );

	describe( 'mousedown handling', () => {
		it( 'emits change(active, true) on left mousedown', async () => {
			const wrapper = mountTile();

			await wrapper.trigger( 'mousedown', { button: 0 } );

			const emitted = wrapper.emitted( 'change' );
			expect( emitted ).toBeTruthy();
			expect( emitted[ 0 ] ).toEqual( [ 'active', true ] );
		} );

		it( 'does not emit change on non-left mousedown', async () => {
			const wrapper = mountTile();

			await wrapper.trigger( 'mousedown', { button: 1 } );

			expect( wrapper.emitted( 'change' ) ).toBeUndefined();
		} );
	} );

	describe( 'rendered element', () => {
		it( 'renders as <a> when url is set', () => {
			const wrapper = mountTile();

			expect( wrapper.element.tagName ).toBe( 'A' );
			expect( wrapper.attributes( 'href' ) ).toBe( '/wiki/File:Foo.png' );
		} );

		it( 'renders as <button> when no url', () => {
			const wrapper = mountTile( { url: '' } );

			expect( wrapper.element.tagName ).toBe( 'BUTTON' );
		} );
	} );
} );
