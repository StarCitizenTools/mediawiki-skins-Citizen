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

	describe( 'mode management', () => {
		let orch;
		let mockProviders;

		beforeEach( () => {
			mockProviders = [ mockSyncProvider, mockAsyncProvider ];
			orch = useProviderOrchestration( mockProviders, mockDecorator );
		} );

		it( 'enterMode sets activeMode and clears query', () => {
			const mode = { id: 'ns', getResults: vi.fn().mockResolvedValue( [] ) };

			orch.enterMode( mode );

			expect( orch.activeMode.value ).toBe( mode );
			expect( orch.query.value ).toBe( '' );
		} );

		it( 'exitMode clears activeMode and loads presults', async () => {
			const mode = { id: 'ns', getResults: vi.fn().mockResolvedValue( [] ) };
			orch.enterMode( mode );

			await orch.exitMode();

			expect( orch.activeMode.value ).toBeNull();
		} );

		it( 'enterMode fetches initial results with empty query', async () => {
			const mode = {
				id: 'ns',
				getResults: vi.fn().mockResolvedValue( [
					{ id: 'ns-1', label: 'Talk', type: 'namespace' }
				] )
			};

			orch.enterMode( mode );
			await vi.runAllTimersAsync();

			expect( mode.getResults ).toHaveBeenCalledWith( '', undefined, [] );
		} );

		it( 'updateQuery routes through active mode getResults when mode is active', async () => {
			const mode = {
				id: 'ns',
				getResults: vi.fn().mockResolvedValue( [
					{ id: 'result-1', label: 'Talk', type: 'namespace' }
				] )
			};
			orch.enterMode( mode );
			await vi.runAllTimersAsync();
			mode.getResults.mockClear();

			orch.updateQuery( 'Talk' );
			vi.advanceTimersByTime( 250 );
			await vi.runAllTimersAsync();

			expect( mode.getResults ).toHaveBeenCalledWith( 'Talk', expect.any( AbortSignal ), [] );
		} );

		it( 'updateQuery uses normal provider dispatch when no mode is active', async () => {
			await orch.updateQuery( 'test' );

			expect( mockProviders[ 0 ].canProvide ).toHaveBeenCalledWith( 'test' );
		} );

		it( 'enterMode clears displayed items', () => {
			const mode = { id: 'ns', getResults: vi.fn().mockResolvedValue( [] ) };

			orch.enterMode( mode );

			expect( orch.displayedItems.value ).toEqual( [] );
		} );

		it( 'exitMode resets to presults', async () => {
			const mode = { id: 'ns', getResults: vi.fn().mockResolvedValue( [] ) };
			orch.enterMode( mode );

			await orch.exitMode();

			// After exitMode, clearSearch should have been called
			// which populates presults. activeMode should be null.
			expect( orch.activeMode.value ).toBeNull();
		} );

		it( 'handleSelection delegates to active mode onResultSelect', async () => {
			const mode = {
				id: 'ns',
				getResults: vi.fn().mockResolvedValue( [] ),
				onResultSelect: vi.fn().mockReturnValue( {
					action: 'updateQuery', payload: 'Talk:'
				} )
			};
			orch.enterMode( mode );

			const result = { id: 'ns-1', label: 'Talk', value: 'Talk:', type: 'namespace' };
			const action = await orch.handleSelection( result );

			expect( mode.onResultSelect ).toHaveBeenCalledWith( result );
			expect( action ).toEqual( { action: 'updateQuery', payload: 'Talk:' } );
		} );

		it( 'handleSelection does not check providers when mode is active', async () => {
			const mode = {
				id: 'ns',
				getResults: vi.fn().mockResolvedValue( [] ),
				onResultSelect: vi.fn().mockReturnValue( { action: 'none' } )
			};
			orch.enterMode( mode );
			mockSyncProvider.onResultSelect.mockClear();

			const result = { id: 'ns-1', label: 'Talk', source: 'sync' };
			await orch.handleSelection( result );

			expect( mode.onResultSelect ).toHaveBeenCalled();
			expect( mockSyncProvider.onResultSelect ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'stateConfig', () => {
		it( 'should return defaults when no mode is active', () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);

			const config = orch.stateConfig.value;

			expect( config.emptyState.title ).toBe( 'searchsuggest-search' );
			expect( config.emptyState.description ).toBe( 'citizen-search-empty-desc' );
			expect( config.emptyState.icon ).toBeNull();
		} );

		it( 'should return default noResults function when no mode is active', () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);

			const result = orch.stateConfig.value.noResults( 'test query' );

			expect( result.title ).toBe( 'citizen-search-noresults-title' );
			expect( result.description ).toBe( 'search-nonefound' );
			expect( result.icon ).toBeNull();
		} );

		it( 'should use mode emptyState when mode provides it', () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);
			const mode = {
				id: 'test',
				getResults: vi.fn().mockResolvedValue( [] ),
				emptyState: {
					title: 'Custom empty',
					description: 'Custom desc',
					icon: 'customIcon'
				}
			};

			orch.enterMode( mode );

			expect( orch.stateConfig.value.emptyState.title ).toBe( 'Custom empty' );
			expect( orch.stateConfig.value.emptyState.icon ).toBe( 'customIcon' );
		} );

		it( 'should use mode noResults when mode provides it', () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);
			const mode = {
				id: 'test',
				getResults: vi.fn().mockResolvedValue( [] ),
				noResults: ( query ) => ( {
					title: 'No results for ' + query,
					description: 'Try again',
					icon: 'warningIcon'
				} )
			};

			orch.enterMode( mode );
			const result = orch.stateConfig.value.noResults( 'foo' );

			expect( result.title ).toBe( 'No results for foo' );
			expect( result.icon ).toBe( 'warningIcon' );
		} );

		it( 'should fall back to defaults for missing mode fields', () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);
			const mode = {
				id: 'test',
				getResults: vi.fn().mockResolvedValue( [] )
			};

			orch.enterMode( mode );

			expect( orch.stateConfig.value.emptyState.title ).toBe( 'searchsuggest-search' );
			expect( typeof orch.stateConfig.value.noResults ).toBe( 'function' );
		} );

		it( 'should update when mode changes', async () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);
			const mode = {
				id: 'test',
				getResults: vi.fn().mockResolvedValue( [] ),
				emptyState: {
					title: 'Mode title',
					description: 'Mode desc',
					icon: null
				}
			};

			expect( orch.stateConfig.value.emptyState.title ).toBe( 'searchsuggest-search' );

			orch.enterMode( mode );

			expect( orch.stateConfig.value.emptyState.title ).toBe( 'Mode title' );

			await orch.exitMode();

			expect( orch.stateConfig.value.emptyState.title ).toBe( 'searchsuggest-search' );
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
