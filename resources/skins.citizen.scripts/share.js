/**
 * Initializes the share button functionality for Citizen
 *
 * @return {void}
 */
function init() {
	const shareButton = document.getElementById( 'citizen-share' );
	if ( !shareButton ) {
		// Citizen will not add the citizen-share element if the share button is undesirable
		return;
	}

	const canonicalLink = document.querySelector( 'link[rel="canonical"]' );
	const url = canonicalLink ? canonicalLink.href : window.location.href;
	const shareData = {
		title: document.title,
		url: url
	};

	// eslint-disable-next-line es-x/no-async-functions
	const handleShareButtonClick = async () => {
		shareButton.disabled = true; // Disable the button
		try {
			if ( navigator.share ) {
				await navigator.share( shareData );
			} else if ( navigator.clipboard ) {
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
			shareButton.disabled = false; // Re-enable button after error or share completes
		}
	};

	shareButton.addEventListener( 'click', mw.util.debounce( handleShareButtonClick, 100 ) );
}

module.exports = {
	init: init
};
