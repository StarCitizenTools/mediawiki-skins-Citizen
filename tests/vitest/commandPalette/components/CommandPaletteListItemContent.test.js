// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

mw.loader.require = vi.fn( () => ( {
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
} ) );

let CommandPaletteListItemContent;

const BASE_PROPS = {
	url: '/wiki/Foo',
	label: 'Foo',
	description: '',
	thumbnail: null,
	thumbnailIcon: 'icon-name',
	metadata: [],
	type: 'page',
	typeLabel: 'Page',
	searchQuery: '',
	highlightQuery: false,
	compact: false
};

function mountContent( propsOverrides = {} ) {
	return mount( CommandPaletteListItemContent, {
		props: { ...BASE_PROPS, ...propsOverrides }
	} );
}

beforeAll( async () => {
	const mod = await import(
		'../../../../resources/skins.citizen.commandPalette/components/CommandPaletteListItemContent.vue'
	);
	CommandPaletteListItemContent = mod.default;
} );

afterEach( () => {
	vi.restoreAllMocks();
} );

describe( 'CommandPaletteListItemContent', () => {
	describe( 'default (non-compact) layout', () => {
		it( 'renders a CdxThumbnail', () => {
			const wrapper = mountContent();

			expect( wrapper.findComponent( { name: 'CdxThumbnail' } ).exists() ).toBe( true );
			expect( wrapper.findComponent( { name: 'CdxIcon' } ).exists() ).toBe( false );
		} );

		it( 'renders the description block when description is present', () => {
			const wrapper = mountContent( { description: 'A description' } );

			const description = wrapper.find( '.citizen-command-palette-list-item__text__description' );
			expect( description.exists() ).toBe( true );
			expect( description.text() ).toBe( 'A description' );
		} );

		it( 'omits the description block when description is empty', () => {
			const wrapper = mountContent( { description: '' } );

			expect( wrapper.find( '.citizen-command-palette-list-item__text__description' ).exists() ).toBe( false );
		} );
	} );

	describe( 'compact layout', () => {
		it( 'renders a CdxIcon and not a CdxThumbnail', () => {
			const wrapper = mountContent( { compact: true } );

			expect( wrapper.findComponent( { name: 'CdxIcon' } ).exists() ).toBe( true );
			expect( wrapper.findComponent( { name: 'CdxThumbnail' } ).exists() ).toBe( false );
		} );

		it( 'renders the icon at medium size', () => {
			const wrapper = mountContent( { compact: true } );

			const icon = wrapper.findComponent( { name: 'CdxIcon' } );
			expect( icon.props( 'size' ) ).toBe( 'medium' );
		} );

		it( 'renders label and description as siblings inside one inline container', () => {
			const wrapper = mountContent( { compact: true, description: 'Group: admin' } );

			const inline = wrapper.find( '.citizen-command-palette-list-item__text-inline' );
			expect( inline.exists() ).toBe( true );

			const label = inline.find( '.citizen-command-palette-list-item__text__label' );
			const description = inline.find( '.citizen-command-palette-list-item__text-inline__description' );

			expect( label.exists() ).toBe( true );
			expect( description.exists() ).toBe( true );
			expect( label.text() ).toContain( 'Foo' );
			expect( description.text() ).toBe( 'Group: admin' );
		} );

		it( 'omits the description node when description is empty', () => {
			const wrapper = mountContent( { compact: true, description: '' } );

			expect( wrapper.find( '.citizen-command-palette-list-item__text-inline__description' ).exists() ).toBe( false );
		} );

		it( 'renders CdxSearchResultTitle for the label when highlightQuery is true', () => {
			const wrapper = mountContent( {
				compact: true,
				highlightQuery: true,
				searchQuery: 'Foo'
			} );

			const title = wrapper.findComponent( { name: 'CdxSearchResultTitle' } );
			expect( title.exists() ).toBe( true );
			expect( title.props( 'title' ) ).toBe( 'Foo' );
			expect( title.props( 'searchQuery' ) ).toBe( 'Foo' );
		} );

		it( 'still renders metadata items', () => {
			const wrapper = mountContent( {
				compact: true,
				metadata: [ { label: 'meta', icon: '' } ]
			} );

			const items = wrapper.findAll( '.citizen-command-palette-list-item__metadata__item' );
			// One for the metadata entry, one for the type label
			expect( items.length ).toBeGreaterThanOrEqual( 2 );
		} );
	} );
} );
