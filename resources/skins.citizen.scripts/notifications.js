const MODULE = 'skins.citizen.notifications';
const { bindIntentPrefetch } = require( './intentPrefetch.js' );
const { usingWithVue } = require( './vueBatch.js' );

/**
 * Trigger orchestrator for the notifications dropdown.
 *
 * The bell is a Citizen header dropdown (`<details>` + `.citizen-menu__card`),
 * so the shared dropdown CSS/JS own open/close, positioning, and dismissal.
 * This module only handles the lazy Vue panel inside the card: intent prefetch
 * on hover, a mount as soon as the module is ready so the panel's first fetch
 * is in flight before the click lands, `mw.loader.using` on first open when
 * intent never fired, mounting into `#citizen-notifications-content`
 * (replacing the server-rendered placeholder), a refresh on each reopen, and
 * keeping the bell badge in sync with unread counts. On load failure the
 * server-rendered error block (with retry) replaces the preview, leaving the
 * placeholder's footer links — the no-JS fallback, and the only remaining way
 * to reach the notifications and preferences pages — on screen.
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

		// The part of the placeholder the error stands in for. The frame around
		// it — heading, and the footer's links to the notifications and
		// preferences pages — survives a failure, because when the module
		// cannot be fetched those links are the only way left to reach them.
		// Empty on markup cached before the frame existed, where the error
		// block and its sibling see-all link already behave this way.
		const previewEls = [
			contentEl.querySelector( '.citizen-notifications__placeholder-body' ),
			contentEl.querySelector( '.citizen-notifications__empty' )
		].filter( Boolean );
		const errorEl = contentEl.querySelector( '.citizen-notifications__error' );
		const retryBtn = errorEl ?
			errorEl.querySelector( '.citizen-notifications__retry' ) :
			null;

		let app = null;
		let loading = false;
		let cancelPrefetch = null;

		/**
		 * Reflect the unread count onto the bell. The dot is driven by CSS off
		 * `data-counter-text` (shown when non-zero).
		 *
		 * @param {{ alert: number, message: number, total: number }} counts
		 */
		function updateBadge( counts ) {
			summary.dataset.counterText = String( counts.total );
		}

		/**
		 * The unread count the server rendered onto the bell. The panel uses it
		 * to skip its loading state when there is demonstrably nothing to load.
		 * Markup cached before the attribute existed yields null, which the
		 * panel reads as "unknown" and handles by showing the skeleton.
		 *
		 * @return {number|null}
		 */
		function serverCount() {
			const raw = summary.dataset.counterText;
			if ( raw === undefined || raw === '' ) {
				return null;
			}
			const count = Number( raw );
			return Number.isInteger( count ) && count >= 0 ? count : null;
		}

		function showPreview() {
			if ( errorEl ) {
				errorEl.hidden = true;
			}
			previewEls.forEach( ( el ) => {
				el.hidden = false;
			} );
		}

		function showError() {
			previewEls.forEach( ( el ) => {
				el.hidden = true;
			} );
			if ( errorEl ) {
				errorEl.hidden = false;
			}
		}

		/**
		 * Mount the panel into the card, replacing the placeholder. Shared by
		 * the intent-driven mount and the click-driven load, which both end in
		 * the same ready-to-open state.
		 *
		 * @param {Function} req Module require function from `mw.loader.using`
		 */
		function mountApp( req ) {
			const mod = req( MODULE );
			// Vue's mount replaces the placeholder inside the card.
			app = mod.initApp( contentEl, {
				onCountsChange: updateBadge,
				initialCount: serverCount()
			} );
			// Once mounted, the intent listeners have nothing left to prefetch.
			if ( cancelPrefetch ) {
				cancelPrefetch();
				cancelPrefetch = null;
			}
		}

		// Mounting is what starts the panel's first fetch, and that fetch — not
		// the bundle — is what the skeleton waits on. So mount on intent rather
		// than merely prefetching, and a hover-then-click open arrives with the
		// data already in flight. Touch mounts synchronously: the tap follows
		// touchstart too closely for an idle callback to win, and the mount is
		// cheap enough to run inline.
		cancelPrefetch = bindIntentPrefetch( summary, MODULE, mw, {
			vue: true,
			onReady: ( req, eventType ) => {
				const mount = () => {
					// A click may have beaten this callback — the load path owns
					// the mount from there, and mounting is synchronous, so the
					// two cannot interleave.
					if ( app || loading ) {
						return;
					}
					try {
						mountApp( req );
					} catch ( e ) {
						// Speculative: the user has asked for nothing yet, so
						// stay silent and let the click path surface the error.
						app = null;
					}
				};
				if ( eventType === 'touchstart' ) {
					mount();
					return;
				}
				mw.requestIdleCallback( mount );
			}
		} );

		function load() {
			// Already mounted (usually on intent, before the card opened): keep
			// the panel's content and height, and just refetch so it stays
			// fresh. The panel drops a refresh whose fetch is still in flight,
			// so a hover immediately followed by a click costs one request.
			if ( app ) {
				app.refresh();
				app.markSeen();
				return;
			}
			if ( loading ) {
				return;
			}
			loading = true;
			showPreview();

			usingWithVue( MODULE, mw ).then(
				( req ) => {
					// A throw here (module shape, Vue mount) is not caught by
					// the rejection handler below, so guard it explicitly —
					// otherwise `loading` stays true and the dropdown can never
					// reopen. Scoped to the mount alone: a panel that came up
					// fine must not be torn down by what follows it.
					try {
						mountApp( req );
					} catch ( e ) {
						app = null;
						showError();
						loading = false;
						return;
					}
					loading = false;
					app.markSeen();
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
