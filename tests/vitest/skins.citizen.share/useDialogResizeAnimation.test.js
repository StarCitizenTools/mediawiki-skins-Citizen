// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const { defineComponent, ref } = require( 'vue' );

const { useDialogResizeAnimation } = require(
	'../../../resources/skins.citizen.share/composables/useDialogResizeAnimation.js'
);

let observerInstance = null;

class StubResizeObserver {
	constructor( callback ) {
		this.callback = callback;
		this.observed = [];
		this.disconnected = false;
		observerInstance = this;
	}
	observe( target ) {
		this.observed.push( target );
	}
	disconnect() {
		this.disconnected = true;
	}
}

let rafQueue = [];

beforeEach( () => {
	observerInstance = null;
	rafQueue = [];
	globalThis.ResizeObserver = StubResizeObserver;
	// Capture rAF callbacks so tests can decide when to flush them.
	globalThis.requestAnimationFrame = ( cb ) => {
		rafQueue.push( cb );
		return rafQueue.length;
	};
} );

afterEach( () => {
	delete globalThis.ResizeObserver;
	delete globalThis.requestAnimationFrame;
} );

function flushRaf() {
	const callbacks = rafQueue;
	rafQueue = [];
	callbacks.forEach( ( cb ) => cb() );
}

function mountWith( { container, viewportEl } ) {
	const viewport = ref( viewportEl );
	const Wrapper = defineComponent( {
		template: '<div></div>',
		setup() {
			return useDialogResizeAnimation( { container, viewport } );
		}
	} );
	return mount( Wrapper );
}

describe( 'useDialogResizeAnimation', () => {
	it( 'observes the viewport and writes clientHeight to the container on setup', () => {
		const container = document.createElement( 'div' );
		const viewport = document.createElement( 'div' );
		Object.defineProperty( viewport, 'clientHeight', { value: 320 } );

		const wrapper = mountWith( { container, viewportEl: viewport } );
		wrapper.vm.setup();

		expect( observerInstance ).not.toBeNull();
		expect( observerInstance.observed ).toEqual( [ viewport ] );
		expect( container.style.height ).toBe( '320px' );
	} );

	it( 'skips writes when clientHeight is 0 (dialog is closed)', () => {
		const container = document.createElement( 'div' );
		container.style.height = '320px'; // simulate a previous on-screen write
		const viewport = document.createElement( 'div' );
		Object.defineProperty( viewport, 'clientHeight', {
			configurable: true,
			value: 0
		} );

		const wrapper = mountWith( { container, viewportEl: viewport } );
		wrapper.vm.setup();
		observerInstance.callback();

		// Previous inline value is preserved — important so the next open
		// does not animate from 0 → measured height.
		expect( container.style.height ).toBe( '320px' );
	} );

	it( 'adds the --animated class on the next rAF after the first nonzero write', () => {
		const container = document.createElement( 'div' );
		const viewport = document.createElement( 'div' );
		Object.defineProperty( viewport, 'clientHeight', { value: 240 } );

		const wrapper = mountWith( { container, viewportEl: viewport } );
		wrapper.vm.setup();

		// Class must not be on the container during the same paint as the
		// first inline-height write — otherwise the initial write would
		// animate from intrinsic height to the pixel value.
		expect( container.classList.contains( 'citizen-share-dialog--animated' ) ).toBe( false );

		flushRaf();

		expect( container.classList.contains( 'citizen-share-dialog--animated' ) ).toBe( true );
	} );

	it( 'schedules the rAF exactly once across multiple callbacks', () => {
		const container = document.createElement( 'div' );
		const viewport = document.createElement( 'div' );
		Object.defineProperty( viewport, 'clientHeight', {
			configurable: true,
			value: 240
		} );

		const wrapper = mountWith( { container, viewportEl: viewport } );
		wrapper.vm.setup();

		// First nonzero write schedules a single rAF.
		expect( rafQueue.length ).toBe( 1 );

		Object.defineProperty( viewport, 'clientHeight', {
			configurable: true,
			value: 360
		} );
		observerInstance.callback();

		// A second write does not queue another — the class is one-shot.
		expect( rafQueue.length ).toBe( 1 );
	} );

	it( 'teardown disconnects the observer', () => {
		const container = document.createElement( 'div' );
		const viewport = document.createElement( 'div' );
		Object.defineProperty( viewport, 'clientHeight', { value: 100 } );

		const wrapper = mountWith( { container, viewportEl: viewport } );
		wrapper.vm.setup();
		const created = observerInstance;

		wrapper.vm.teardown();

		expect( created.disconnected ).toBe( true );
	} );

	it( 'unmount disconnects an active observer', () => {
		const container = document.createElement( 'div' );
		const viewport = document.createElement( 'div' );
		Object.defineProperty( viewport, 'clientHeight', { value: 100 } );

		const wrapper = mountWith( { container, viewportEl: viewport } );
		wrapper.vm.setup();
		const created = observerInstance;

		wrapper.unmount();

		expect( created.disconnected ).toBe( true );
	} );

	it( 'setup is a no-op when the container is null', () => {
		const viewport = document.createElement( 'div' );
		Object.defineProperty( viewport, 'clientHeight', { value: 100 } );

		const wrapper = mountWith( { container: null, viewportEl: viewport } );
		wrapper.vm.setup();

		expect( observerInstance ).toBeNull();
	} );
} );
