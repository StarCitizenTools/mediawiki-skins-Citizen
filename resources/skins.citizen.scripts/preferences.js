const MODULE = 'skins.citizen.preferences';
const { bindIntentPrefetch } = require( './intentPrefetch.js' );

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Object} deps.mw
 * @return {Object}
 */
function createPreferences( { document, mw } ) {
	/**
	 * Wire intent prefetching, lazy loading, and failure recovery for the
	 * preferences dropdown. The skeleton and error markup are server-rendered
	 * inside #citizen-preferences-content; Vue's mount() replaces them when
	 * the module finishes loading.
	 *
	 * @return {void}
	 */
	function init() {
		const details = document.getElementById( 'citizen-preferences-details' );
		if ( !details ) {
			return;
		}

		const summary = details.querySelector( 'summary' );
		const contentEl = document.getElementById( 'citizen-preferences-content' );
		if ( !summary || !contentEl ) {
			return;
		}

		const skeletonEl = contentEl.querySelector( '.citizen-preferences-skeleton' );
		const errorEl = contentEl.querySelector( '.citizen-preferences-error' );
		const retryBtn = errorEl ?
			errorEl.querySelector( '.citizen-preferences-error__retry' ) :
			null;

		let loading = false;
		let mounted = false;

		function showSkeleton() {
			if ( errorEl ) {
				errorEl.hidden = true;
			}
			if ( skeletonEl ) {
				skeletonEl.hidden = false;
				skeletonEl.setAttribute( 'aria-busy', 'true' );
			}
		}

		function showError() {
			if ( skeletonEl ) {
				skeletonEl.setAttribute( 'aria-busy', 'false' );
				skeletonEl.hidden = true;
			}
			if ( errorEl ) {
				errorEl.hidden = false;
			}
		}

		const cancelPrefetch = bindIntentPrefetch( summary, MODULE, mw );

		function load() {
			if ( mounted || loading ) {
				return;
			}
			loading = true;
			showSkeleton();

			mw.loader.using( MODULE ).then(
				() => {
					mounted = true;
					loading = false;
					cancelPrefetch();
				},
				() => {
					showError();
					loading = false;
				}
			);
		}

		details.addEventListener( 'toggle', () => {
			if ( details.open ) {
				load();
			}
		} );

		if ( retryBtn ) {
			retryBtn.addEventListener( 'click', load );
		}
	}

	return { init };
}

module.exports = { createPreferences };
