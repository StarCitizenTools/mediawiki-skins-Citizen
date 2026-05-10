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
 * When the panel is reachable in the current mode, share.js binds intent
 * prefetch on the trigger, opens the server-rendered `<dialog>` with a
 * skeleton on click, and lazy-loads `skins.citizen.share`. The Vue app
 * mounts inside the dialog and replaces the skeleton; subsequent clicks
 * reopen the same `<dialog>`. If the bundle fails to load, the dialog
 * closes and we degrade to the native share path so the click is never
 * lost.
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

		const nativeDialog = document.getElementById( 'citizen-share-dialog' );
		const mountPoint = document.getElementById( 'citizen-share-dialog-content' );
		const hasPanelScaffolding = nativeDialog !== null && mountPoint !== null;

		// 'auto' can fall back to the panel, so it needs the scaffolding.
		// 'panel' obviously needs it. 'native' never touches it.
		const panelEnabled = ( mode === 'panel' || mode === 'auto' ) && hasPanelScaffolding;

		if ( !panelEnabled ) {
			// 'native' mode, or a page that lacks the scaffolding. The
			// button calls navigator.share directly with a clipboard
			// fallback — no lazy-load, no prefetch.
			trigger.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				triggerNativeShare( nativeDeps );
			} );
			return;
		}

		const panel = createPanel( { trigger, nativeDialog, mountPoint, mw, window } );

		trigger.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			// Decide native vs panel at click time. 'panel' always uses
			// the panel; 'auto' prefers native when the API exists.
			if ( mode === 'auto' && typeof navigator.share === 'function' ) {
				triggerNativeShare( nativeDeps );
				return;
			}
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

			// The sticky-header share button forwards clicks to this
			// off-screen trigger; bring the page to top so the dialog
			// is visible. Skip on the main page where the toolbar may
			// already sit near the top.
			if ( !mw.config.get( 'wgIsMainPage' ) ) {
				window.scrollTo( { top: 0, left: 0, behavior: 'auto' } );
			}
		}
	};
}

module.exports = { createShare };
