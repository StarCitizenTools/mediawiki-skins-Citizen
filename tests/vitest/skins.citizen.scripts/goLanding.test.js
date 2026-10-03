// @vitest-environment jsdom
const { recordGoLanding } = require( '../../../resources/skins.citizen.scripts/goLanding.js' );

const NOTE_KEY = 'skin-citizen-command-palette-go-note';
const LANDING_KEY = 'skin-citizen-command-palette-go-landing';

function store( map ) {
	return {
		getObject: vi.fn( ( key ) => ( key in map ? map[ key ] : null ) ),
		setObject: vi.fn( ( key, value ) => {
			map[ key ] = value;
			return true;
		} ),
		remove: vi.fn( ( key ) => {
			delete map[ key ];
		} )
	};
}

function setup( { note, config = {}, search = null, redirectCount = 0 } = {} ) {
	const session = note === undefined ? {} : { [ NOTE_KEY ]: note };
	const local = {};
	const mw = {
		storage: { ...store( local ), session: store( session ) },
		config: { get: vi.fn( ( key ) => ( key in config ? config[ key ] : null ) ) },
		util: {
			getParamValue: vi.fn( ( name ) => ( name === 'search' ? search : null ) ),
			getUrl: vi.fn( ( title ) => '/wiki/' + title )
		}
	};
	const performance = { getEntriesByType: vi.fn( () => [ { redirectCount } ] ) };
	return { session, local, mw, performance };
}

function freshNote() {
	return { key: 'page:Main page', query: 'main page', expires: Date.now() + 60000 };
}

describe( 'recordGoLanding', () => {
	it( 'does nothing without a note', () => {
		const { session, local, mw, performance } = setup();

		recordGoLanding( { mw, performance } );

		expect( session ).toEqual( {} );
		expect( local ).toEqual( {} );
		expect( mw.storage.setObject ).not.toHaveBeenCalled();
	} );

	it( 'records the page a go was redirected to', () => {
		const { session, local, mw, performance } = setup( {
			note: freshNote(),
			config: { wgPageName: 'Main_Page', wgCanonicalSpecialPageName: false },
			redirectCount: 1
		} );

		recordGoLanding( { mw, performance } );

		expect( session ).toEqual( {} );
		expect( local ).toEqual( {
			[ LANDING_KEY ]: { key: 'page:Main page', url: '/wiki/Main_Page', label: 'Main Page' }
		} );
	} );

	it( 'reads the note only from this tab\'s session', () => {
		const { local, mw, performance } = setup( {
			config: { wgPageName: 'Main_Page', wgCanonicalSpecialPageName: false },
			redirectCount: 1
		} );
		const note = freshNote();
		local[ NOTE_KEY ] = note;

		recordGoLanding( { mw, performance } );

		expect( local ).toEqual( { [ NOTE_KEY ]: note } );
	} );

	it( 'records a go that searched', () => {
		const { session, local, mw, performance } = setup( {
			note: freshNote(),
			config: { wgPageName: 'Special:Search', wgCanonicalSpecialPageName: 'Search' },
			search: 'main page'
		} );

		recordGoLanding( { mw, performance } );

		expect( session ).toEqual( {} );
		expect( local ).toEqual( { [ LANDING_KEY ]: { key: 'page:Main page', searched: true } } );
	} );

	it( 'ignores a search for something else', () => {
		const { session, local, mw, performance } = setup( {
			note: freshNote(),
			config: { wgPageName: 'Special:Search', wgCanonicalSpecialPageName: 'Search' },
			search: 'other'
		} );

		recordGoLanding( { mw, performance } );

		expect( session ).toEqual( {} );
		expect( local ).toEqual( {} );
	} );

	it( 'ignores the page a go to another wiki stops at, using up the note', () => {
		const { session, local, mw, performance } = setup( {
			note: freshNote(),
			config: { wgPageName: 'Special:GoToInterwiki/wikipedia:Main_Page', wgCanonicalSpecialPageName: 'GoToInterwiki' },
			redirectCount: 1
		} );

		recordGoLanding( { mw, performance } );

		expect( session ).toEqual( {} );
		expect( local ).toEqual( {} );
		expect( mw.storage.setObject ).not.toHaveBeenCalled();
	} );

	it( 'ignores a page reached without a redirect', () => {
		const { session, local, mw, performance } = setup( {
			note: freshNote(),
			config: { wgPageName: 'Main_Page', wgCanonicalSpecialPageName: false },
			redirectCount: 0
		} );

		recordGoLanding( { mw, performance } );

		expect( session ).toEqual( {} );
		expect( local ).toEqual( {} );
	} );

	it( 'ignores an expired or malformed note', () => {
		const expired = setup( {
			note: { key: 'page:Main page', query: 'main page', expires: Date.now() - 1 },
			config: { wgPageName: 'Main_Page' },
			redirectCount: 1
		} );
		const malformed = setup( { note: { key: 5 }, config: { wgPageName: 'Main_Page' }, redirectCount: 1 } );

		recordGoLanding( expired );
		recordGoLanding( malformed );

		expect( expired.session ).toEqual( {} );
		expect( expired.local ).toEqual( {} );
		expect( malformed.session ).toEqual( {} );
		expect( malformed.local ).toEqual( {} );
	} );
} );
