const MS_PER_MIN = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;

// Built on first use and kept: a formatter costs far more to build than to
// use, and the first one a page builds loads the locale's date data.
/** @type {Intl.DateTimeFormat|null} */
let sameYearFormat = null;
/** @type {Intl.DateTimeFormat|null} */
let otherYearFormat = null;

/**
 * Build a date formatter in the interface language rather than the
 * browser's, so the palette matches the rest of the page when the two
 * differ.
 *
 * @param {Intl.DateTimeFormatOptions} options
 * @return {Intl.DateTimeFormat}
 */
function createDateFormat( options ) {
	const locale = mw.config.get( 'wgUserLanguage' ) || undefined;
	try {
		return new Intl.DateTimeFormat( locale, options );
	} catch ( e ) {
		// A structurally invalid BCP 47 tag (e.g. the x-xss testing
		// pseudo-language) makes the constructor throw. Fall back to the
		// browser locale rather than breaking the row's render.
		return new Intl.DateTimeFormat( undefined, options );
	}
}

/**
 * Format a revision timestamp for human scanning.
 *
 * Recent edits get a compact relative form — "now", "5m", "3h", "2d".
 * It has no "ago": every caller shows it beside other details of a
 * revision, where a time can only be in the past, and language-neutral
 * abbreviations stay short across locales. A caller that shows it where
 * the past tense is not implied needs a different form. Older edits get
 * a compact absolute date ("Apr 28") via Intl.DateTimeFormat, in the
 * interface language.
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

	// A formatter throws on an invalid date; this gives "Invalid Date", as
	// toLocaleDateString does, so the row is still drawn.
	if ( Number.isNaN( then.getTime() ) ) {
		return String( then );
	}
	if ( then.getFullYear() === new Date().getFullYear() ) {
		sameYearFormat = sameYearFormat ||
			createDateFormat( { month: 'short', day: 'numeric' } );
		return sameYearFormat.format( then );
	}
	otherYearFormat = otherYearFormat ||
		createDateFormat( { year: 'numeric', month: 'short', day: 'numeric' } );
	return otherYearFormat.format( then );
}

module.exports = formatTimestamp;
