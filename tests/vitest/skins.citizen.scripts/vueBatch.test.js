const { claimVueBatch, usingWithVue } = require( '../../../resources/skins.citizen.scripts/vueBatch.js' );

const MODULE = 'skins.citizen.commandPalette';

let mw;

beforeEach( () => {
	mw = { loader: { using: vi.fn( () => Promise.resolve() ) } };
} );

describe( 'claimVueBatch', () => {
	it( 'requests vue on its own so the panel batch excludes it', () => {
		claimVueBatch( mw );

		expect( mw.loader.using ).toHaveBeenCalledTimes( 1 );
		expect( mw.loader.using ).toHaveBeenCalledWith( 'vue' );
	} );

	it( 'swallows a failed vue load so the caller owns error surfacing', async () => {
		mw.loader.using = vi.fn( () => Promise.reject( new Error( 'network' ) ) );

		expect( () => claimVueBatch( mw ) ).not.toThrow();
		await Promise.resolve();
	} );
} );

describe( 'usingWithVue', () => {
	it( 'requests vue before the module', () => {
		usingWithVue( MODULE, mw );

		expect( mw.loader.using.mock.calls.map( ( [ name ] ) => name ) ).toEqual( [ 'vue', MODULE ] );
	} );

	it( 'does not await vue, so both requests are in flight together', () => {
		let resolveVue;
		mw.loader.using = vi.fn( ( name ) => name === 'vue' ?
			new Promise( ( resolve ) => {
				resolveVue = resolve;
			} ) :
			Promise.resolve() );

		usingWithVue( MODULE, mw );

		expect( mw.loader.using ).toHaveBeenCalledWith( MODULE );
		expect( resolveVue ).toBeTypeOf( 'function' );
	} );

	it( 'resolves with the module require function', async () => {
		const req = vi.fn();
		mw.loader.using = vi.fn( ( name ) => Promise.resolve( name === 'vue' ? undefined : req ) );

		await expect( usingWithVue( MODULE, mw ) ).resolves.toBe( req );
	} );

	it( 'rejects when the module fails, regardless of vue', async () => {
		mw.loader.using = vi.fn( ( name ) => name === 'vue' ?
			Promise.resolve() :
			Promise.reject( new Error( 'module failed' ) ) );

		await expect( usingWithVue( MODULE, mw ) ).rejects.toThrow( 'module failed' );
	} );
} );
