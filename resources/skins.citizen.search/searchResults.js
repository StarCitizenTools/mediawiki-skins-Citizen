// const config = require( './config.json' );
// const htmlHelper = require( './htmlHelper.js' )();
const searchAction = require( './searchAction.js' )();

function searchResults() {
	return {
		render: function ( typeaheadEl, searchQuery ) {
			searchAction.render( typeaheadEl, searchQuery );
		},
		clear: function ( typeaheadEl ) {
			searchAction.clear( typeaheadEl );
		}
	};
}

/** @module searchResults */
module.exports = searchResults;
