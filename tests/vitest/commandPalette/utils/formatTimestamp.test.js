const formatTimestamp = require( '../../../../resources/skins.citizen.commandPalette/utils/formatTimestamp.js' );

describe( 'formatTimestamp', () => {
	beforeEach( () => {
		vi.useFakeTimers();
		vi.setSystemTime( new Date( '2026-10-02T12:00:00Z' ) );
	} );

	afterEach( () => {
		vi.useRealTimers();
	} );

	it( 'gives recent times as a compact age', () => {
		expect( formatTimestamp( '2026-10-02T11:59:30Z' ) ).toBe( 'now' );
		expect( formatTimestamp( '2026-10-02T11:55:00Z' ) ).toBe( '5m' );
		expect( formatTimestamp( '2026-10-02T09:00:00Z' ) ).toBe( '3h' );
		expect( formatTimestamp( '2026-09-29T12:00:00Z' ) ).toBe( '3d' );
	} );

	it( 'gives older times as a date', () => {
		const old = '2026-04-28T08:30:00Z';

		const formatted = formatTimestamp( old );

		expect( formatted ).toBe(
			new Date( old ).toLocaleDateString( undefined, { month: 'short', day: 'numeric' } )
		);
	} );
} );
