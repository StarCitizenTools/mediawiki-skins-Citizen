const COLLAPSED_CLASS = 'citizen-section--collapsed';
const HEADING_SELECTOR = '.mw-heading, .citizen-section-heading';
const COLLAPSED_SECTION_SELECTOR =
	`section[data-mw-section-id].${ COLLAPSED_CLASS }, section.citizen-section.${ COLLAPSED_CLASS }`;

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {HTMLElement} deps.bodyContent
 * @return {Object}
 */
function createSections( { document, bodyContent } ) {
	/**
	 * The section wrapper a heading belongs to: a native Parsoid section or
	 * a section produced by the legacy transform (both carry the heading as
	 * a direct child). Null for pre-convergence cached markup, where the
	 * heading sits outside the section.
	 *
	 * @param {HTMLElement} heading
	 * @return {HTMLElement|null}
	 */
	function getSectionFromHeading( heading ) {
		const section = heading.parentElement;
		if ( section && (
			section.hasAttribute( 'data-mw-section-id' ) ||
			section.classList.contains( 'citizen-section' )
		) ) {
			return section;
		}
		return null;
	}

	/**
	 * Collapse or expand a section that contains its own heading. The
	 * heading stays visible; every other direct child (including nested
	 * subsections) is hidden with `until-found` so find-in-page can still
	 * reach the content.
	 *
	 * @param {HTMLElement} section
	 * @param {boolean} collapsed
	 */
	function setSectionCollapsed( section, collapsed ) {
		section.classList.toggle( COLLAPSED_CLASS, collapsed );
		for ( const child of section.children ) {
			if ( child.matches( HEADING_SELECTOR ) ) {
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

			const heading = target.closest( HEADING_SELECTOR );
			if ( !heading ) {
				return;
			}

			// Sections that contain their own heading: native Parsoid markup
			// and the legacy transform's converged output
			const section = getSectionFromHeading( heading );
			if ( section ) {
				setSectionCollapsed(
					section,
					!section.classList.contains( COLLAPSED_CLASS )
				);
				return;
			}

			// Pre-convergence cached markup: the heading precedes a sibling
			// section that wraps only the body
			if ( heading.nextElementSibling && heading.nextElementSibling.classList.contains( 'citizen-section' ) ) {
				const sibling = heading.nextElementSibling;
				sibling.hidden = sibling.hidden ? false : 'until-found';
			}
		};

		// Pre-convergence cached sections self-heal on find-in-page: the
		// browser clears the wrapper's own `hidden`. Converged and Parsoid
		// sections hide individual children, so expand the whole chain of
		// collapsed ancestors on a match.
		const handleBeforeMatch = ( e ) => {
			let section = e.target instanceof Element ?
				e.target.closest( COLLAPSED_SECTION_SELECTOR ) :
				null;
			while ( section ) {
				setSectionCollapsed( section, false );
				section = section.parentElement ?
					section.parentElement.closest( COLLAPSED_SECTION_SELECTOR ) :
					null;
			}
		};

		bodyContent.addEventListener( 'click', handleClick, false );
		bodyContent.addEventListener( 'beforematch', handleBeforeMatch, false );
	}

	return { init };
}

module.exports = { createSections };
