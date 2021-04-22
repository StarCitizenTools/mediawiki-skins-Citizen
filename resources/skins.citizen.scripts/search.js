/**
 * Based on Vector
 * Loads the search module via `mw.loader.using` on the element's
 * focus event. Or, if the element is already focused, loads the
 * search module immediately.
 * After the search module is loaded, executes a function to remove
 * the loading indicator.
 *
 * @param {HTMLElement} element search input.
 * @param {string} moduleName resourceLoader module to load.
 * @param {function(): void} afterLoadFn function to execute after search module loads.
 */
function loadSearchModule( element, moduleName, afterLoadFn ) {
	const requestSearchModule = () => {
		mw.loader.using( moduleName, afterLoadFn );
		element.removeEventListener( 'focus', requestSearchModule );
	};

	if ( document.activeElement === element ) {
		requestSearchModule();
	} else {
		element.addEventListener( 'focus', requestSearchModule );
	}
}

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
 * @param {HTMLInputElement} input
 * @return {void}
 */
function initCheckboxHack( window, input ) {
	const checkboxHack = require( './checkboxHack.js' ),
		button = document.getElementById( 'search-toggle' ),
		checkbox = document.getElementById( 'search-checkbox' ),
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
	const searchInput = document.getElementById( 'searchInput' );

	initCheckboxHack( window, searchInput );

	if ( mw.config.get( 'wgCitizenEnableSearch' ) ) {
		loadSearchModule( searchInput, 'skins.citizen.scripts.search', () => {} );
	} else {
		loadSearchModule( searchInput, 'mediawiki.searchSuggest', () => {} );
	}
}

module.exports = {
	init: initSearch
};
