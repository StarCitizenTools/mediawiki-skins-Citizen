/**
 * @param {Document} document
 * @return {void}
 */
function initCollapsibleSections( document ) {
	const prefix = 'section-',
		headings = document.querySelectorAll( '.' + prefix + 'heading' ),
		sections = document.querySelectorAll( '.' + prefix + 'collapsible' );

	for ( let i = 0; i < headings.length; i++ ) {
		const j = i + 1,
			collapsibleID = prefix + 'collapsible-' + j,
			headline = headings[ i ].querySelector( '.mw-headline' );

		// Set up ARIA
		headline.setAttribute( 'tabindex', 0 );
		headline.setAttribute( 'role', 'button' );
		headline.setAttribute( 'aria-controls', collapsibleID );
		headline.setAttribute( 'aria-expanded', true );

		// TODO: Need a keyboard handler
		headings[ i ].addEventListener( 'click', function () {
			// .section-heading--collapsed

			this.classList.toggle( prefix + 'heading--collapsed' );
			// .section-collapsible--collapsed

			sections[ j ].classList.toggle( prefix + 'collapsible--collapsed' );
			headline.setAttribute( 'aria-expanded', headline.getAttribute( 'aria-expanded' ) === 'true' ? 'false' : 'true' );
		} );
	}
}

initCollapsibleSections( document );
