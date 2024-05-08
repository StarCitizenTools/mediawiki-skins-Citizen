/**
 * Enhance last modified to use human readable relative time
 *
 * @return {void}
 */
function init() {
	const lastmodEl = document.getElementById( 'citizen-lastmod-relative' );
	if ( !lastmodEl || typeof Intl.RelativeTimeFormat !== 'function' ) {
		return;
	}

	// There might be better method but it works :P
	const lang = document.documentElement.getAttribute( 'lang' );
	// eslint-disable-next-line compat/compat
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

	const formatTimeAgo = ( date ) => {
		let duration = date - Date.now() / 1000;

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
