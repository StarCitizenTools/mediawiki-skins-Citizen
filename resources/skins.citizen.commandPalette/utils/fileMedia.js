const {
	cdxIconArticle,
	cdxIconAttachment,
	cdxIconImage,
	cdxIconPlay,
	cdxIconVolumeUp
} = require( '../icons.json' );

// Roughly the average width of a `minmax(140px, 1fr)` gallery tile. Each
// distinct `iiurlwidth` is a new thumbnail per file, so the width snaps to
// 1× or 2× rather than following the exact pixel ratio. The server already
// rounds to $wgThumbnailSteps, so there is no client-side rounding.
const BASE_TILE_WIDTH = 160;

// Zoom plus OS scaling can report 1.0000000149… on an effectively 1× screen.
const RATIO_TOLERANCE = 0.01;

/**
 * @return {number} Thumbnail width to request, in pixels.
 */
function computeThumbWidth() {
	const dpr = ( typeof window !== 'undefined' && window.devicePixelRatio ) || 1;
	return dpr > 1 + RATIO_TOLERANCE ? BASE_TILE_WIDTH * 2 : BASE_TILE_WIDTH;
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
