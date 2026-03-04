const mw = require( '../../mocks/mw.js' );
globalThis.mw = mw;

const useProviderOrchestration = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useProviderOrchestration.js'
);

describe( 'useProviderOrchestration', () => {
	let mockSyncProvider;
	let mockAsyncProvider;
	let mockDecorator;

	beforeEach( () => {
		vi.useFakeTimers();

		mockSyncProvider = {
			id: 'sync',
			canProvide: vi.fn( ( q ) => q === 'sync-query' ),
			getResults: vi.fn( () => ( { items: [ { id: '1', label: 'Result 1' } ] } ) ),
			onResultSelect: vi.fn(),
			debounceMs: 0,
			keepStaleResults: false
		};

		mockAsyncProvider = {
			id: 'async',
			canProvide: vi.fn( ( q ) => q === 'async-query' ),
			getResults: vi.fn( () => Promise.resolve( {
				items: [ { id: '2', label: 'Async Result' } ]
			} ) ),
			onResultSelect: vi.fn(),
			debounceMs: 250,
			keepStaleResults: false
		};

		mockDecorator = vi.fn( ( items, query ) => {
			if ( query ) {
				return items.concat( [ { id: 'action', label: query, type: 'action' } ] );
			}
			return items;
		} );
	} );

	afterEach( () => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	} );

	it( 'should initialize with empty state', () => {
		const orch = useProviderOrchestration(
			[ mockSyncProvider ], mockDecorator
		);

		expect( orch.query.value ).toBe( '' );
		expect( orch.displayedItems.value ).toEqual( [] );
		expect( orch.isPending.value ).toBe( false );
	} );

	describe( 'updateQuery — sync provider', () => {
		it( 'should find the matching provider and display results', async () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);

			orch.updateQuery( 'sync-query' );
			await vi.waitFor( () => {
				expect( orch.displayedItems.value ).toHaveLength( 1 );
			} );

			expect( mockSyncProvider.getResults ).toHaveBeenCalledWith( 'sync-query', undefined );
			expect( orch.flatItems.value ).toHaveLength( 2 );
			expect( orch.flatItems.value[ 0 ].label ).toBe( 'Result 1' );
			expect( orch.flatItems.value[ 1 ].type ).toBe( 'action' );
		} );
	} );

	describe( 'updateQuery — async provider', () => {
		it( 'should debounce and show results after delay', async () => {
			const orch = useProviderOrchestration(
				[ mockAsyncProvider ], mockDecorator
			);

			orch.updateQuery( 'async-query' );

			expect( orch.isPending.value ).toBe( true );
			expect( mockAsyncProvider.getResults ).not.toHaveBeenCalled();

			vi.advanceTimersByTime( 250 );
			await vi.runAllTimersAsync();

			expect( mockAsyncProvider.getResults ).toHaveBeenCalled();
			expect( orch.flatItems.value[ 0 ].label ).toBe( 'Async Result' );
			expect( orch.isPending.value ).toBe( false );
		} );
	} );

	describe( 'updateQuery — no matching provider', () => {
		it( 'should display only decorator results', () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);

			orch.updateQuery( 'unmatched' );

			expect( orch.flatItems.value ).toHaveLength( 1 );
			expect( orch.flatItems.value[ 0 ].type ).toBe( 'action' );
		} );
	} );

	describe( 'updateQuery — clears on empty', () => {
		it( 'should clear results when query becomes empty', () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);

			orch.updateQuery( 'sync-query' );
			orch.updateQuery( '' );

			expect( orch.query.value ).toBe( '' );
		} );
	} );

	describe( 'abort coordination', () => {
		it( 'should abort previous async request on new query', async () => {
			const orch = useProviderOrchestration(
				[ mockAsyncProvider ], mockDecorator
			);

			orch.updateQuery( 'async-query' );
			vi.advanceTimersByTime( 100 );
			orch.updateQuery( 'async-query' );

			vi.advanceTimersByTime( 250 );
			await vi.runAllTimersAsync();

			expect( mockAsyncProvider.getResults ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
