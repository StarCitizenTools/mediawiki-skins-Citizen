// @vitest-environment jsdom

const { mount, flushPromises } = require( '@vue/test-utils' );
const { defineComponent, ref } = require( 'vue' );

/**
 * Creates a mock matchMedia result object.
 *
 * @param {boolean} matches Whether the media query matches
 * @return {Object} Mock MediaQueryList
 */
function createMatchMediaMock( matches ) {
	return {
		matches,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	};
}

/**
 * Mocks the computed color-scheme on the document element.
 *
 * @param {string} colorScheme
 * @return {import('vitest').MockInstance}
 */
function mockRootColorScheme( colorScheme ) {
	return vi.spyOn( window, 'getComputedStyle' ).mockReturnValue( { colorScheme } );
}

// useVisibility relies on Vue lifecycle hooks (onMounted/onUnmounted),
// so it must be called inside a component's setup(). We mount a minimal
// wrapper component to test the composable in its intended context.
let useVisibility;

/**
 * Creates and mounts a wrapper component that calls useVisibility,
 * exposing the returned isVisible ref for assertions.
 *
 * @param {string} condition The visibility condition
 * @param {import('vue').Ref<string>} themeValue Reactive theme value
 * @return {import('@vue/test-utils').VueWrapper}
 */
function mountWithVisibility( condition, themeValue ) {
	const Wrapper = defineComponent( {
		template: '<div v-if="isVisible">visible</div>',
		setup() {
			const { isVisible } = useVisibility( condition, themeValue );
			return { isVisible };
		}
	} );
	return mount( Wrapper );
}

beforeAll( async () => {
	const mod = await import( '../../../resources/skins.citizen.preferences/useVisibility.js' );
	useVisibility = mod.default || mod;
} );

afterEach( () => {
	vi.restoreAllMocks();
	delete globalThis.matchMedia;
} );

describe( 'useVisibility', () => {
	describe( 'always condition', () => {
		it( 'should be visible regardless of theme value', () => {
			const themeValue = ref( 'day' );

			const wrapper = mountWithVisibility( 'always', themeValue );

			expect( wrapper.text() ).toBe( 'visible' );
		} );
	} );

	describe( 'dark-theme condition', () => {
		beforeEach( () => {
			globalThis.matchMedia = vi.fn( () => createMatchMediaMock( false ) );
		} );

		it( 'should be visible when the resolved scheme is dark', async () => {
			mockRootColorScheme( 'dark' );
			const themeValue = ref( 'black' );

			const wrapper = mountWithVisibility( 'dark-theme', themeValue );
			await flushPromises();

			expect( wrapper.text() ).toBe( 'visible' );
		} );

		it( 'should be hidden when the resolved scheme is light', async () => {
			mockRootColorScheme( 'light' );
			globalThis.matchMedia = vi.fn( () => createMatchMediaMock( true ) );
			const themeValue = ref( 'day' );

			const wrapper = mountWithVisibility( 'dark-theme', themeValue );
			await flushPromises();

			expect( wrapper.text() ).toBe( '' );
		} );

		it( 'should follow the OS preference when the scheme is adaptive', async () => {
			mockRootColorScheme( 'light dark' );
			globalThis.matchMedia = vi.fn( () => createMatchMediaMock( true ) );
			const themeValue = ref( 'os' );

			const wrapper = mountWithVisibility( 'dark-theme', themeValue );
			await flushPromises();

			expect( globalThis.matchMedia ).toHaveBeenCalledWith( '(prefers-color-scheme: dark)' );
			expect( wrapper.text() ).toBe( 'visible' );
		} );

		it( 'should be hidden for adaptive scheme when the OS is light', async () => {
			mockRootColorScheme( 'light dark' );
			const themeValue = ref( 'os' );

			const wrapper = mountWithVisibility( 'dark-theme', themeValue );
			await flushPromises();

			expect( wrapper.text() ).toBe( '' );
		} );

		it( 'should re-resolve when the theme value changes', async () => {
			const spy = mockRootColorScheme( 'light' );
			const themeValue = ref( 'day' );

			const wrapper = mountWithVisibility( 'dark-theme', themeValue );
			await flushPromises();

			expect( wrapper.text() ).toBe( '' );

			spy.mockReturnValue( { colorScheme: 'dark' } );
			themeValue.value = 'black';
			await wrapper.vm.$nextTick();

			expect( wrapper.text() ).toBe( 'visible' );
		} );

		it( 'should treat a missing color-scheme as light', async () => {
			mockRootColorScheme( '' );
			globalThis.matchMedia = vi.fn( () => createMatchMediaMock( true ) );
			const themeValue = ref( 'unknowntheme' );

			const wrapper = mountWithVisibility( 'dark-theme', themeValue );
			await flushPromises();

			expect( wrapper.text() ).toBe( '' );
		} );
	} );

	describe( 'tablet-viewport condition', () => {
		beforeEach( () => {
			globalThis.matchMedia = vi.fn( () => createMatchMediaMock( false ) );
		} );

		it( 'should be visible when viewport matches tablet breakpoint', async () => {
			globalThis.matchMedia = vi.fn( () => createMatchMediaMock( true ) );
			const themeValue = ref( 'os' );

			const wrapper = mountWithVisibility( 'tablet-viewport', themeValue );
			await flushPromises();

			expect( wrapper.text() ).toBe( 'visible' );
		} );

		it( 'should be hidden when viewport exceeds tablet breakpoint', () => {
			globalThis.matchMedia = vi.fn( () => createMatchMediaMock( false ) );
			const themeValue = ref( 'os' );

			const wrapper = mountWithVisibility( 'tablet-viewport', themeValue );

			expect( wrapper.text() ).toBe( '' );
		} );

		it( 'should register a matchMedia listener for max-width', () => {
			const mockQuery = createMatchMediaMock( false );
			globalThis.matchMedia = vi.fn( () => mockQuery );
			const themeValue = ref( 'os' );

			mountWithVisibility( 'tablet-viewport', themeValue );

			expect( globalThis.matchMedia ).toHaveBeenCalledWith( '(max-width: 1119px)' );
			expect( mockQuery.addEventListener ).toHaveBeenCalledWith( 'change', expect.any( Function ) );
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should remove dark-theme media query listener on unmount', () => {
			const mockQuery = createMatchMediaMock( true );
			globalThis.matchMedia = vi.fn( () => mockQuery );
			const themeValue = ref( 'os' );

			const wrapper = mountWithVisibility( 'dark-theme', themeValue );
			wrapper.unmount();

			expect( mockQuery.removeEventListener ).toHaveBeenCalledWith(
				'change',
				expect.any( Function )
			);
		} );

		it( 'should remove tablet-viewport media query listener on unmount', () => {
			const mockQuery = createMatchMediaMock( true );
			globalThis.matchMedia = vi.fn( () => mockQuery );
			const themeValue = ref( 'os' );

			const wrapper = mountWithVisibility( 'tablet-viewport', themeValue );
			wrapper.unmount();

			expect( mockQuery.removeEventListener ).toHaveBeenCalledWith(
				'change',
				expect.any( Function )
			);
		} );

		it( 'should not call matchMedia for always condition', () => {
			globalThis.matchMedia = vi.fn();
			const themeValue = ref( 'os' );

			mountWithVisibility( 'always', themeValue );

			expect( globalThis.matchMedia ).not.toHaveBeenCalled();
		} );
	} );
} );
