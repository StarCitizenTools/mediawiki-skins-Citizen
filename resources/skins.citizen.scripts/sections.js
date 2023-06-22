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

	const
		headings = bodyContent.querySelectorAll( '.section-heading' ),
		sections = bodyContent.querySelectorAll( '.section-collapsible' ),
		editSections = bodyContent.querySelectorAll( '.mw-editsection, .mw-editsection-like' );

	for ( let i = 0; i < headings.length; i++ ) {
		const j = i + 1,
			collapsibleID = `.section-collapsible-${j}`,
			/* T13555 */
			headline = headings[ i ].querySelector( '.mw-headline' ) || headings[ i ].querySelector( '.mw-heading' );

		// Set up ARIA
		headline.setAttribute( 'tabindex', 0 );
		headline.setAttribute( 'role', 'button' );
		headline.setAttribute( 'aria-controls', collapsibleID );
		headline.setAttribute( 'aria-expanded', true );

		// TODO: Need a keyboard handler
		headings[ i ].addEventListener( 'click', function () {
			// .section-heading--collapsed

			this.classList.toggle( 'section-heading--collapsed' );
			// .section-collapsible--collapsed

			sections[ j ].classList.toggle( 'section-collapsible--collapsed' );
			headline.setAttribute( 'aria-expanded', headline.getAttribute( 'aria-expanded' ) === 'true' ? 'false' : 'true' );
		} );
	}

	for ( let i = 0; i < editSections.length; i++ ) {
		editSections[ i ].addEventListener( 'click', function ( e ) {
			e.stopPropagation();
		} );
	}
}

module.exports = {
	init: init
};
