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

		if ( heading && heading.nextElementSibling && heading.nextElementSibling.classList.contains( 'citizen-section' ) ) {
			const section = heading.nextElementSibling;

			if ( section ) {
				section.hidden = section.hidden ? false : 'until-found';
			}
		}
	};

	bodyContent.addEventListener( 'click', handleClick, false );
}

module.exports = {
	init: init
};
