/*
 * Citizen - Search JS
 * https://starcitizen.tools
 *
 * Focus on search input when checkbox is toggled
 * Open the search box when the input is in focus
 */

var searchToggle = document.getElementById( 'search-toggle' ),
	searchInput = document.getElementById( 'searchInput' );

/**
 * Focus in search box when search toggle checkbox is checked.
 * @constructor
 */
function searchInputFocus() {
	if ( searchToggle.checked !== false ) {
		searchInput.focus();
	}
}

/**
 * Check search toggle checkbox when search box is in focus.
 * @constructor
 */
function searchToggleCheck() {
	if ( searchToggle.checked === false ) {
		searchToggle.checked = true;
	}
}

searchToggle.addEventListener( 'click', searchInputFocus );
searchInput.addEventListener( 'focus', searchToggleCheck );
