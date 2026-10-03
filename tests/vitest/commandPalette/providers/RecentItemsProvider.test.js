const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const createRecentItemsProvider = require(
	'../../../../resources/skins.citizen.commandPalette/providers/RecentItemsProvider.js'
);

describe( 'createRecentItemsProvider', () => {
	describe( 'getResults', () => {
		it( 'hands the service the options it is given', () => {
			const service = { getRecentItems: vi.fn( () => [ { id: 'r1', label: 'A', url: '/wiki/A' } ] ) };
			const provider = createRecentItemsProvider( service );
			const options = { leftOut: new Set( [ 'page:B' ] ), limit: 8 };

			const result = provider.getResults( '', options );

			expect( service.getRecentItems ).toHaveBeenCalledWith( options );
			expect( result.items ).toEqual( [ { id: 'r1', label: 'A', url: '/wiki/A', source: 'recent' } ] );
		} );
	} );
} );
