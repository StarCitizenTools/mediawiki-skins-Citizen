// @vitest-environment jsdom
/* global document */

const setupObservers = require( '../../../resources/skins.citizen.scripts/setupObservers.js' );
const mw = require( '../mocks/mw.js' );

function createMockWindow() {
	return {
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		getComputedStyle: vi.fn( () => ( {
			getPropertyValue: vi.fn( () => 'block' )
		} ) )
	};
}

function createMockIntersectionObserver() {
	return vi.fn( function () {
		this.observe = vi.fn();
		this.unobserve = vi.fn();
		this.disconnect = vi.fn();
	} );
}

describe( 'setupObservers', () => {
	afterEach( () => {
		[ 've.activationStart', 've.deactivationComplete' ]
			.forEach( ( name ) => mw.hook( name )._reset() );
		vi.clearAllMocks();
		document.body.innerHTML = '';
	} );

	it( 'should lazy-load the table of contents module when the page has a ToC', async () => {
		document.body.innerHTML = `
			<div id="citizen-toc"></div>
			<div id="bodyContent"></div>
			<div id="citizen-page-header-sticky-sentinel"></div>
		`;
		const win = createMockWindow();
		const MockIntersectionObserver = createMockIntersectionObserver();
		const tocInit = vi.fn();
		const moduleRequire = vi.fn( () => ( { init: tocInit } ) );
		mw.loader.using.mockImplementation( () => Promise.resolve( moduleRequire ) );

		setupObservers.init( {
			document,
			window: win,
			mw,
			IntersectionObserver: MockIntersectionObserver
		} );

		expect( mw.loader.using ).toHaveBeenCalledWith( 'skins.citizen.toc' );

		await Promise.resolve();

		expect( moduleRequire ).toHaveBeenCalledWith( 'skins.citizen.toc' );
		expect( tocInit ).toHaveBeenCalledWith( {
			document,
			window: win,
			mw,
			IntersectionObserver: MockIntersectionObserver
		} );
	} );

	it( 'should log instead of rejecting when the module fails to load', async () => {
		document.body.innerHTML = `
			<div id="citizen-toc"></div>
			<div id="bodyContent"></div>
			<div id="citizen-page-header-sticky-sentinel"></div>
		`;
		const win = createMockWindow();
		const loadError = new Error( 'Unknown module' );
		mw.loader.using.mockImplementation( () => Promise.reject( loadError ) );
		mw.log = { warn: vi.fn() };

		setupObservers.init( {
			document,
			window: win,
			mw,
			IntersectionObserver: createMockIntersectionObserver()
		} );
		await Promise.resolve();

		expect( mw.log.warn ).toHaveBeenCalledWith(
			'Failed to load skins.citizen.toc', loadError
		);
	} );

	it( 'should not load the table of contents module when the page has no ToC', () => {
		document.body.innerHTML = `
			<div id="bodyContent"></div>
			<div id="citizen-page-header-sticky-sentinel"></div>
		`;
		const win = createMockWindow();

		setupObservers.init( {
			document,
			window: win,
			mw,
			IntersectionObserver: createMockIntersectionObserver()
		} );

		expect( mw.loader.using ).not.toHaveBeenCalled();
	} );

	it( 'should still observe the sticky header sentinel without a ToC', () => {
		document.body.innerHTML = `
			<div id="bodyContent"></div>
			<div id="citizen-page-header-sticky-sentinel"></div>
		`;
		const win = createMockWindow();
		const ioInstances = [];
		const MockIntersectionObserver = vi.fn( function () {
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

		const sentinel = document.getElementById( 'citizen-page-header-sticky-sentinel' );
		const observed = ioInstances.some(
			( io ) => io.observe.mock.calls.some( ( args ) => args[ 0 ] === sentinel )
		);
		expect( observed ).toBe( true );
	} );
} );
