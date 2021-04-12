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
 * Uncheck search toggle checkbox when search box is not in focus.
 *
 * @constructor
 */
function searchToggleUnCheck() {
	if ( searchToggle.checked === true ) {
		searchToggle.checked = false;
	}
}

/**
 * Toggle search bar with slash
 *
 * @constructor
 */
function keyboardEvents() {
	if ( searchToggle.checked === false ) {
		if ( event.key === '/' && !event.target.matches( 'input' ) ) {
			searchInput.focus();
			searchInput.value = '';
		}
	} else {
		if ( event.key === 'Escape' ) {
			searchInput.blur();
		}
	}
}

/**
 * @return {void}
 */
function init() {
	searchToggle.addEventListener( 'click', searchInputFocus );
	searchInput.addEventListener( 'focus', searchToggleCheck );
	searchInput.addEventListener( 'blur', searchToggleUnCheck );
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
