const { ref } = require( 'vue' );

const useListNavigation = require( '../../../../resources/skins.citizen.commandPalette/composables/useListNavigation.js' );

describe( 'useListNavigation', () => {
	it( 'initializes with highlightedIndex at -1', () => {
		const items = ref( [ 'a', 'b', 'c' ] );

		const { highlightedIndex } = useListNavigation( items );

		expect( highlightedIndex.value ).toBe( -1 );
	} );

	it( 'highlightNext moves from -1 to 0', () => {
		const items = ref( [ 'a', 'b', 'c' ] );
		const { highlightedIndex, highlightNext } = useListNavigation( items );

		highlightNext();

		expect( highlightedIndex.value ).toBe( 0 );
	} );

	it( 'highlightNext wraps around to 0 from last item', () => {
		const items = ref( [ 'a', 'b', 'c' ] );
		const { highlightedIndex, highlightNext } = useListNavigation( items );
		highlightedIndex.value = 2;

		highlightNext();

		expect( highlightedIndex.value ).toBe( 0 );
	} );

	it( 'highlightPrevious wraps to last item from first', () => {
		const items = ref( [ 'a', 'b', 'c' ] );
		const { highlightedIndex, highlightPrevious } = useListNavigation( items );
		highlightedIndex.value = 0;

		highlightPrevious();

		expect( highlightedIndex.value ).toBe( 2 );
	} );

	it( 'highlightFirst sets to 0', () => {
		const items = ref( [ 'a', 'b', 'c' ] );
		const { highlightedIndex, highlightFirst } = useListNavigation( items );

		highlightFirst();

		expect( highlightedIndex.value ).toBe( 0 );
	} );

	it( 'highlightFirst sets to -1 for empty list', () => {
		const items = ref( [] );
		const { highlightedIndex, highlightFirst } = useListNavigation( items );

		highlightFirst();

		expect( highlightedIndex.value ).toBe( -1 );
	} );

	it( 'highlightLast sets to last index', () => {
		const items = ref( [ 'a', 'b', 'c' ] );
		const { highlightedIndex, highlightLast } = useListNavigation( items );

		highlightLast();

		expect( highlightedIndex.value ).toBe( 2 );
	} );

	it( 'resetHighlight sets to -1', () => {
		const items = ref( [ 'a', 'b', 'c' ] );
		const { highlightedIndex, resetHighlight } = useListNavigation( items );
		highlightedIndex.value = 1;

		resetHighlight();

		expect( highlightedIndex.value ).toBe( -1 );
	} );

	it( 'highlightNext does not change index for empty list', () => {
		const items = ref( [] );
		const { highlightedIndex, highlightNext } = useListNavigation( items );

		highlightNext();

		expect( highlightedIndex.value ).toBe( -1 );
	} );
} );
