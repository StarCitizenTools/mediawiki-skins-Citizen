// @vitest-environment jsdom
/* global document */

const setupObservers = require( '../../../resources/skins.citizen.scripts/setupObservers.js' );
const mw = require( '../mocks/mw.js' );

/**
 * Minimal ToC + article fixture: one top-level section whose heading
 * carries the id the location hash points at.
 *
 * @return {{ tocItem: HTMLElement }}
 */
function createFixture() {
	document.body.innerHTML = `
		<div id="citizen-toc">
			<div class="citizen-toc-indicator"></div>
			<ul id="mw-panel-toc-list">
				<li id="toc-s1" class="citizen-toc-list-item citizen-toc-level-1">
					<a class="citizen-toc-link" href="#s1">Section 1</a>
					<button class="citizen-toc-toggle"></button>
				</li>
				<li id="toc-s2" class="citizen-toc-list-item citizen-toc-level-1">
					<a class="citizen-toc-link" href="#s2">Section 2</a>
					<button class="citizen-toc-toggle"></button>
				</li>
			</ul>
		</div>
		<div id="bodyContent">
			<div class="mw-parser-output">
				<div class="mw-heading"><h2 id="s1">Section 1</h2></div>
				<div class="mw-heading"><h2 id="s2">Section 2</h2></div>
			</div>
		</div>
		<div id="citizen-page-header-sticky-sentinel"></div>
	`;
	return {
		tocItem: document.getElementById( 'toc-s1' ),
		tocItem2: document.getElementById( 'toc-s2' ),
		heading2: document.querySelectorAll( '.mw-heading' )[ 1 ]
	};
}

describe( 'setupObservers', () => {
	let rafQueue;
	let idleCallbacks;
	let win;

	function flushFrame() {
		rafQueue.splice( 0 ).forEach( ( cb ) => cb() );
	}

	function createMockWindow() {
		return {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			location: { hash: '#s1' },
			innerHeight: 800,
			scrollY: 0,
			matchMedia: vi.fn( () => ( {
				// Desktop breakpoint matches so the scroll spy is active
				matches: true,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn()
			} ) ),
			getComputedStyle: vi.fn( () => ( {
				getPropertyValue: vi.fn( () => '75' )
			} ) ),
			requestAnimationFrame: vi.fn( ( cb ) => cb() )
		};
	}

	beforeEach( () => {
		rafQueue = [];
		// deferUntilFrame uses the global requestAnimationFrame
		vi.stubGlobal( 'requestAnimationFrame', ( cb ) => {
			rafQueue.push( cb );
			return rafQueue.length;
		} );

		idleCallbacks = [];
		mw.requestIdleCallback = vi.fn( ( cb ) => {
			idleCallbacks.push( cb );
		} );
	} );

	afterEach( () => {
		[ 've.activationStart', 've.deactivationComplete', 'wikipage.tableOfContents' ]
			.forEach( ( name ) => mw.hook( name )._reset() );
		vi.unstubAllGlobals();
		vi.clearAllMocks();
		document.body.innerHTML = '';
	} );

	it( 'should defer initial section activation until idle plus one frame', () => {
		const { tocItem } = createFixture();
		win = createMockWindow();
		mw.util.getTargetFromFragment = vi.fn( () => tocItem );
		const MockIntersectionObserver = vi.fn( function () {
			this.observe = vi.fn();
			this.unobserve = vi.fn();
			this.disconnect = vi.fn();
		} );

		setupObservers.init( {
			document,
			window: win,
			mw,
			IntersectionObserver: MockIntersectionObserver
		} );

		// Boot idle tasks dirty document-level state; reading TOC geometry
		// before they are painted forces a full-page reflow. Nothing may
		// activate synchronously.
		expect( tocItem.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( false );
		expect( tocItem.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( false );
		expect( idleCallbacks.length ).toBeGreaterThan( 0 );

		idleCallbacks.forEach( ( cb ) => cb() );

		// Still waiting for the post-idle frame
		expect( tocItem.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( false );

		flushFrame();

		expect( tocItem.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
		expect( tocItem.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( true );
	} );

	it( 'should defer the hash-less initial intersection calculation to idle plus one frame', () => {
		createFixture();
		win = createMockWindow();
		win.location.hash = '';
		const ioInstances = [];
		const MockIntersectionObserver = vi.fn( function ( cb ) {
			this.cb = cb;
			this.observe = vi.fn();
			this.unobserve = vi.fn();
			this.disconnect = vi.fn();
			ioInstances.push( this );
		} );

		setupObservers.init( {
			document,
			window: win,
			mw,
			IntersectionObserver: MockIntersectionObserver
		} );

		// The section observer (first constructed) only observes elements when
		// calcIntersection runs — which must wait for idle plus one frame
		const sectionSpyIo = ioInstances[ 0 ];
		expect( sectionSpyIo.observe ).not.toHaveBeenCalled();

		idleCallbacks.forEach( ( cb ) => cb() );
		expect( sectionSpyIo.observe ).not.toHaveBeenCalled();

		flushFrame();

		expect( sectionSpyIo.observe ).toHaveBeenCalled();
	} );

	it( 'should skip the deferred initial activation when the scroll spy has already fired', () => {
		const { tocItem, tocItem2, heading2 } = createFixture();
		win = createMockWindow();
		// Page loaded with a hash pointing at section 1
		win.location.hash = '#s1';
		mw.util.getTargetFromFragment = vi.fn( () => tocItem );
		const ioInstances = [];
		const MockIntersectionObserver = vi.fn( function ( cb ) {
			this.cb = cb;
			this.observe = vi.fn();
			this.unobserve = vi.fn();
			this.disconnect = vi.fn();
			ioInstances.push( this );
		} );

		setupObservers.init( {
			document,
			window: win,
			mw,
			IntersectionObserver: MockIntersectionObserver
		} );

		// Before idle fires, the user scrolls and the spy activates section 2
		ioInstances[ 0 ].cb( [
			{ target: heading2, boundingClientRect: { top: 10 } }
		] );
		expect( tocItem2.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( true );

		idleCallbacks.forEach( ( cb ) => cb() );
		flushFrame();

		// The stale boot-time hash target must not clobber the live spy state
		expect( tocItem2.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( true );
		expect( tocItem.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( false );
	} );

	it( 'should not activate at idle on narrow viewports where the spy is paused', () => {
		const { tocItem } = createFixture();
		win = createMockWindow();
		// Below the desktop breakpoint the ToC popover is collapsed
		win.matchMedia = vi.fn( () => ( {
			matches: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		} ) );
		mw.util.getTargetFromFragment = vi.fn( () => tocItem );
		const MockIntersectionObserver = vi.fn( function () {
			this.observe = vi.fn();
			this.unobserve = vi.fn();
			this.disconnect = vi.fn();
		} );

		setupObservers.init( {
			document,
			window: win,
			mw,
			IntersectionObserver: MockIntersectionObserver
		} );
		idleCallbacks.forEach( ( cb ) => cb() );
		flushFrame();

		expect( tocItem.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( false );
	} );
} );
