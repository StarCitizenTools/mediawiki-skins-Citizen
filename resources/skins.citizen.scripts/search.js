/* Some of the functions are based on Vector */
/* ESLint does not like having class names as const */
/* eslint-disable mediawiki/class-doc */
const SEARCH_INPUT_ID = 'searchInput',
	SEARCH_LOADING_CLASS = 'citizen-loading';

/**
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
 * Event callback that shows or hides the loading indicator based on the event type.
 * The loading indicator states are:
 * 1. Show on input event (while user is typing)
 * 2. Hide on focusout event (when user removes focus from the input )
 * 3. Show when input is focused, if it contains a query. (in case user re-focuses on input)
 *
 * @param {Event} event
 */
function renderSearchLoadingIndicator( event ) {
	const form = /** @type {HTMLElement} */ ( event.currentTarget ),
		input = /** @type {HTMLInputElement} */ ( event.target );

	if (
		!( event.currentTarget instanceof HTMLElement ) ||
		!( event.target instanceof HTMLInputElement ) ||
		!( input.id === SEARCH_INPUT_ID ) ) {
		return;
	}

	if ( event.type === 'input' ) {
		form.classList.add( SEARCH_LOADING_CLASS );

	} else if ( event.type === 'focusout' ) {
		form.classList.remove( SEARCH_LOADING_CLASS );

	} else if ( event.type === 'focusin' && input.value.trim() ) {
		form.classList.add( SEARCH_LOADING_CLASS );
	}
}

/**
 * Attaches or detaches the event listeners responsible for activating
 * the loading indicator.
 *
 * @param {HTMLElement} element
 * @param {boolean} attach
 * @param {function(Event): void} eventCallback
 */
function setLoadingIndicatorListeners( element, attach, eventCallback ) {

	/** @type { "addEventListener" | "removeEventListener" } */
	const addOrRemoveListener = ( attach ? 'addEventListener' : 'removeEventListener' );

	[ 'input', 'focusin', 'focusout' ].forEach( function ( eventType ) {
		element[ addOrRemoveListener ]( eventType, eventCallback );
	} );

	if ( !attach ) {
		element.classList.remove( SEARCH_LOADING_CLASS );
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
 * Check if the element is a HTML form element or content editable
 *
 * @param {HTMLElement} element
 * @return {boolean}
 */
function isFormField( element ) {
	if ( !( element instanceof HTMLElement ) ) {
		return false;
	}
	const name = element.nodeName.toLowerCase();
	const type = ( element.getAttribute( 'type' ) || '' ).toLowerCase();
	return ( name === 'select' ||
        name === 'textarea' ||
        ( name === 'input' && type !== 'submit' && type !== 'reset' && type !== 'checkbox' && type !== 'radio' ) ||
        element.isContentEditable );
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
		if ( event.key === '/' && !isFormField( event.target ) ) {
			// Since Firefox quickfind interfere with this
			event.preventDefault();
			checkbox.checked = true;
			focusOnChecked( checkbox, input );
		}
	};

	window.addEventListener( 'keydown', onExpandOnSlash, true );
}

/**
 * @param {Window} window
 * @param {HTMLInputElement} input
 * @param {HTMLElement} target
 * @return {void}
 */
function initCheckboxHack( window, input, target ) {
	const checkboxHack = require( './checkboxHack.js' ),
		button = document.getElementById( 'search-toggle' ),
		checkbox = document.getElementById( 'search-checkbox' );

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
	const searchConfig = require( './config.json' ).wgCitizenEnableSearch,
		searchForm = document.getElementById( 'searchform' ),
		searchInput = document.getElementById( SEARCH_INPUT_ID );

	initCheckboxHack( window, searchInput, searchForm );

	if ( searchConfig ) {
		setLoadingIndicatorListeners( searchForm, true, renderSearchLoadingIndicator );
		loadSearchModule( searchInput, 'skins.citizen.search', () => {
			setLoadingIndicatorListeners( searchForm, false, renderSearchLoadingIndicator );
		} );
	} else {
		loadSearchModule( searchInput, 'mediawiki.searchSuggest', () => {} );
	}
}

module.exports = {
	init: initSearch
};
