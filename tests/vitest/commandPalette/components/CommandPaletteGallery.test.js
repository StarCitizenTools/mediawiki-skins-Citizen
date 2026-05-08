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

let CommandPaletteGallery;

const SAMPLE_SECTIONS = [
	{
		items: [
			{ id: 'a', type: 'file', label: 'A.png', url: '/wiki/File:A.png' },
			{ id: 'b', type: 'file', label: 'B.png', url: '/wiki/File:B.png' },
			{ id: 'c', type: 'file', label: 'C.png', url: '/wiki/File:C.png' }
		]
	}
];

function mountGallery( propsOverrides = {} ) {
	return mount( CommandPaletteGallery, {
		props: {
			sections: SAMPLE_SECTIONS,
			highlightedItemIndex: -1,
			...propsOverrides
		},
		global: {
			mocks: { $i18n: ( key ) => ( { text: () => key } ) }
		}
	} );
}

beforeAll( async () => {
	const mod = await import(
		'../../../../resources/skins.citizen.commandPalette/components/CommandPaletteGallery.vue'
	);
	CommandPaletteGallery = mod.default;
} );

describe( 'CommandPaletteGallery', () => {
	it( 'renders one tile per item', () => {
		const wrapper = mountGallery();

		const tiles = wrapper.findAllComponents( { name: 'CommandPaletteGalleryItem' } );
		expect( tiles ).toHaveLength( 3 );
	} );

	it( 'lays out tiles in a CSS grid container', () => {
		const wrapper = mountGallery();

		expect( wrapper.find( '.citizen-command-palette-gallery__grid' ).exists() ).toBe( true );
	} );

	it( 'flags the tile at highlightedItemIndex as highlighted', () => {
		const wrapper = mountGallery( { highlightedItemIndex: 1 } );

		const tiles = wrapper.findAllComponents( { name: 'CommandPaletteGalleryItem' } );
		expect( tiles[ 0 ].props( 'highlighted' ) ).toBe( false );
		expect( tiles[ 1 ].props( 'highlighted' ) ).toBe( true );
		expect( tiles[ 2 ].props( 'highlighted' ) ).toBe( false );
	} );

	it( 'forwards select events from items to parent', async () => {
		const wrapper = mountGallery();

		const firstTile = wrapper.findAllComponents( { name: 'CommandPaletteGalleryItem' } )[ 0 ];
		await firstTile.trigger( 'click' );

		expect( wrapper.emitted( 'select' ) ).toBeTruthy();
		expect( wrapper.emitted( 'select' )[ 0 ][ 0 ].id ).toBe( 'a' );
	} );

	it( 'forwards hover events with global index', async () => {
		const wrapper = mountGallery();

		const secondTile = wrapper.findAllComponents( { name: 'CommandPaletteGalleryItem' } )[ 1 ];
		await secondTile.trigger( 'mouseenter' );

		expect( wrapper.emitted( 'hover' ) ).toBeTruthy();
		expect( wrapper.emitted( 'hover' )[ 0 ][ 0 ] ).toBe( 1 );
	} );

	it( 'renders a section heading when provided', () => {
		const wrapper = mountGallery( {
			sections: [
				{ heading: 'citizen-command-palette-mode-recents-heading', items: SAMPLE_SECTIONS[ 0 ].items }
			]
		} );

		const heading = wrapper.find( '.citizen-command-palette-gallery__heading' );
		expect( heading.exists() ).toBe( true );
	} );

	it( 'computes correct global index across multiple sections', () => {
		const wrapper = mountGallery( {
			sections: [
				{ items: [ { id: 'x1', type: 'file', label: 'X1', url: '/' } ] },
				{ items: [ { id: 'y1', type: 'file', label: 'Y1', url: '/' } ] }
			],
			highlightedItemIndex: 1
		} );

		const tiles = wrapper.findAllComponents( { name: 'CommandPaletteGalleryItem' } );
		expect( tiles[ 0 ].props( 'highlighted' ) ).toBe( false );
		expect( tiles[ 1 ].props( 'highlighted' ) ).toBe( true );
	} );

	it( 'has role=listbox for a11y', () => {
		const wrapper = mountGallery();

		expect( wrapper.attributes( 'role' ) ).toBe( 'listbox' );
	} );

	it( 'exposes the galleryRef so parents can observe the container', () => {
		const wrapper = mountGallery();

		expect( wrapper.vm.galleryRef ).toBeDefined();
	} );
} );
