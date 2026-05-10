// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

mw.loader.require = vi.fn( () => ( {
	CdxIcon: {
		name: 'CdxIcon',
		template: '<span class="cdx-icon-stub"></span>',
		props: [ 'icon' ]
	}
} ) );

let CommandPaletteImage;

beforeAll( async () => {
	const mod = await import(
		'../../../../resources/skins.citizen.commandPalette/components/CommandPaletteImage.vue'
	);
	CommandPaletteImage = mod.default;
} );

describe( 'CommandPaletteImage', () => {
	describe( 'renders an <img>', () => {
		it( 'when src is provided', () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '/img/foo.png', width: 320, height: 240, alt: 'A cat' }
			} );

			const img = wrapper.find( 'img.citizen-command-palette-image__image' );
			expect( img.exists() ).toBe( true );
			expect( img.attributes( 'src' ) ).toBe( '/img/foo.png' );
			expect( img.attributes( 'width' ) ).toBe( '320' );
			expect( img.attributes( 'height' ) ).toBe( '240' );
			expect( img.attributes( 'alt' ) ).toBe( 'A cat' );
			expect( img.attributes( 'loading' ) ).toBe( 'lazy' );
			expect( img.attributes( 'decoding' ) ).toBe( 'async' );
		} );

		it( 'with eager loading priority when set', () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '/img/foo.png', loadingPriority: 'eager' }
			} );

			expect( wrapper.find( 'img' ).attributes( 'loading' ) ).toBe( 'eager' );
		} );
	} );

	describe( 'renders the placeholder', () => {
		it( 'when src is empty', () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '', placeholderIcon: 'audio-icon' }
			} );

			expect( wrapper.find( 'img' ).exists() ).toBe( false );
			const placeholder = wrapper.find( '.citizen-command-palette-image__placeholder' );
			expect( placeholder.exists() ).toBe( true );
			const icon = placeholder.findComponent( { name: 'CdxIcon' } );
			expect( icon.exists() ).toBe( true );
			expect( icon.props( 'icon' ) ).toBe( 'audio-icon' );
		} );

		it( 'with no icon when placeholderIcon is null', () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '' }
			} );

			expect( wrapper.find( '.citizen-command-palette-image__placeholder' ).exists() ).toBe( true );
			expect( wrapper.findComponent( { name: 'CdxIcon' } ).exists() ).toBe( false );
		} );

		it( 'when the image fails to load (broken URL)', async () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '/missing.png', placeholderIcon: 'fallback-icon' }
			} );

			// img is rendered initially
			expect( wrapper.find( 'img' ).exists() ).toBe( true );

			// Simulate a load failure — the component swaps to the placeholder
			// so the user sees the mediatype icon instead of the browser's
			// broken-image glyph.
			await wrapper.find( 'img' ).trigger( 'error' );

			expect( wrapper.find( 'img' ).exists() ).toBe( false );
			const icon = wrapper.findComponent( { name: 'CdxIcon' } );
			expect( icon.exists() ).toBe( true );
			expect( icon.props( 'icon' ) ).toBe( 'fallback-icon' );
		} );

		it( 'recovers and re-attempts when src changes after a failure', async () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '/missing.png', placeholderIcon: 'fallback-icon' }
			} );

			await wrapper.find( 'img' ).trigger( 'error' );
			expect( wrapper.find( 'img' ).exists() ).toBe( false );

			// Same component instance gets reused as the highlight moves
			// across rows; resetting the broken flag on src change keeps a
			// previous row's failure from poisoning the new URL.
			await wrapper.setProps( { src: '/works.png' } );

			const img = wrapper.find( 'img' );
			expect( img.exists() ).toBe( true );
			expect( img.attributes( 'src' ) ).toBe( '/works.png' );
		} );
	} );

	describe( 'aspect ratio + object fit classes', () => {
		it( 'maps aspectRatio="1:1" to a --ratio-1-1 class', () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '/img/foo.png', aspectRatio: '1:1' }
			} );

			expect( wrapper.classes() ).toContain( 'citizen-command-palette-image--ratio-1-1' );
		} );

		it( 'maps aspectRatio="16:9" to a --ratio-16-9 class', () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '/img/foo.png', aspectRatio: '16:9' }
			} );

			expect( wrapper.classes() ).toContain( 'citizen-command-palette-image--ratio-16-9' );
		} );

		it( 'omits the ratio class when aspectRatio is null', () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '/img/foo.png' }
			} );

			expect(
				wrapper.classes().some( ( c ) => c.startsWith( 'citizen-command-palette-image--ratio-' ) )
			).toBe( false );
		} );

		it( 'applies the object-fit class to the img element only (matches CdxImage)', () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '/img/foo.png', objectFit: 'contain' }
			} );

			// CdxImage puts the object-fit modifier on the inner <img>,
			// not on the root. Mirroring that placement means the future
			// swap is a class-prefix rename — nothing structural changes.
			expect(
				wrapper.classes().some( ( c ) => c.startsWith( 'citizen-command-palette-image--fit-' ) )
			).toBe( false );
			expect( wrapper.find( 'img' ).classes() ).toContain( 'citizen-command-palette-image__image--fit-contain' );
		} );

		it( 'defaults to cover on the img when objectFit is not provided', () => {
			const wrapper = mount( CommandPaletteImage, {
				props: { src: '/img/foo.png' }
			} );

			expect( wrapper.find( 'img' ).classes() ).toContain( 'citizen-command-palette-image__image--fit-cover' );
		} );
	} );
} );
