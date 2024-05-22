/**
 * @return {void}
 */
function initSearchLoader() {
	const searchForm = document.getElementById( 'searchform' );
	const searchInput = document.getElementById( 'searchInput' );

	if ( searchForm && searchInput ) {
		const typeahead = require( './typeahead.js' );
		typeahead.init( searchForm, searchInput );
	}
}

initSearchLoader();
