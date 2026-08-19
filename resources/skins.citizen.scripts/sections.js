const COLLAPSED_CLASS = 'citizen-section--collapsed';
const HEADING_SELECTOR = '.mw-heading, .citizen-section-heading';
const HEADING_TAGS = 'h1, h2, h3, h4, h5, h6';
const TOGGLE_CLASS = 'citizen-section-toggle';
// The same Codex classes templates/IconButtonLink.mustache gives the edit
// links, so the two stay in step as Codex moves.
const TOGGLE_CLASSES =
	`${ TOGGLE_CLASS } cdx-button cdx-button--weight-quiet cdx-button--icon-only`;
const INTERACTIVE_CLASS = 'citizen-sections-interactive';
const COLLAPSED_SECTION_SELECTOR =
	`section[data-mw-section-id].${ COLLAPSED_CLASS }, section.citizen-section.${ COLLAPSED_CLASS }`;

/**
 * Content roots whose handlers are already attached.
 *
 * Setup runs once per `wikipage.content`, which fires again whenever the
 * content is re-rendered — a live preview, or saving without a reload. The
 * root element survives that, so a second pass would leave two sets of
 * delegated handlers on it and every click would toggle a section twice,
 * landing back where it started. Held weakly so a replaced root is
 * collectable.
 *
 * @type {WeakSet<HTMLElement>}
 */
const boundRoots = new WeakSet();

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {HTMLElement} deps.bodyContent
 * @return {Object}
 */
function createSections( { document, bodyContent } ) {
	let labelCount = 0;
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
	 * The element whose text names the section. Legacy heading markup keeps
	 * it in `.mw-headline`; newer markup drops that wrapper and puts the text
	 * — and the anchor id — straight on the heading tag.
	 *
	 * @param {HTMLElement} heading
	 * @param {HTMLElement|null} headingTag
	 * @return {HTMLElement}
	 */
	function getHeadingLabel( heading, headingTag ) {
		return heading.querySelector( '.mw-headline' ) || headingTag || heading;
	}

	/**
	 * An id no other element on the page already claims. Section titles
	 * normally carry their own anchor, so this is only reached for markup
	 * that has none — but the counter restarts with every instance, and
	 * nothing reserves the prefix against page content.
	 *
	 * @return {string}
	 */
	function getUniqueLabelId() {
		let id;
		do {
			labelCount++;
			id = `citizen-section-label-${ labelCount }`;
		} while ( document.getElementById( id ) );
		return id;
	}

	/**
	 * Give a heading a real control. Pointer users can already toggle through
	 * the delegated click handler, but a bare heading is unreachable by
	 * keyboard and announces neither that it is a control nor what state it
	 * is in. A native button fixes both and needs no listener of its own:
	 * Enter and Space fire a click that bubbles to the same handler — which
	 * stops at `.mw-editsection`, so the button must stay a sibling of the edit
	 * links rather than move inside them.
	 *
	 * @param {HTMLElement} heading
	 * @return {void}
	 */
	function addToggle( heading ) {
		if ( heading.querySelector( `.${ TOGGLE_CLASS }` ) ) {
			return;
		}

		const headingTag = heading.matches( HEADING_TAGS ) ?
			heading :
			heading.querySelector( HEADING_TAGS );
		const label = getHeadingLabel( heading, headingTag );
		if ( !label.id ) {
			label.id = getUniqueLabelId();
		}

		const toggle = document.createElement( 'button' );
		toggle.type = 'button';
		toggle.className = TOGGLE_CLASSES;
		toggle.setAttribute( 'aria-expanded', 'true' );
		// Naming the control after its section is the disclosure convention:
		// "Foo, button, collapsed" beats a generic label, and it keeps the
		// wording out of i18n.
		toggle.setAttribute( 'aria-labelledby', label.id );

		// After the edit links, matching where the styles render it, so reading
		// order and rendered order agree. `.mw-editsection-like` is deliberately
		// not matched: DiscussionTools' subscribe control is the heading's first
		// child, so inserting after it would land the button ahead of the title.
		const editSection = heading.querySelector( ':scope > .mw-editsection' );
		if ( editSection ) {
			editSection.after( toggle );
		} else if ( headingTag && headingTag !== heading ) {
			// Newer markup wraps the heading tag in a container, so the button
			// sits beside it and the heading keeps a clean accessible name.
			headingTag.after( toggle );
		} else {
			heading.append( toggle );
		}

		if ( headingTag === heading && label !== heading ) {
			// Legacy markup has no wrapper, so the button lands inside the
			// heading tag and would be folded into its accessible name. Goes
			// when the legacy heading DOM does.
			heading.setAttribute( 'aria-labelledby', label.id );
		}
	}

	/**
	 * Collapse or expand a section that contains its own heading. The
	 * heading stays visible; every other direct child (including nested
	 * subsections) is hidden with `until-found` so find-in-page can still
	 * reach the content. The attribute does not hide on its own — see the
	 * `.citizen-section--collapsed > [hidden]` rules in Sections.less.
	 *
	 * @param {HTMLElement} section
	 * @param {boolean} collapsed
	 */
	function setSectionCollapsed( section, collapsed ) {
		section.classList.toggle( COLLAPSED_CLASS, collapsed );
		for ( const child of section.children ) {
			if ( child.matches( HEADING_SELECTOR ) ) {
				const toggle = child.querySelector( `.${ TOGGLE_CLASS }` );
				if ( toggle ) {
					toggle.setAttribute( 'aria-expanded', ( !collapsed ).toString() );
				}
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

		// Re-rendered content brings new headings, so this always runs.
		for ( const heading of bodyContent.querySelectorAll( HEADING_SELECTOR ) ) {
			// Pre-convergence cached markup keeps the heading outside the
			// section, where there is nothing to toggle.
			if ( getSectionFromHeading( heading ) ) {
				addToggle( heading );
			}
		}
		// Every toggle is in place, so the styles can hand the chevron over.
		document.body.classList.add( INTERACTIVE_CLASS );

		// The handlers below are delegated, so the ones already on this root
		// cover whatever was just rendered into it.
		if ( boundRoots.has( bodyContent ) ) {
			return;
		}
		boundRoots.add( bodyContent );

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

			const section = getSectionFromHeading( heading );
			if ( section ) {
				setSectionCollapsed(
					section,
					!section.classList.contains( COLLAPSED_CLASS )
				);
			}
		};

		// Sections hide individual children, so expand the whole chain of
		// collapsed ancestors on a find-in-page match.
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
