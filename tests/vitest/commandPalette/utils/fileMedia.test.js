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

	describe( 'computeThumbWidth', () => {
		function widthAt( dpr ) {
			vi.stubGlobal( 'devicePixelRatio', dpr );
			return computeThumbWidth();
		}

		it( 'requests the 1× width at or below a pixel ratio of 1', () => {
			const widths = [ 0.5, 0.9, 1 ].map( widthAt );

			expect( widths ).toEqual( [ 160, 160, 160 ] );
		} );

		it( 'treats a ratio a rounding error above 1 as 1×', () => {
			// Reported for 80% zoom on a 125% scaled Windows display.
			const width = widthAt( 1.0000000149011612 );

			expect( width ).toBe( 160 );
		} );

		it( 'requests the 2× width for every pixel ratio above 1', () => {
			const widths = [ 1.1, 1.25, 1.5, 1.75, 2, 2.25, 3, 4 ].map( widthAt );

			expect( new Set( widths ) ).toEqual( new Set( [ 320 ] ) );
		} );

		it( 'treats a missing pixel ratio as 1×', () => {
			const width = widthAt( undefined );

			expect( width ).toBe( 160 );
		} );
	} );
} );
