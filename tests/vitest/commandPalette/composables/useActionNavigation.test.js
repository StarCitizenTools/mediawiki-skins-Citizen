const { ref } = require( 'vue' );

const useActionNavigation = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useActionNavigation.js'
);

function makeRowComponent() {
	return {
		focusFirstButton: vi.fn(),
		focusButtonAtIndex: vi.fn(),
		clickButtonAtIndex: vi.fn()
	};
}

function setup( { items = [], highlighted = -1, refs = new Map() } = {} ) {
	const itemsRef = ref( items );
	const highlightedIndex = ref( highlighted );
	const itemRefs = ref( refs );
	const nav = useActionNavigation( { items: itemsRef, highlightedIndex, itemRefs } );

	return { nav, itemsRef, highlightedIndex, itemRefs };
}

describe( 'useActionNavigation', () => {
	it( 'starts inactive with focusedIndex -1', () => {
		const { nav } = setup();

		expect( nav.focusedIndex.value ).toBe( -1 );
		expect( nav.isActive.value ).toBe( false );
	} );

	describe( 'focusFirst', () => {
		it( 'calls focusFirstButton on the highlighted row and moves focusedIndex to 0', () => {
			const row = makeRowComponent();
			const { nav } = setup( {
				items: [ { actions: [ {}, {} ] } ],
				highlighted: 0,
				refs: new Map( [ [ 0, row ] ] )
			} );

			nav.focusFirst();

			expect( row.focusFirstButton ).toHaveBeenCalledOnce();
			expect( nav.focusedIndex.value ).toBe( 0 );
			expect( nav.isActive.value ).toBe( true );
		} );

		it( 'is a no-op when no row component is available', () => {
			const { nav } = setup( { highlighted: 0 } );

			nav.focusFirst();

			expect( nav.focusedIndex.value ).toBe( -1 );
		} );

		it( 'is a no-op when the row component lacks focusFirstButton', () => {
			const incomplete = { /* no focusFirstButton */ };
			const { nav } = setup( {
				items: [ { actions: [ {} ] } ],
				highlighted: 0,
				refs: new Map( [ [ 0, incomplete ] ] )
			} );

			nav.focusFirst();

			expect( nav.focusedIndex.value ).toBe( -1 );
		} );
	} );

	describe( 'focusNext', () => {
		it( 'moves to the next button and calls focusButtonAtIndex', () => {
			const row = makeRowComponent();
			const { nav } = setup( {
				items: [ { actions: [ {}, {}, {} ] } ],
				highlighted: 0,
				refs: new Map( [ [ 0, row ] ] )
			} );
			nav.focusedIndex.value = 0;

			nav.focusNext();

			expect( nav.focusedIndex.value ).toBe( 1 );
			expect( row.focusButtonAtIndex ).toHaveBeenCalledWith( 1 );
		} );

		it( 'does not advance past the last action', () => {
			const row = makeRowComponent();
			const { nav } = setup( {
				items: [ { actions: [ {}, {} ] } ],
				highlighted: 0,
				refs: new Map( [ [ 0, row ] ] )
			} );
			nav.focusedIndex.value = 1;

			nav.focusNext();

			expect( nav.focusedIndex.value ).toBe( 1 );
			expect( row.focusButtonAtIndex ).not.toHaveBeenCalled();
		} );

		it( 'treats a row without an actions array as zero actions', () => {
			const row = makeRowComponent();
			const { nav } = setup( {
				items: [ { /* no actions */ } ],
				highlighted: 0,
				refs: new Map( [ [ 0, row ] ] )
			} );

			nav.focusNext();

			expect( nav.focusedIndex.value ).toBe( -1 );
		} );
	} );

	describe( 'focusPrevious', () => {
		it( 'decrements focusedIndex and calls focusButtonAtIndex', () => {
			const row = makeRowComponent();
			const { nav } = setup( {
				items: [ { actions: [ {}, {}, {} ] } ],
				highlighted: 0,
				refs: new Map( [ [ 0, row ] ] )
			} );
			nav.focusedIndex.value = 2;

			nav.focusPrevious();

			expect( nav.focusedIndex.value ).toBe( 1 );
			expect( row.focusButtonAtIndex ).toHaveBeenCalledWith( 1 );
		} );

		it( 'snaps to -1 (deactivates) when called from index 0', () => {
			const row = makeRowComponent();
			const { nav } = setup( {
				items: [ { actions: [ {}, {} ] } ],
				highlighted: 0,
				refs: new Map( [ [ 0, row ] ] )
			} );
			nav.focusedIndex.value = 0;

			nav.focusPrevious();

			expect( nav.focusedIndex.value ).toBe( -1 );
			expect( row.focusButtonAtIndex ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'deactivate', () => {
		it( 'resets focusedIndex to -1', () => {
			const { nav } = setup();
			nav.focusedIndex.value = 2;

			nav.deactivate();

			expect( nav.focusedIndex.value ).toBe( -1 );
			expect( nav.isActive.value ).toBe( false );
		} );
	} );

	describe( 'clickFocused', () => {
		it( 'dispatches a click on the row at focusedIndex', () => {
			const row = makeRowComponent();
			const { nav } = setup( {
				items: [ { actions: [ {}, {} ] } ],
				highlighted: 0,
				refs: new Map( [ [ 0, row ] ] )
			} );
			nav.focusedIndex.value = 1;

			nav.clickFocused();

			expect( row.clickButtonAtIndex ).toHaveBeenCalledWith( 1 );
		} );

		it( 'is a no-op when no row component is available', () => {
			const { nav } = setup( { highlighted: 0 } );
			nav.focusedIndex.value = 0;

			nav.clickFocused();

			// Nothing to assert; the no-op should not throw.
			expect( nav.focusedIndex.value ).toBe( 0 );
		} );
	} );
} );
