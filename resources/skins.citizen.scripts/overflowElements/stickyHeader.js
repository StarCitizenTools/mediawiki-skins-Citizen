/**
 * Creates a sticky header clone for an overflow element.
 * Detects whether the element is a table and creates the appropriate
 * clone structure (table with colgroup or div).
 *
 * @param {Object} params
 * @param {Document} params.document
 * @param {HTMLElement} params.element
 * @param {HTMLElement} params.content
 * @param {HTMLElement} params.headerRow
 * @return {{stickyHeader: HTMLElement, syncColumns: Function|null}}
 */
function createOverflowStickyHeader( { document, element, content, headerRow } ) {
	const isTable = element instanceof HTMLTableElement;

	let colgroup = null;
	let originalTh = null;
	let stickyHeader;

	if ( isTable ) {
		stickyHeader = document.createElement( 'table' );
		const thead = document.createElement( 'thead' );

		// Copy attributes from original table to sticky header
		for ( const { name, value } of element.attributes ) {
			stickyHeader.setAttribute( name, value );
		}
		for ( const className of element.classList ) {
			stickyHeader.classList.add( className );
		}

		// Create colgroup and columns so that we can align the column widths
		colgroup = document.createElement( 'colgroup' );
		originalTh = headerRow.querySelectorAll( 'th' );
		for ( let i = 0; i < originalTh.length; i++ ) {
			colgroup.append( document.createElement( 'col' ) );
		}

		thead.append( headerRow.cloneNode( true ) );
		stickyHeader.append( thead, colgroup );
	} else {
		stickyHeader = document.createElement( 'div' );
		stickyHeader.append( headerRow.cloneNode( true ) );
	}

	stickyHeader.classList.add( 'citizen-overflow-content-sticky-header' );
	stickyHeader.setAttribute( 'aria-hidden', 'true' );
	content.insertBefore( stickyHeader, element );

	function syncColumns() {
		if ( !colgroup || !originalTh ) {
			return;
		}
		const stickyCols = colgroup.querySelectorAll( 'col' );
		originalTh.forEach( ( col, index ) => {
			stickyCols[ index ].style.minWidth = col.getBoundingClientRect().width + 'px';
		} );
	}

	// Initial sync
	if ( isTable ) {
		syncColumns();
	}

	return { stickyHeader, syncColumns: isTable ? syncColumns : null };
}

module.exports = { createOverflowStickyHeader };
