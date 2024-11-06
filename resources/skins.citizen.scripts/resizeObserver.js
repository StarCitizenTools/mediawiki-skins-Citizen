/**
 * Create an observer for showing/hiding feature and for firing scroll event hooks.
 *
 * @param {Function} onResize functionality for when the element during resize
 * @param {Function} onResizeEnd functionality for when the element at the end of resize
 * @return {ResizeObserver}
 */
function initResizeObserver( onResize, onResizeEnd ) {
	/* eslint-disable-next-line compat/compat */
	return new ResizeObserver( () => {
		onResize();
		if ( onResizeEnd ) {
			clearTimeout( window.resizedFinished );
			window.resizedFinished = setTimeout( () => {
				onResizeEnd();
			}, 250 );
		}
	} );
}

module.exports = {
	initResizeObserver
};
