/*
 * Citizen - Search focus JS
 * https://starcitizen.tools
 *
 * Focus on search input when checkbox is toggled
 * TODO: Clean up all the JS files after the skin is converted to Mustache
 */

var searchToggle = document.getElementById('search-toggle');

function searchInputFocus() {
	var searchInput = document.getElementById('search-input');

    if (searchToggle.checked !== false) {
        searchInput.focus();
    }
}

searchToggle.addEventListener("click", searchInputFocus);