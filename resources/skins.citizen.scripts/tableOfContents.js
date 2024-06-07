const ACTIVE_SECTION_CLASS = 'citizen-toc__listItem--active';

let /** @type {HTMLElement | undefined} */ activeSection;

/**
 * Escapes double quotes in the given HTML attribute ID.
 *
 * @param {string} id - The HTML attribute ID to escape double quotes from.
 * @return {string} The escaped HTML attribute ID with double quotes replaced.
 */
function escapeHtmlAttributeQuotes( id ) {
	// Escapes double quotes in the given id
	return id.replace( /"/g, '\\"' );
}

/**
 * Finds a link element in the table of contents (TOC) based on the provided ID.
 *
 * @param {Element} toc - The table of contents element to search within.
 * @param {string} id - The ID of the section to find the link for.
 * @return {Element|null} The link element corresponding to the provided ID, or null if not found.
 */
function findLinkById( toc, id ) {
	const sanitizedId = escapeHtmlAttributeQuotes( id );
	const linkElement = toc.querySelector( `a[href="#${ sanitizedId }"]` );
	return linkElement;
}

/**
 * Changes the active section in the table of contents based on the provided ID.
 *
 * @param {HTMLElement} toc - The Table of Content HTML element
 * @param {string} id - The ID of the section to make active.
 * @return {void}
 */
function changeActiveSection( toc, id ) {
	const link = findLinkById( toc, id );

	if ( activeSection ) {
		activeSection.classList.remove( ACTIVE_SECTION_CLASS );
		activeSection = undefined;
	}

	if ( link ) {
		activeSection = link.parentNode;
		activeSection.classList.add( ACTIVE_SECTION_CLASS );
	}
}

/**
 * Toggle active HTML class to items in table of content based on user viewport.
 * Based on Vector
 *
 * @param {HTMLElement} bodyContent
 * @return {void}
 */
function init( bodyContent ) {
	const toc = document.getElementById( 'mw-panel-toc' );
	if ( !toc ) {
		return;
	}

	const extractIds = () => Array.from( toc.querySelectorAll( '.citizen-toc__listItem' ) )
		.map( ( tocListEl ) => tocListEl.id.slice( 4 ) );

	const queryElements = ( ids ) => ids.map( ( id ) => bodyContent.querySelector( '#' + CSS.escape( id ) ) )
		.filter( ( element ) => element !== null && element !== undefined );

	const headlines = queryElements( extractIds() );

	const computedStyle = window.getComputedStyle( document.documentElement );
	const scrollPaddingTop = computedStyle.getPropertyValue( 'scroll-padding-top' );
	const topMargin = Number( scrollPaddingTop.slice( 0, -2 ) ) + 20;

	const getTopMargin = () => topMargin;

	const initSectionObserver = require( './sectionObserver.js' ).init;

	const sectionObserver = initSectionObserver( {
		elements: headlines,
		topMargin: getTopMargin(),
		onIntersection: ( section ) => {
			if ( section.id && section.id.trim() !== '' ) {
				changeActiveSection( toc, section.id );
			}
		}
	} );

	sectionObserver.resume();
}

module.exports = {
	init: init
};
