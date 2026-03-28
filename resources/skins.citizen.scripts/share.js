/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @return {Object}
 */
function createShare( { document, window, mw } ) {
	/**
	 * Initializes the share button functionality for Citizen
	 *
	 * @return {void}
	 */
	function init() {
		const shareDetails = document.getElementById( 'citizen-share-details' );
		if ( !shareDetails ) {
			return;
		}

		shareDetails.addEventListener( 'toggle', () => {
			mw.loader.load( 'skins.citizen.share' );
		}, { once: true } );

		// intended for the sticky share button as the modal is only mounted once in the toolbar
		shareDetails.addEventListener( 'toggle', () => {
			window.scrollTo( { top: 0, left: 0, behavior: 'auto' } );
		} );
	}

	return { init };
}

module.exports = { createShare };
