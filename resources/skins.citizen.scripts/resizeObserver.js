/**
 * Create an observer for showing/hiding feature and for firing scroll event hooks.
 *
 * @param {Function} onResize functionality for when the element during resize
 * @param {Function} onResizeStart functionality for when the element at the start of resize
 * @param {Function} onResizeEnd functionality for when the element at the end of resize
 * @return {ResizeObserver}
 */
function initResizeObserver( onResize, onResizeStart, onResizeEnd ) {
	let resizeStarted = false;

	/* eslint-disable-next-line compat/compat */
	return new ResizeObserver( ( entries ) => {
		if ( onResizeStart && !resizeStarted ) {
			onResizeStart( entries[ 0 ] );
			resizeStarted = true;
		}

		onResize( entries[ 0 ] );

		if ( onResizeEnd ) {
			clearTimeout( window.resizedFinished );
			window.resizedFinished = setTimeout( () => {
				onResizeEnd( entries[ 0 ] );
				resizeStarted = false;
			}, 250 );
		}
	} );
}

module.exports = {
	initResizeObserver
};
