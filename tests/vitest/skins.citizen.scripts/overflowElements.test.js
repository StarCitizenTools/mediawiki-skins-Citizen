// @vitest-environment jsdom
/* global document */

const { init } = require( '../../../resources/skins.citizen.scripts/overflowElements/index.js' );
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
		...overrides
	};
}

/**
 * Create a bodyContent element attached to the document.
 * Elements must be in the DOM so parentNode is available for the wrapper module.
 *
 * @param {HTMLElement[]} children
 * @return {HTMLElement}
 */
function createBodyContent( children = [] ) {
	const bodyContent = document.createElement( 'div' );
	children.forEach( ( child ) => {
		bodyContent.appendChild( child );
	} );
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
	// Must use function (not arrow) so it can be called with new
	const MockIntersectionObserver = vi.fn( function ( cb ) {
		intersectionCallback = cb;
		this.observe = intersectionObserve;
	} );

	let resizeCallback;
	const resizeObserve = vi.fn();
	const resizeUnobserve = vi.fn();
	const MockResizeObserver = vi.fn( function ( cb ) {
		resizeCallback = cb;
		this.observe = resizeObserve;
		this.unobserve = resizeUnobserve;
	} );

	return {
		IntersectionObserver: MockIntersectionObserver,
		ResizeObserver: MockResizeObserver,
		getIntersectionCallback: () => intersectionCallback,
		getResizeCallback: () => resizeCallback,
		intersectionObserve,
		resizeObserve,
		resizeUnobserve
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
			const table = document.createElement( 'table' );
			table.classList.add( 'wikitable', 'nowrap' );
			const bodyContent = createBodyContent( [ table ] );
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

	describe( 'OverflowElement', () => {
		it( 'should return early from init when wrapper returns null', () => {
			const table = document.createElement( 'table' );
			table.classList.add( 'wikitable' );
			const bodyContent = createBodyContent( [ table ] );

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

		it( 'should create sticky header only when header row exists', () => {
			const table = document.createElement( 'table' );
			table.classList.add( 'wikitable' );
			const thead = document.createElement( 'thead' );
			const headerRow = document.createElement( 'tr' );
			headerRow.classList.add( 'citizen-overflow-sticky-header' );
			const th1 = document.createElement( 'th' );
			th1.textContent = 'Column 1';
			const th2 = document.createElement( 'th' );
			th2.textContent = 'Column 2';
			headerRow.appendChild( th1 );
			headerRow.appendChild( th2 );
			thead.appendChild( headerRow );
			table.appendChild( thead );
			const bodyContent = createBodyContent( [ table ] );
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

			// The sticky header module creates an element with this class
			const stickyHeader = document.querySelector( '.citizen-overflow-content-sticky-header' );
			expect( stickyHeader ).not.toBe( null );
			expect( stickyHeader.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
		} );

		it( 'should bind and unbind listeners on resume and pause', () => {
			const table = document.createElement( 'table' );
			table.classList.add( 'wikitable' );
			const bodyContent = createBodyContent( [ table ] );
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

			// resume() is called during init — resize observer should observe the element
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
			const intersectionCb = observers.getIntersectionCallback();
			intersectionCb( [ { isIntersecting: false } ] );

			expect( contentRemoveSpy ).toHaveBeenCalledWith( 'scroll', expect.any( Function ) );
			expect( observers.resizeUnobserve ).toHaveBeenCalledWith( table );
			expect( navRemoveSpy ).toHaveBeenCalledWith( 'click', expect.any( Function ) );

			// Resume again
			intersectionCb( [ { isIntersecting: true } ] );

			expect( contentAddSpy ).toHaveBeenCalledWith( 'scroll', expect.any( Function ) );
			expect( navAddSpy ).toHaveBeenCalledWith( 'click', expect.any( Function ) );
		} );

		it( 'should clamp scrollLeft between 0 and max using rAF', () => {
			const table = document.createElement( 'table' );
			table.classList.add( 'wikitable' );
			const bodyContent = createBodyContent( [ table ] );
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

		it( 'should handle only navButton clicks and distinguish left from right', () => {
			const table = document.createElement( 'table' );
			table.classList.add( 'wikitable' );
			const bodyContent = createBodyContent( [ table ] );
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

			// rAF is also called by createOverflowState.updateState during resume,
			// so check that no scroll happened
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
