// @vitest-environment jsdom

const { mount, flushPromises } = require( '@vue/test-utils' );
const { defineComponent, ref } = require( 'vue' );

const useGalleryColumnCount = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useGalleryColumnCount.js'
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

beforeEach( () => {
	observerInstance = null;
	globalThis.ResizeObserver = StubResizeObserver;
} );

afterEach( () => {
	delete globalThis.ResizeObserver;
} );

/**
 * Build a fake gallery component instance with an `$el` whose
 * clientWidth can be configured up front.
 *
 * @param {number} width
 * @return {Object}
 */
function fakeGallery( width ) {
	const el = document.createElement( 'div' );
	Object.defineProperty( el, 'clientWidth', {
		configurable: true,
		value: width
	} );
	return { $el: el };
}

/**
 * Mount a wrapper that runs the composable against a galleryRef and
 * exposes the returned columnCount ref + the galleryRef so tests can
 * mutate it.
 *
 * @param {Object} options
 * @return {Object}
 */
function mountWith( { galleryRef, minTileWidth } = {} ) {
	const ref$ = galleryRef || ref( null );
	const Wrapper = defineComponent( {
		template: '<div></div>',
		setup() {
			const columnCount = useGalleryColumnCount( {
				galleryRef: ref$,
				minTileWidth
			} );
			return { columnCount };
		}
	} );
	const wrapper = mount( Wrapper );
	return { wrapper, galleryRef: ref$ };
}

describe( 'useGalleryColumnCount', () => {
	it( 'starts at 1 with no gallery mounted', () => {
		const { wrapper } = mountWith();

		expect( wrapper.vm.columnCount ).toBe( 1 );
	} );

	it( 'attaches an observer and computes columns when galleryRef binds', async () => {
		const { wrapper, galleryRef } = mountWith();

		galleryRef.value = fakeGallery( 700 );
		await flushPromises();

		expect( observerInstance ).not.toBeNull();
		expect( observerInstance.observed ).toHaveLength( 1 );
		// 700 / 140 = 5
		expect( wrapper.vm.columnCount ).toBe( 5 );
	} );

	it( 'recomputes columns when the observer callback fires', async () => {
		const gallery = fakeGallery( 280 );
		const { wrapper, galleryRef } = mountWith();

		galleryRef.value = gallery;
		await flushPromises();
		expect( wrapper.vm.columnCount ).toBe( 2 );

		Object.defineProperty( gallery.$el, 'clientWidth', {
			configurable: true,
			value: 560
		} );
		observerInstance.callback();

		expect( wrapper.vm.columnCount ).toBe( 4 );
	} );

	it( 'clamps to a minimum of 1 column for narrow gallery widths', async () => {
		const { wrapper, galleryRef } = mountWith();

		galleryRef.value = fakeGallery( 80 );
		await flushPromises();

		expect( wrapper.vm.columnCount ).toBe( 1 );
	} );

	it( 'disconnects the previous observer when galleryRef swaps to a new instance', async () => {
		const { galleryRef } = mountWith();

		galleryRef.value = fakeGallery( 280 );
		await flushPromises();
		const first = observerInstance;

		galleryRef.value = fakeGallery( 560 );
		await flushPromises();
		const second = observerInstance;

		expect( first.disconnected ).toBe( true );
		expect( second ).not.toBe( first );
	} );

	it( 'disconnects when galleryRef becomes null', async () => {
		const { galleryRef } = mountWith();

		galleryRef.value = fakeGallery( 280 );
		await flushPromises();
		const created = observerInstance;

		galleryRef.value = null;
		await flushPromises();

		expect( created.disconnected ).toBe( true );
	} );

	it( 'disconnects on component unmount', async () => {
		const { wrapper, galleryRef } = mountWith();

		galleryRef.value = fakeGallery( 280 );
		await flushPromises();
		const created = observerInstance;

		wrapper.unmount();

		expect( created.disconnected ).toBe( true );
	} );

	it( 'honors a custom minTileWidth', async () => {
		const { wrapper, galleryRef } = mountWith( { minTileWidth: 200 } );

		galleryRef.value = fakeGallery( 700 );
		await flushPromises();

		// 700 / 200 = 3 (floored)
		expect( wrapper.vm.columnCount ).toBe( 3 );
	} );
} );
