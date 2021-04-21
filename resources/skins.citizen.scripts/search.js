/**
 * Manually focus on the input field if checkbox is checked
 *
 * @param {HTMLInputElement} checkbox
 * @param {HTMLInputElement} input
 * @return {void}
 */
function focusOnChecked( checkbox, input ) {
	if ( checkbox.checked ) {
		input.focus();
	} else {
		input.blur();
	}
}

/**
 * Manually check the checkbox state when the button is SLASH is pressed.
 *
 * @param {Window} window
 * @param {HTMLInputElement} checkbox
 * @param {HTMLInputElement} input
 * @return {void}
 */
function bindExpandOnSlash( window, checkbox, input ) {
	const onExpandOnSlash = ( /** @type {KeyboardEvent} */ event ) => {
		// Only handle SPACE and ENTER.
		if ( event.key === '/' &&
			!event.target.matches( 'input' ) &&
			!event.target.matches( 'textarea' )
		) {
			checkbox.checked = true;
			focusOnChecked( checkbox, input );
		}
	};

	window.addEventListener( 'keyup', onExpandOnSlash, true );
}

/**
 * @param {Window} window
 * @return {void}
 */
function initCheckboxHack( window ) {
	const checkboxHack = require( './checkboxHack.js' ),
		button = document.getElementById( 'search-toggle' ),
		checkbox = document.getElementById( 'search-checkbox' ),
		input = document.getElementById( 'searchInput' ),
		target = document.getElementById( 'searchform' );

	if ( checkbox instanceof HTMLInputElement && button ) {
		checkboxHack.bindToggleOnClick( checkbox, button );
		checkboxHack.bindUpdateAriaExpandedOnInput( checkbox, button );
		checkboxHack.updateAriaExpanded( checkbox, button );
		checkboxHack.bindToggleOnSpaceEnter( checkbox, button );
		checkboxHack.bindDismissOnClickOutside( window, checkbox, button, target );
		checkboxHack.bindDismissOnFocusLoss( window, checkbox, button, target );
		checkboxHack.bindDismissOnEscape( window, checkbox );
	}

	bindExpandOnSlash( window, checkbox, input );

	// Focus when toggled
	checkbox.addEventListener( 'input', () => {
		focusOnChecked( checkbox, input );
	} );
}

/**
 * @param {Window} window
 * @return {void}
 */
function initSearch( window ) {
	const pageReady = require( ( 'mediawiki.page.ready' ) );

	initCheckboxHack( window );
	pageReady.loadSearchModule(
		// Decide between new Citizen implementation or core
		mw.config.get( 'wgCitizenEnableSearch' ) ?
			'skins.citizen.scripts.search' : 'mediawiki.searchSuggest'
	);
}

module.exports = {
	init: initSearch
};
