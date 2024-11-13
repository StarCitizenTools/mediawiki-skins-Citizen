/**
 * Initializes the share button functionality for Citizen
 *
 * @return {void}
 */
function init() {
	const supportsWebShareAPI = navigator.share;

	if ( !mw.config.get( 'wgIsArticle' ) ) {
		return;
	}

	const pageActions = document.querySelector( '.page-actions' );
	if ( !pageActions ) {
		mw.log.error( '[Citizen] Unable to attach share button (.page-actions not found)' );
		return;
	}

	const canonicalLink = document.querySelector( 'link[rel="canonical"]' );
	const url = canonicalLink ? canonicalLink.href : window.location.href;
	const shareData = {
		title: document.title,
		url: url
	};

	const fragment = document.createDocumentFragment();
	const button = document.createElement( 'button' );
	button.classList.add( 'citizen-share', 'citizen-button', 'citizen-dropdown-summary' );
	const icon = document.createElement( 'span' );
	icon.classList.add( 'citizen-ui-icon', 'mw-ui-icon-wikimedia-share' );
	const label = document.createElement( 'span' );
	const labelMsg = mw.message( 'citizen-share' );
	label.textContent = labelMsg;
	button.setAttribute( 'title', labelMsg );
	button.append( icon, label );
	fragment.appendChild( button );
	pageActions.prepend( fragment );

	// eslint-disable-next-line es-x/no-async-functions
	const handleShareButtonClick = async () => {
		button.disabled = true; // Disable the button
		try {
			if ( supportsWebShareAPI ) {
				await navigator.share( shareData );
			} else {
				// Fallback to navigator.clipboard if Share API is not supported
				await navigator.clipboard.writeText( url );
				mw.notify( mw.msg( 'citizen-share-copied' ), {
					tag: 'citizen-share',
					type: 'success'
				} );
			}
		} catch ( error ) {
			mw.log.error( `[Citizen] ${ error }` );
		} finally {
			button.disabled = false; // Re-enable button after error or share completes
		}
	};

	button.addEventListener( 'click', mw.util.debounce( handleShareButtonClick, 100 ) );
}

module.exports = {
	init: init
};
