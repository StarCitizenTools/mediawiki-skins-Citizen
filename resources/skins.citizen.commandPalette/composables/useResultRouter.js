const { nextTick } = require( 'vue' );

/**
 * Composable that owns the palette's result-action dispatch.
 *
 * Two functions are returned: `selectResult` for row activations, and
 * `handleAction` for action-button events emitted by row components.
 * Both are switch-based dispatchers; the action sets are intentionally
 * closed (the palette's contract enumerates them).
 *
 * The composable does not own state — it reads from and mutates the
 * passed-in orchestrator and tokenInput. The grouped-interface options
 * bag keeps the caller's wiring explicit:
 *  - `orchestrator` and `tokenInput` are passed through opaquely; the
 *    composable consumes their public surfaces as documented in the
 *    design (handleSelection, enterMode, addToken, setFreeText, etc.).
 *  - `navigation` exposes cross-mode lookups (currently
 *    `findModeByQuery`).
 *  - `control` carries the DOM and lifecycle handles
 *    (`focusInput`, `close`, `paletteRoot`).
 *  - `preview` is the injected preview-handler service; the duck-typed
 *    contract is `{ isAvailable, triggerForAnchor }`. Other consumers
 *    of the service (palette-level processContext / onReady wiring)
 *    live in App.vue.
 *
 * @param {Object} options
 * @param {Object} options.orchestrator
 * @param {Object} options.tokenInput
 * @param {Object} options.navigation
 * @param {Function} options.navigation.findModeByQuery
 * @param {Object} options.control
 * @param {Function} options.control.focusInput
 * @param {Function} options.control.close
 * @param {import('vue').Ref<HTMLElement|null>} options.control.paletteRoot
 * @param {Object} options.preview
 * @param {Function} options.preview.isAvailable
 * @param {Function} options.preview.triggerForAnchor
 * @return {{ selectResult: Function, handleAction: Function }}
 */
function useResultRouter( {
	orchestrator,
	tokenInput,
	navigation,
	control,
	preview
} ) {
	const { findModeByQuery } = navigation;
	const { focusInput, close, paletteRoot } = control;

	/**
	 * Dispatch a row activation. The orchestrator decides what action
	 * the row produced (via `handleSelection`); this function carries
	 * out the side effects.
	 *
	 * @param {Object} result The selected item.
	 */
	async function selectResult( result ) {
		const wasHelpVisible = orchestrator.helpVisible.value;
		const action = await orchestrator.handleSelection( result );

		switch ( action.action ) {
			case 'navigate':
				if ( action.payload ) {
					// Previewable result with a preview handler available:
					// keep the palette open so the user can dismiss the
					// preview and pick another row. Plain mouse clicks are
					// intercepted by the handler; keyboard activation
					// synthesizes a click on the highlighted row's anchor
					// so the handler can take over. Modifier or non-primary
					// clicks (Ctrl, Cmd, Alt, Shift, middle) fall through
					// to the navigate+close path so users keep their
					// browser-level escape hatches.
					if (
						result.previewable &&
						preview.isAvailable() &&
						!result.modifierClick
					) {
						if ( !result.isMouseClick && paletteRoot.value ) {
							const anchor = paletteRoot.value.querySelector(
								'.citizen-command-palette-list-item--highlighted a'
							);
							if ( anchor ) {
								preview.triggerForAnchor( anchor );
							}
						}
						break;
					}

					// <a> tags are handled by the browser on mouse click,
					// so we don't need to navigate.
					if ( !result.isMouseClick ) {
						window.location.href = action.payload;
					}
					close();
				}
				break;
			case 'exitWithQuery':
				if ( orchestrator.activeMode.value ) {
					// From within a mode: exit and seed the freeText.
					orchestrator.exitMode();
					tokenInput.setFreeText( action.payload );
				} else {
					// From root: try to enter a matching mode.
					const match = findModeByQuery( action.payload );
					if ( match ) {
						tokenInput.clear();
						// Closing help before entering the mode keeps openHelp's
						// catalog from being preserved across the enterMode reset.
						if ( wasHelpVisible ) {
							orchestrator.closeHelp();
						}
						orchestrator.enterMode( match.mode );
					}
				}
				nextTick( focusInput );
				break;
			case 'updateQuery':
				tokenInput.setFreeText( action.payload );
				nextTick( focusInput );
				break;
			case 'addToken':
				tokenInput.addToken( action.payload );
				tokenInput.setFreeText( '' );
				// Force re-query: adding a token while clearing freeText
				// produces the same fullQuery string, so the watcher won't
				// fire. Push the value through explicitly.
				// TODO: A generation counter on useTokenizedInput could
				// replace this workaround by making the watcher always
				// see a new value.
				orchestrator.updateQuery( tokenInput.fullQuery.value );
				nextTick( focusInput );
				break;
			case 'pushModeContext':
				orchestrator.pushModeContext( action.payload );
				tokenInput.clear();
				nextTick( focusInput );
				break;
			case 'toggleHelp':
				orchestrator.toggleHelp();
				tokenInput.clear();
				nextTick( focusInput );
				break;
			case 'none':
			default:
				break;
		}

		// Auto-dismiss help after any non-toggle selection from inside
		// the help overlay. Skipped for 'navigate' (the palette closes)
		// and 'exitWithQuery' (which already closed help before
		// entering mode).
		if (
			wasHelpVisible &&
			action.action !== 'toggleHelp' &&
			action.action !== 'navigate' &&
			action.action !== 'exitWithQuery'
		) {
			orchestrator.closeHelp();
		}
	}

	/**
	 * Dispatch a row-button action (dismiss, navigate, event).
	 *
	 * @param {Object} action
	 */
	function handleAction( action ) {
		switch ( action.type ) {
			case 'dismiss':
				if ( action.itemId !== undefined ) {
					orchestrator.dismissRecentItem( action.itemId );
				} else {
					mw.log.warn( '[CommandPalette] Dismiss action missing itemId:', action );
				}
				break;
			case 'navigate':
				if ( action.url ) {
					window.location.href = action.url;
					close();
				} else {
					mw.log.warn( '[CommandPalette] Navigate action missing url:', action );
				}
				break;
			case 'event':
				break;
			default:
				mw.log.warn( '[CommandPalette] Unknown or missing action type received:', action );
		}
	}

	return { selectResult, handleAction };
}

module.exports = useResultRouter;
