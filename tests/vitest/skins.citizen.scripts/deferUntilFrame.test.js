const deferUntilFrame = require( '../../../resources/skins.citizen.scripts/deferUntilFrame.js' );

describe( 'deferUntilFrame', () => {
	let rafCallbacks;

	beforeEach( () => {
		rafCallbacks = [];
		vi.stubGlobal( 'requestAnimationFrame', vi.fn( ( cb ) => {
			rafCallbacks.push( cb );
		} ) );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	it( 'should call callback immediately when frameCount is 0', () => {
		const callback = vi.fn();

		deferUntilFrame( callback, 0 );

		expect( callback ).toHaveBeenCalledOnce();
		expect( globalThis.requestAnimationFrame ).not.toHaveBeenCalled();
	} );

	it( 'should defer callback by the specified number of frames', () => {
		const callback = vi.fn();

		deferUntilFrame( callback, 3 );

		expect( callback ).not.toHaveBeenCalled();
		expect( rafCallbacks ).toHaveLength( 1 );

		// Frame 1
		rafCallbacks[ 0 ]();
		expect( callback ).not.toHaveBeenCalled();
		expect( rafCallbacks ).toHaveLength( 2 );

		// Frame 2
		rafCallbacks[ 1 ]();
		expect( callback ).not.toHaveBeenCalled();
		expect( rafCallbacks ).toHaveLength( 3 );

		// Frame 3
		rafCallbacks[ 2 ]();
		expect( callback ).toHaveBeenCalledOnce();
	} );

	it( 'should call callback immediately when frameCount is negative', () => {
		const callback = vi.fn();

		deferUntilFrame( callback, -1 );

		expect( callback ).toHaveBeenCalledOnce();
		expect( globalThis.requestAnimationFrame ).not.toHaveBeenCalled();
	} );
} );
