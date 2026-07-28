// @vitest-environment jsdom
/* global document */

const { init } = require( '../../../resources/skins.citizen.scripts/overflowElements/index.js' );
const { detectFloatDirection } = require( '../../../resources/skins.citizen.scripts/overflowElements/float.js' );
const { resolveBandRows, createStickyRows, hasScrollContainerAncestor } =
	require( '../../../resources/skins.citizen.scripts/overflowElements/stickyRows.js' );
const mw = require( '../mocks/mw.js' );

/**
 * Create a mock window object with sensible defaults.
 *
 * @param {Object} [overrides]
 * @return {Object}
 */
function createMockWindow( overrides = {} ) {
	return {
		matchMedia: vi.fn( () => ( { matches: false } ) ),
		requestAnimationFrame: vi.fn( ( cb ) => cb() ),
		getComputedStyle: vi.fn( ( el ) => ( {
			float: el.style.getPropertyValue( 'float' ) || 'none',
			direction: 'ltr'
		} ) ),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		...overrides
	};
}

/**
 * Create a bodyContent element attached to the document.
 * Elements must be in the DOM so parentNode is available for the wrapper module.
 *
 * @param {string} [innerHTML]
 * @return {HTMLElement}
 */
function createBodyContent( innerHTML = '' ) {
	const bodyContent = document.createElement( 'div' );
	bodyContent.innerHTML = innerHTML;
	document.body.appendChild( bodyContent );
	return bodyContent;
}

/**
 * Create a base config object for init().
 *
 * @param {Object} [overrides]
 * @return {Object}
 */
function createConfig( overrides = {} ) {
	return {
		wgCitizenOverflowNowrapClasses: [ 'nowrap' ],
		wgCitizenOverflowInheritedClasses: [],
		...overrides
	};
}

/**
 * Create mock IntersectionObserver and ResizeObserver constructors that
 * capture their callbacks for later invocation.
 *
 * @return {Object} helpers with constructors and callback accessors
 */
function createMockObservers() {
	let intersectionCallback;
	const intersectionObserve = vi.fn();
	const intersectionInstances = [];
	// Must use function (not arrow) so it can be called with new
	const MockIntersectionObserver = vi.fn( function ( cb ) {
		intersectionCallback = cb;
		this.observe = intersectionObserve;
		this.disconnect = vi.fn();
		intersectionInstances.push( this );
	} );

	let resizeCallback;
	const resizeObserve = vi.fn();
	const resizeUnobserve = vi.fn();
	const resizeInstances = [];
	const MockResizeObserver = vi.fn( function ( cb ) {
		resizeCallback = cb;
		this.observe = resizeObserve;
		this.unobserve = resizeUnobserve;
		this.disconnect = vi.fn();
		resizeInstances.push( this );
	} );

	return {
		IntersectionObserver: MockIntersectionObserver,
		ResizeObserver: MockResizeObserver,
		getIntersectionCallback: () => intersectionCallback,
		getResizeCallback: () => resizeCallback,
		intersectionObserve,
		intersectionInstances,
		resizeObserve,
		resizeUnobserve,
		resizeInstances
	};
}

afterEach( () => {
	vi.clearAllMocks();
	document.body.innerHTML = '';
} );

describe( 'overflowElements', () => {
	describe( 'init', () => {
		it( 'should early-return with error when nowrapClasses config is not an array', () => {
			const bodyContent = createBodyContent();
			const win = createMockWindow();
			const config = createConfig( { wgCitizenOverflowNowrapClasses: null } );

			init( {
				document,
				window: win,
				mw,
				IntersectionObserver: vi.fn(),
				ResizeObserver: vi.fn(),
				bodyContent,
				config
			} );

			expect( mw.log.error ).toHaveBeenCalledWith(
				'[Citizen] Invalid or missing $wgCitizenOverflowNowrapClasses. Cannot proceed with wrapping element.'
			);
		} );

		it( 'should early-return when no overflow elements are found', () => {
			const bodyContent = createBodyContent();
			const win = createMockWindow();
			const config = createConfig();
			const observers = createMockObservers();

			init( {
				document,
				window: win,
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config
			} );

			// No wrapper should be created if there are no overflow elements
			expect( document.querySelector( '.citizen-overflow-wrapper' ) ).toBe( null );
			expect( observers.IntersectionObserver ).not.toHaveBeenCalled();
		} );

		it( 'should skip elements that have a nowrap class', () => {
			const bodyContent = createBodyContent( '<table class="wikitable nowrap"></table>' );
			const win = createMockWindow();
			const config = createConfig();
			const observers = createMockObservers();

			init( {
				document,
				window: win,
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config
			} );

			// No wrapper should be created for elements with nowrap class
			expect( document.querySelector( '.citizen-overflow-wrapper' ) ).toBe( null );
			expect( observers.IntersectionObserver ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'detectFloatDirection', () => {
		const makeWindow = ( style ) => ( {
			getComputedStyle: vi.fn( () => style )
		} );

		it.each( [
			[ { float: 'right', direction: 'ltr' }, 'right' ],
			[ { float: 'left', direction: 'ltr' }, 'left' ],
			[ { float: 'none', direction: 'ltr' }, null ],
			[ { float: 'inline-start', direction: 'ltr' }, 'left' ],
			[ { float: 'inline-start', direction: 'rtl' }, 'right' ],
			[ { float: 'inline-end', direction: 'ltr' }, 'right' ],
			[ { float: 'inline-end', direction: 'rtl' }, 'left' ]
		] )( 'should resolve computed %o to %s', ( style, expected ) => {
			expect( detectFloatDirection( {}, makeWindow( style ) ) ).toBe( expected );
		} );
	} );

	describe( 'float preservation', () => {
		it( 'should mirror an inline float onto the wrapper as a modifier class', () => {
			const bodyContent = createBodyContent(
				'<table class="wikitable" style="float: right;"><tbody><tr><td>a</td></tr></tbody></table>'
			);
			const observers = createMockObservers();

			init( {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			const wrapper = document.querySelector( '.citizen-overflow-wrapper' );
			expect( wrapper.classList.contains( 'citizen-overflow-wrapper--floatright' ) ).toBe( true );
			expect( wrapper.querySelector( 'table' ) ).not.toBe( null );
		} );

		it( 'should mirror an inline float:left as the floatleft modifier', () => {
			const bodyContent = createBodyContent(
				'<table class="wikitable" style="float: left;"><tbody><tr><td>a</td></tr></tbody></table>'
			);
			const observers = createMockObservers();

			init( {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			const wrapper = document.querySelector( '.citizen-overflow-wrapper' );
			expect( wrapper.classList.contains( 'citizen-overflow-wrapper--floatleft' ) ).toBe( true );
		} );

		it( 'should mirror an inline float on a .citizen-overflow div', () => {
			const bodyContent = createBodyContent(
				'<div class="citizen-overflow" style="float: right;">content</div>'
			);
			const observers = createMockObservers();

			init( {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			const wrapper = document.querySelector( '.citizen-overflow-wrapper' );
			expect( wrapper.classList.contains( 'citizen-overflow-wrapper--floatright' ) ).toBe( true );
			expect( wrapper.querySelector( 'div.citizen-overflow' ) ).not.toBe( null );
		} );

		it( 'should not add a float modifier to non-floated elements', () => {
			const bodyContent = createBodyContent( '<table class="wikitable"></table>' );
			const observers = createMockObservers();

			init( {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			const wrapper = document.querySelector( '.citizen-overflow-wrapper' );
			expect( wrapper.classList.contains( 'citizen-overflow-wrapper--floatleft' ) ).toBe( false );
			expect( wrapper.classList.contains( 'citizen-overflow-wrapper--floatright' ) ).toBe( false );
		} );

		it( 'should migrate inherited classes without adding a float modifier', () => {
			const bodyContent = createBodyContent(
				'<table class="wikitable floatright"></table>'
			);
			const win = createMockWindow();
			const observers = createMockObservers();

			init( {
				document,
				window: win,
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig( {
					wgCitizenOverflowInheritedClasses: [ 'floatright' ]
				} )
			} );

			const wrapper = document.querySelector( '.citizen-overflow-wrapper' );
			// The class migrates wholesale (viewport-correct via hacks.less)
			expect( wrapper.classList.contains( 'floatright' ) ).toBe( true );
			expect( wrapper.classList.contains( 'citizen-overflow-wrapper--floatright' ) ).toBe( false );
			expect( bodyContent.querySelector( 'table' ).classList.contains( 'floatright' ) ).toBe( false );
			// Detection is skipped entirely for inherited-class elements
			expect( win.getComputedStyle ).not.toHaveBeenCalled();
		} );

		it( 'should finish all computed-style reads before any wrapping', () => {
			const bodyContent = createBodyContent(
				'<table class="wikitable" style="float: right;"></table>' +
				'<table class="wikitable" style="float: left;"></table>'
			);
			const wrappersAtRead = [];
			const win = createMockWindow( {
				getComputedStyle: vi.fn( ( el ) => {
					wrappersAtRead.push(
						document.querySelectorAll( '.citizen-overflow-wrapper' ).length
					);
					return { float: el.style.getPropertyValue( 'float' ) || 'none', direction: 'ltr' };
				} )
			} );
			const observers = createMockObservers();

			init( {
				document,
				window: win,
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			// Every read saw zero wrappers: reads were fully batched ahead of writes
			expect( wrappersAtRead ).toEqual( [ 0, 0 ] );
			expect( document.querySelectorAll( '.citizen-overflow-wrapper' ) ).toHaveLength( 2 );
		} );

		it( 'should isolate a computed-style failure to its own element', () => {
			const bodyContent = createBodyContent(
				'<table class="wikitable"></table>' +
				'<table class="wikitable" style="float: left;"></table>'
			);
			const tables = bodyContent.querySelectorAll( 'table' );
			const win = createMockWindow( {
				getComputedStyle: vi.fn( ( el ) => {
					if ( el === tables[ 0 ] ) {
						throw new Error( 'monkey-patched' );
					}
					return { float: el.style.getPropertyValue( 'float' ) || 'none', direction: 'ltr' };
				} )
			} );
			const observers = createMockObservers();

			expect( () => init( {
				document,
				window: win,
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} ) ).not.toThrow();

			// Both elements are still wrapped despite the failed detection
			const wrappers = document.querySelectorAll( '.citizen-overflow-wrapper' );
			expect( wrappers ).toHaveLength( 2 );
			// The throwing element degrades to no modifier ...
			expect( wrappers[ 0 ].classList.contains( 'citizen-overflow-wrapper--floatleft' ) ).toBe( false );
			expect( wrappers[ 0 ].classList.contains( 'citizen-overflow-wrapper--floatright' ) ).toBe( false );
			// ... while the healthy element still gets its modifier
			expect( wrappers[ 1 ].classList.contains( 'citizen-overflow-wrapper--floatleft' ) ).toBe( true );
			expect( mw.log.error ).toHaveBeenCalledWith(
				expect.stringContaining( '[Citizen] Error occurred while detecting float direction' )
			);
		} );
	} );

	describe( 'OverflowElement', () => {
		it( 'should return early from init when wrapper returns null', () => {
			const bodyContent = createBodyContent( '<table class="wikitable"></table>' );

			// Force the wrapper to fail by making insertBefore throw
			bodyContent.insertBefore = () => {
				throw new Error( 'test error' );
			};

			const observers = createMockObservers();

			init( {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			// Wrapper failed, so no observers should be created
			expect( observers.ResizeObserver ).not.toHaveBeenCalled();
			expect( observers.IntersectionObserver ).not.toHaveBeenCalled();
			expect( mw.log.error ).toHaveBeenCalledWith(
				expect.stringContaining( '[Citizen] Error occurred while wrapping element' )
			);
		} );

		it( 'should bind and unbind listeners on resume and pause', () => {
			const bodyContent = createBodyContent( '<table class="wikitable"></table>' );
			const win = createMockWindow( {
				matchMedia: vi.fn( () => ( { matches: true } ) )
			} );
			const config = createConfig();
			const observers = createMockObservers();

			init( {
				document,
				window: win,
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config
			} );

			const table = bodyContent.querySelector( 'table' );
			const intersectionCb = observers.getIntersectionCallback();

			// resume() happens once the element intersects
			intersectionCb( [ { isIntersecting: true, target: table } ] );

			expect( observers.resizeObserve ).toHaveBeenCalledWith( table );

			// The content element should have a scroll listener
			const contentEl = document.querySelector( '.citizen-overflow-content' );
			const contentAddSpy = vi.spyOn( contentEl, 'addEventListener' );
			const contentRemoveSpy = vi.spyOn( contentEl, 'removeEventListener' );

			// The nav element should have a click listener (pointer device)
			const navEl = document.querySelector( '.citizen-overflow-nav' );
			const navAddSpy = vi.spyOn( navEl, 'addEventListener' );
			const navRemoveSpy = vi.spyOn( navEl, 'removeEventListener' );

			// Trigger intersection observer to pause then resume
			intersectionCb( [ { isIntersecting: false, target: table } ] );

			expect( contentRemoveSpy ).toHaveBeenCalledWith( 'scroll', expect.any( Function ) );
			expect( observers.resizeUnobserve ).toHaveBeenCalledWith( table );
			expect( navRemoveSpy ).toHaveBeenCalledWith( 'click', expect.any( Function ) );

			// Resume again
			intersectionCb( [ { isIntersecting: true, target: table } ] );

			expect( contentAddSpy ).toHaveBeenCalledWith( 'scroll', expect.any( Function ) );
			expect( navAddSpy ).toHaveBeenCalledWith( 'click', expect.any( Function ) );
		} );

		it( 'should clamp scrollLeft between 0 and max using rAF', () => {
			const bodyContent = createBodyContent( '<table class="wikitable"></table>' );
			const rAF = vi.fn( ( cb ) => cb() );
			const win = createMockWindow( {
				matchMedia: vi.fn( () => ( { matches: true } ) ),
				requestAnimationFrame: rAF
			} );
			const config = createConfig();
			const observers = createMockObservers();

			init( {
				document,
				window: win,
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config
			} );

			// Nav click listeners bind on intersection
			observers.getIntersectionCallback()( [
				{ isIntersecting: true, target: bodyContent.querySelector( 'table' ) }
			] );

			const contentEl = document.querySelector( '.citizen-overflow-content' );
			const wrapperEl = document.querySelector( '.citizen-overflow-wrapper' );
			const navEl = document.querySelector( '.citizen-overflow-nav' );

			// Set up scrollable content dimensions
			Object.defineProperty( contentEl, 'scrollWidth', { value: 1000, configurable: true } );
			Object.defineProperty( contentEl, 'offsetWidth', { value: 400, configurable: true } );
			Object.defineProperty( wrapperEl, 'offsetWidth', { value: 400, configurable: true } );

			// Find the right nav button and simulate click
			const rightButton = navEl.querySelector( '.citizen-overflow-navButton-right' );
			const leftButton = navEl.querySelector( '.citizen-overflow-navButton-left' );

			// Set scrollLeft to 0, click right — offset = 400/2 = 200
			contentEl.scrollLeft = 0;
			rAF.mockClear();

			rightButton.dispatchEvent( new Event( 'click', { bubbles: true } ) );

			expect( rAF ).toHaveBeenCalled();
			// scrollLeft = min(max(0 + 200, 0), 600) = 200
			expect( contentEl.scrollLeft ).toBe( 200 );

			// Now scroll past the max: scrollLeft=500, offset=200 => 700, clamped to 600
			contentEl.scrollLeft = 500;
			rAF.mockClear();

			rightButton.dispatchEvent( new Event( 'click', { bubbles: true } ) );

			expect( contentEl.scrollLeft ).toBe( 600 );

			// Now scroll left past 0: scrollLeft=100, offset=-200 => -100, clamped to 0
			contentEl.scrollLeft = 100;
			rAF.mockClear();

			leftButton.dispatchEvent( new Event( 'click', { bubbles: true } ) );

			expect( contentEl.scrollLeft ).toBe( 0 );
		} );

		it( 'should not measure or observe resize until the element intersects', () => {
			const bodyContent = createBodyContent( '<table class="wikitable"></table>' );
			const table = bodyContent.querySelector( 'table' );
			let scrollWidthReads = 0;
			Object.defineProperty( table, 'scrollWidth', {
				configurable: true,
				get() {
					scrollWidthReads++;
					return 1000;
				}
			} );
			const observers = createMockObservers();

			init( {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			// Nothing is measured or resize-observed at boot
			expect( observers.resizeObserve ).not.toHaveBeenCalled();
			expect( scrollWidthReads ).toBe( 0 );

			// Scrolling into view starts resize observation
			observers.getIntersectionCallback()( [ { isIntersecting: true, target: table } ] );

			expect( observers.resizeObserve ).toHaveBeenCalledWith( table );
			expect( scrollWidthReads ).toBe( 0 );

			// Measurement happens on resize observer delivery
			observers.getResizeCallback()( [ { target: table } ] );

			expect( scrollWidthReads ).toBeGreaterThan( 0 );
			const wrapper = document.querySelector( '.citizen-overflow-wrapper' );
			expect( wrapper.classList.contains( 'citizen-overflow--right' ) ).toBe( true );
		} );

		it( 'should not measure an element that never intersects', () => {
			const bodyContent = createBodyContent( '<table class="wikitable"></table>' );
			const table = bodyContent.querySelector( 'table' );
			let scrollWidthReads = 0;
			Object.defineProperty( table, 'scrollWidth', {
				configurable: true,
				get() {
					scrollWidthReads++;
					return 1000;
				}
			} );
			const observers = createMockObservers();

			init( {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			// Off-screen at boot: pause before any resume must be safe
			observers.getIntersectionCallback()( [ { isIntersecting: false, target: table } ] );

			expect( scrollWidthReads ).toBe( 0 );
			expect( observers.resizeObserve ).not.toHaveBeenCalled();
			expect( observers.resizeUnobserve ).toHaveBeenCalledWith( table );
		} );

		it( 'should share one IntersectionObserver and one ResizeObserver across all elements', () => {
			const bodyContent = createBodyContent(
				'<table class="wikitable"></table><table class="wikitable"></table>'
			);
			const observers = createMockObservers();

			init( {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			expect( observers.IntersectionObserver ).toHaveBeenCalledTimes( 1 );
			expect( observers.ResizeObserver ).toHaveBeenCalledTimes( 1 );
			const tables = bodyContent.querySelectorAll( 'table.wikitable' );
			expect( observers.intersectionObserve ).toHaveBeenCalledWith( tables[ 0 ] );
			expect( observers.intersectionObserve ).toHaveBeenCalledWith( tables[ 1 ] );
		} );

		it( 'should stay idempotent on repeated intersection without an intervening pause', () => {
			const bodyContent = createBodyContent( '<table class="wikitable"></table>' );
			const table = bodyContent.querySelector( 'table' );
			const observers = createMockObservers();

			init( {
				document,
				window: createMockWindow( {
					matchMedia: vi.fn( () => ( { matches: true } ) )
				} ),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config: createConfig()
			} );

			const contentEl = document.querySelector( '.citizen-overflow-content' );
			const contentAddSpy = vi.spyOn( contentEl, 'addEventListener' );
			const intersectionCb = observers.getIntersectionCallback();

			intersectionCb( [ { isIntersecting: true, target: table } ] );
			intersectionCb( [ { isIntersecting: true, target: table } ] );

			// Same handler reference every time: rebinding stays a no-op for the DOM
			expect( contentAddSpy ).toHaveBeenCalledTimes( 2 );
			const handlers = contentAddSpy.mock.calls.map( ( call ) => call[ 1 ] );
			expect( handlers[ 0 ] ).toBe( handlers[ 1 ] );
			expect( observers.resizeObserve ).toHaveBeenCalledTimes( 2 );
			expect( observers.resizeObserve ).toHaveBeenNthCalledWith( 2, table );
		} );

		// Note: overflowElements keeps its current observer pair in module
		// state that persists across tests (matching the production
		// ResourceLoader singleton). The first init() in a test may therefore
		// disconnect a pair left behind by an earlier test — assertions here
		// only use this test's own mock instances, so that bleed is inert.
		it( 'should disconnect the previous generation of observers on re-init', () => {
			const observers = createMockObservers();
			const deps = {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				config: createConfig()
			};
			const firstContent = createBodyContent( '<table class="wikitable"></table>' );

			init( { ...deps, bodyContent: firstContent } );

			// Simulate a wikipage.content re-fire with replaced content
			firstContent.remove();
			const secondContent = createBodyContent( '<table class="wikitable"></table>' );

			init( { ...deps, bodyContent: secondContent } );

			expect( observers.intersectionInstances ).toHaveLength( 2 );
			expect( observers.intersectionInstances[ 0 ].disconnect ).toHaveBeenCalled();
			expect( observers.resizeInstances[ 0 ].disconnect ).toHaveBeenCalled();
			// The live generation stays connected
			expect( observers.intersectionInstances[ 1 ].disconnect ).not.toHaveBeenCalled();
			expect( observers.resizeInstances[ 1 ].disconnect ).not.toHaveBeenCalled();
		} );

		it( 'should disconnect previous observers even when new content has no overflow elements', () => {
			const observers = createMockObservers();
			const deps = {
				document,
				window: createMockWindow(),
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				config: createConfig()
			};
			const firstContent = createBodyContent( '<table class="wikitable"></table>' );

			init( { ...deps, bodyContent: firstContent } );

			firstContent.remove();
			const emptyContent = createBodyContent( '<p>No tables here</p>' );

			init( { ...deps, bodyContent: emptyContent } );

			// No new generation is constructed, but the old one is torn down
			expect( observers.intersectionInstances ).toHaveLength( 1 );
			expect( observers.resizeInstances ).toHaveLength( 1 );
			expect( observers.intersectionInstances[ 0 ].disconnect ).toHaveBeenCalled();
			expect( observers.resizeInstances[ 0 ].disconnect ).toHaveBeenCalled();
		} );

		it( 'should handle only navButton clicks and distinguish left from right', () => {
			const bodyContent = createBodyContent( '<table class="wikitable"></table>' );
			const rAF = vi.fn( ( cb ) => cb() );
			const win = createMockWindow( {
				matchMedia: vi.fn( () => ( { matches: true } ) ),
				requestAnimationFrame: rAF
			} );
			const config = createConfig();
			const observers = createMockObservers();

			init( {
				document,
				window: win,
				mw,
				IntersectionObserver: observers.IntersectionObserver,
				ResizeObserver: observers.ResizeObserver,
				bodyContent,
				config
			} );

			// Nav click listeners bind on intersection
			observers.getIntersectionCallback()( [
				{ isIntersecting: true, target: bodyContent.querySelector( 'table' ) }
			] );

			const contentEl = document.querySelector( '.citizen-overflow-content' );
			const wrapperEl = document.querySelector( '.citizen-overflow-wrapper' );
			const navEl = document.querySelector( '.citizen-overflow-nav' );

			Object.defineProperty( contentEl, 'scrollWidth', { value: 1000, configurable: true } );
			Object.defineProperty( contentEl, 'offsetWidth', { value: 400, configurable: true } );
			Object.defineProperty( wrapperEl, 'offsetWidth', { value: 400, configurable: true } );

			// Click on the nav element itself (not a button) — should be ignored
			contentEl.scrollLeft = 100;
			rAF.mockClear();

			navEl.dispatchEvent( new Event( 'click', { bubbles: false } ) );

			expect( contentEl.scrollLeft ).toBe( 100 );

			// Click on the right navButton — should scroll right
			const rightButton = navEl.querySelector( '.citizen-overflow-navButton-right' );
			contentEl.scrollLeft = 0;
			rAF.mockClear();

			rightButton.dispatchEvent( new Event( 'click', { bubbles: true } ) );

			expect( contentEl.scrollLeft ).toBe( 200 );

			// Click on the left navButton — should scroll left
			const leftButton = navEl.querySelector( '.citizen-overflow-navButton-left' );
			contentEl.scrollLeft = 300;
			rAF.mockClear();

			leftButton.dispatchEvent( new Event( 'click', { bubbles: true } ) );

			expect( contentEl.scrollLeft ).toBe( 100 );
		} );
	} );
} );

describe( 'sticky band integration', () => {
	function initWithStickyTable( {
		supportsViewTimeline = true, supportsMap = null, scrollAncestor = false,
		tableCount = 1, windowOverrides = {}
	} = {} ) {
		const tableHtml = `
			<table class="wikitable">
				<tr class="citizen-overflow-sticky-header"><th>a</th><th>b</th></tr>
				<tr><td>1</td><td>2</td></tr>
			</table>`;
		const bodyContent = createBodyContent( `
			${ scrollAncestor ? '<div style="overflow-y: hidden">' : '' }
			${ tableHtml.repeat( tableCount ) }
			${ scrollAncestor ? '</div>' : '' }` );
		const observers = createMockObservers();
		// Each probe resolves independently: a mock that returned one shared
		// boolean for both probe strings could not detect the AND between
		// them degrading to an OR (or a probe being dropped).
		const supports = supportsMap || {
			'animation-timeline: view()': supportsViewTimeline,
			'animation-range: exit-crossing 0%': supportsViewTimeline
		};
		const win = createMockWindow( {
			CSS: { supports: vi.fn( ( probe ) => supports[ probe ] === true ) },
			getComputedStyle: vi.fn( ( el ) => ( {
				float: el.style.getPropertyValue( 'float' ) || 'none',
				direction: 'ltr',
				overflowX: el.style.overflowX || 'visible',
				overflowY: el.style.overflowY || 'visible'
			} ) ),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			...windowOverrides
		} );
		init( {
			document, window: win, mw,
			IntersectionObserver: observers.IntersectionObserver,
			ResizeObserver: observers.ResizeObserver,
			bodyContent, config: createConfig()
		} );
		return { bodyContent, observers, win };
	}

	it( 'tags the band and selects the css mode', () => {
		const { bodyContent } = initWithStickyTable();

		const wrapper = bodyContent.querySelector( '.citizen-overflow-wrapper' );
		expect( wrapper.classList.contains( 'citizen-overflow-wrapper--sticky-css' ) ).toBe( true );
		expect( bodyContent.querySelectorAll( '.citizen-overflow-sticky-row' ) ).toHaveLength( 1 );
	} );

	it( 'falls back to js mode without view timeline support', () => {
		const { bodyContent } = initWithStickyTable( { supportsViewTimeline: false } );

		expect( bodyContent.querySelector( '.citizen-overflow-wrapper' )
			.classList.contains( 'citizen-overflow-wrapper--sticky-js' ) ).toBe( true );
	} );

	it( 'falls back to js mode when view() is supported but exit-crossing is not', () => {
		const { bodyContent } = initWithStickyTable( {
			supportsMap: {
				'animation-timeline: view()': true,
				'animation-range: exit-crossing 0%': false
			}
		} );

		expect( bodyContent.querySelector( '.citizen-overflow-wrapper' )
			.classList.contains( 'citizen-overflow-wrapper--sticky-js' ) ).toBe( true );
	} );

	it( 'falls back to js mode when exit-crossing is supported but view() is not', () => {
		const { bodyContent } = initWithStickyTable( {
			supportsMap: {
				'animation-timeline: view()': false,
				'animation-range: exit-crossing 0%': true
			}
		} );

		expect( bodyContent.querySelector( '.citizen-overflow-wrapper' )
			.classList.contains( 'citizen-overflow-wrapper--sticky-js' ) ).toBe( true );
	} );

	it( 'falls back to js mode under a scroll-container ancestor', () => {
		const { bodyContent } = initWithStickyTable( { scrollAncestor: true } );

		expect( bodyContent.querySelector( '.citizen-overflow-wrapper' )
			.classList.contains( 'citizen-overflow-wrapper--sticky-js' ) ).toBe( true );
	} );

	it( 'stamps band and travel vars from the resize callback', () => {
		const { bodyContent, observers } = initWithStickyTable();
		const wrapper = bodyContent.querySelector( '.citizen-overflow-wrapper' );
		const table = bodyContent.querySelector( 'table' );
		vi.spyOn( table.rows[ 0 ], 'getBoundingClientRect' ).mockReturnValue( { top: 0, bottom: 40 } );
		vi.spyOn( wrapper, 'getBoundingClientRect' ).mockReturnValue( { height: 240 } );

		observers.getResizeCallback()( [ { target: table } ] );

		expect( wrapper.style.getPropertyValue( '--citizen-overflow-sticky-band' ) ).toBe( '40px' );
		expect( wrapper.style.getPropertyValue( '--citizen-overflow-sticky-travel' ) ).toBe( '200px' );
	} );

	it( 'batches all measure reads before any band writes across tables on resize', () => {
		const { bodyContent, observers } = initWithStickyTable( { tableCount: 2 } );
		const wrappers = Array.from( bodyContent.querySelectorAll( '.citizen-overflow-wrapper' ) );
		const tables = Array.from( bodyContent.querySelectorAll( 'table' ) );
		const log = [];
		wrappers.forEach( ( wrapper, index ) => {
			vi.spyOn( wrapper, 'getBoundingClientRect' ).mockImplementation( () => {
				log.push( `read:${ index }` );
				return { height: 240 };
			} );
			vi.spyOn( wrapper.style, 'setProperty' ).mockImplementation( ( name ) => {
				if ( name === '--citizen-overflow-sticky-band' || name === '--citizen-overflow-sticky-travel' ) {
					log.push( `write:${ index }` );
				}
			} );
		} );
		tables.forEach( ( table, index ) => {
			vi.spyOn( table.rows[ 0 ], 'getBoundingClientRect' ).mockImplementation( () => {
				log.push( `read:${ index }` );
				return { top: 0, bottom: 40 };
			} );
		} );

		// One batched entries array covering both tables, as a real
		// ResizeObserver would deliver
		observers.getResizeCallback()( [ { target: tables[ 0 ] }, { target: tables[ 1 ] } ] );

		expect( log ).toContain( 'read:0' );
		expect( log ).toContain( 'read:1' );
		expect( log ).toContain( 'write:0' );
		expect( log ).toContain( 'write:1' );
		// Every geometry read across both wrappers must precede every
		// custom-property write — interleaving would force layout thrash
		const lastRead = Math.max( log.lastIndexOf( 'read:0' ), log.lastIndexOf( 'read:1' ) );
		const firstWrite = Math.min( log.indexOf( 'write:0' ), log.indexOf( 'write:1' ) );
		expect( lastRead ).toBeLessThan( firstWrite );
	} );

	it( 'drives --citizen-overflow-sticky-top for js-mode instances on scroll', () => {
		// Realistic rAF semantics, local to this test: the drive's one-frame
		// coalescing guard needs a numeric id returned before the callback
		// runs, so the suite-wide synchronous mock cannot exercise it.
		const rafQueue = [];
		const flushRaf = () => {
			while ( rafQueue.length ) {
				rafQueue.shift()();
			}
		};
		const { bodyContent, observers, win } = initWithStickyTable( {
			supportsViewTimeline: false,
			windowOverrides: {
				// Array#push returns the new length — a valid numeric frame id
				requestAnimationFrame: vi.fn( ( cb ) => rafQueue.push( cb ) )
			}
		} );
		const wrapper = bodyContent.querySelector( '.citizen-overflow-wrapper' );
		const table = bodyContent.querySelector( 'table' );
		const rect = vi.spyOn( wrapper, 'getBoundingClientRect' )
			.mockReturnValue( { top: -120, height: 240 } );

		// Element scrolls into view → resume() registers it with the drive
		observers.getIntersectionCallback()( [ { target: table, isIntersecting: true } ] );
		flushRaf();

		// Registration attaches the listener and drives one immediate update
		expect( win.addEventListener ).toHaveBeenCalledWith( 'scroll', expect.any( Function ), { passive: true, capture: true } );
		expect( wrapper.style.getPropertyValue( '--citizen-overflow-sticky-top' ) ).toBe( '-120px' );

		// The page scrolls further → the scroll handler drives a second
		// update reflecting the new geometry
		rect.mockReturnValue( { top: -240, height: 240 } );
		const scrollHandler = win.addEventListener.mock.calls
			.find( ( call ) => call[ 0 ] === 'scroll' )[ 1 ];
		scrollHandler();
		flushRaf();

		expect( wrapper.style.getPropertyValue( '--citizen-overflow-sticky-top' ) ).toBe( '-240px' );
	} );

	it( 'batches rect reads before top writes across js-mode tables on scroll', () => {
		const rafQueue = [];
		const flushRaf = () => {
			while ( rafQueue.length ) {
				rafQueue.shift()();
			}
		};
		const { bodyContent, observers, win } = initWithStickyTable( {
			supportsViewTimeline: false,
			tableCount: 2,
			windowOverrides: {
				requestAnimationFrame: vi.fn( ( cb ) => rafQueue.push( cb ) )
			}
		} );
		const wrappers = Array.from( bodyContent.querySelectorAll( '.citizen-overflow-wrapper' ) );
		const tables = Array.from( bodyContent.querySelectorAll( 'table' ) );
		const log = [];
		wrappers.forEach( ( wrapper, index ) => {
			vi.spyOn( wrapper, 'getBoundingClientRect' ).mockImplementation( () => {
				log.push( `read:${ index }` );
				return { top: -120, height: 240 };
			} );
			vi.spyOn( wrapper.style, 'setProperty' ).mockImplementation( ( name ) => {
				if ( name === '--citizen-overflow-sticky-top' ) {
					log.push( `write:${ index }` );
				}
			} );
		} );
		// Both elements scroll into view → resume() registers both with the
		// drive; flush its registration frame and discard those entries so
		// the assertion covers the scroll-driven frame alone
		observers.getIntersectionCallback()( [
			{ target: tables[ 0 ], isIntersecting: true },
			{ target: tables[ 1 ], isIntersecting: true }
		] );
		flushRaf();
		log.length = 0;

		const scrollHandler = win.addEventListener.mock.calls
			.find( ( call ) => call[ 0 ] === 'scroll' )[ 1 ];
		scrollHandler();
		flushRaf();

		// Both wrappers' rect reads precede both top writes in the one frame
		expect( log ).toEqual( [ 'read:0', 'read:1', 'write:0', 'write:1' ] );
	} );

	it( 'detaches the js drive scroll listener on re-init', () => {
		const { bodyContent, observers, win } = initWithStickyTable( { supportsViewTimeline: false } );
		const table = bodyContent.querySelector( 'table' );
		// Element scrolls into view → resume() attaches the scroll listener
		observers.getIntersectionCallback()( [ { target: table, isIntersecting: true } ] );
		const scrollHandler = win.addEventListener.mock.calls
			.find( ( call ) => call[ 0 ] === 'scroll' )[ 1 ];

		init( {
			document, window: win, mw,
			IntersectionObserver: observers.IntersectionObserver,
			ResizeObserver: observers.ResizeObserver,
			bodyContent, config: createConfig()
		} );

		expect( win.removeEventListener ).toHaveBeenCalledWith( 'scroll', scrollHandler, { capture: true } );
	} );
} );

describe( 'stickyRows', () => {
	describe( 'resolveBandRows', () => {
		it( 'returns rows through the deepest marked row', () => {
			const bodyContent = createBodyContent( `
				<table id="t">
					<tr><th>a</th></tr>
					<tr class="citizen-overflow-sticky-header"><th>b</th></tr>
					<tr><td>c</td></tr>
				</table>` );
			const rows = resolveBandRows( bodyContent.querySelector( '#t' ) );

			expect( rows ).toHaveLength( 2 );
		} );

		it( 'uses the deepest marker when multiple rows are marked', () => {
			const bodyContent = createBodyContent( `
				<table id="t">
					<tr class="citizen-overflow-sticky-header"><th>a</th></tr>
					<tr class="citizen-overflow-sticky-header"><th>b</th></tr>
					<tr><td>c</td></tr>
				</table>` );

			const rows = resolveBandRows( bodyContent.querySelector( '#t' ) );

			expect( rows ).toHaveLength( 2 );
		} );

		it( 'ignores markers inside nested tables', () => {
			const bodyContent = createBodyContent( `
				<table id="outer"><tr><td>
					<table><tr class="citizen-overflow-sticky-header"><th>x</th></tr></table>
				</td></tr></table>` );

			expect( resolveBandRows( bodyContent.querySelector( '#outer' ) ) ).toBeNull();
		} );

		it( 'uses direct children for non-table elements', () => {
			const bodyContent = createBodyContent( `
				<div id="d" class="citizen-overflow">
					<div>first</div>
					<div class="citizen-overflow-sticky-header">second</div>
					<div>third</div>
				</div>` );

			expect( resolveBandRows( bodyContent.querySelector( '#d' ) ) ).toHaveLength( 2 );
		} );

		it( 'returns null when no marker present', () => {
			const bodyContent = createBodyContent( '<table id="t"><tr><th>a</th></tr></table>' );

			expect( resolveBandRows( bodyContent.querySelector( '#t' ) ) ).toBeNull();
		} );
	} );

	describe( 'createStickyRows', () => {
		it( 'tags band rows and wrapper mode class without touching the marker', () => {
			const bodyContent = createBodyContent( `
				<div id="w"><table id="t">
					<tr class="citizen-overflow-sticky-header"><th>a</th></tr>
					<tr><td>b</td></tr>
				</table></div>` );
			const wrapper = bodyContent.querySelector( '#w' );
			const element = bodyContent.querySelector( '#t' );

			const sticky = createStickyRows( { element, wrapper, mode: 'css' } );

			const row = element.rows[ 0 ];
			expect( row.classList.contains( 'citizen-overflow-sticky-row' ) ).toBe( true );
			expect( row.classList.contains( 'citizen-overflow-sticky-row--boundary' ) ).toBe( true );
			expect( row.classList.contains( 'citizen-overflow-sticky-header' ) ).toBe( true );
			expect( wrapper.classList.contains( 'citizen-overflow-wrapper--sticky-css' ) ).toBe( true );
			expect( sticky.mode ).toBe( 'css' );
		} );

		it( 'measures band height and travel, applies px vars to wrapper', () => {
			const bodyContent = createBodyContent( `
				<div id="w"><table id="t">
					<tr class="citizen-overflow-sticky-header"><th>a</th></tr>
					<tr><td>b</td></tr>
				</table></div>` );
			const wrapper = bodyContent.querySelector( '#w' );
			const element = bodyContent.querySelector( '#t' );
			const sticky = createStickyRows( { element, wrapper, mode: 'js' } );
			vi.spyOn( element.rows[ 0 ], 'getBoundingClientRect' )
				.mockReturnValue( { top: 100, bottom: 140 } );
			vi.spyOn( wrapper, 'getBoundingClientRect' ).mockReturnValue( { height: 400 } );

			const measurement = sticky.measure();
			sticky.apply( measurement );

			expect( measurement ).toEqual( { bandHeight: 40, travel: 360 } );
			expect( wrapper.style.getPropertyValue( '--citizen-overflow-sticky-band' ) ).toBe( '40px' );
			expect( wrapper.style.getPropertyValue( '--citizen-overflow-sticky-travel' ) ).toBe( '360px' );
		} );

		it( 'puts the boundary class only on the last row of a multi-row band', () => {
			const bodyContent = createBodyContent( `
				<div id="w"><table id="t">
					<tr><th>a</th></tr>
					<tr class="citizen-overflow-sticky-header"><th>b</th></tr>
					<tr><td>c</td></tr>
				</table></div>` );
			const wrapper = bodyContent.querySelector( '#w' );
			const element = bodyContent.querySelector( '#t' );

			createStickyRows( { element, wrapper, mode: 'css' } );

			const rows = element.rows;
			expect( rows[ 0 ].classList.contains( 'citizen-overflow-sticky-row' ) ).toBe( true );
			expect( rows[ 0 ].classList.contains( 'citizen-overflow-sticky-row--boundary' ) ).toBe( false );
			expect( rows[ 1 ].classList.contains( 'citizen-overflow-sticky-row' ) ).toBe( true );
			expect( rows[ 1 ].classList.contains( 'citizen-overflow-sticky-row--boundary' ) ).toBe( true );
			expect( rows[ 2 ].classList.contains( 'citizen-overflow-sticky-row' ) ).toBe( false );
		} );

		it( 'clamps travel to zero when the band is taller than the wrapper', () => {
			const bodyContent = createBodyContent( `
				<div id="w"><table id="t">
					<tr class="citizen-overflow-sticky-header"><th>a</th></tr>
				</table></div>` );
			const wrapper = bodyContent.querySelector( '#w' );
			const element = bodyContent.querySelector( '#t' );
			const sticky = createStickyRows( { element, wrapper, mode: 'js' } );
			vi.spyOn( element.rows[ 0 ], 'getBoundingClientRect' )
				.mockReturnValue( { top: 0, bottom: 300 } );
			vi.spyOn( wrapper, 'getBoundingClientRect' ).mockReturnValue( { height: 200 } );

			const measurement = sticky.measure();

			expect( measurement ).toEqual( { bandHeight: 300, travel: 0 } );
		} );
	} );

	describe( 'hasScrollContainerAncestor', () => {
		it( 'detects an overflow ancestor and ignores visible/clip', () => {
			const bodyContent = createBodyContent( '<div id="a"><div id="b"></div></div>' );
			const win = {
				getComputedStyle: ( el ) => ( {
					overflowX: el.style.overflowX || 'visible',
					overflowY: el.style.overflowY || 'visible'
				} )
			};
			const inner = bodyContent.querySelector( '#b' );

			expect( hasScrollContainerAncestor( inner, win ) ).toBe( false );

			bodyContent.querySelector( '#a' ).style.overflowY = 'hidden';
			expect( hasScrollContainerAncestor( inner, win ) ).toBe( true );

			bodyContent.querySelector( '#a' ).style.overflowY = 'clip';
			expect( hasScrollContainerAncestor( inner, win ) ).toBe( false );
		} );

		it( 'detects an overflow-x scroll value', () => {
			const bodyContent = createBodyContent( '<div id="a"><div id="b"></div></div>' );
			const win = {
				getComputedStyle: ( el ) => ( {
					overflowX: el.style.overflowX || 'visible',
					overflowY: el.style.overflowY || 'visible'
				} )
			};
			bodyContent.querySelector( '#a' ).style.overflowX = 'auto';

			expect( hasScrollContainerAncestor( bodyContent.querySelector( '#b' ), win ) ).toBe( true );
		} );
	} );
} );
