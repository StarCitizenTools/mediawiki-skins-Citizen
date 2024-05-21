const ACTIVE_SECTION_CLASS = 'citizen-toc__listItem--active';

let /** @type {HTMLElement | undefined} */ activeSection;

/**
 * Changes the active section in the table of contents based on the provided ID.
 *
 * @param {HTMLElement} toc - The Table of Content HTML element
 * @param {string} id - The ID of the section to make active.
 * @return {void}
 */
function changeActiveSection( toc, id ) {
	const getLink = ( hash ) => {
		const el = toc.querySelector( `a[href="#${ hash }"], a[href="#${ encodeURIComponent( hash ) }"]` );
		return el;
	};

	const link = getLink( id );

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

	const getHeadlineElements = () => {
		const headlineElements = [];
		Array.from( toc.querySelectorAll( '.citizen-toc__listItem' ) ).forEach( ( tocListEl ) => {
			// Remove 'toc-' prefix from ID
			const headlineElement = bodyContent.querySelector( '#' + CSS.escape( tocListEl.id.slice( 4 ) ) );
			if ( headlineElement ) {
				headlineElements.push( headlineElement );
			}
		} );
		return headlineElements;
	};

	// We use scroll-padding-top to handle scrolling with fixed header
	// It is better to respect that so it is consistent
	const getTopMargin = () => {
		const computedStyle = window.getComputedStyle( document.documentElement );
		return Number(
			computedStyle.getPropertyValue( 'scroll-padding-top' )
				.slice( 0, -2 )
		) + 20;
	};

	const headlines = getHeadlineElements();

	// Do not continue if there are no headlines
	// TODO: Need to revamp the selector so that it works better with MW 1.40,
	// currently MW 1.40 has ToC on non-content pages as well
	if ( !headlines ) {
		return;
	}

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

	// TODO: Pause section observer on ToC link click
	sectionObserver.resume();
}

module.exports = {
	init: init
};
