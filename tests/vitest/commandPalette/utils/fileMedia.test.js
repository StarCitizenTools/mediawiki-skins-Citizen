// @vitest-environment jsdom
const icons = require( '../../mocks/commandPaletteIcons.js' );

const { computeThumbWidth, iconForMediatype } = require( '../../../../resources/skins.citizen.commandPalette/utils/fileMedia.js' );

describe( 'fileMedia', () => {
	afterEach( () => {
		vi.unstubAllGlobals();
	} );

	it( 'maps each media type to its icon', () => {
		expect( iconForMediatype( 'BITMAP' ) ).toBe( icons.cdxIconImage );
		expect( iconForMediatype( 'DRAWING' ) ).toBe( icons.cdxIconImage );
		expect( iconForMediatype( 'OFFICE' ) ).toBe( icons.cdxIconArticle );
		expect( iconForMediatype( 'AUDIO' ) ).toBe( icons.cdxIconVolumeUp );
		expect( iconForMediatype( 'VIDEO' ) ).toBe( icons.cdxIconPlay );
		expect( iconForMediatype( 'UNKNOWN' ) ).toBe( icons.cdxIconAttachment );
	} );

	it( 'scales the thumbnail width with the pixel ratio, up to a cap', () => {
		vi.stubGlobal( 'devicePixelRatio', 1 );
		const one = computeThumbWidth();
		vi.stubGlobal( 'devicePixelRatio', 2 );
		const two = computeThumbWidth();
		vi.stubGlobal( 'devicePixelRatio', 3 );
		const three = computeThumbWidth();

		expect( [ one, two, three ] ).toEqual( [ 160, 320, 400 ] );
	} );
} );
