/**
 * Command palette mode for finding files and media (images, PDFs,
 * audio, video, etc.).
 *
 * - Empty input on a content page: surface files used on the page
 *   via `generator=images`, mirroring how category mode lists the
 *   page's categories. Off-article (or pages without files) falls
 *   through to the idle empty state.
 * - Typed input: prefix search first via `generator=prefixsearch` —
 *   universally available, matches how users typically know file
 *   names (by their start). Falls back to full-text search via
 *   `generator=search` only when prefix returns nothing, so deeper
 *   content matches surface on CirrusSearch-enabled wikis without
 *   doubling the bandwidth on the common case.
 * - Default action: navigate to the file's `File:` description page.
 * - Layout: gallery (tiled). The active mode's `layout` field tells
 *   App.vue to swap CommandPaletteList for CommandPaletteGallery.
 */
const {
	cdxIconImageGallery,
	cdxIconImage,
	cdxIconArticle,
	cdxIconAttachment,
	cdxIconVolumeUp,
	cdxIconPlay
} = require( '../icons.json' );
const config = require( '../config.json' );
const { defineMode } = require( '../services/defineMode.js' );

const FILE_NAMESPACE = 6;
const RESULT_LIMIT = 50;

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

function computeThumbWidth() {
	const dpr = ( typeof window !== 'undefined' && window.devicePixelRatio ) || 1;
	return Math.min(
		MAX_THUMB_WIDTH,
		Math.ceil( BASE_TILE_WIDTH * Math.max( 1, dpr ) )
	);
}

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

const MS_PER_MIN = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;

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

// Brand-cased MIME subtypes that look wrong in plain uppercase (WEBM, WEBP).
// Anything not listed falls through to .toUpperCase() in friendlyType().
const SUBTYPE_BRAND_NAMES = {
	webm: 'WebM',
	webp: 'WebP'
};

/**
 * Convert a MIME type and mediatype into a short, human-readable
 * label like "JPEG image" or "PDF document". The label is intended
 * for the detail panel's "type" pair.
 *
 * @param {string} mime e.g. "image/jpeg"
 * @param {string} mediatype Uppercase mediatype string
 * @return {string}
 */
function friendlyType( mime, mediatype ) {
	const slash = mime ? mime.indexOf( '/' ) : -1;
	const rawSubtype = slash >= 0 ? mime.slice( slash + 1 ) : '';
	const subtype = SUBTYPE_BRAND_NAMES[ rawSubtype.toLowerCase() ] || rawSubtype.toUpperCase();
	switch ( mediatype ) {
		case 'BITMAP':
			return subtype ? subtype + ' image' : 'Image';
		case 'DRAWING':
			return subtype ? subtype + ' drawing' : 'Drawing';
		case 'AUDIO':
			return subtype ? subtype + ' audio' : 'Audio';
		case 'VIDEO':
			return subtype ? subtype + ' video' : 'Video';
		case 'OFFICE':
			return subtype ? subtype + ' document' : 'Document';
		case 'ARCHIVE':
			return subtype ? subtype + ' archive' : 'Archive';
		case '3D':
			return subtype ? subtype + ' 3D model' : '3D model';
		default:
			return mime || 'File';
	}
}

/**
 * Format a byte count for human reading. Uses binary prefixes (KiB
 * boundary) but renders the lighter "KB / MB / GB" labels so the
 * detail panel stays unobtrusive.
 *
 * @param {number} bytes
 * @return {string}
 */
function formatFileSize( bytes ) {
	if ( !bytes && bytes !== 0 ) {
		return '';
	}
	if ( bytes < KB ) {
		return bytes + ' B';
	}
	if ( bytes < MB ) {
		return ( bytes / KB ).toFixed( 1 ) + ' KB';
	}
	if ( bytes < GB ) {
		return ( bytes / MB ).toFixed( 1 ) + ' MB';
	}
	return ( bytes / GB ).toFixed( 1 ) + ' GB';
}

/**
 * Format a "size" pair value combining dimensions (when present) and
 * byte size: "1280 × 960, 412 KB" or just "412 KB" for non-visual files.
 *
 * @param {Object} info One imageinfo entry
 * @return {string}
 */
function formatDimensionsAndSize( info ) {
	const parts = [];
	if ( info.width && info.height ) {
		parts.push( info.width + ' × ' + info.height );
	}
	const sizeText = formatFileSize( info.size );
	if ( sizeText ) {
		parts.push( sizeText );
	}
	return parts.join( ', ' );
}

/**
 * Format an upload timestamp as a relative duration ("now", "5m",
 * "3h", "2d") for recent uploads, falling back to a localized short
 * date for older ones. Mirrors the history mode's formatting so the
 * palette stays visually consistent.
 *
 * @param {string} timestamp ISO 8601 string from imageinfo.timestamp
 * @return {string}
 */
function formatUploadAge( timestamp ) {
	const then = new Date( timestamp );
	const diffMs = Date.now() - then.getTime();

	if ( diffMs >= 0 && diffMs < 7 * MS_PER_DAY ) {
		if ( diffMs < MS_PER_MIN ) {
			return 'now';
		}
		if ( diffMs < MS_PER_HOUR ) {
			return Math.floor( diffMs / MS_PER_MIN ) + 'm';
		}
		if ( diffMs < MS_PER_DAY ) {
			return Math.floor( diffMs / MS_PER_HOUR ) + 'h';
		}
		return Math.floor( diffMs / MS_PER_DAY ) + 'd';
	}

	const sameYear = then.getFullYear() === new Date().getFullYear();
	return then.toLocaleDateString( undefined, sameYear ?
		{ month: 'short', day: 'numeric' } :
		{ year: 'numeric', month: 'short', day: 'numeric' } );
}

/**
 * Pull the license short-name out of the extmetadata bag. The field is
 * a localized string under `LicenseShortName.value`. Returns an empty
 * string when absent so the detail panel can drop the row.
 *
 * @param {Object} info One imageinfo entry
 * @return {string}
 */
function extractLicense( info ) {
	const meta = info && info.extmetadata;
	if ( !meta || !meta.LicenseShortName || typeof meta.LicenseShortName.value !== 'string' ) {
		return '';
	}
	return meta.LicenseShortName.value;
}

/**
 * Strip the canonical "File:" prefix from a title for display. The
 * full prefixed title is still used for the URL.
 *
 * @param {string} prefixedTitle
 * @return {string}
 */
function stripFilePrefix( prefixedTitle ) {
	const colonIdx = prefixedTitle.indexOf( ':' );
	if ( colonIdx === -1 ) {
		return prefixedTitle;
	}
	return prefixedTitle.slice( colonIdx + 1 );
}

/**
 * Build the detail.pairs array for a single file. Pairs with empty
 * values are dropped so the panel doesn't render orphaned labels.
 * The friendly type label is rendered as the header subtitle, not a
 * pair — so it isn't included here.
 *
 * @param {Object} info One imageinfo entry
 * @return {Array<{key:string,label:string,value:string}>}
 */
function buildDetailPairs( info ) {
	const pairs = [];

	const sizeText = formatDimensionsAndSize( info );
	if ( sizeText ) {
		pairs.push( {
			key: 'size',
			label: mw.message( 'citizen-command-palette-mode-file-detail-size' ).text(),
			value: sizeText
		} );
	}

	if ( info.timestamp && info.user ) {
		pairs.push( {
			key: 'uploaded',
			label: mw.message( 'citizen-command-palette-mode-file-detail-uploaded' ).text(),
			value: formatUploadAge( info.timestamp ) + ' · ' + info.user
		} );
	}

	const license = extractLicense( info );
	if ( license ) {
		pairs.push( {
			key: 'license',
			label: mw.message( 'citizen-command-palette-mode-file-detail-license' ).text(),
			value: license
		} );
	}

	return pairs;
}

/**
 * Adapt one page entry to a list-stage gallery item.
 *
 * The list query intentionally requests only `iiprop=url|mediatype` —
 * everything else (size, mime, extmetadata, user, timestamp) belongs to
 * the detail panel and is fetched lazily by `getItemDetail` when the
 * item is focused. Returning extmetadata for every file in the list
 * costs ~80% of the response time and bandwidth, and we use exactly
 * one field from it (LicenseShortName) — see the design doc for
 * measurements against starcitizen.tools/Hull_B.
 *
 * `detail.header` is set immediately so the detail pane renders with
 * filename + copy button as soon as the list arrives, without waiting
 * for the per-item detail fetch. `detail.header.description` (friendly
 * type) and `detail.pairs` are populated later by `getItemDetail`.
 *
 * @param {Object} page A page entry from `query.pages`
 * @return {Object|null} A palette item, or null when the page has no usable info
 */
function adaptListItem( page ) {
	const info = page.imageinfo && page.imageinfo[ 0 ];
	if ( !info ) {
		return null;
	}

	const mediatype = info.mediatype || 'UNKNOWN';
	// MW returns `thumburl` set to the original file URL when no thumb
	// can be generated (audio, video without poster, archives, …), often
	// with `thumbheight: -1` but sometimes with positive dimensions
	// echoed back from the request. Real thumbnails live at /thumb/…
	// paths distinct from the original URL — `thumburl !== info.url` is
	// the reliable signal. Without this, native <img> would try to load
	// the underlying media (mp3, webm, pdf) and render a broken-image
	// glyph instead of falling back to the placeholder icon.
	const hasThumbnail = info.thumburl &&
		info.thumburl !== info.url &&
		info.thumbwidth > 0 && info.thumbheight > 0;
	const thumbnail = hasThumbnail ? {
		url: info.thumburl,
		width: info.thumbwidth,
		height: info.thumbheight
	} : null;
	const placeholderIcon = iconForMediatype( mediatype );
	const label = stripFilePrefix( page.title );

	return {
		id: 'citizen-command-palette-item-file-' + page.pageid,
		type: 'file',
		// Carried so `getItemDetail` can request the focused file's
		// detail by pageid without re-deriving it from the item id.
		pageid: page.pageid,
		// Carried so `getItemDetail` can build the friendly type label
		// without re-requesting `mediatype` in the detail query — the
		// list response already has it.
		mediatype: mediatype,
		label: label,
		url: mw.util.getUrl( page.title ),
		thumbnail: thumbnail,
		thumbnailIcon: placeholderIcon,
		detail: {
			header: {
				label: label,
				copyValue: label
			}
		}
	};
}

/**
 * Factory for the file/media mode.
 *
 * @param {Function} ApiConstructor mw.Api constructor.
 * @return {Object} Mode descriptor.
 */
function createFileMode( ApiConstructor ) {
	// List-stage params: enough to render a gallery tile (thumbnail URL,
	// fallback icon via mediatype) and nothing else. Splitting the heavier
	// fields out drops cold-cache response time from ~5.7 s to ~0.7 s on
	// pages with many files.
	const baseListImageinfoParams = {
		action: 'query',
		format: 'json',
		prop: 'imageinfo',
		iiprop: 'url|mediatype',
		maxage: config.wgSearchSuggestCacheExpiry,
		smaxage: config.wgSearchSuggestCacheExpiry
	};

	function listParams( extra ) {
		return Object.assign(
			{}, baseListImageinfoParams, { iiurlwidth: computeThumbWidth() }, extra
		);
	}

	// Detail-stage params: everything the right-pane renders. Filtered
	// to LicenseShortName because that's the only extmetadata field we
	// surface today; widening the filter is a follow-up if/when more
	// detail-panel fields are added.
	const detailImageinfoParams = {
		action: 'query',
		format: 'json',
		prop: 'imageinfo',
		iiprop: 'size|mime|extmetadata|user|timestamp',
		iiextmetadatafilter: 'LicenseShortName',
		maxage: config.wgSearchSuggestCacheExpiry,
		smaxage: config.wgSearchSuggestCacheExpiry
	};

	// Per-pageid cache for detail data. Lives for the page lifetime
	// (the mode factory is called once per palette init). Re-focusing a
	// previously focused item returns the cached value synchronously
	// rather than re-firing the API. Not persisted to mw.storage so
	// file-overwrite / re-licensing changes show up after a reload.
	const detailCache = new Map();

	/**
	 * Run an API query and return its `query.pages` array sorted by
	 * the `index` field (which both prefixsearch and search generators
	 * set). Empty array on failure or abort.
	 *
	 * @param {Object} params
	 * @param {AbortSignal} [signal]
	 * @return {Promise<Array<Object>>}
	 */
	async function queryPages( params, signal ) {
		const api = new ApiConstructor();
		try {
			const data = await api.get( params, { signal } );
			const pages = ( data && data.query && data.query.pages ) || {};
			return Object.values( pages )
				.sort( ( a, b ) => ( a.index || 0 ) - ( b.index || 0 ) );
		} catch ( error ) {
			if ( error && error.name !== 'AbortError' ) {
				mw.log.error( '[commandPalette] File search failed:', error );
			}
			return [];
		}
	}

	function fetchFilesByPrefix( subQuery, signal ) {
		return queryPages( listParams( {
			generator: 'prefixsearch',
			gpssearch: subQuery,
			gpsnamespace: FILE_NAMESPACE,
			gpslimit: RESULT_LIMIT
		} ), signal );
	}

	function fetchFilesByFullText( subQuery, signal ) {
		return queryPages( listParams( {
			generator: 'search',
			gsrsearch: subQuery,
			gsrnamespace: FILE_NAMESPACE,
			gsrlimit: RESULT_LIMIT
		} ), signal );
	}

	/**
	 * Fetch the files used on the currently viewed page (images,
	 * audio, video, etc.). Mirrors how category mode surfaces the
	 * current page's categories at empty input. Returns [] off-article
	 * (no `wgArticleId`).
	 *
	 * @param {AbortSignal} [signal]
	 * @return {Promise<Array<Object>>}
	 */
	function fetchFilesOnPage( signal ) {
		const articleId = mw.config.get( 'wgArticleId' );
		if ( !articleId ) {
			return Promise.resolve( [] );
		}
		const title = mw.config.get( 'wgPageName' );
		return queryPages( listParams( {
			generator: 'images',
			titles: title,
			gimlimit: RESULT_LIMIT
		} ), signal );
	}

	function pagesToItems( pages ) {
		const items = [];
		pages.forEach( ( page ) => {
			const item = adaptListItem( page );
			if ( item ) {
				items.push( item );
			}
		} );
		return items;
	}

	/**
	 * Lazy-load detail data for a focused file item. Called by the
	 * orchestration when the highlighted item changes.
	 *
	 * Returns `{ description, pairs }` for the item's detail panel:
	 * `description` is the friendly type label (rendered as the header
	 * subtitle), `pairs` is the size / uploaded / license rows. The
	 * orchestration mutates the item's `detail` reactively when this
	 * resolves.
	 *
	 * Caches per pageid for the page lifetime. Aborted fetches do not
	 * write to the cache (the rejection bypasses `cache.set`). An empty
	 * or malformed response caches the empty default to prevent a
	 * retry loop on a permanently broken file.
	 *
	 * @param {Object} item Palette item produced by `adaptListItem`.
	 * @param {AbortSignal} [signal]
	 * @return {Promise<{description: string, pairs: Array<Object>}>}
	 */
	async function getItemDetail( item, signal ) {
		const pageid = item && item.pageid;
		if ( !pageid ) {
			return { description: '', pairs: [] };
		}
		if ( detailCache.has( pageid ) ) {
			return detailCache.get( pageid );
		}

		const api = new ApiConstructor();
		const data = await api.get(
			Object.assign( {}, detailImageinfoParams, { pageids: pageid } ),
			{ signal }
		);

		const pages = ( data && data.query && data.query.pages ) || {};
		// Read by exact pageid only. A missing file lands under a synthetic
		// negative key with no imageinfo — `pages[ pageid ]` returns
		// undefined and the empty default below covers that case. A
		// `pages` map with multiple entries is not expected for a
		// `pageids=N` query, and falling back to `Object.values()[ 0 ]`
		// would risk caching another file's metadata under this pageid.
		const page = pages[ pageid ];
		const info = page && page.imageinfo && page.imageinfo[ 0 ];
		// `mediatype` is carried over from the list-stage item so the
		// detail query stays narrow — re-requesting it would cost nothing
		// over the wire but adds a field to a query that's intentionally
		// minimal.
		const detail = info ? {
			description: friendlyType( info.mime, item.mediatype || 'UNKNOWN' ),
			pairs: buildDetailPairs( info )
		} : { description: '', pairs: [] };

		detailCache.set( pageid, detail );
		return detail;
	}

	async function getResults( subQuery, signal ) {
		// Empty input: surface the files used on the current page,
		// matching how category mode surfaces the page's categories.
		// Off-article (or pages without files) falls through to the
		// idle empty state via an empty result list.
		if ( !subQuery ) {
			return pagesToItems( await fetchFilesOnPage( signal ) );
		}

		// Prefix search is universally available (no CirrusSearch dependency)
		// and matches how users typically know file names — by their start.
		// Only run the full-text query when prefix returns nothing, so we pay
		// for a second roundtrip only on edge cases. Skip the fallback when
		// the request was aborted — `queryPages` returns [] on AbortError,
		// which would otherwise look identical to "no prefix matches" and
		// dispatch a wasted full-text request against the same dead signal.
		let pages = await fetchFilesByPrefix( subQuery, signal );
		if ( pages.length === 0 && !( signal && signal.aborted ) ) {
			pages = await fetchFilesByFullText( subQuery, signal );
		}
		return pagesToItems( pages );
	}

	function onResultSelect( item ) {
		return {
			action: 'navigate',
			payload: item.url
		};
	}

	return defineMode( {
		id: 'file',
		triggers: [ '/file:', '~' ],
		label: mw.message( 'citizen-command-palette-command-file-label' ).text(),
		description: mw.message( 'citizen-command-palette-command-file-description' ).text(),
		placeholder: mw.message( 'citizen-command-palette-mode-file-placeholder' ).text(),
		icon: cdxIconImageGallery,
		layout: 'gallery',
		emptyState: {
			title: mw.message( 'citizen-command-palette-mode-file-empty-title' ).text(),
			description: mw.message( 'citizen-command-palette-mode-file-empty-description' ).text(),
			icon: cdxIconImageGallery
		},
		noResults() {
			return {
				title: mw.message( 'citizen-command-palette-mode-file-noresults-title' ).text(),
				description: mw.message( 'citizen-command-palette-mode-file-noresults-description' ).text(),
				icon: cdxIconImageGallery
			};
		},
		help: {
			description: 'citizen-command-palette-mode-file-description-help'
		},
		getResults,
		getItemDetail,
		onResultSelect
	} );
}

module.exports = createFileMode;
