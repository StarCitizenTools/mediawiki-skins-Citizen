const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const modeHelpDetail = require(
	'../../../../resources/skins.citizen.commandPalette/utils/modeHelpDetail.js'
);

describe( 'modeHelpDetail', () => {
	it( 'describes a mode with a header, its triggers and its long description', () => {
		const handler = {
			id: 'category',
			icon: 'cdxIconTag',
			label: 'Categories',
			description: 'Search and explore categories',
			triggers: [ '/cat:', '#' ],
			help: { description: 'citizen-command-palette-mode-category-description-help' }
		};

		const detail = modeHelpDetail( handler );

		expect( detail.header ).toEqual( {
			icon: 'cdxIconTag',
			label: 'Categories',
			description: 'Search and explore categories'
		} );
		expect( detail.pairs ).toEqual( [
			{ key: 'triggers', label: 'citizen-command-palette-help-section-triggers', keys: [ '#', '/cat:' ] },
			{ key: 'description', label: 'citizen-command-palette-help-section-description', html: 'citizen-command-palette-mode-category-description-help' }
		] );
	} );

	it( 'leaves out what a handler does not declare', () => {
		const detail = modeHelpDetail( { id: 'bare', triggers: [] } );

		expect( detail.header.label ).toBe( 'bare' );
		expect( detail.pairs ).toEqual( [] );
	} );
} );
