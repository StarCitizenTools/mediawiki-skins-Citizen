// Adopted from Vector 2022
/**
 * Helper method that calls a specified callback before the browser has
 * performed a specified number of repaints.
 *
 * Uses `requestAnimationFrame` under the hood to determine the next repaint.
 *
 * @param {Function} callback
 * @param {number} frameCount The number of frames to wait before calling the
 * specified callback.
 */
function deferUntilFrame( callback, frameCount ) {
	const checkFrame = () => {
		if ( frameCount <= 0 ) {
			callback();
		} else {
			frameCount--;
			requestAnimationFrame( checkFrame );
		}
	};

	checkFrame();
}

module.exports = deferUntilFrame;
