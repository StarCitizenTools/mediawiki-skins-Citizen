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

			expect( mode.getResults ).toHaveBeenCalledWith( '', undefined, [], [] );
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

			expect( mode.getResults ).toHaveBeenCalledWith( 'Talk', expect.any( AbortSignal ), [], [] );
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
					action: 'exitWithQuery', payload: 'Talk:'
				} )
			};
			orch.enterMode( mode );

			const result = { id: 'ns-1', label: 'Talk', value: 'Talk:', type: 'namespace' };
			const action = await orch.handleSelection( result );

			expect( mode.onResultSelect ).toHaveBeenCalledWith( result );
			expect( action ).toEqual( { action: 'exitWithQuery', payload: 'Talk:' } );
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

	describe( 'mode context', () => {
		const stubMode = ( id, getResults ) => ( {
			id,
			getResults: getResults || vi.fn().mockResolvedValue( [] )
		} );

		it( 'initialises activeModeContext to empty array', () => {
			const orch = useProviderOrchestration( [], mockDecorator );

			expect( orch.activeModeContext.value ).toEqual( [] );
		} );

		it( 'enterMode resets activeModeContext', async () => {
			const orch = useProviderOrchestration( [], mockDecorator );
			orch.enterMode( stubMode( 'm' ) );
			orch.pushModeContext( { name: 'A' } );
			orch.enterMode( stubMode( 'm2' ) );
			await vi.runAllTimersAsync();

			expect( orch.activeModeContext.value ).toEqual( [] );
		} );

		it( 'exitMode clears activeModeContext', async () => {
			const orch = useProviderOrchestration( [], mockDecorator );
			orch.enterMode( stubMode( 'm' ) );
			orch.pushModeContext( { name: 'A' } );
			orch.exitMode();
			await vi.runAllTimersAsync();

			expect( orch.activeModeContext.value ).toEqual( [] );
		} );

		it( 'pushModeContext appends and clears query', async () => {
			const orch = useProviderOrchestration( [], mockDecorator );
			orch.enterMode( stubMode( 'm' ) );
			orch.updateQuery( 'foo' );
			orch.pushModeContext( { name: 'A' } );
			orch.pushModeContext( { name: 'B' } );
			await vi.runAllTimersAsync();

			expect( orch.activeModeContext.value ).toEqual(
				[ { name: 'A' }, { name: 'B' } ]
			);
			expect( orch.query.value ).toBe( '' );
		} );

		it( 'popModeContext removes last entry', async () => {
			const orch = useProviderOrchestration( [], mockDecorator );
			orch.enterMode( stubMode( 'm' ) );
			orch.pushModeContext( { name: 'A' } );
			orch.pushModeContext( { name: 'B' } );
			orch.popModeContext();
			await vi.runAllTimersAsync();

			expect( orch.activeModeContext.value ).toEqual( [ { name: 'A' } ] );
		} );

		it( 'popModeContext is a no-op when stack is empty', async () => {
			const orch = useProviderOrchestration( [], mockDecorator );
			orch.enterMode( stubMode( 'm' ) );
			orch.popModeContext();
			await vi.runAllTimersAsync();

			expect( orch.activeModeContext.value ).toEqual( [] );
		} );

		it( 'pushModeContext is a no-op when no mode is active', () => {
			const orch = useProviderOrchestration( [], mockDecorator );
			orch.pushModeContext( { name: 'A' } );

			expect( orch.activeModeContext.value ).toEqual( [] );
		} );

		it( 'passes activeModeContext as 4th arg to mode.getResults', async () => {
			const getResults = vi.fn().mockResolvedValue( [] );
			const orch = useProviderOrchestration( [], mockDecorator );
			orch.enterMode( stubMode( 'm', getResults ) );
			orch.pushModeContext( { name: 'A' } );
			await vi.runAllTimersAsync();

			const lastCall = getResults.mock.calls[ getResults.mock.calls.length - 1 ];
			expect( lastCall[ 3 ] ).toEqual( [ { name: 'A' } ] );
		} );
	} );

	describe( 'help overlay', () => {
		it( 'starts hidden', () => {
			const orch = useProviderOrchestration( [], mockDecorator );

			expect( orch.helpVisible.value ).toBe( false );
		} );

		it( 'openHelp loads the catalog into displayedItems at root', () => {
			const catalogItems = [
				{ id: 'cmd-a', source: 'command:a' },
				{ id: 'cmd-b', source: 'command:b' }
			];
			const getHelpCatalogItems = vi.fn( () => catalogItems );
			const orch = useProviderOrchestration( [], mockDecorator, { getHelpCatalogItems } );

			orch.openHelp();

			expect( orch.helpVisible.value ).toBe( true );
			expect( orch.displayedItems.value ).toHaveLength( 1 );
			expect( orch.displayedItems.value[ 0 ].heading ).toBe( 'citizen-command-palette-help-section-modes' );
			expect( orch.displayedItems.value[ 0 ].items ).toEqual( catalogItems );
		} );

		it( 'openHelp inside an active mode preserves the mode and does not load the catalog', async () => {
			const getHelpCatalogItems = vi.fn( () => [] );
			const mode = {
				id: 'cat',
				triggers: [ '#' ],
				getResults: vi.fn( () => [ { id: 'r1', label: 'In-mode result' } ] )
			};
			const orch = useProviderOrchestration( [], mockDecorator, { getHelpCatalogItems } );

			orch.enterMode( mode );
			await vi.runAllTimersAsync();
			orch.openHelp();

			expect( orch.helpVisible.value ).toBe( true );
			expect( orch.activeMode.value ).toBe( mode );
			expect( getHelpCatalogItems ).not.toHaveBeenCalled();
		} );

		it( 'closeHelp at root with no query restores presults via clearSearch', () => {
			const recentItems = [ { id: 'recent-1', url: '/Recent', source: 'recent' } ];
			const orch = useProviderOrchestration( [], mockDecorator, {
				getHelpCatalogItems: () => [ { id: 'cmd', source: 'command:x' } ],
				recentItemsProvider: { getResults: () => ( { items: recentItems } ) }
			} );

			orch.openHelp();
			orch.closeHelp();

			expect( orch.helpVisible.value ).toBe( false );
			expect( orch.displayedItems.value ).toEqual( [
				{ heading: 'citizen-command-palette-heading-recent', items: recentItems }
			] );
		} );

		it( 'closeHelp inside an active mode preserves activeMode and modeContext', async () => {
			const mode = {
				id: 'cat',
				triggers: [ '#' ],
				getResults: vi.fn( () => [ { id: 'r1', label: 'A' } ] )
			};
			const orch = useProviderOrchestration( [], mockDecorator, {
				getHelpCatalogItems: () => []
			} );

			orch.enterMode( mode );
			await vi.runAllTimersAsync();
			orch.pushModeContext( { name: 'Animals' } );
			await vi.runAllTimersAsync();

			orch.openHelp();
			orch.closeHelp();

			expect( orch.helpVisible.value ).toBe( false );
			expect( orch.activeMode.value ).toBe( mode );
			expect( orch.activeModeContext.value ).toEqual( [ { name: 'Animals' } ] );
		} );

		it( 'toggleHelp flips the flag both directions', () => {
			const orch = useProviderOrchestration( [], mockDecorator, {
				getHelpCatalogItems: () => []
			} );

			orch.toggleHelp();
			expect( orch.helpVisible.value ).toBe( true );

			orch.toggleHelp();
			expect( orch.helpVisible.value ).toBe( false );
		} );

		it( 'open/close are idempotent', () => {
			const orch = useProviderOrchestration( [], mockDecorator, {
				getHelpCatalogItems: vi.fn( () => [ { id: 'a', source: 'command:a' } ] )
			} );

			orch.openHelp();
			orch.openHelp();
			expect( orch.helpVisible.value ).toBe( true );

			orch.closeHelp();
			orch.closeHelp();
			expect( orch.helpVisible.value ).toBe( false );
		} );

		it( 'updateQuery does not overwrite the help catalog while help is visible', () => {
			// Regression: selecting `/help` calls openHelp, then tokenInput.clear()
			// triggers the fullQuery watcher, which calls updateQuery(''). Without
			// the helpVisible guard, clearSearch overwrites the catalog with recents.
			const catalogItems = [ { id: 'cmd-a', source: 'command:a' } ];
			const recentItems = [ { id: 'r1', url: '/R', source: 'recent' } ];
			const orch = useProviderOrchestration( [], mockDecorator, {
				getHelpCatalogItems: () => catalogItems,
				recentItemsProvider: { getResults: () => ( { items: recentItems } ) }
			} );

			orch.updateQuery( '/help' );
			orch.openHelp();
			orch.updateQuery( '' );

			expect( orch.helpVisible.value ).toBe( true );
			expect( orch.displayedItems.value ).toHaveLength( 1 );
			expect( orch.displayedItems.value[ 0 ].items ).toEqual( catalogItems );
		} );

		it( 'closeHelp at root with empty query restores presults', async () => {
			const recentItems = [ { id: 'r1', url: '/R', source: 'recent' } ];
			const orch = useProviderOrchestration( [], mockDecorator, {
				getHelpCatalogItems: () => [ { id: 'cmd-a', source: 'command:a' } ],
				recentItemsProvider: { getResults: () => ( { items: recentItems } ) }
			} );

			orch.openHelp();
			orch.closeHelp();

			expect( orch.helpVisible.value ).toBe( false );
			expect( orch.displayedItems.value ).toEqual( [
				{ heading: 'citizen-command-palette-heading-recent', items: recentItems }
			] );
		} );
	} );

	describe( 'requestItemDetail', () => {
		// Build a mode with a getItemDetail mock and pre-load it as activeMode
		// with a known list of items in displayedItems.
		function setupModeWithItems( items, getItemDetailImpl ) {
			const mode = {
				id: 'file',
				getResults: vi.fn().mockResolvedValue( items ),
				getItemDetail: vi.fn( getItemDetailImpl )
			};
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);
			orch.enterMode( mode );
			return { orch, mode };
		}

		it( 'is a no-op when there is no active mode', () => {
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);

			expect( () => orch.requestItemDetail( { id: '1' } ) ).not.toThrow();
		} );

		it( 'is a no-op when the active mode does not declare getItemDetail', () => {
			const mode = {
				id: 'plain',
				getResults: vi.fn().mockResolvedValue( [] )
			};
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);
			orch.enterMode( mode );

			expect( () => orch.requestItemDetail( { id: '1' } ) ).not.toThrow();
		} );

		it( 'is a no-op when item is null/undefined', () => {
			const { orch, mode } = setupModeWithItems(
				[ { id: '1', detail: { header: {} } } ],
				() => Promise.resolve( { description: 'x', pairs: [] } )
			);

			orch.requestItemDetail( null );
			vi.advanceTimersByTime( 100 );

			expect( mode.getItemDetail ).not.toHaveBeenCalled();
		} );

		it( 'calls mode.getItemDetail after the detail debounce and mutates item.detail', async () => {
			const { orch, mode } = setupModeWithItems(
				[ { id: '1', detail: { header: { label: 'F' } } } ],
				() => Promise.resolve( {
					description: 'PNG image',
					pairs: [ { key: 'size', label: 'Size', value: '1 KB' } ]
				} )
			);
			await vi.runAllTimersAsync();
			// App.vue passes the live (proxied) item from flatItems; doing
			// the same here ensures the staleness identity check matches.
			const item = orch.flatItems.value[ 0 ];

			orch.requestItemDetail( item );
			expect( mode.getItemDetail ).not.toHaveBeenCalled();

			vi.advanceTimersByTime( 80 );
			await vi.runAllTimersAsync();

			expect( mode.getItemDetail ).toHaveBeenCalledTimes( 1 );
			expect( mode.getItemDetail ).toHaveBeenCalledWith( item, expect.any( AbortSignal ) );
			expect( item.detail.header.description ).toBe( 'PNG image' );
			expect( item.detail.pairs ).toEqual( [
				{ key: 'size', label: 'Size', value: '1 KB' }
			] );
		} );

		it( 'aborts a prior in-flight detail fetch when called again with a different item', async () => {
			const seenSignals = [];
			const { orch, mode } = setupModeWithItems(
				[
					{ id: '1', detail: { header: {} } },
					{ id: '2', detail: { header: {} } }
				],
				( _item, signal ) => {
					seenSignals.push( signal );
					// Resolve only the second call; leave the first hanging until aborted.
					return seenSignals.length === 1 ?
						new Promise( () => {} ) :
						Promise.resolve( { description: 'd', pairs: [] } );
				}
			);
			await vi.runAllTimersAsync();
			const item1 = orch.flatItems.value[ 0 ];
			const item2 = orch.flatItems.value[ 1 ];

			orch.requestItemDetail( item1 );
			vi.advanceTimersByTime( 80 );
			await vi.runAllTimersAsync();

			orch.requestItemDetail( item2 );
			vi.advanceTimersByTime( 80 );
			await vi.runAllTimersAsync();

			expect( mode.getItemDetail ).toHaveBeenCalledTimes( 2 );
			expect( seenSignals[ 0 ].aborted ).toBe( true );
			expect( seenSignals[ 1 ].aborted ).toBe( false );
		} );

		it( 'drops a stale result when the item has been replaced in flatItems', async () => {
			let resolveDetail;
			const orch = useProviderOrchestration(
				[ mockSyncProvider ], mockDecorator
			);
			const mode = {
				id: 'file',
				getResults: vi.fn().mockResolvedValue( [
					{ id: 'a', detail: { header: {} } }
				] ),
				getItemDetail: vi.fn( () => new Promise( ( resolve ) => {
					resolveDetail = resolve;
				} ) )
			};
			orch.enterMode( mode );
			await vi.runAllTimersAsync();

			const captured = orch.flatItems.value[ 0 ];
			orch.requestItemDetail( captured );
			vi.advanceTimersByTime( 80 );
			await vi.runAllTimersAsync();

			// Replace the items array (simulates a list refresh from a new query).
			mode.getResults.mockResolvedValueOnce( [
				{ id: 'b', detail: { header: {} } }
			] );
			orch.updateQuery( 'b' );
			vi.advanceTimersByTime( 250 );
			await vi.runAllTimersAsync();

			// updateQuery's resetDetailState() aborts the in-flight signal,
			// so the lifecycle's finally block already cleared it. The
			// resolution we trigger here arrives at a no-op onResult because
			// isStale is true (captured no longer in flatItems).
			resolveDetail( { description: 'late', pairs: [ { key: 'k', label: 'L', value: 'V' } ] } );
			await vi.runAllTimersAsync();

			expect( captured.detail.header.description ).toBeUndefined();
			expect( captured.detail.pairs ).toBeUndefined();
		} );

		it( 'enterMode resets the detail lifecycle (aborts in-flight fetch)', async () => {
			let seenSignal;
			const { orch, mode } = setupModeWithItems(
				[ { id: '1', detail: { header: {} } } ],
				( _item, signal ) => {
					seenSignal = signal;
					return new Promise( () => {} ); // never resolves
				}
			);
			await vi.runAllTimersAsync();
			const item = orch.flatItems.value[ 0 ];

			orch.requestItemDetail( item );
			vi.advanceTimersByTime( 80 );
			await vi.runAllTimersAsync();

			expect( seenSignal.aborted ).toBe( false );

			orch.enterMode( Object.assign( {}, mode, { id: 'other' } ) );

			expect( seenSignal.aborted ).toBe( true );
		} );

		it( 'exitMode resets the detail lifecycle (aborts in-flight fetch)', async () => {
			let seenSignal;
			const { orch } = setupModeWithItems(
				[ { id: '1', detail: { header: {} } } ],
				( _item, signal ) => {
					seenSignal = signal;
					return new Promise( () => {} );
				}
			);
			await vi.runAllTimersAsync();
			const item = orch.flatItems.value[ 0 ];

			orch.requestItemDetail( item );
			vi.advanceTimersByTime( 80 );
			await vi.runAllTimersAsync();

			expect( seenSignal.aborted ).toBe( false );

			orch.exitMode();

			expect( seenSignal.aborted ).toBe( true );
		} );

		it( 'logs and leaves item.detail untouched when getItemDetail rejects', async () => {
			mw.log.error.mockClear();
			const { orch } = setupModeWithItems(
				[ { id: '1', detail: { header: { label: 'F' } } } ],
				() => Promise.reject( new Error( 'boom' ) )
			);
			await vi.runAllTimersAsync();
			const item = orch.flatItems.value[ 0 ];

			orch.requestItemDetail( item );
			vi.advanceTimersByTime( 80 );
			await vi.runAllTimersAsync();

			expect( mw.log.error ).toHaveBeenCalled();
			expect( item.detail.header.description ).toBeUndefined();
			expect( item.detail.pairs ).toBeUndefined();
		} );
	} );
} );
