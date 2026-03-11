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
			innerHeight: 800,
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

	it( 'should report all visible sections ordered by DOM position', () => {
		const elA = makeElement( 'a' );
		const elB = makeElement( 'b' );
		const elC = makeElement( 'c' );
		const elD = makeElement( 'd' );
		const obs = createObserver( { elements: [ elA, elB, elC, elD ] } );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elA, -500 ),
			makeEntry( elB, -100 ),
			makeEntry( elC, 300 ),
			makeEntry( elD, 900 )
		] );

		expect( onIntersection ).toHaveBeenCalledWith( [ elB, elC ] );
	} );

	it( 'should report single section when only one heading is above viewport', () => {
		const elAbove = makeElement( 'above' );
		const elBelow = makeElement( 'below' );
		const obs = createObserver( { elements: [ elAbove, elBelow ] } );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elAbove, -5 ),
			makeEntry( elBelow, 900 )
		] );

		expect( onIntersection ).toHaveBeenCalledWith( [ elAbove ] );
	} );

	it( 'should not re-fire onIntersection when the same sections remain visible', () => {
		const elA = makeElement( 'a' );
		const elB = makeElement( 'b' );
		const obs = createObserver( { elements: [ elA, elB ] } );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elA, -10 ),
			makeEntry( elB, 300 )
		] );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elA, -50 ),
			makeEntry( elB, 250 )
		] );

		expect( onIntersection ).toHaveBeenCalledOnce();
	} );

	it( 'should fire onIntersection when the visible set changes', () => {
		const elA = makeElement( 'a' );
		const elB = makeElement( 'b' );
		const elC = makeElement( 'c' );
		const obs = createObserver( { elements: [ elA, elB, elC ] } );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elA, -10 ),
			makeEntry( elB, 300 ),
			makeEntry( elC, 900 )
		] );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elA, -400 ),
			makeEntry( elB, -10 ),
			makeEntry( elC, 300 )
		] );

		expect( onIntersection ).toHaveBeenCalledTimes( 2 );
		expect( onIntersection ).toHaveBeenNthCalledWith( 1, [ elA, elB ] );
		expect( onIntersection ).toHaveBeenNthCalledWith( 2, [ elB, elC ] );
	} );

	it( 'should report only the closest-above section when all entries are above the viewport', () => {
		const elA = makeElement( 'a' );
		const elB = makeElement( 'b' );
		const obs = createObserver( { elements: [ elA, elB ] } );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elA, -10 ),
			makeEntry( elB, 300 )
		] );

		obs.calcIntersection();
		observerCallback( [
			makeEntry( elA, -500 ),
			makeEntry( elB, -400 )
		] );

		expect( onIntersection ).toHaveBeenCalledTimes( 2 );
		expect( onIntersection ).toHaveBeenNthCalledWith( 1, [ elA, elB ] );
		expect( onIntersection ).toHaveBeenNthCalledWith( 2, [ elB ] );
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

	it( 'should not throw when IntersectionObserver delivers an empty entries array', () => {
		const el = makeElement( 'empty-test' );
		const obs = createObserver( { elements: [ el ] } );

		obs.calcIntersection();
		observerCallback( [] );

		expect( onIntersection ).not.toHaveBeenCalled();
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
