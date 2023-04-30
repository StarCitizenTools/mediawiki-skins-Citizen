/**
 * Wrap table in div container to make it scrollable without breaking layout
 *
 * @param {HTMLTableElement} table
 * @return {void}
 */
function wrapTable( table ) {
	const wrapper = document.createElement( 'div' );
	wrapper.classList.add( 'citizen-table-wrapper' );
	table.parentNode.insertBefore( wrapper, table );
	wrapper.appendChild( table );
}

/**
 * @param {HTMLElement} bodyContent
 * @return {void}
 */
function init( bodyContent ) {
	if ( !bodyContent.querySelector( 'table' ) ) {
		return;
	}

	const
		tables = bodyContent.querySelectorAll( 'table' );

	tables.forEach( ( table ) => {
		wrapTable( table );
	} );
}

module.exports = {
	init: init
};
