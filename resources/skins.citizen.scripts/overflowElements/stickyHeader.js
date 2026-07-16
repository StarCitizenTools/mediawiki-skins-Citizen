/**
 * Creates a sticky header clone for an overflow element.
 * Detects whether the element is a table and creates the appropriate
 * clone structure (table with colgroup or div).
 *
 * Column widths are synced in two phases so callers can batch the geometry
 * reads of many tables ahead of any style writes: measureColumns() only
 * reads, applyColumns() only writes.
 *
 * @param {Object} params
 * @param {Document} params.document
 * @param {HTMLElement} params.element
 * @param {HTMLElement} params.content
 * @param {HTMLElement} params.headerRow
 * @return {{stickyHeader: HTMLElement, measureColumns: Function|null, applyColumns: Function|null}}
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

	function measureColumns() {
		if ( !colgroup || !originalTh ) {
			return null;
		}
		const widths = [];
		originalTh.forEach( ( col ) => {
			widths.push( col.getBoundingClientRect().width );
		} );
		return widths;
	}

	function applyColumns( widths ) {
		if ( !widths || !colgroup ) {
			return;
		}
		const stickyCols = colgroup.querySelectorAll( 'col' );
		widths.forEach( ( width, index ) => {
			if ( stickyCols[ index ] ) {
				stickyCols[ index ].style.setProperty( 'min-width', width + 'px' );
			}
		} );
	}

	return {
		stickyHeader,
		measureColumns: isTable ? measureColumns : null,
		applyColumns: isTable ? applyColumns : null
	};
}

module.exports = { createOverflowStickyHeader };
