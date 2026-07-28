const STICKY_MARKER_CLASS = 'citizen-overflow-sticky-header';
const STICKY_ROW_CLASS = 'citizen-overflow-sticky-row';
const STICKY_BOUNDARY_CLASS = 'citizen-overflow-sticky-row--boundary';
const MODE_CSS = 'css';
const MODE_JS = 'js';

/**
 * Resolves the sticky band: all rows (tables) or direct children
 * (other elements) from the start of the element through the deepest
 * element carrying the editor marker class. Markers inside nested
 * tables are never seen — `table.rows` only lists the table's own rows.
 *
 * @param {HTMLElement} element
 * @return {HTMLElement[]|null} band members, or null when nothing is marked
 */
function resolveBandRows( element ) {
	const candidates = element instanceof HTMLTableElement ?
		Array.from( element.rows ) :
		Array.from( element.children );
	let boundary = -1;
	candidates.forEach( ( candidate, index ) => {
		if ( candidate.classList.contains( STICKY_MARKER_CLASS ) ) {
			boundary = index;
		}
	} );
	if ( boundary === -1 ) {
		return null;
	}
	return candidates.slice( 0, boundary + 1 );
}

/**
 * Whether a scroll container sits between the element and the root.
 * A CSS view timeline binds to the nearest ancestor scroll container,
 * so such elements must use the JS drive. Reads computed styles —
 * callers batch this ahead of DOM writes.
 *
 * @param {HTMLElement} element
 * @param {Window} window
 * @return {boolean}
 */
function hasScrollContainerAncestor( element, window ) {
	const isScrollValue = ( value ) => value !== 'visible' && value !== 'clip';
	const documentElement = element.ownerDocument.documentElement;
	let node = element.parentElement;
	while ( node && node !== documentElement ) {
		const { overflowX, overflowY } = window.getComputedStyle( node );
		if ( isScrollValue( overflowX ) || isScrollValue( overflowY ) ) {
			return true;
		}
		node = node.parentElement;
	}
	return false;
}

/**
 * Tags the band rows and wrapper, and exposes the measure/apply pair
 * for the two per-wrapper pixel custom properties. measure() only
 * reads geometry, apply() only writes styles, so callers can batch
 * many instances' reads ahead of any writes.
 *
 * @param {Object} params
 * @param {HTMLElement} params.element
 * @param {HTMLElement} params.wrapper
 * @param {string} params.mode MODE_CSS or MODE_JS
 * @return {{rows: HTMLElement[], mode: string, measure: Function, apply: Function}|null}
 */
function createStickyRows( { element, wrapper, mode } ) {
	const rows = resolveBandRows( element );
	if ( !rows ) {
		return null;
	}
	rows.forEach( ( row ) => row.classList.add( STICKY_ROW_CLASS ) );
	rows[ rows.length - 1 ].classList.add( STICKY_BOUNDARY_CLASS );
	wrapper.classList.add( `citizen-overflow-wrapper--sticky-${ mode }` );

	function measure() {
		const first = rows[ 0 ].getBoundingClientRect();
		const last = rows[ rows.length - 1 ].getBoundingClientRect();
		const bandHeight = last.bottom - first.top;
		return {
			bandHeight,
			travel: Math.max( 0, wrapper.getBoundingClientRect().height - bandHeight )
		};
	}

	function apply( measurement ) {
		if ( !measurement ) {
			return;
		}
		wrapper.style.setProperty( '--citizen-overflow-sticky-band', measurement.bandHeight + 'px' );
		wrapper.style.setProperty( '--citizen-overflow-sticky-travel', measurement.travel + 'px' );
	}

	return { rows, mode, measure, apply };
}

module.exports = {
	resolveBandRows,
	createStickyRows,
	hasScrollContainerAncestor,
	MODE_CSS,
	MODE_JS
};
