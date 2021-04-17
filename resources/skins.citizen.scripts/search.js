var searchToggle = document.getElementById( 'search-checkbox' ),
	searchInput = document.getElementById( 'searchInput' ),
	pageReady = require( ( 'mediawiki.page.ready' ) );

/**
 * Focus and unfocus in search box when search toggle checkbox is toggled.
 *
 * @constructor
 */
function searchInputFocus() {
	if ( searchToggle.checked === true ) {
		searchInput.focus();
	} else {
		searchInput.blur();
	}
}

/**
 * Toggle search bar with slash
 *
 * @constructor
 */
function keyboardEvents() {
	if ( searchToggle.checked === false ) {
		if ( event.key === '/'
			&& !event.target.matches( 'input' )
			&& !event.target.matches( 'textarea' )
		) {
			searchToggle.checked = true;
			searchInput.focus();
			searchInput.value = '';
		}
	} else {
		if ( event.key === 'Escape' ) {
			searchToggle.checked = false;
			searchInput.blur();
		}
	}
}

/**
 * @return {void}
 */
function init() {
	searchToggle.addEventListener( 'change', searchInputFocus );
	document.addEventListener( 'keyup', keyboardEvents );
	pageReady.loadSearchModule(
		// Decide between new Citizen implementation or core
		mw.config.get( 'wgCitizenEnableSearch' ) ?
			'skins.citizen.scripts.search' : 'mediawiki.searchSuggest'
	);
}

module.exports = {
	init: init
};
