// @vitest-environment jsdom
/* global document */
const { createSectionObserver } = require( '../../../resources/skins.citizen.scripts/sectionObserver.js' );

describe( 'createSectionObserver', () => {
	let win;
	let mw;
	let onIntersection;
	let observerCallback;
	let mockObserverInstance;

	function createMockIntersectionObserver() {
		return function MockIntersectionObserver( callback ) {
			observerCallback = callback;
			mockObserverInstance = {
				observe: vi.fn(),
				disconnect: vi.fn()
			};
			return mockObserverInstance;
		};
	}

	function makeElement( id ) {
		const el = document.createElement( 'div' );
		el.id = id;
		document.body.appendChild( el );
		return el;
	}

	function makeEntry( element, top ) {
		return {
			target: element,
			boundingClientRect: { top }
		};
	}

	function createObserver( overrides = {} ) {
		return createSectionObserver( {
			window: win,
			mw,
			IntersectionObserver: createMockIntersectionObserver(),
			elements: overrides.elements || [],
			topMargin: 0,
			throttleMs: 200,
			onIntersection,
			...overrides
		} );
	}

	beforeEach( () => {
		vi.useFakeTimers();
		win = {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			setTimeout: vi.fn( ( fn, ms ) => globalThis.setTimeout( fn, ms ) ),
			clearTimeout: vi.fn( ( id ) => globalThis.clearTimeout( id ) )
		};
		mw = {
			log: {
				warn: vi.fn()
			}
		};
		onIntersection = vi.fn();
		observerCallback = undefined;
		mockObserverInstance = undefined;
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.useRealTimers();
		document.body.innerHTML = '';
	} );

	it( 'should select the entry closest to viewport top', () => {
		const elA = makeElement( 'a' );
		const elB = makeElement( 'b' );
		const elC = makeElement( 'c' );
		const obs = createObserver( { elements: [ elA, elB, elC ] } );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elA, -200 ),
			makeEntry( elB, -5 ),
			makeEntry( elC, 300 )
		] );

		expect( onIntersection ).toHaveBeenCalledWith( elB );
	} );

	it( 'should prefer above-viewport (negative) entry over equidistant positive entry', () => {
		const elAbove = makeElement( 'above' );
		const elBelow = makeElement( 'below' );
		const obs = createObserver( { elements: [ elAbove, elBelow ] } );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elAbove, -5 ),
			makeEntry( elBelow, 5 )
		] );

		expect( onIntersection ).toHaveBeenCalledWith( elAbove );
	} );

	it( 'should not re-fire onIntersection when the same section remains closest', () => {
		const el = makeElement( 'same' );
		const obs = createObserver( { elements: [ el ] } );

		obs.calcIntersection();
		observerCallback( [ makeEntry( el, -10 ) ] );

		obs.calcIntersection();
		observerCallback( [ makeEntry( el, -20 ) ] );

		expect( onIntersection ).toHaveBeenCalledOnce();
	} );

	it( 'should fire onIntersection when a different section becomes closest', () => {
		const elA = makeElement( 'first' );
		const elB = makeElement( 'second' );
		const obs = createObserver( { elements: [ elA, elB ] } );

		obs.calcIntersection();
		observerCallback( [ makeEntry( elA, -10 ), makeEntry( elB, 100 ) ] );

		obs.calcIntersection();
		observerCallback( [ makeEntry( elA, -300 ), makeEntry( elB, -5 ) ] );

		expect( onIntersection ).toHaveBeenCalledTimes( 2 );
		expect( onIntersection ).toHaveBeenNthCalledWith( 1, elA );
		expect( onIntersection ).toHaveBeenNthCalledWith( 2, elB );
	} );

	it( 'should throttle rapid scroll events so only one recalculation fires per interval', () => {
		const el = makeElement( 'throttled' );
		createObserver( { elements: [ el ], throttleMs: 200 } );
		const scrollHandler = win.addEventListener.mock.calls[ 0 ][ 1 ];

		scrollHandler();
		scrollHandler();
		scrollHandler();

		vi.advanceTimersByTime( 200 );

		expect( mockObserverInstance.observe ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should clear timeout, reset current, and remove scroll listener on pause', () => {
		const el = makeElement( 'pause-el' );
		const obs = createObserver( { elements: [ el ], throttleMs: 200 } );
		const scrollHandler = win.addEventListener.mock.calls[ 0 ][ 1 ];

		// Set current by triggering intersection
		obs.calcIntersection();
		observerCallback( [ makeEntry( el, -10 ) ] );

		// Start a throttled scroll that has not yet fired
		scrollHandler();
		const observeCountBeforePause = mockObserverInstance.observe.mock.calls.length;

		obs.pause();

		// The pending timeout should have been cleared — advancing should not trigger observe
		vi.advanceTimersByTime( 200 );
		expect( mockObserverInstance.observe ).toHaveBeenCalledTimes( observeCountBeforePause );

		// Scroll listener should be removed
		expect( win.removeEventListener ).toHaveBeenCalledWith( 'scroll', scrollHandler );

		// Current is reset — so re-triggering with the same element should fire callback again
		obs.calcIntersection();
		observerCallback( [ makeEntry( el, -10 ) ] );
		expect( onIntersection ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'should re-add the scroll listener on resume', () => {
		const obs = createObserver( { elements: [] } );

		// Constructor already called addEventListener once
		const initialAddCount = win.addEventListener.mock.calls.length;

		obs.pause();
		obs.resume();

		expect( win.addEventListener ).toHaveBeenCalledTimes( initialAddCount + 1 );
		const lastCall = win.addEventListener.mock.calls[ win.addEventListener.mock.calls.length - 1 ];
		expect( lastCall[ 0 ] ).toBe( 'scroll' );
	} );

	it( 'should remove scroll listener and disconnect observer on unmount', () => {
		const obs = createObserver( { elements: [] } );
		const scrollHandler = win.addEventListener.mock.calls[ 0 ][ 1 ];

		obs.unmount();

		expect( win.removeEventListener ).toHaveBeenCalledWith( 'scroll', scrollHandler );
		expect( mockObserverInstance.disconnect ).toHaveBeenCalled();
	} );

	it( 'should warn and skip elements without a parentNode in calcIntersection', () => {
		const attached = makeElement( 'attached' );
		const detached = document.createElement( 'div' );
		detached.id = 'detached';
		// detached has no parentNode
		const obs = createObserver( { elements: [ detached, attached ] } );

		obs.calcIntersection();

		expect( mw.log.warn ).toHaveBeenCalledWith(
			'Element being observed is not in DOM',
			detached
		);
		expect( mockObserverInstance.observe ).toHaveBeenCalledTimes( 1 );
		expect( mockObserverInstance.observe ).toHaveBeenCalledWith( attached );
	} );
} );
