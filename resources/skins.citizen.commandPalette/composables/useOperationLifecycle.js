/**
 * Debounce + abort + pending coordination for async dispatch. Each
 * call to `runDebouncedAbortable` cancels the prior in-flight
 * controller, schedules the new operation after `debounceMs`, and
 * tracks pending state on the supplied refs.
 *
 *  - `isPending` flips to `true` immediately and stays true until the
 *    operation resolves, errors, or is cancelled. `showPending` flips
 *    on after `pendingDelayMs` so brief operations don't flash a
 *    spinner.
 *  - The caller supplies an `isStale()` predicate. It is called both
 *    before the operation runs (to short-circuit if the world has
 *    moved on) and after (to decide whether to apply the result).
 *  - Errors with `name === 'AbortError'` are swallowed silently; all
 *    others are passed to `onError` so callers control their own log
 *    prefix.
 *
 * @param {Object} options
 * @param {import('vue').Ref<boolean>} options.isPending Reactive flag flipped to true while an operation is in flight.
 * @param {import('vue').Ref<boolean>} options.showPending Reactive flag flipped to true after `pendingDelayMs` if the operation is still in flight (for spinner-style UI).
 * @param {number} [options.pendingDelayMs=300] Delay before `showPending` flips on, so brief operations don't flash a spinner.
 * @return {{ reset: Function, runDebouncedAbortable: Function }}
 */
function useOperationLifecycle( { isPending, showPending, pendingDelayMs = 300 } ) {
	let debounceTimeout = null;
	let pendingDelayTimeout = null;
	let abortController = null;

	/**
	 * Cancel any in-flight operation and reset pending state.
	 *
	 * Called by the orchestrator when a navigation or mode change makes
	 * the current operation irrelevant (e.g. enterMode, exitMode, query
	 * cleared by Esc).
	 */
	function reset() {
		clearTimeout( debounceTimeout );
		debounceTimeout = null;
		clearTimeout( pendingDelayTimeout );
		pendingDelayTimeout = null;
		isPending.value = false;
		showPending.value = false;

		if ( abortController ) {
			abortController.abort();
			abortController = null;
		}
	}

	/**
	 * Run an async operation with debounce + abort + pending coordination.
	 *
	 * @param {Object} task
	 * @param {number} task.debounceMs Debounce duration in milliseconds.
	 * @param {Function} task.isStale Predicate `() => boolean`. Called both
	 *   before the operation runs (to short-circuit if the world has
	 *   moved on) and after (to decide whether to apply the result).
	 *   Implementations typically check `query.value === currentQuery
	 *   && activeMode.value === capturedMode`.
	 * @param {Function} task.run Async function `(signal) => Promise<*>`.
	 *   Receives the AbortController's signal so the operation can
	 *   cancel its own work (e.g. fetch).
	 * @param {Function} task.onResult Called with the awaited result if
	 *   `isStale()` is still false.
	 * @param {Function} task.onError Called with the caught error
	 *   (excluding AbortError, which is silently swallowed). Fires
	 *   regardless of `isStale()` — callers must check staleness
	 *   inside their handler before applying side effects.
	 */
	function runDebouncedAbortable( task ) {
		const { debounceMs, isStale, run, onResult, onError } = task;

		isPending.value = true;

		clearTimeout( pendingDelayTimeout );
		pendingDelayTimeout = setTimeout( () => {
			if ( isPending.value && !isStale() ) {
				showPending.value = true;
			}
		}, pendingDelayMs );

		clearTimeout( debounceTimeout );

		if ( abortController ) {
			abortController.abort();
		}
		abortController = new AbortController();
		const signal = abortController.signal;

		debounceTimeout = setTimeout( async () => {
			if ( isStale() ) {
				isPending.value = false;
				showPending.value = false;
				return;
			}

			try {
				const result = await run( signal );
				if ( !isStale() ) {
					onResult( result );
				}
			} catch ( error ) {
				if ( error && error.name !== 'AbortError' ) {
					onError( error );
				}
			} finally {
				if ( !isStale() ) {
					isPending.value = false;
					showPending.value = false;
					clearTimeout( pendingDelayTimeout );
					pendingDelayTimeout = null;
				}
			}
		}, debounceMs );
	}

	return { reset, runDebouncedAbortable };
}

module.exports = useOperationLifecycle;
