const MODULE = 'skins.citizen.share';
const { bindIntentPrefetch } = require( './intentPrefetch.js' );
const { triggerNativeShare } = require( './triggerNativeShare.js' );

/**
 * Wire intent prefetching and lazy loading for the customizable share panel.
 *
 * The skeleton inside #citizen-share-content is server-rendered and stays
 * visible until Vue's mount() replaces it. If the bundle fails to load
 * (offline, network error), we degrade to the browser's native share path
 * via triggerNativeShare — the curated service list becomes invisible, but
 * the user can still share, which matches what they'd get with
 * $wgCitizenEnableCustomizableSharePanel = false.
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
		const details = document.getElementById( 'citizen-share-details' );
		if ( !details ) {
			return;
		}

		const summary = details.querySelector( 'summary' );
		const contentEl = document.getElementById( 'citizen-share-content' );
		if ( !summary || !contentEl ) {
			return;
		}

		let loading = false;
		let mounted = false;

		const cancelPrefetch = bindIntentPrefetch( summary, MODULE, mw );

		function load() {
			if ( mounted || loading ) {
				return;
			}
			loading = true;

			mw.loader.using( MODULE ).then(
				() => {
					mounted = true;
					loading = false;
					cancelPrefetch();
				},
				() => {
					loading = false;
					// Bundle didn't load — close the empty panel and trigger
					// the browser's share sheet so the click isn't dropped.
					details.open = false;
					triggerNativeShare( { document, window, mw, navigator } );
				}
			);
		}

		details.addEventListener( 'toggle', () => {
			if ( !details.open ) {
				return;
			}
			load();
			// Bring the page to the top so the panel is visible: the sticky
			// header's share button forwards clicks to this toolbar trigger,
			// which is otherwise off-screen when scrolled. Skip on the main
			// page where the toolbar may already sit at top.
			if ( !mw.config.get( 'wgIsMainPage' ) ) {
				window.scrollTo( { top: 0, left: 0, behavior: 'auto' } );
			}
		} );
	}

	return { init };
}

module.exports = { createShare };
