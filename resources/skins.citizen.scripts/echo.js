/**
 * Originally based on Vector
 *
 * Upgrades Echo for icon consistency.
 * Undos work inside Echo to replace our button.
 *
 * TODO: Switch to mw.hook( 'ext.echo.NotificationBadgeWidget.onInitialize' ) when we drop 1.39 support
 */
function init() {
	if ( document.querySelectorAll( '#pt-notifications-alert a, #pt-notifications-notice a' ).length !== 2 ) {
		return;
	}

	const notifications = document.getElementById( 'p-notifications' );
	// Clone the icons so we can insert it back afterwards
	const alertIcon = notifications.querySelector( '#pt-notifications-alert > a > .citizen-ui-icon' ).cloneNode();
	const noticeIcon = notifications.querySelector( '#pt-notifications-notice > a > .citizen-ui-icon' ).cloneNode();

	// When the Echo button is clicked, all of its children are reset back to the initial state.
	// This will re-upgrade the children of the Echo button
	const callChildSupportServices = ( anchor ) => {
		const badge = anchor.parentElement;
		// Wrap label in a span
		const label = document.createElement( 'span' );
		label.textContent = anchor.textContent;
		anchor.replaceChildren( label );
		// Add icon span back
		if ( badge.id === 'pt-notifications-alert' ) {
			anchor.prepend( alertIcon );
			anchor.classList.remove( 'oo-ui-icon-bell' );
		} else if ( badge.id === 'pt-notifications-notice' ) {
			anchor.prepend( noticeIcon );
			anchor.classList.remove( 'oo-ui-icon-tray' );
		}
	};

	// Upgrade the Echo badge
	// This only needs to be run once at the Echo button init
	const setupFosterHome = ( badge, anchor ) => {
		badge.classList.add( 'mw-list-item' );
		anchor.classList.remove( 'mw-echo-notifications-badge' );
		anchor.classList.add( 'citizen-header__button', 'citizen-echo-notification-badge' );
		callChildSupportServices( anchor );
	};

	// Whenever Echo kicks its children out from the button, undo what Echo did.
	const abuseObserver = new MutationObserver( ( mutations ) => {
		for ( const mutation of mutations ) {
			if ( mutation.type === 'childList' ) {
				const removedNodes = mutation.removedNodes;
				if ( removedNodes.length === 0 ) {
					return;
				}
				for ( const removedNode of removedNodes ) {
					if ( !( removedNode instanceof HTMLSpanElement ) || !removedNode.classList.contains( 'citizen-ui-icon' ) ) {
						return;
					}
					const anchor = mutation.target;
					callChildSupportServices( anchor );
				}
			}
		}
	} );

	// Observe for Echo button init, it will only happen once per icon (so twice)
	let initObserved = 0;
	const initObserver = new MutationObserver( ( mutations ) => {
		for ( const mutation of mutations ) {
			// All Echo buttons are observed by abuseObserver, disconnect observer.
			if ( initObserved >= 2 ) {
				initObserver.disconnect();
			}
			if ( mutation.type === 'childList' ) {
				const addedNodes = mutation.addedNodes;
				if ( addedNodes.length === 0 ) {
					return;
				}
				for ( const addedNode of addedNodes ) {
					if ( !addedNode.classList.contains( 'mw-echo-ui-notificationBadgeButtonPopupWidget' ) ) {
						return;
					}
					const anchor = addedNode.firstElementChild;
					// Upgrade the badge immediately before Echo kicks its children out
					setupFosterHome( addedNode, anchor );
					// Observe Echo button
					abuseObserver.observe(
						anchor,
						{
							childList: true,
							subtree: true
						}
					);
					initObserved++;
				}
			}
		}
	} );
	initObserver.observe(
		notifications,
		{
			childList: true,
			subtree: true
		}
	);
}

module.exports = init;
