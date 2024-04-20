const ACTIVE_SECTION_CLASS = 'citizen-toc__listItem--active';

let /** @type {HTMLElement | undefined} */ activeSection;

/**
 * @param {string} id
 */
function changeActiveSection( id ) {
	const toc = document.getElementById( 'mw-panel-toc' );

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
	const tocEl = document.getElementById( 'mw-panel-toc' );
	if ( !tocEl ) {
		return;
	}

	const getHeadlineElements = () => {
		const getHeadlineIds = () => {
			const headlineIds = [];
			// Nodelist.forEach is forbidden by mediawiki/no-nodelist-unsupported-methods
			Array.from( tocEl.querySelectorAll( '.citizen-toc__listItem' ) ).forEach( ( tocListEl ) => {
				// Remove 'toc-' prefix from ID
				headlineIds.push( '#' + tocListEl.id.slice( 4 ) );
			} );
			return headlineIds.join( ',' );
		};
		return bodyContent.querySelectorAll( getHeadlineIds() );
	};

	// We use scroll-padding-top to handle scrolling with fixed header
	// It is better to respect that so it is consistent
	const getTopMargin = () => {
		return Number(
			window.getComputedStyle( document.documentElement )
				.getPropertyValue( 'scroll-padding-top' )
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
			changeActiveSection( section.id );
		}
	} );

	// TODO: Pause section observer on ToC link click
	sectionObserver.resume();
}

module.exports = {
	init: init
};
