/**
 * Set up functionality of collapsable sections
 *
 * @param {HTMLElement} bodyContent
 * @return {void}
 */
function init( bodyContent ) {
	if ( !document.body.classList.contains( 'citizen-sections-enabled' ) ) {
		return;
	}

	const headings = bodyContent.querySelectorAll( '.citizen-section-heading' );
	const sections = bodyContent.querySelectorAll( '.citizen-section' );

	const setHeadlineAttributes = ( heading, collapsibleID, i ) => {
		const headline = heading.querySelector( '.mw-headline' ) ||
				heading.querySelector( '.mw-heading' );

		if ( !headline ) {
			return;
		}

		headline.setAttribute( 'tabindex', 0 );
		headline.setAttribute( 'role', 'button' );
		headline.setAttribute( 'aria-controls', collapsibleID );
		headline.setAttribute( 'aria-expanded', true );
		headline.setAttribute( 'data-mw-citizen-section-heading-index', i );
	};

	const toggleClasses = ( i ) => {
		if ( sections[ i + 1 ] ) {
			headings[ i ].classList.toggle( 'citizen-section-heading--collapsed' );
			sections[ i + 1 ].classList.toggle( 'citizen-section--collapsed' );
		}
	};

	const toggleAriaExpanded = ( el ) => {
		const isExpanded = el.getAttribute( 'aria-expanded' ) === 'true';
		el.setAttribute( 'aria-expanded', isExpanded ? 'false' : 'true' );
	};

	const onEditSectionClick = ( e ) => {
		e.stopPropagation();
	};

	const handleClick = ( e ) => {
		const target = e.target;
		const isEditSection = target.closest( '.mw-editsection, .mw-editsection-like' );

		if ( isEditSection ) {
			onEditSectionClick( e );
			return;
		}

		const heading = target.closest( '.citizen-section-heading' );

		if ( heading ) {
			const headline = heading.querySelector( '.mw-headline' ) ||
				heading.querySelector( '.mw-heading' );

			if ( headline ) {
				const i = +headline.getAttribute( 'data-mw-citizen-section-heading-index' );
				toggleClasses( i );
				toggleAriaExpanded( headline );
			}
		}
	};

	const headingsLength = headings.length;
	for ( let i = 0; i < headingsLength; i++ ) {
		setHeadlineAttributes( headings[ i ], `citizen-section-${ i + 1 }`, i );
	}

	bodyContent.addEventListener( 'click', handleClick, false );
}

module.exports = {
	init: init
};
