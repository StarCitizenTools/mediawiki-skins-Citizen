var searchToggle = document.getElementById( 'search-checkbox' ),
	searchInput = document.getElementById( 'searchInput' ),
	pageReady = require( ( 'mediawiki.page.ready' ) );

/**
 * Focus in search box when search toggle checkbox is checked.
 *
 * @constructor
 */
function searchInputFocus() {
	if ( searchToggle.checked !== false ) {
		searchInput.focus();
	}
}

/**
 * Check search toggle checkbox when search box is in focus.
 *
 * @constructor
 */
function searchToggleCheck() {
	if ( searchToggle.checked === false ) {
		searchToggle.checked = true;
	}
}

/**
 * Toggle search bar with slash
 *
 * @constructor
 */
function slashToggle() {
	if ( event.key === '/' && searchToggle.checked === false ) {
		searchToggle.checked = true;
		searchInput.focus();
		searchInput.value = '';
	}
}

/**
 * @return {void}
 */
function init() {
	searchToggle.addEventListener( 'click', searchInputFocus );
	searchInput.addEventListener( 'focus', searchToggleCheck );
	document.addEventListener( 'keyup', slashToggle );
	pageReady.loadSearchModule(
		// Decide between new Citizen implementation or core
		mw.config.get( 'wgCitizenEnableSearch' ) ?
			'skins.citizen.scripts.search' : 'mediawiki.searchSuggest'
	);
}

module.exports = {
	init: init
};
