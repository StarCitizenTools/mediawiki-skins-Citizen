const MODULE = 'skins.citizen.share';
const { bindIntentPrefetch } = require( './intentPrefetch.js' );
const { triggerNativeShare } = require( './triggerNativeShare.js' );

/**
 * Orchestrate Citizen's share trigger across three modes:
 *
 * - 'native': always hand off to the browser's Web Share API (clipboard
 *   fallback if unsupported). No panel scaffolding rendered.
 * - 'panel': always open Citizen's customizable panel.
 * - 'auto' (default): prefer Web Share API when the browser supports it;
 *   fall back to the panel when it doesn't.
 *
 * When the panel is reachable in the current mode (always for 'panel',
 * and for 'auto' only when the browser lacks the Web Share API), share.js
 * binds intent prefetch on the trigger, opens the server-rendered
 * `<dialog>` with a skeleton on click, and lazy-loads `skins.citizen.share`.
 * The Vue app mounts inside the dialog and replaces the skeleton;
 * subsequent clicks reopen the same `<dialog>`. If the bundle fails to
 * load, the dialog closes and we degrade to the native share path so the
 * click is never lost.
 *
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {Object} deps.navigator
 * @param {string} [deps.mode] One of 'auto' | 'panel' | 'native'.
 *   Defaults to 'auto'.
 * @return {Object}
 */
function createShare( { document, window, mw, navigator, mode = 'auto' } ) {
	const nativeDeps = { document, window, mw, navigator };

	function init() {
		const trigger = document.getElementById( 'citizen-share' );
		if ( !trigger ) {
			return;
		}

		// Decide once at init time: in 'auto' mode, a browser with the
		// Web Share API will never reach the panel, so prefetching the
		// Vue bundle on hover is wasted bandwidth. 'panel' always needs
		// the scaffolding; 'native' never does.
		const hasWebShare = typeof navigator.share === 'function';
		const needsPanel = mode === 'panel' || ( mode === 'auto' && !hasWebShare );

		const nativeDialog = needsPanel ?
			document.getElementById( 'citizen-share-dialog' ) :
			null;
		const mountPoint = needsPanel ?
			document.getElementById( 'citizen-share-dialog-content' ) :
			null;
		const panelEnabled = needsPanel && nativeDialog !== null && mountPoint !== null;

		if ( !panelEnabled ) {
			// 'native' mode, 'auto' with the Web Share API available, or
			// a page that lacks the panel scaffolding. The button calls
			// navigator.share directly with a clipboard fallback — no
			// lazy-load, no prefetch.
			trigger.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				triggerNativeShare( nativeDeps );
			} );
			return;
		}

		const panel = createPanel( { trigger, nativeDialog, mountPoint, mw, window } );

		trigger.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			panel.open();
		} );
	}

	return { init };
}

/**
 * Lazy-load + open lifecycle for the Vue-backed customizable panel.
 *
 * Hoisted out of init() so the conditional branching at the top doesn't
 * stack nested function declarations.
 *
 * @param {Object} deps
 * @param {HTMLElement} deps.trigger
 * @param {HTMLDialogElement} deps.nativeDialog
 * @param {HTMLElement} deps.mountPoint
 * @param {Object} deps.mw
 * @param {Window} deps.window
 * @return {{open: Function}}
 */
function createPanel( { trigger, nativeDialog, mountPoint, mw, window } ) {
	let state = 'idle'; // 'idle' | 'loading' | 'mounted'
	const cancelPrefetch = bindIntentPrefetch( trigger, MODULE, mw );

	function closeNativeDialog() {
		if ( nativeDialog.open ) {
			nativeDialog.close();
		}
	}

	function load() {
		state = 'loading';
		mw.loader.using( MODULE ).then(
			( req ) => {
				const mod = req( MODULE );
				mod.initApp( mountPoint );
				state = 'mounted';
				cancelPrefetch();
			},
			() => {
				state = 'idle';
				closeNativeDialog();
				// Native share is the last resort when the panel bundle
				// can't load — same shape as 'native' mode would give.
				triggerNativeShare( {
					document: trigger.ownerDocument,
					window: window,
					mw: mw,
					navigator: window.navigator
				} );
			}
		);
	}

	// Backdrop click on the dialog closes it. The `<dialog>` element is
	// the click target when the user clicks the dimmed area outside the
	// dialog's box (since the dialog box sizes smaller than the dialog
	// element itself).
	nativeDialog.addEventListener( 'click', ( event ) => {
		if ( event.target === nativeDialog ) {
			closeNativeDialog();
		}
	} );

	return {
		open() {
			if ( state === 'idle' ) {
				load();
			}
			if ( !nativeDialog.open ) {
				nativeDialog.showModal();
			}
		}
	};
}

module.exports = { createShare };
