const { triggerNativeShare } = require( './triggerNativeShare.js' );

/**
 * Native Web Share API path for Citizen's share button.
 *
 * Rendered by ShareNative.mustache when $wgCitizenEnableCustomizableSharePanel
 * is false. Wires the toolbar button to triggerNativeShare with a debounce.
 *
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {Object} deps.navigator
 * @return {Object}
 */
function createShareNative( { document, window, mw, navigator } ) {
	function init() {
		const shareButton = document.getElementById( 'citizen-share' );
		if ( !shareButton || shareButton.tagName !== 'BUTTON' ) {
			return;
		}
		// Share.mustache emits the same <button> for both modes; the
		// customizable-panel path also emits the sibling <dialog>. If it
		// is present, createShare owns the click — bail out so we don't
		// double-bind handlers.
		if ( document.getElementById( 'citizen-share-dialog' ) ) {
			return;
		}

		const handleShareButtonClick = async () => {
			shareButton.disabled = true;
			try {
				await triggerNativeShare( { document, window, mw, navigator } );
			} finally {
				shareButton.disabled = false;
			}
		};

		shareButton.addEventListener( 'click', mw.util.debounce( handleShareButtonClick, 100 ) );
	}

	return { init };
}

module.exports = { createShareNative };
