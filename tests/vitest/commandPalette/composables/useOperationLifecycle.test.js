// @vitest-environment jsdom

const { ref } = require( 'vue' );

const useOperationLifecycle = require(
	'../../../../resources/skins.citizen.commandPalette/composables/useOperationLifecycle.js'
);

beforeEach( () => {
	vi.useFakeTimers();
} );

afterEach( () => {
	vi.useRealTimers();
} );

describe( 'useOperationLifecycle', () => {
	describe( 'runDebouncedAbortable — happy path', () => {
		it( 'sets isPending immediately and clears it on success', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( { isPending, showPending } );

			const onResult = vi.fn();
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => false,
				run: () => Promise.resolve( [ { id: 1 } ] ),
				onResult,
				onError: vi.fn()
			} );

			expect( isPending.value ).toBe( true );

			await vi.advanceTimersByTimeAsync( 100 );
			

			expect( onResult ).toHaveBeenCalledWith( [ { id: 1 } ] );
			expect( isPending.value ).toBe( false );
		} );

		it( 'sets showPending after the configured delay if still pending', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( {
				isPending,
				showPending,
				pendingDelayMs: 200
			} );

			lifecycle.runDebouncedAbortable( {
				debounceMs: 1000,
				isStale: () => false,
				run: () => Promise.resolve( [] ),
				onResult: vi.fn(),
				onError: vi.fn()
			} );

			expect( showPending.value ).toBe( false );
			await vi.advanceTimersByTimeAsync( 200 );
			expect( showPending.value ).toBe( true );

			// Let the operation complete; showPending clears.
			await vi.advanceTimersByTimeAsync( 1000 );
			
			expect( showPending.value ).toBe( false );
		} );

		it( 'does not set showPending if the operation finishes before the delay', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( {
				isPending,
				showPending,
				pendingDelayMs: 500
			} );

			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => false,
				run: () => Promise.resolve( [] ),
				onResult: vi.fn(),
				onError: vi.fn()
			} );

			await vi.advanceTimersByTimeAsync( 100 );
			

			expect( showPending.value ).toBe( false );
			// Even if the delay timer fires later, isPending is already false.
			await vi.advanceTimersByTimeAsync( 500 );
			expect( showPending.value ).toBe( false );
		} );

		it( 'passes the AbortSignal to the run function', () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( { isPending, showPending } );

			const run = vi.fn( () => Promise.resolve( [] ) );
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => false,
				run,
				onResult: vi.fn(),
				onError: vi.fn()
			} );

			vi.advanceTimersByTime( 100 );

			const signal = run.mock.calls[ 0 ][ 0 ];
			expect( signal ).toBeDefined();
			expect( typeof signal.aborted ).toBe( 'boolean' );
		} );
	} );

	describe( 'runDebouncedAbortable — staleness', () => {
		it( 'short-circuits before running if isStale returns true', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( { isPending, showPending } );

			const run = vi.fn();
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => true,
				run,
				onResult: vi.fn(),
				onError: vi.fn()
			} );

			await vi.advanceTimersByTimeAsync( 100 );
			

			expect( run ).not.toHaveBeenCalled();
			expect( isPending.value ).toBe( false );
		} );

		it( 'leaves isPending alone when the stale result is discarded — the spinner stays on for the operation that superseded us', async () => {
			// Pins the contract: when isStale flips true after run resolves,
			// the lifecycle does NOT clear isPending. The orchestrator only
			// supersedes operations via reset() or a fresh
			// runDebouncedAbortable, both of which manage isPending
			// themselves. Clearing it here would flicker the spinner off
			// between superseded and current operations.
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( { isPending, showPending } );

			let staleness = false;
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => staleness,
				run: () => {
					staleness = true;
					return Promise.resolve( [] );
				},
				onResult: vi.fn(),
				onError: vi.fn()
			} );

			expect( isPending.value ).toBe( true );

			await vi.advanceTimersByTimeAsync( 100 );

			expect( isPending.value ).toBe( true );
		} );

		it( 'discards the result if isStale becomes true after run resolves', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( { isPending, showPending } );

			let staleness = false;
			const onResult = vi.fn();
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => staleness,
				run: () => {
					// Simulate the world moving on while the request is in flight.
					staleness = true;
					return Promise.resolve( [ { id: 1 } ] );
				},
				onResult,
				onError: vi.fn()
			} );

			await vi.advanceTimersByTimeAsync( 100 );
			

			expect( onResult ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'runDebouncedAbortable — abort', () => {
		it( 'aborts a prior in-flight controller when a new operation starts', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( { isPending, showPending } );

			let firstSignal;
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => false,
				run: ( signal ) => {
					firstSignal = signal;
					return new Promise( ( resolve ) => setTimeout( () => resolve( [] ), 1000 ) );
				},
				onResult: vi.fn(),
				onError: vi.fn()
			} );

			vi.advanceTimersByTime( 100 );
			expect( firstSignal.aborted ).toBe( false );

			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => false,
				run: () => Promise.resolve( [] ),
				onResult: vi.fn(),
				onError: vi.fn()
			} );

			expect( firstSignal.aborted ).toBe( true );
		} );

		it( 'silently swallows AbortError from the run function', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( { isPending, showPending } );

			const onError = vi.fn();
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => false,
				run: () => {
					const err = new Error( 'aborted' );
					err.name = 'AbortError';
					return Promise.reject( err );
				},
				onResult: vi.fn(),
				onError
			} );

			await vi.advanceTimersByTimeAsync( 100 );
			

			expect( onError ).not.toHaveBeenCalled();
		} );

		it( 'invokes onError for non-AbortError exceptions', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( { isPending, showPending } );

			const onError = vi.fn();
			const err = new Error( 'network unreachable' );
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => false,
				run: () => Promise.reject( err ),
				onResult: vi.fn(),
				onError
			} );

			await vi.advanceTimersByTimeAsync( 100 );
			

			expect( onError ).toHaveBeenCalledWith( err );
		} );
	} );

	describe( 'reset', () => {
		it( 'clears pending flags and aborts the in-flight controller', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( {
				isPending,
				showPending,
				pendingDelayMs: 200
			} );

			let signal;
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => false,
				run: ( s ) => {
					signal = s;
					return new Promise( () => {} );
				},
				onResult: vi.fn(),
				onError: vi.fn()
			} );

			vi.advanceTimersByTime( 100 );
			expect( isPending.value ).toBe( true );

			lifecycle.reset();

			expect( isPending.value ).toBe( false );
			expect( showPending.value ).toBe( false );
			expect( signal.aborted ).toBe( true );
		} );

		it( 'cancels a debounce timer that has not yet fired', async () => {
			const isPending = ref( false );
			const showPending = ref( false );
			const lifecycle = useOperationLifecycle( { isPending, showPending } );

			const run = vi.fn();
			lifecycle.runDebouncedAbortable( {
				debounceMs: 100,
				isStale: () => false,
				run,
				onResult: vi.fn(),
				onError: vi.fn()
			} );

			lifecycle.reset();
			await vi.advanceTimersByTimeAsync( 200 );

			expect( run ).not.toHaveBeenCalled();
		} );

		it( 'is idempotent — calling reset twice does not throw', () => {
			const lifecycle = useOperationLifecycle( {
				isPending: ref( false ),
				showPending: ref( false )
			} );

			expect( () => {
				lifecycle.reset();
				lifecycle.reset();
			} ).not.toThrow();
		} );
	} );
} );
