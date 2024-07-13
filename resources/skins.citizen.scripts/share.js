/**
 * Initializes the share button functionality for Citizen
 *
 * @return {void}
 */
function init() {
	if ( !navigator.share ) {
		mw.log( '[Citizen] Browser/OS does not support Web Share API' );
		return;
	}

	if ( !mw.config.get( 'wgIsArticle' ) ) {
		return;
	}

	const pageActions = document.querySelector( '.page-actions' );
	if ( !pageActions ) {
		mw.log.error( '[Citizen] Unable to attach share button (.page-actions not found)' );
		return;
	}

	const canonicalLink = document.querySelector( 'link[rel="canonical"]' );
	const shareData = {
		title: document.title,
		url: canonicalLink ? canonicalLink.href : window.location.href
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
			await navigator.share( shareData );
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
