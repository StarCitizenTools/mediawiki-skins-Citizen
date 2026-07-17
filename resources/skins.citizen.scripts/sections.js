const COLLAPSED_CLASS = 'citizen-parsoid-section--collapsed';

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {HTMLElement} deps.bodyContent
 * @return {Object}
 */
function createSections( { document, bodyContent } ) {
	/**
	 * The native Parsoid section wrapper a heading belongs to, or null when
	 * the heading is not the direct heading of such a section (legacy markup).
	 *
	 * @param {HTMLElement} heading
	 * @return {HTMLElement|null}
	 */
	function getParsoidSection( heading ) {
		const section = heading.parentElement;
		if ( section && section.hasAttribute( 'data-mw-section-id' ) ) {
			return section;
		}
		return null;
	}

	/**
	 * Collapse or expand a native Parsoid section. The heading stays visible;
	 * every other direct child (including nested subsections) is hidden with
	 * `until-found` so find-in-page can still reach the content.
	 *
	 * @param {HTMLElement} section
	 * @param {boolean} collapsed
	 */
	function setParsoidSectionCollapsed( section, collapsed ) {
		section.classList.toggle( COLLAPSED_CLASS, collapsed );
		for ( const child of section.children ) {
			if ( child.classList.contains( 'mw-heading' ) ) {
				continue;
			}
			child.hidden = collapsed ? 'until-found' : false;
		}
	}

	/**
	 * Set up functionality of collapsable sections
	 *
	 * @return {void}
	 */
	function init() {
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

			// Native Parsoid sections: the heading is a direct child of its
			// own <section data-mw-section-id> wrapper
			const mwHeading = target.closest( '.mw-heading' );
			if ( mwHeading ) {
				const parsoidSection = getParsoidSection( mwHeading );
				if ( parsoidSection ) {
					setParsoidSectionCollapsed(
						parsoidSection,
						!parsoidSection.classList.contains( COLLAPSED_CLASS )
					);
					return;
				}
			}

			const heading = target.closest( '.citizen-section-heading' );

			if ( heading && heading.nextElementSibling && heading.nextElementSibling.classList.contains( 'citizen-section' ) ) {
				const section = heading.nextElementSibling;

				if ( section ) {
					section.hidden = section.hidden ? false : 'until-found';
				}
			}
		};

		// Legacy sections self-heal on find-in-page: the browser clears the
		// wrapper's own `hidden`. Parsoid sections hide individual children,
		// so expand the whole chain of collapsed ancestors on a match.
		const handleBeforeMatch = ( e ) => {
			let section = e.target instanceof Element ?
				e.target.closest( `section[data-mw-section-id].${ COLLAPSED_CLASS }` ) :
				null;
			while ( section ) {
				setParsoidSectionCollapsed( section, false );
				section = section.parentElement ?
					section.parentElement.closest( `section[data-mw-section-id].${ COLLAPSED_CLASS }` ) :
					null;
			}
		};

		bodyContent.addEventListener( 'click', handleClick, false );
		bodyContent.addEventListener( 'beforematch', handleBeforeMatch, false );
	}

	return { init };
}

module.exports = { createSections };
