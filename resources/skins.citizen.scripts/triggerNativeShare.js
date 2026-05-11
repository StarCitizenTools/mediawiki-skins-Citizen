/**
 * Trigger the browser's native share sheet, with a clipboard fallback.
 *
 * Called from share.js for the 'native' mode path, for the 'auto' mode
 * Web Share API fast-path, and as the last-resort fallback when the
 * panel bundle fails to load. Stays DOM-free so any caller can invoke
 * it without setting up the panel's `<dialog>` scaffolding.
 *
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {Object} deps.navigator
 * @return {Promise<void>}
 */
async function triggerNativeShare( { document, window, mw, navigator } ) {
	const canonicalLink = document.querySelector( 'link[rel="canonical"]' );
	const url = canonicalLink ? canonicalLink.href : window.location.href;
	const shareData = {
		title: document.title,
		url: url
	};

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
	}
}

module.exports = { triggerNativeShare };
