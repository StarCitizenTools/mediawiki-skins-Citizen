/**
 * Compact localized relative time, shared by the notification rows and the
 * cross-wiki list.
 *
 * @module relativeTime
 */

// Largest-first so we pick the coarsest unit that fits.
const RELATIVE_UNITS = [
	[ 'year', 31536000 ],
	[ 'month', 2592000 ],
	[ 'week', 604800 ],
	[ 'day', 86400 ],
	[ 'hour', 3600 ],
	[ 'minute', 60 ]
];

/**
 * Format a unix timestamp (seconds) as a compact localized relative time via
 * Intl's narrow style, e.g. "now", "2m ago", "5h ago", "3d ago". Returns ''
 * for a missing/invalid timestamp, where Intl is unsupported, or where the
 * user language is not a valid BCP 47 tag.
 *
 * @param {number} unixSeconds
 * @return {string}
 */
function formatRelativeTime( unixSeconds ) {
	// Captured through a guarded reference so unsupported browsers degrade to
	// no timestamp rather than throwing (mirrors lastModified.js).
	// eslint-disable-next-line compat/compat
	const RelativeTimeFormat = typeof Intl !== 'undefined' && Intl.RelativeTimeFormat;
	if ( !unixSeconds || !RelativeTimeFormat ) {
		return '';
	}
	const deltaSeconds = unixSeconds - Math.floor( Date.now() / 1000 ); // negative = past
	const abs = Math.abs( deltaSeconds );
	const match = RELATIVE_UNITS.find( ( unit ) => abs >= unit[ 1 ] );
	const unitName = match ? match[ 0 ] : 'second';
	const divisor = match ? match[ 1 ] : 1;

	let rtf;
	try {
		rtf = new RelativeTimeFormat(
			mw.config.get( 'wgUserLanguage' ) || undefined,
			{ style: 'narrow', numeric: 'auto' }
		);
	} catch ( e ) {
		// A structurally invalid BCP 47 tag (e.g. the x-xss testing
		// pseudo-language) makes the constructor throw. Degrade to no relative
		// timestamp rather than breaking the notification row's render.
		mw.log.warn(
			'[Citizen] Skipping the notification relative time; the interface language is not a valid BCP 47 tag:',
			e
		);
		return '';
	}

	return rtf.format( Math.round( deltaSeconds / divisor ), unitName );
}

module.exports = formatRelativeTime;
