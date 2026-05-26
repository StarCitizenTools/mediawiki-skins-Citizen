const MODULE = 'skins.citizen.notifications';
const { bindIntentPrefetch } = require( './intentPrefetch.js' );

/**
 * Trigger orchestrator for the notifications dropdown.
 *
 * The bell is a Citizen header dropdown (`<details>` + `.citizen-menu__card`),
 * so the shared dropdown CSS/JS own open/close, positioning, and dismissal.
 * This module only handles the lazy Vue panel inside the card: intent prefetch
 * on hover, `mw.loader.using` on first open, mounting into
 * `#citizen-notifications-content` (replacing the server-rendered skeleton),
 * a reload on each reopen, and keeping the bell badge in sync with unread
 * counts. The card also carries a no-JS "See all notifications" link, and on
 * load failure the server-rendered error block (with retry) is shown.
 *
 * No-ops when the dropdown is absent (anonymous views, or markup cached
 * before the feature shipped).
 *
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Object} deps.mw
 * @return {{ init: Function }}
 */
function createNotifications( { document, mw } ) {
	function init() {
		const details = document.getElementById( 'citizen-notifications-details' );
		if ( !details ) {
			return;
		}

		const summary = details.querySelector( 'summary' );
		const contentEl = document.getElementById( 'citizen-notifications-content' );
		if ( !summary || !contentEl ) {
			return;
		}

		const skeletonEl = contentEl.querySelector( '.citizen-notifications__skeleton' );
		const errorEl = contentEl.querySelector( '.citizen-notifications__error' );
		const retryBtn = errorEl ?
			errorEl.querySelector( '.citizen-notifications__retry' ) :
			null;

		let app = null;
		let loading = false;

		/**
		 * Reflect the unread count onto the bell. The dot is driven by CSS off
		 * `data-counter-text` (shown when non-zero).
		 *
		 * @param {{ alert: number, message: number, total: number }} counts
		 */
		function updateBadge( counts ) {
			summary.dataset.counterText = String( counts.total );
		}

		function showSkeleton() {
			if ( errorEl ) {
				errorEl.hidden = true;
			}
			if ( skeletonEl ) {
				skeletonEl.hidden = false;
			}
		}

		function showError() {
			if ( skeletonEl ) {
				skeletonEl.hidden = true;
			}
			if ( errorEl ) {
				errorEl.hidden = false;
			}
		}

		const cancelPrefetch = bindIntentPrefetch( summary, MODULE, mw );

		function load() {
			// Already mounted: just refetch so counts/items stay fresh.
			if ( app ) {
				app.refresh();
				return;
			}
			if ( loading ) {
				return;
			}
			loading = true;
			showSkeleton();

			mw.loader.using( MODULE ).then(
				( req ) => {
					// A throw here (module shape, Vue mount) is not caught by
					// the rejection handler below, so guard it explicitly —
					// otherwise `loading` stays true and the dropdown can never
					// reopen.
					try {
						const mod = req( MODULE );
						// Vue's mount replaces the skeleton inside the card.
						app = mod.initApp( contentEl, { onCountsChange: updateBadge } );
						cancelPrefetch();
					} catch ( e ) {
						showError();
					}
					loading = false;
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

module.exports = { createNotifications };
