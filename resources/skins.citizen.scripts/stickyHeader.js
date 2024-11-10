const
	STICKY_HEADER_ID = 'citizen-page-header',
	STICKY_HEADER_PLACEHOLDER_ID = 'citizen-page-header-sticky-placeholder',
	STICKY_HEADER_VISIBLE_CLASS = 'citizen-sticky-header-visible';

/**
 * Update sticky header CSS variable, used by other sticky elements
 *
 * @param {number} value
 * @return {void}
 */
function setCSSVariable( value ) {
	document.documentElement.style.setProperty( '--height-sticky-header', `${ value }px` );
}

/**
 * Show the sticky header.
 *
 * @param {HTMLElement} stickyHeader
 * @param {HTMLElement} placeholder
 * @return {void}
 */
function show( stickyHeader, placeholder ) {
	const staticHeight = stickyHeader.getBoundingClientRect().height;
	document.body.classList.add( STICKY_HEADER_VISIBLE_CLASS );
	const stickyHeight = stickyHeader.getBoundingClientRect().height;
	placeholder.style.height = `${ staticHeight - stickyHeight }px`;
	setCSSVariable( stickyHeight );
}

/**
 * Hide the sticky header.
 *
 * @param {HTMLElement} stickyHeader
 * @param {HTMLElement} placeholder
 * @return {void}
 */
function hide( stickyHeader, placeholder ) {
	// Dismiss dropdown menus and search if active
	if ( stickyHeader && stickyHeader.contains( document.activeElement ) ) {
		document.body.click();
	}
	placeholder.style.height = '0px';
	setCSSVariable( 0 );
	document.body.classList.remove( STICKY_HEADER_VISIBLE_CLASS );
}

module.exports = {
	STICKY_HEADER_ID,
	STICKY_HEADER_PLACEHOLDER_ID,
	STICKY_HEADER_VISIBLE_CLASS,
	show,
	hide
};
