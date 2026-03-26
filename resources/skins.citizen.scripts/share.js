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
		if ( !shareDetails ) {
			return;
		}

		shareDetails.addEventListener( 'toggle', () => {
			mw.loader.load( 'skins.citizen.share' );
		}, { once: true } );

		shareDetails.addEventListener( 'toggle', () => {
			window.scrollTo( { top: 0, left: 0, behavior: 'auto' } );
		} );
	}

	return { init };
}

module.exports = { createShare };
