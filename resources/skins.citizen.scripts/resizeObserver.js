/**
 * Create a resize observer with start/end lifecycle callbacks.
 *
 * @param {Object} deps
 * @param {typeof ResizeObserver} deps.ResizeObserver
 * @param {Function} deps.onResize - Called on every resize entry.
 * @param {Function} [deps.onResizeStart] - Called once when resizing begins.
 * @param {Function} [deps.onResizeEnd] - Called once when resizing settles (after 250ms).
 * @return {ResizeObserver}
 */
function createResizeObserver( { ResizeObserver, onResize, onResizeStart, onResizeEnd } ) {
	let resizeStarted = false;
	let resizeEndTimer;

	return new ResizeObserver( ( entries ) => {
		if ( onResizeStart && !resizeStarted ) {
			onResizeStart( entries[ 0 ] );
			resizeStarted = true;
		}

		onResize( entries[ 0 ] );

		if ( onResizeEnd ) {
			clearTimeout( resizeEndTimer );
			resizeEndTimer = setTimeout( () => {
				onResizeEnd( entries[ 0 ] );
				resizeStarted = false;
			}, 250 );
		}
	} );
}

module.exports = {
	createResizeObserver
};
