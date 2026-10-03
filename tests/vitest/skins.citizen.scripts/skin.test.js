// @vitest-environment jsdom
/* global document, window */

/**
 * Boot-path timing tests for skin.js (the module wiring entry point).
 *
 * Requiring skin.js runs main() immediately (jsdom reports readyState
 * 'complete'), so each test re-requires it with fresh modules and asserts
 * WHEN boot work happens: geometry-reading setup must wait for the frame
 * queue, and the performance-mode probe and the go-landing check must wait
 * for the idle callback.
 */

describe( 'skin.js boot path', () => {
	let mw;
	let rafQueue;
	let idleCallbacks;

	/**
	 * Run one animation frame: invoke everything queued so far.
	 */
	function flushFrame() {
		const tasks = rafQueue.splice( 0 );
		tasks.forEach( ( cb ) => cb() );
	}

	const SKIN_PATH = '../../../resources/skins.citizen.scripts/skin.js';

	function bootSkin() {
		// skin.js boots at require time; evict it from the CommonJS cache so
		// every test re-runs the boot with its own spies in place.
		delete require.cache[ require.resolve( SKIN_PATH ) ];
		require( SKIN_PATH );
	}

	beforeEach( () => {

		document.body.innerHTML = `
			<div id="citizen-page-header-sticky-sentinel"></div>
			<div id="bodyContent"></div>
		`;

		rafQueue = [];
		vi.stubGlobal( 'requestAnimationFrame', ( cb ) => {
			rafQueue.push( cb );
			return rafQueue.length;
		} );

		vi.stubGlobal( 'matchMedia', vi.fn( () => ( {
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		} ) ) );

		vi.stubGlobal( 'IntersectionObserver', vi.fn( function () {
			this.observe = vi.fn();
			this.unobserve = vi.fn();
			this.disconnect = vi.fn();
		} ) );
		vi.stubGlobal( 'ResizeObserver', vi.fn( function () {
			this.observe = vi.fn();
			this.unobserve = vi.fn();
			this.disconnect = vi.fn();
		} ) );

		mw = require( '../mocks/mw.js' );
		mw.storage.get.mockReturnValue( null );
		idleCallbacks = [];
		mw.requestIdleCallback = vi.fn( ( cb ) => {
			idleCallbacks.push( cb );
		} );
		vi.stubGlobal( 'mw', mw );
	} );

	afterEach( () => {
		// The shared mw mock's hook registry is a closure that outlives
		// clearAllMocks — reset the hooks the boot path registers on.
		[ 've.activationStart', 've.deactivationComplete', 'wikipage.tableOfContents', 'wikipage.content' ]
			.forEach( ( name ) => mw.hook( name )._reset() );
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		vi.clearAllMocks();
		document.body.innerHTML = '';
	} );

	it( 'should defer the performance-mode probe to the idle callback', () => {
		// No stored client prefs — the WebGL probe would run and persist a result
		mw.storage.get.mockReturnValue( null );

		bootSkin();

		const performanceModeCalls = () => mw.storage.set.mock.calls.filter(
			( call ) => String( call[ 1 ] ).includes( 'citizen-feature-performance-mode-clientpref' )
		);

		// Nothing persisted synchronously at boot
		expect( performanceModeCalls() ).toHaveLength( 0 );
		expect( idleCallbacks.length ).toBeGreaterThan( 0 );

		idleCallbacks.forEach( ( cb ) => cb() );

		// jsdom has no WebGL, so the probe persists performance mode ON
		const calls = performanceModeCalls();
		expect( calls ).toHaveLength( 1 );
		expect( calls[ 0 ][ 1 ] ).toContain( 'citizen-feature-performance-mode-clientpref-1' );
	} );

	it( 'should check where a go landed only once the page is idle', () => {
		bootSkin();

		expect( mw.storage.session.getObject ).not.toHaveBeenCalled();

		idleCallbacks.forEach( ( cb ) => cb() );

		expect( mw.storage.session.getObject ).toHaveBeenCalledWith(
			'skin-citizen-command-palette-go-note'
		);
	} );

	it( 'should judge a go note by when the page started, not by when the check runs', () => {
		// Saved after the page started, by a go made from this page
		mw.storage.session.getObject.mockReturnValueOnce(
			{ key: 'page:Main page', query: 'main page', savedAt: 3000, expires: 63000 }
		);
		const now = vi.spyOn( Date, 'now' ).mockReturnValue( 1000 );
		bootSkin();
		now.mockReturnValue( 5000 );

		idleCallbacks.forEach( ( cb ) => cb() );

		// The note is left for the page that go opens
		expect( mw.storage.session.getObject ).toHaveBeenCalled();
		expect( mw.storage.session.remove ).not.toHaveBeenCalled();
	} );

	it( 'should not read computed styles synchronously at boot', () => {
		const getComputedStyleSpy = vi.spyOn( window, 'getComputedStyle' );

		bootSkin();

		// No geometry reads before the first paint
		expect( getComputedStyleSpy ).not.toHaveBeenCalled();

		// Observer setup runs once the frame queue drains (after first paint)
		flushFrame();
		flushFrame();
		flushFrame();

		expect( getComputedStyleSpy ).toHaveBeenCalled();
	} );

	it( 'should still set up observers after the deferral', () => {
		bootSkin();

		expect( global.IntersectionObserver ).not.toHaveBeenCalled();

		flushFrame();
		flushFrame();
		flushFrame();

		// Scroll observer + sticky sentinel observer come up after the frames
		expect( global.IntersectionObserver ).toHaveBeenCalled();
	} );
} );
