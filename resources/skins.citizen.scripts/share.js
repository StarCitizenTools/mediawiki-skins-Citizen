/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {Object} deps.navigator
 * @return {Object}
 */
function createShare( { document, window, mw, navigator } ) {
	/**
	 * Initializes the share button functionality for Citizen
	 *
	 * @return {void}
	 */
	function init() {
		const shareDetails = document.getElementById( 'citizen-share-details' );
		const shareButton = document.getElementById( 'citizen-share' );
		if ( !shareButton ) {
			return;
		}

		if ( shareDetails ) {
			shareDetails.addEventListener( 'toggle', () => {
				mw.loader.load( 'skins.citizen.share' );
			}, { once: true } );

			// intended for the sticky share button as the modal is only mounted once in the toolbar
			shareDetails.addEventListener( 'toggle', ( event ) => {
				if (
					event.target.open &&
					!mw.config.get( 'wgIsMainPage' )
				) {
					window.scrollTo( { top: 0, left: 0, behavior: 'auto' } );
				}
			} );
			return;
		}

		const canonicalLink = document.querySelector( 'link[rel="canonical"]' );
		const url = canonicalLink ? canonicalLink.href : window.location.href;
		const shareData = {
			title: document.title,
			url: url
		};

		const handleShareButtonClick = async () => {
			shareButton.disabled = true;
			try {
				if ( navigator.share ) {
					await navigator.share( shareData );
				} else if ( navigator.clipboard ) {
					await navigator.clipboard.writeText( url );
					mw.notify( mw.msg( 'citizen-share-copied' ), {
						tag: 'citizen-share',
						type: 'success'
					} );
				}
			} catch ( error ) {
				mw.log.error( `[Citizen] ${ error }` );
			} finally {
				shareButton.disabled = false;
			}
		};

		shareButton.addEventListener( 'click', mw.util.debounce( handleShareButtonClick, 100 ) );
	}

	return { init };
}

module.exports = { createShare };
