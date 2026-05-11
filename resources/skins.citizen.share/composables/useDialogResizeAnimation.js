const { onBeforeUnmount } = require( 'vue' );

/**
 * Smooth-resize animation for the share dialog.
 *
 * Watches the Vue app's root element (`viewport`) with a `ResizeObserver`
 * and writes its rendered height as an inline pixel value on the dialog
 * (`container`). The dialog's CSS transition on `height` handles the
 * animation. When the view inside Vue swaps (e.g. default → QR) the
 * dialog smoothly grows or shrinks vertically to fit the new content.
 *
 * Height only, not width: native `<dialog>` interprets inline `style.width`
 * inconsistently with its computed `box-sizing` value (the project sets
 * `box-sizing: border-box` globally but the dialog still adds border on
 * top of `style.width`). Measuring the viewport's `clientWidth` and
 * feeding it back through that mismatch starts a recursive shrink loop
 * that runs the dialog down to ~32px wide over a few ResizeObserver
 * fires. Width stays at the CSS-declared `min( 32rem, … )` value so the
 * dialog has a stable width across all view states; the
 * `prefers-reduced-motion` media query carries the existing CSS
 * transition guard.
 *
 * Pattern adapted from
 * `skins.citizen.commandPalette/composables/useBodyHeightAnimation.js`.
 *
 * @param {Object} options
 * @param {?HTMLElement} options.container The element to animate (the dialog).
 * @param {import('vue').Ref<HTMLElement|null>} options.viewport The content element being measured.
 * @return {{ setup: () => void, teardown: () => void }}
 */
function useDialogResizeAnimation( { container, viewport } ) {
	let observer = null;
	let primed = false;

	function updateSize() {
		if ( !container || !viewport.value ) {
			return;
		}
		// While the dialog is closed the browser sets `display: none` on
		// the dialog, which zeroes the viewport's measured height.
		// Writing 0 to the inline `style.height` would then cause the
		// next open to animate from 0 → content height. Skip writes when
		// the viewport has no rendered size so the inline value stays at
		// the last on-screen height across close/reopen cycles.
		const height = viewport.value.clientHeight;
		if ( height === 0 ) {
			return;
		}
		container.style.height = height + 'px';
		// `height` is excluded from `transition-property` on the dialog
		// until the first measurement has been written, then enabled via
		// this class. If the class were applied first, the initial inline
		// write would animate from the dialog's intrinsic open-state
		// height to the pixel value. The class is added on the next
		// animation frame to guarantee the paint that applies the inline
		// height runs before `height` becomes a transitioned property —
		// reserving the animation for subsequent view swaps
		// (default ↔ QR).
		if ( !primed ) {
			primed = true;
			requestAnimationFrame( () => {
				container.classList.add( 'citizen-share-dialog--animated' );
			} );
		}
	}

	function setup() {
		if ( !container || !viewport.value ) {
			return;
		}
		// ResizeObserver delivers its initial entry asynchronously, so
		// call updateSize() explicitly to prime the inline height before
		// the dialog has a chance to paint. Matches the pattern in
		// `useBodyHeightAnimation` in the command palette.
		updateSize();
		observer = new ResizeObserver( updateSize );
		observer.observe( viewport.value );
	}

	function teardown() {
		if ( observer ) {
			observer.disconnect();
			observer = null;
		}
	}

	onBeforeUnmount( teardown );

	return { setup, teardown };
}

module.exports = { useDialogResizeAnimation };
