const DIVISIONS = [
	{ amount: 60, name: 'seconds' },
	{ amount: 60, name: 'minutes' },
	{ amount: 24, name: 'hours' },
	{ amount: 7, name: 'days' },
	{ amount: 4.34524, name: 'weeks' },
	{ amount: 12, name: 'months' },
	{ amount: Number.POSITIVE_INFINITY, name: 'years' }
];

const SECONDS_IN_MILLISECOND = 1000;

/**
 * Formats the time elapsed since a given date in a human-readable relative time format.
 *
 * @param {string} date - The timestamp in seconds to calculate relative time from.
 * @param {number} nowMs - The current time in milliseconds (e.g. Date.now()).
 * @param {Intl.RelativeTimeFormat} rtf - The formatter instance.
 * @param {Array<{amount: number, name: string}>} divisions - Time unit divisions.
 * @return {string|undefined} The formatted relative time string, or undefined if invalid.
 */
function formatTimeAgo( date, nowMs, rtf, divisions ) {
	const timestamp = parseFloat( date );
	if ( isNaN( timestamp ) ) {
		return;
	}
	let duration = timestamp - nowMs / SECONDS_IN_MILLISECOND;

	for ( let i = 0; i < divisions.length; i++ ) {
		const division = divisions[ i ];
		if ( Math.abs( duration ) < division.amount ) {
			return rtf.format( Math.round( duration ), division.name );
		}
		duration /= division.amount;
	}
}

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Object} deps.Intl
 * @return {Object}
 */
function createLastModified( { document, Intl: IntlObj } ) {
	function init() {
		const lastmodEl = document.getElementById( 'citizen-page-aside-lastmod-time' );
		if ( !lastmodEl || typeof IntlObj.RelativeTimeFormat !== 'function' ) {
			return;
		}

		// Seconds: the unit formatTimeAgo and its divisions are written in.
		const timestamp = Date.parse( lastmodEl.getAttribute( 'datetime' ) || '' ) / SECONDS_IN_MILLISECOND;
		if ( isNaN( timestamp ) ) {
			return;
		}

		const lang = document.documentElement.getAttribute( 'lang' );

		let rtf;
		try {
			rtf = new IntlObj.RelativeTimeFormat( lang );
		} catch ( e ) {
			// A structurally invalid BCP 47 tag (e.g. the x-xss testing
			// pseudo-language) makes the constructor throw. The relative time is
			// a progressive enhancement, so leave the server-rendered absolute
			// date in place rather than aborting the rest of skin init.
			mw.log.warn(
				'[Citizen] Skipping the relative last-modified time; the interface language is not a valid BCP 47 tag:',
				e
			);
			return;
		}

		const relative = formatTimeAgo( String( timestamp ), Date.now(), rtf, DIVISIONS );
		if ( relative !== undefined ) {
			lastmodEl.textContent = relative;
		}
	}

	return { init };
}

module.exports = { createLastModified, formatTimeAgo, DIVISIONS };
