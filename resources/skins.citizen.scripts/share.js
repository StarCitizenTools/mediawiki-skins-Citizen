const MODULE = 'skins.citizen.share';
const { bindIntentPrefetch } = require( './intentPrefetch.js' );
const { triggerNativeShare } = require( './triggerNativeShare.js' );

/**
 * Wire intent prefetching and lazy loading for the customizable share dialog.
 *
 * The trigger button opens a server-rendered native `<dialog>` containing a
 * skeleton — visible immediately while `skins.citizen.share` is fetched. On
 * resolve, the Vue app mounts inside the dialog and replaces the skeleton
 * with the real share UI. The `<dialog>` element stays the canonical modal
 * across opens; subsequent clicks just call `showModal()` again, and the
 * Vue app stays mounted between cycles.
 *
 * If the bundle fails to load (offline, network error), the dialog closes
 * and we degrade to the browser's native share path via triggerNativeShare
 * — the curated service list becomes invisible, but the click still
 * produces a working share dialog, which matches what the user would get
 * with $wgCitizenEnableCustomizableSharePanel = false anyway.
 *
 * Rendered by Share.mustache when $wgCitizenEnableCustomizableSharePanel is
 * true. Coexists with createShareNative, which handles the no-panel case.
 *
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {Object} deps.navigator
 * @return {Object}
 */
function createShare( { document, window, mw, navigator } ) {
	function init() {
		const trigger = document.getElementById( 'citizen-share' );
		const nativeDialog = document.getElementById( 'citizen-share-dialog' );
		const mountPoint = document.getElementById( 'citizen-share-dialog-content' );
		if ( !trigger || !nativeDialog || !mountPoint ) {
			return;
		}

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
					triggerNativeShare( { document, window, mw, navigator } );
				}
			);
		}

		function triggerOpen() {
			if ( state === 'idle' ) {
				load();
			}
			if ( !nativeDialog.open ) {
				nativeDialog.showModal();
			}

			// Bring the page to top when triggered from the sticky-header
			// share button, which forwards clicks to this off-screen
			// trigger. Skip on the main page where the toolbar may already
			// sit near the top.
			if ( !mw.config.get( 'wgIsMainPage' ) ) {
				window.scrollTo( { top: 0, left: 0, behavior: 'auto' } );
			}
		}

		trigger.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			triggerOpen();
		} );

		// Backdrop click on the dialog closes it. The `<dialog>` element is
		// the click target when the user clicks the dimmed area outside the
		// dialog's box (since the dialog box sizes smaller than the dialog
		// element itself).
		nativeDialog.addEventListener( 'click', ( event ) => {
			if ( event.target === nativeDialog ) {
				closeNativeDialog();
			}
		} );
	}

	return { init };
}

module.exports = { createShare };
