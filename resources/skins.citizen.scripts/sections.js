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

	const setHeadlineAttributes = ( heading, collapsibleID, sectionIndex ) => {
		const headline = heading.querySelector( '.mw-headline, .mw-heading' );

		if ( !headline ) {
			return;
		}

		headline.setAttribute( 'tabindex', '0' );
		headline.setAttribute( 'role', 'button' );
		headline.setAttribute( 'aria-controls', collapsibleID );
		headline.setAttribute( 'aria-expanded', 'true' );
		headline.setAttribute( 'data-mw-citizen-section-heading-index', sectionIndex );
	};

	const setSectionAttributes = ( section ) => {
		section.setAttribute( 'aria-hidden', 'false' );
	};

	const toggleClasses = ( heading, section ) => {
		if ( section ) {
			heading.classList.toggle( 'citizen-section-heading--collapsed' );
			section.classList.toggle( 'citizen-section--collapsed' );
		}
	};

	const toggleAriaAttribute = ( el, attribute ) => {
		const isAttributeSet = el.getAttribute( attribute ) === 'true';
		el.setAttribute( attribute, isAttributeSet ? 'false' : 'true' );
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

		const selectedHeading = target.closest( '.citizen-section-heading' );

		if ( selectedHeading ) {
			const selectedHeadline = selectedHeading.querySelector( '.mw-headline, .mw-heading' );

			if ( selectedHeadline ) {
				const sectionIndex = +selectedHeadline.dataset.mwCitizenSectionHeadingIndex;
				const selectedSection = sections[ sectionIndex + 1 ];
				toggleClasses( selectedHeading, selectedSection );
				toggleAriaAttribute( selectedHeadline, 'aria-expanded' );
				toggleAriaAttribute( selectedSection, 'aria-hidden' );
			}
		}
	};

	const headingsLength = headings.length;
	for ( let i = 0; i < headingsLength; i++ ) {
		setHeadlineAttributes( headings[ i ], `citizen-section-${ i + 1 }`, i );
	}

	sections.forEach( ( section ) => {
		setSectionAttributes( section );
	} );

	bodyContent.addEventListener( 'click', handleClick, false );
}

module.exports = {
	init: init
};
