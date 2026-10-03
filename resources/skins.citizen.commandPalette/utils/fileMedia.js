const {
	cdxIconArticle,
	cdxIconAttachment,
	cdxIconImage,
	cdxIconPlay,
	cdxIconVolumeUp
} = require( '../icons.json' );

// Gallery tiles render in a `minmax(140px, 1fr)` grid; the average
// rendered tile width is roughly BASE_TILE_WIDTH. The MW server resamples
// to whatever `iiurlwidth` we request, so picking a width that matches
// the user's DPR avoids over-fetching on 1× displays and prevents the
// browser from upscaling on retina-class (2×, 3×) displays. Capped at
// MAX_THUMB_WIDTH to avoid runaway values from unusual ratios. Computed
// per request rather than at module load so a window dragged between a
// 1× and a 2× display picks up the new ratio on the next list refresh.
const BASE_TILE_WIDTH = 160;
const MAX_THUMB_WIDTH = 400;

/**
 * @return {number} Thumbnail width to request, in pixels.
 */
function computeThumbWidth() {
	const dpr = ( typeof window !== 'undefined' && window.devicePixelRatio ) || 1;
	return Math.min(
		MAX_THUMB_WIDTH,
		Math.ceil( BASE_TILE_WIDTH * Math.max( 1, dpr ) )
	);
}

/**
 * Map a MediaWiki mediatype to a fallback Codex icon. Used when the
 * file has no thumbnail (typically: audio, video, archive, 3D).
 *
 * @param {string} mediatype Uppercase mediatype string from imageinfo
 * @return {Object} Codex icon
 */
function iconForMediatype( mediatype ) {
	switch ( mediatype ) {
		case 'BITMAP':
		case 'DRAWING':
			return cdxIconImage;
		case 'OFFICE':
			return cdxIconArticle;
		case 'AUDIO':
			return cdxIconVolumeUp;
		case 'VIDEO':
			return cdxIconPlay;
		default:
			return cdxIconAttachment;
	}
}

module.exports = {
	computeThumbWidth,
	iconForMediatype
};
