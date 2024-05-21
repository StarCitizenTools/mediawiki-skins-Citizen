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
	const sections = bodyContent.querySelectorAll( '.citizen-section-collapsible' );

	const toggleAriaExpanded = ( headline ) => {
		headline.toggleAttribute( 'aria-expanded' );

	};

	const setHeadlineAttributes = ( headline, collapsibleID ) => {
		headline.setAttribute( 'tabindex', 0 );
		headline.setAttribute( 'role', 'button' );
		headline.setAttribute( 'aria-controls', collapsibleID );
		headline.setAttribute( 'aria-expanded', true );
	};

	const handleClick = ( i ) => {
		const collapsibleID = `citizen-section-collapsible-${ i + 1 }`;
		const headline = headings[ i ].querySelector( '.citizen-section-heading .mw-headline' );

		if ( headline ) {
			setHeadlineAttributes( headline, collapsibleID );

			headings[ i ].addEventListener( 'click', function ( e ) {
				this.classList.toggle( 'citizen-section-heading--collapsed' );
				sections[ i + 1 ].classList.toggle( 'citizen-section-collapsible--collapsed' );
				toggleAriaExpanded( headline );

				if ( e.target.closest( '.mw-editsection, .mw-editsection-like' ) ) {
					e.stopPropagation();
				}
			} );
		}
	};

	for ( let i = 0; i < headings.length; i++ ) {
		handleClick( i );
	}
}

module.exports = {
	init: init
};
