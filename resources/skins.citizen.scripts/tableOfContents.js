const ACTIVE_SECTION_CLASS = 'toc__item--active';

let /** @type {HTMLElement | undefined} */ activeSection;

/**
 * @param {string} id
 */
function changeActiveSection( id ) {
	const toc = document.getElementById( 'toc' );

	const getLink = ( hash ) => {
		const
			prefix = 'a[href="#',
			suffix = '"]';

		let el = toc.querySelector( prefix + hash + suffix );

		if ( el === null ) {
			// Sometimes the href attribute is encoded
			el = toc.querySelector( prefix + encodeURIComponent( hash ) + suffix );
		}

		return el;
	};

	const link = getLink( id );

	if ( activeSection ) {
		activeSection.classList.remove( ACTIVE_SECTION_CLASS );
		activeSection = undefined;
	}

	activeSection = link.parentNode;
	activeSection.classList.add( ACTIVE_SECTION_CLASS );
}

/**
 * Toggle active HTML class to items in table of content based on user viewport.
 * Based on Vector
 *
 * @return {void}
 */
function initToC() {
	const bodyContent = document.getElementById( 'bodyContent' );

	// We use scroll-padding-top to handle scrolling with fixed header
	// It is better to respect that so it is consistent
	const getTopMargin = () => {
		return Number(
			window.getComputedStyle( document.documentElement )
				.getPropertyValue( 'scroll-padding-top' )
				.slice( 0, -2 )
		) + 20;
	};

	const initSectionObserver = require( './sectionObserver.js' ).init;

	const sectionObserver = initSectionObserver( {
		elements: bodyContent.querySelectorAll( '.mw-headline' ),
		topMargin: getTopMargin(),
		onIntersection: ( section ) => { changeActiveSection( section.id ); }
	} );

	// TODO: Pause section observer on ToC link click
	sectionObserver.resume();
}

module.exports = {
	init: initToC
};
