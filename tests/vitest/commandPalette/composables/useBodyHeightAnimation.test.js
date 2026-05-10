// @vitest-environment jsdom

const { mount } = require( '@vue/test-utils' );
const { defineComponent, ref } = require( 'vue' );

const useBodyHeightAnimation = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useBodyHeightAnimation.js'
);

// Stub ResizeObserver so we can capture the constructor and the callback
// without depending on jsdom's (missing) implementation.
let observerInstance = null;

class StubResizeObserver {
	constructor( callback ) {
		this.callback = callback;
		this.observed = [];
		this.disconnected = false;
		// Most recent instance is the one the test asserts against.
		observerInstance = this;
	}
	observe( target ) {
		this.observed.push( target );
	}
	disconnect() {
		this.disconnected = true;
	}
}

beforeEach( () => {
	observerInstance = null;
	globalThis.ResizeObserver = StubResizeObserver;
} );

afterEach( () => {
	delete globalThis.ResizeObserver;
} );

/**
 * Mount a wrapper that calls useBodyHeightAnimation against the given
 * container/viewport refs. Returns the wrapper plus the setup/teardown
 * functions on the wrapper's `vm` so tests can drive them directly.
 *
 * @param {Object} refs
 * @return {Object}
 */
function mountWith( refs ) {
	const Wrapper = defineComponent( {
		template: '<div></div>',
		setup() {
			return useBodyHeightAnimation( refs );
		}
	} );
	return mount( Wrapper );
}

describe( 'useBodyHeightAnimation', () => {
	describe( 'setupResizeObserver', () => {
		it( 'observes the viewport ref and writes its clientHeight to the container', () => {
			const container = document.createElement( 'div' );
			const viewport = document.createElement( 'div' );
			Object.defineProperty( viewport, 'clientHeight', { value: 320 } );

			const wrapper = mountWith( {
				bodyContainer: ref( container ),
				bodyViewport: ref( viewport )
			} );

			wrapper.vm.setupResizeObserver();

			expect( observerInstance ).not.toBeNull();
			expect( observerInstance.observed ).toEqual( [ viewport ] );
			expect( container.style.height ).toBe( '320px' );
		} );

		it( 'is a no-op when the viewport ref is null', () => {
			const wrapper = mountWith( {
				bodyContainer: ref( null ),
				bodyViewport: ref( null )
			} );

			wrapper.vm.setupResizeObserver();

			expect( observerInstance ).toBeNull();
		} );

		it( 'updates the container height again when the observer callback fires', () => {
			const container = document.createElement( 'div' );
			const viewport = document.createElement( 'div' );
			Object.defineProperty( viewport, 'clientHeight', {
				configurable: true,
				value: 200
			} );

			const wrapper = mountWith( {
				bodyContainer: ref( container ),
				bodyViewport: ref( viewport )
			} );

			wrapper.vm.setupResizeObserver();
			expect( container.style.height ).toBe( '200px' );

			Object.defineProperty( viewport, 'clientHeight', {
				configurable: true,
				value: 480
			} );
			observerInstance.callback();

			expect( container.style.height ).toBe( '480px' );
		} );
	} );

	describe( 'teardownResizeObserver', () => {
		it( 'disconnects the active observer', () => {
			const container = document.createElement( 'div' );
			const viewport = document.createElement( 'div' );
			Object.defineProperty( viewport, 'clientHeight', { value: 100 } );

			const wrapper = mountWith( {
				bodyContainer: ref( container ),
				bodyViewport: ref( viewport )
			} );
			wrapper.vm.setupResizeObserver();
			const created = observerInstance;

			wrapper.vm.teardownResizeObserver();

			expect( created.disconnected ).toBe( true );
		} );

		it( 'is a no-op when no observer is active', () => {
			const wrapper = mountWith( {
				bodyContainer: ref( null ),
				bodyViewport: ref( null )
			} );

			expect( () => wrapper.vm.teardownResizeObserver() ).not.toThrow();
		} );
	} );

	describe( 'unmount', () => {
		it( 'disconnects an active observer when the component unmounts', () => {
			const container = document.createElement( 'div' );
			const viewport = document.createElement( 'div' );
			Object.defineProperty( viewport, 'clientHeight', { value: 100 } );

			const wrapper = mountWith( {
				bodyContainer: ref( container ),
				bodyViewport: ref( viewport )
			} );
			wrapper.vm.setupResizeObserver();
			const created = observerInstance;

			wrapper.unmount();

			expect( created.disconnected ).toBe( true );
		} );
	} );
} );
