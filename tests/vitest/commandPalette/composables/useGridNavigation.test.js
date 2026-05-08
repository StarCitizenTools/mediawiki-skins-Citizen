/* global globalThis */

const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const { ref } = require( 'vue' );
const useGridNavigation = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useGridNavigation.js'
);

/**
 * Build a small reactive items ref.
 *
 * @param {number} count
 * @return {import('vue').Ref<Array<{id: number}>>}
 */
function makeItems( count ) {
	const items = [];
	for ( let i = 0; i < count; i++ ) {
		items.push( { id: i } );
	}
	return ref( items );
}

describe( 'useGridNavigation', () => {
	describe( 'initial state', () => {
		it( 'starts with highlightedIndex = -1 (nothing selected)', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );

			const nav = useGridNavigation( items, cols );

			expect( nav.highlightedIndex.value ).toBe( -1 );
		} );

		it( 'any direction from -1 lands at index 0', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );

			const nav = useGridNavigation( items, cols );
			nav.highlightNext();

			expect( nav.highlightedIndex.value ).toBe( 0 );
		} );

		it( 'highlightUp from -1 also lands at index 0 (no wrap)', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );

			const nav = useGridNavigation( items, cols );
			nav.highlightUp();

			expect( nav.highlightedIndex.value ).toBe( 0 );
		} );
	} );

	describe( 'horizontal navigation (← / →)', () => {
		it( 'highlightNext steps by 1 forward', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 2;

			nav.highlightNext();

			expect( nav.highlightedIndex.value ).toBe( 3 );
		} );

		it( 'highlightPrevious steps by 1 backward', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 5;

			nav.highlightPrevious();

			expect( nav.highlightedIndex.value ).toBe( 4 );
		} );

		it( 'highlightNext clamps at the last item (no wrap)', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 7;

			nav.highlightNext();

			expect( nav.highlightedIndex.value ).toBe( 7 );
		} );

		it( 'highlightPrevious clamps at index 0 (no wrap)', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 0;

			nav.highlightPrevious();

			expect( nav.highlightedIndex.value ).toBe( 0 );
		} );
	} );

	describe( 'vertical navigation (↑ / ↓)', () => {
		it( 'highlightDown jumps by columnCount', () => {
			const items = makeItems( 16 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 1; // row 0, col 1

			nav.highlightDown();

			expect( nav.highlightedIndex.value ).toBe( 5 ); // row 1, col 1
		} );

		it( 'highlightUp retreats by columnCount', () => {
			const items = makeItems( 16 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 9; // row 2, col 1

			nav.highlightUp();

			expect( nav.highlightedIndex.value ).toBe( 5 ); // row 1, col 1
		} );

		it( 'highlightDown clamps to last item when no full row below', () => {
			const items = makeItems( 10 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 7; // row 1, col 3

			nav.highlightDown();

			// Would land at 11, but only 10 items (last index 9)
			expect( nav.highlightedIndex.value ).toBe( 9 );
		} );

		it( 'highlightUp clamps to 0 when above first row', () => {
			const items = makeItems( 16 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 2; // row 0, col 2

			nav.highlightUp();

			expect( nav.highlightedIndex.value ).toBe( 0 );
		} );
	} );

	describe( 'columnCount = 1 (degenerate to 1D)', () => {
		it( 'highlightDown advances by 1', () => {
			const items = makeItems( 8 );
			const cols = ref( 1 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 3;

			nav.highlightDown();

			expect( nav.highlightedIndex.value ).toBe( 4 );
		} );

		it( 'highlightUp retreats by 1', () => {
			const items = makeItems( 8 );
			const cols = ref( 1 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 3;

			nav.highlightUp();

			expect( nav.highlightedIndex.value ).toBe( 2 );
		} );
	} );

	describe( 'reactive columnCount', () => {
		it( 'highlightDown uses the current columnCount value (not a snapshot)', () => {
			const items = makeItems( 16 );
			const cols = ref( 2 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 0;

			cols.value = 4;
			nav.highlightDown();

			expect( nav.highlightedIndex.value ).toBe( 4 );
		} );
	} );

	describe( 'first / last / reset', () => {
		it( 'highlightFirst sets index to 0', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 5;

			nav.highlightFirst();

			expect( nav.highlightedIndex.value ).toBe( 0 );
		} );

		it( 'highlightLast sets index to last', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );

			nav.highlightLast();

			expect( nav.highlightedIndex.value ).toBe( 7 );
		} );

		it( 'resetHighlight returns to -1', () => {
			const items = makeItems( 8 );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 3;

			nav.resetHighlight();

			expect( nav.highlightedIndex.value ).toBe( -1 );
		} );
	} );

	describe( 'empty items', () => {
		it( 'navigation no-ops when items is empty', () => {
			const items = ref( [] );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );

			nav.highlightNext();
			nav.highlightDown();
			nav.highlightFirst();

			expect( nav.highlightedIndex.value ).toBe( -1 );
		} );

		it( 'highlightLast on empty stays at -1', () => {
			const items = ref( [] );
			const cols = ref( 4 );
			const nav = useGridNavigation( items, cols );

			nav.highlightLast();

			expect( nav.highlightedIndex.value ).toBe( -1 );
		} );
	} );

	describe( 'columnCount fallback', () => {
		it( 'treats 0 columnCount as 1', () => {
			const items = makeItems( 8 );
			const cols = ref( 0 );
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 0;

			nav.highlightDown();

			expect( nav.highlightedIndex.value ).toBe( 1 );
		} );

		it( 'treats undefined columnCount as 1', () => {
			const items = makeItems( 8 );
			const cols = ref();
			const nav = useGridNavigation( items, cols );
			nav.highlightedIndex.value = 0;

			nav.highlightDown();

			expect( nav.highlightedIndex.value ).toBe( 1 );
		} );
	} );
} );
