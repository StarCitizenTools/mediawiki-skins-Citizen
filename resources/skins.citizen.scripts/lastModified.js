/**
 * Updates the text content of a specific HTML element to display a human-readable,
 * relative time format based on a timestamp attribute.
 *
 * @return {void}
 */
function init() {
	const lastmodEl = document.getElementById( 'citizen-lastmod-relative' );
	if ( !lastmodEl || typeof Intl.RelativeTimeFormat !== 'function' ) {
		return;
	}

	const lang = document.documentElement.getAttribute( 'lang' );
	const rtf = new Intl.RelativeTimeFormat( lang );

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

	// eslint-disable-next-line jsdoc/require-returns-check
	/**
	 * Formats the time elapsed since a given date in a human-readable relative time format.
	 *
	 * @param {string} date - The timestamp to calculate relative time from.
	 * @return {string} The formatted relative time string.
	 */
	const formatTimeAgo = ( date ) => {
		const timestamp = parseFloat( date );
		if ( isNaN( timestamp ) ) {
			mw.log.error( '[Citizen] Invalid timestamp value' );
			return;
		}
		let duration = timestamp - Date.now() / SECONDS_IN_MILLISECOND;

		for ( let i = 0; i < DIVISIONS.length; i++ ) {
			const division = DIVISIONS[ i ];
			if ( Math.abs( duration ) < division.amount ) {
				return rtf.format( Math.round( duration ), division.name );
			}
			duration /= division.amount;
		}
	};

	lastmodEl.lastChild.textContent = formatTimeAgo( lastmodEl.getAttribute( 'data-timestamp' ) );
}

module.exports = {
	init: init
};
