/* global $ */

/**
 * Helper for integrating with the Instant Diffs gadget
 * (https://www.mediawiki.org/wiki/Instant_Diffs).
 *
 * Citizen does not depend on the gadget. When it is not installed,
 * isAvailable() returns false and the rest of these helpers no-op.
 */

/**
 * Whether the Instant Diffs gadget has finished initializing on this page.
 *
 * @return {boolean}
 */
function isAvailable() {
	return typeof window !== 'undefined' &&
		!!window.instantDiffs &&
		window.instantDiffs.isReady === true;
}

/**
 * Ask the gadget to scan a container for unprocessed diff/revision links
 * and attach its click handlers. No-op when the gadget is unavailable.
 *
 * @param {HTMLElement|jQuery} container DOM element or jQuery collection.
 */
function processContext( container ) {
	if ( !isAvailable() ) {
		return;
	}
	// The gadget's process hook calls $container.find() internally, so the
	// payload must be a jQuery object. Wrap raw DOM elements before firing.
	const $container = container && container.jquery ? container : $( container );
	mw.hook( 'instantDiffs.process' ).fire( $container );
}

/**
 * Dispatch a synthetic left-click on the given anchor and return whether
 * any listener (typically the gadget) called preventDefault. Used for the
 * keyboard-Enter activation path: if a preview gadget intercepted the
 * click, the caller should not also navigate or close the palette.
 *
 * @param {HTMLAnchorElement} anchor
 * @return {boolean} Whether defaultPrevented was set during dispatch.
 */
function triggerForAnchor( anchor ) {
	const event = new MouseEvent( 'click', {
		bubbles: true,
		cancelable: true,
		button: 0
	} );
	anchor.dispatchEvent( event );
	return event.defaultPrevented;
}

/**
 * Register a callback to run once the gadget signals ready. Useful for
 * the late-load case where the gadget initializes after a consumer has
 * already rendered its anchors. No-op-on-call if the hook never fires.
 *
 * @param {Function} callback
 */
function onReady( callback ) {
	mw.hook( 'instantDiffs.ready' ).add( callback );
}

module.exports = {
	isAvailable: isAvailable,
	processContext: processContext,
	triggerForAnchor: triggerForAnchor,
	onReady: onReady
};
