/**
 * Focus and unfocus element when checkbox is toggled.
 * TODO: This should be a helper function in checkboxHack
 *
 * @param {HTMLElement} checkbox
 * @param {HTMLElement} target
 * @return {void}
 */
function checkboxHackFocusHandler( checkbox, target ) {
	if ( checkbox.checked === true ) {
		target.focus();
	} else {
		target.blur();
	}
}

/**
 * Handle keyup events
 * TODO: This should be a helper function in checkboxHack
 *
 * @param {Event} event
 * @param {HTMLElement} checkbox
 * @param {HTMLElement} target
 * @return {void}
 */
function checkboxHackOnKeyUp( event, checkbox, target ) {
	if ( checkbox.checked === false ) {
		if ( event.key === '/' &&
			!event.target.matches( 'input' ) &&
			!event.target.matches( 'textarea' )
		) {
			checkbox.checked = true;
			target.focus();
			target.value = '';
		}
	} else {
		if ( event.key === 'Escape' ) {
			checkbox.checked = false;
			target.blur();
		}
	}
}

/**
 * @param {Document} document
 * @return {void}
 */
function initSearch( document ) {
	const toggle = document.getElementById( 'search-checkbox' ),
		input = document.getElementById( 'searchInput' ),
		pageReady = require( ( 'mediawiki.page.ready' ) );

	toggle.addEventListener( 'change', function () {
		checkboxHackFocusHandler( this, input );
	} );
	document.addEventListener( 'keyup', ( event ) => {
		checkboxHackOnKeyUp( event, toggle, input );
	} );
	pageReady.loadSearchModule(
		// Decide between new Citizen implementation or core
		mw.config.get( 'wgCitizenEnableSearch' ) ?
			'skins.citizen.scripts.search' : 'mediawiki.searchSuggest'
	);
}

module.exports = {
	init: initSearch
};
