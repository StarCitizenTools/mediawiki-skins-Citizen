/**
 * @return {void}
 */
function initSearchLoader() {
	const searchForm = document.getElementById( 'searchform' ),
		searchInput = document.getElementById( 'searchInput' );

	if ( searchForm && searchInput ) {
		const typeahead = require( './typeahead.js' );
		typeahead.init( searchForm, searchInput );
	}
}

initSearchLoader();
