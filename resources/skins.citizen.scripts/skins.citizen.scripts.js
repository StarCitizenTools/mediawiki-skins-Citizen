/*
 * Citizen - Search JS
 * https://starcitizen.tools
 *
 * Focus on search input when checkbox is toggled
 * Open the search box when the input is in focus
 */

var searchToggle = document.getElementById( 'search-toggle' ),
	searchInput = document.getElementById( 'searchInput' );

function searchInputFocus() {
	if ( searchToggle.checked !== false ) {
		searchInput.focus();
	}
}

function searchToggleCheck() {
	if ( searchToggle.checked === false ) {
		searchToggle.checked = true;
	}
}

searchToggle.addEventListener( 'click', searchInputFocus );
searchInput.addEventListener( 'focus', searchToggleCheck );
