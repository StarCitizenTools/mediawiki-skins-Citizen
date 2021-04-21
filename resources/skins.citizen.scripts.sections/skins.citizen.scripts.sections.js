/**
 * @param {Document} document
 * @return {void}
 */
function initCollapsibleSections( document ) {
	const headings = document.querySelectorAll( '.section-heading' ),
		sections = document.querySelectorAll( '.section-collapsible' );

	for ( let i = 0; i < headings.length; i++ ) {
		headings[ i ].addEventListener( 'click', function () {
			const j = i + 1;
			this.classList.toggle( 'section-heading--collapsed' );
			sections[ j ].classList.toggle( 'section-collapsible--collapsed' );
		} );
	}
}

initCollapsibleSections( document );
