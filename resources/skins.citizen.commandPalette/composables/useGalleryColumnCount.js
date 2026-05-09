const { ref, watch, onBeforeUnmount } = require( 'vue' );

/**
 * Composable that tracks the gallery's rendered column count for use
 * by 2D grid navigation. Watches the gallery component's template ref
 * and attaches a ResizeObserver to the underlying element while it is
 * mounted, deriving the column count from the element's width and the
 * configured minimum tile width.
 *
 * The composable returns a `Ref<number>` initialized at 1 so grid
 * consumers can rely on a sensible default before the first
 * measurement.
 *
 * @param {Object} options
 * @param {import('vue').Ref<Object|null>} options.galleryRef Vue template ref for the gallery component instance.
 * @param {number} [options.minTileWidth=140] Minimum tile width in CSS pixels. Must mirror the gallery stylesheet's `minmax( ..., 1fr )` floor.
 * @return {import('vue').Ref<number>} Reactive column count, default 1.
 */
function useGalleryColumnCount( { galleryRef, minTileWidth = 140 } ) {
	const columnCount = ref( 1 );
	let observer = null;

	function update( element ) {
		if ( !element ) {
			return;
		}
		const width = element.clientWidth;
		columnCount.value = Math.max( 1, Math.floor( width / minTileWidth ) );
	}

	function disconnect() {
		if ( observer ) {
			observer.disconnect();
			observer = null;
		}
	}

	watch( galleryRef, ( newInstance, oldInstance ) => {
		if ( oldInstance ) {
			disconnect();
		}
		if ( newInstance && newInstance.$el ) {
			const element = newInstance.$el;
			update( element );
			observer = new ResizeObserver( () => update( element ) );
			observer.observe( element );
		}
	} );

	onBeforeUnmount( disconnect );

	return columnCount;
}

module.exports = useGalleryColumnCount;
