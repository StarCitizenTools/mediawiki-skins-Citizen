const { onBeforeUnmount } = require( 'vue' );

/**
 * Composable for the palette body's animated-height transition.
 *
 * Owns a ResizeObserver that watches the inner viewport's rendered
 * height and writes it as a CSS pixel value on the outer container's
 * inline style. The container's CSS transition handles the animation.
 *
 * Setup is invoked from the palette's enter-transition `@after-enter`
 * hook so the observer attaches once the modal has finished mounting;
 * teardown runs from `@after-leave` to release the observer when the
 * palette closes. As a safety net the composable also disconnects on
 * component unmount, in case the leave-transition is interrupted.
 *
 * @param {Object} options
 * @param {import('vue').Ref<HTMLElement|null>} options.bodyContainer Outer container ref.
 * @param {import('vue').Ref<HTMLElement|null>} options.bodyViewport Inner viewport ref measured by the observer.
 * @return {{ setupResizeObserver: () => void, teardownResizeObserver: () => void }}
 */
function useBodyHeightAnimation( { bodyContainer, bodyViewport } ) {
	let observer = null;

	function updateBodyHeight() {
		const container = bodyContainer.value;
		const viewport = bodyViewport.value;
		if ( container && viewport ) {
			container.style.height = viewport.clientHeight + 'px';
		}
	}

	function setupResizeObserver() {
		if ( !bodyViewport.value ) {
			return;
		}
		updateBodyHeight();
		observer = new ResizeObserver( updateBodyHeight );
		observer.observe( bodyViewport.value );
	}

	function teardownResizeObserver() {
		if ( observer ) {
			observer.disconnect();
			observer = null;
		}
	}

	onBeforeUnmount( teardownResizeObserver );

	return { setupResizeObserver, teardownResizeObserver };
}

module.exports = useBodyHeightAnimation;
