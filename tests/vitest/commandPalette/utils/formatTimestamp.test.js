const formatTimestamp = require( '../../../../resources/skins.citizen.commandPalette/utils/formatTimestamp.js' );

describe( 'formatTimestamp', () => {
	beforeEach( () => {
		vi.useFakeTimers();
		vi.setSystemTime( new Date( '2026-10-02T12:00:00Z' ) );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
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

	it( 'gives a time in an earlier year as a date with its year', () => {
		const old = '2025-11-03T08:30:00Z';

		const formatted = formatTimestamp( old );

		expect( formatted ).toBe(
			new Date( old ).toLocaleDateString( undefined, { year: 'numeric', month: 'short', day: 'numeric' } )
		);
	} );

	it( 'gives an unreadable time as an invalid date, without failing', () => {
		const formatted = formatTimestamp( 'yesterday-ish' );

		expect( formatted ).toBe( new Date( 'yesterday-ish' ).toLocaleDateString() );
	} );

	it( 'builds the date formatter once for any number of dates', () => {
		// A fresh copy, so a formatter kept from an earlier test cannot stand in.
		const path = require.resolve( '../../../../resources/skins.citizen.commandPalette/utils/formatTimestamp.js' );
		delete require.cache[ path ];
		const freshFormatTimestamp = require( path );
		const expected = [ '2026-04-28T08:30:00Z', '2026-03-15T08:30:00Z' ].map(
			( time ) => new Date( time ).toLocaleDateString( undefined, { month: 'short', day: 'numeric' } )
		);
		const construct = vi.spyOn( Intl, 'DateTimeFormat' );
		const toLocaleDateString = vi.spyOn( Date.prototype, 'toLocaleDateString' );

		const formatted = [
			freshFormatTimestamp( '2026-04-28T08:30:00Z' ),
			freshFormatTimestamp( '2026-03-15T08:30:00Z' )
		];

		expect( formatted ).toEqual( expected );
		expect( construct ).toHaveBeenCalledTimes( 1 );
		expect( construct ).toHaveBeenCalledWith( undefined, { month: 'short', day: 'numeric' } );
		expect( toLocaleDateString ).not.toHaveBeenCalled();
	} );
} );
