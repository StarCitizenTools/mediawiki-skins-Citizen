const
	{ TableOfContents } = require( './tableOfContents.js' ),
	TOC_ID = 'citizen-toc',
	SUMMARY_SELECTOR = '.citizen-dropdown-summary',
	TRACKING_CLASS = 'citizen-toc--tracking',
	CURRENT_CLASS = 'citizen-toc-current',
	TRACK_CLASS = 'citizen-toc-current__track',
	LINE_CLASS = 'citizen-toc-current__line',
	HEADING_SELECTOR = '.citizen-toc-heading',
	LIST_ITEM_SELECTOR = '.citizen-toc-list-item';

/**
 * The contents control's current value: the section you are in.
 *
 * Below tablet the control is a pill with nothing but a glyph, which names
 * what it opens but not where you are. This gives it a value, and the value
 * moving with the document is what makes it read as an outline rather than a
 * label — a static one could not.
 *
 * The text is taken from the table of contents' own rendered rows, so it is
 * already escaped and in the reader's language, and it can only ever say
 * something the card also says.
 *
 * Injected rather than served, so a page with no script keeps the glyph it
 * has always had and nothing is left half-built.
 */
class SectionLabel {
	constructor( { document, window } ) {
		this.document = document;
		this.window = window;
		this.toc = null;
		this.track = null;
		this.currentId = null;
	}

	/**
	 * Position of a row in the outline, for deciding which way a change
	 * travelled. -1 for anything not in the list.
	 *
	 * @param {string|null} id
	 * @return {number}
	 */
	indexOf( id ) {
		if ( !id || !this.toc ) {
			return -1;
		}
		const rows = Array.from( this.toc.querySelectorAll( LIST_ITEM_SELECTOR ) );
		return rows.findIndex( ( row ) => row.id === id );
	}

	/**
	 * @param {string|null} id
	 * @return {string}
	 */
	textFor( id ) {
		if ( !id ) {
			return '';
		}
		const row = this.document.getElementById( id );
		const heading = row && row.querySelector( HEADING_SELECTOR );
		return heading ? heading.textContent.trim() : '';
	}

	/**
	 * @return {boolean}
	 */
	prefersReducedMotion() {
		return typeof this.window.matchMedia === 'function' &&
			this.window.matchMedia( '( prefers-reduced-motion: reduce )' ).matches;
	}

	/**
	 * Show a section, displacing whatever the line said before. Both labels
	 * move together in the direction of travel, so it reads as the outline
	 * advancing rather than one word being swapped for another.
	 *
	 * @param {string|null} id A table of contents row id, or null for the lead.
	 */
	update( id ) {
		if ( !this.track || id === this.currentId ) {
			return;
		}
		const text = this.textFor( id );
		const forward = this.indexOf( id ) > this.indexOf( this.currentId );
		this.currentId = text ? id : null;

		this.toc.classList.toggle( TRACKING_CLASS, !!text );

		const leaving = this.track.querySelector( '.' + LINE_CLASS + ':not( .is-leaving )' );
		const reduced = this.prefersReducedMotion();

		if ( text ) {
			const line = this.document.createElement( 'span' );
			line.className = LINE_CLASS;
			line.textContent = text;
			this.track.appendChild( line );
			if ( !reduced ) {
				line.classList.add( forward ? 'is-entering-below' : 'is-entering-above' );
			}
		}

		if ( !leaving ) {
			return;
		}
		if ( reduced || !text ) {
			leaving.remove();
			return;
		}
		// Drop the enter classes first: two animations on one element is a
		// cascade race, and the one it arrived with is meaningless now.
		leaving.classList.remove( 'is-entering-below', 'is-entering-above' );
		leaving.classList.add( 'is-leaving', forward ? 'is-leaving-above' : 'is-leaving-below' );
		leaving.addEventListener( 'animationend', () => leaving.remove(), { once: true } );
	}

	/**
	 * Take the value from the row the card marks as active, so the control and
	 * the card it opens cannot disagree about where the reader is. Several
	 * paths activate a section without going through the scroll spy — a load
	 * with a hash, and a rebuild after VisualEditor — and they all end with the
	 * card marked, so reading the mark covers each of them.
	 */
	syncFromCard() {
		if ( !this.toc ) {
			return;
		}
		const active = this.toc.querySelector( '.' + TableOfContents.ACTIVE_SECTION_CLASS );
		this.update( active ? active.id : null );
	}

	/**
	 * @return {boolean} Whether there was a control to give a value to.
	 */
	init() {
		this.toc = this.document.getElementById( TOC_ID );
		const summary = this.toc && this.toc.querySelector( SUMMARY_SELECTOR );
		if ( !summary ) {
			return false;
		}

		// A div, not a span: Dropdown.less screen-reader-onlys every non-icon
		// span that is a direct child of a summary, which is how the "Contents"
		// label beside this is hidden. A span here would be clipped to 1px and
		// the control would never grow.
		const current = this.document.createElement( 'div' );
		current.className = CURRENT_CLASS;
		// The control is already named "Contents" by its own label. Announcing
		// the section here would name it twice, and the card marks the active
		// row anyway.
		current.setAttribute( 'aria-hidden', 'true' );

		this.track = this.document.createElement( 'span' );
		this.track.className = TRACK_CLASS;
		current.appendChild( this.track );

		const chevron = this.document.createElement( 'span' );
		// Points up: the card opens upward from a control at the block end.
		chevron.className = 'citizen-ui-icon mw-ui-icon-wikimedia-collapse';
		current.appendChild( chevron );

		summary.appendChild( current );
		return true;
	}
}

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @return {SectionLabel}
 */
function createSectionLabel( { document, window } ) {
	return new SectionLabel( { document, window } );
}

module.exports = { createSectionLabel };
