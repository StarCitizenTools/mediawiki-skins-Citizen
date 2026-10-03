const MS_PER_MIN = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Format a revision timestamp for human scanning.
 *
 * Recent edits get a compact relative form — "now", "5m", "3h", "2d".
 * It has no "ago": every caller shows it beside other details of a
 * revision, where a time can only be in the past, and language-neutral
 * abbreviations stay short across locales. A caller that shows it where
 * the past tense is not implied needs a different form. Older edits get
 * a compact absolute date ("Apr 28") via Intl.DateTimeFormat, which
 * localizes for free.
 *
 * @param {string} timestamp ISO 8601 string from the API
 * @return {string}
 */
function formatTimestamp( timestamp ) {
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

module.exports = formatTimestamp;
