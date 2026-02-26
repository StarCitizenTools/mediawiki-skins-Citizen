const { createDirectionObserver } = require( '../../../resources/skins.citizen.scripts/scrollObserver.js' );

describe( 'createDirectionObserver', () => {
	let win;
	let onScrollDown;
	let onScrollUp;

	beforeEach( () => {
		win = {
			scrollY: 0,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		};
		onScrollDown = vi.fn();
		onScrollUp = vi.fn();
	} );

	afterEach( () => {
		vi.restoreAllMocks();
	} );

	function createObserver( overrides = {} ) {
		return createDirectionObserver( {
			window: win,
			throttle: ( fn ) => fn,
			onScrollDown,
			onScrollUp,
			threshold: 0,
			...overrides
		} );
	}

	function simulateScroll( scrollY ) {
		win.scrollY = scrollY;
		const handler = win.addEventListener.mock.calls[ 0 ][ 1 ];
		handler();
	}

	it( 'should call onScrollDown when scrolling down', () => {
		const observer = createObserver();
		observer.resume();

		simulateScroll( 100 );

		expect( onScrollDown ).toHaveBeenCalledOnce();
		expect( onScrollUp ).not.toHaveBeenCalled();
	} );

	it( 'should call onScrollUp when scrolling up', () => {
		const observer = createObserver();
		observer.resume();

		simulateScroll( 100 );
		simulateScroll( 50 );

		expect( onScrollUp ).toHaveBeenCalledOnce();
	} );

	it( 'should not fire callback when scroll delta is below threshold', () => {
		const observer = createObserver( { threshold: 20 } );
		observer.resume();

		simulateScroll( 10 );

		expect( onScrollDown ).not.toHaveBeenCalled();
		expect( onScrollUp ).not.toHaveBeenCalled();
	} );

	it( 'should fire callback when scroll delta meets threshold', () => {
		const observer = createObserver( { threshold: 20 } );
		observer.resume();

		simulateScroll( 25 );

		expect( onScrollDown ).toHaveBeenCalledOnce();
	} );

	it( 'should not repeat same-direction callback (deduplication)', () => {
		const observer = createObserver();
		observer.resume();

		simulateScroll( 100 );
		simulateScroll( 200 );
		simulateScroll( 300 );

		expect( onScrollDown ).toHaveBeenCalledOnce();
	} );

	it( 'should fire again after direction change', () => {
		const observer = createObserver();
		observer.resume();

		simulateScroll( 100 );
		simulateScroll( 50 );
		simulateScroll( 150 );

		expect( onScrollDown ).toHaveBeenCalledTimes( 2 );
		expect( onScrollUp ).toHaveBeenCalledOnce();
	} );

	it( 'should add scroll listener on resume', () => {
		const observer = createObserver();

		observer.resume();

		expect( win.addEventListener ).toHaveBeenCalledWith( 'scroll', expect.any( Function ) );
	} );

	it( 'should remove scroll listener on pause', () => {
		const observer = createObserver();

		observer.resume();
		observer.pause();

		const addedHandler = win.addEventListener.mock.calls[ 0 ][ 1 ];
		expect( win.removeEventListener ).toHaveBeenCalledWith( 'scroll', addedHandler );
	} );

	it( 'should use the same function reference for add and remove', () => {
		const observer = createObserver();

		observer.resume();
		observer.pause();

		const addedFn = win.addEventListener.mock.calls[ 0 ][ 1 ];
		const removedFn = win.removeEventListener.mock.calls[ 0 ][ 1 ];
		expect( addedFn ).toBe( removedFn );
	} );

	it( 'should clamp negative scroll positions to zero', () => {
		const observer = createObserver();
		observer.resume();

		simulateScroll( -10 );

		// After clamping to 0, scrolling to 50 should be a down scroll
		simulateScroll( 50 );
		expect( onScrollDown ).toHaveBeenCalled();
	} );
} );
