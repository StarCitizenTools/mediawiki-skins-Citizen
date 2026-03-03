/**
 * Upgrades Echo for icon consistency.
 * Uses the badge widget hook to apply CdxButton classes and CSS-only icons.
 *
 * Icon classes are placed directly on the anchor because Echo replaces
 * anchor children on every update, clearing any icon spans.
 * The mask-image is provided by skins.citizen.icons (OOUIIconPackModule),
 * and the rendering setup is in ext.echo.styles.badge skinStyles.
 *
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Object} deps.mw
 * @return {Object}
 */
function createEchoUpgrade( { document, mw } ) {
	const ICON_MAP = {
		'pt-notifications-alert': 'mw-ui-icon-wikimedia-bell',
		'pt-notifications-notice': 'mw-ui-icon-wikimedia-tray'
	};

	function init() {
		if ( document.querySelectorAll( '#pt-notifications-alert a, #pt-notifications-notice a' ).length !== 2 ) {
			return;
		}

		mw.hook( 'ext.echo.NotificationBadgeWidget.onInitialize' ).add( ( badge ) => {
			const element = badge.$element[ 0 ];
			element.classList.add( 'mw-list-item' );
			const anchor = element.querySelector( 'a' );
			if ( !anchor ) {
				return;
			}
			// Strip OOUI widget classes that conflict with CdxButton styling
			// (framed button, background-image icons, etc.)
			for ( const cls of Array.from( anchor.classList ) ) {
				if ( cls.startsWith( 'oo-ui-' ) || cls === 'mw-echo-notifications-badge' ) {
					anchor.classList.remove( cls );
				}
			}
			anchor.classList.add(
				'cdx-button',
				'cdx-button--fake-button',
				'cdx-button--fake-button--enabled',
				'cdx-button--icon-only',
				'cdx-button--weight-quiet',
				'citizen-cdx-button--size-large',
				'citizen-echo-notification-badge'
			);
			// Add icon class directly on anchor because Echo replaces
			// anchor children on every update, clearing any icon spans
			const iconClass = ICON_MAP[ element.id ];
			if ( iconClass ) {
				anchor.classList.add( iconClass );
			}
		} );
	}

	return { init };
}

module.exports = { createEchoUpgrade };
