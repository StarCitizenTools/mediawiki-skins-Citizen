/* Some of the functions are based on Vector */
/* ESLint does not like having class names as const */

const SEARCH_LOADING_CLASS = 'citizen-loading';

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
		!( event.target instanceof HTMLInputElement )
	) {
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
 * This is to prevent trigger search box when user is typing on a textfield, input, etc.
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
		const isKeyPressed = () => {
			// "/" key is standard on many sites
			if ( event.key === '/' ) {
				return true;
			// "Alt" + "Shift" + "F" is the MW standard key
			// Shift key might makes F key goes capital, so we need to make it lowercase
			} else if ( event.altKey && event.shiftKey && event.key.toLowerCase() === 'f' ) {
				return true;
			} else {
				return false;
			}
		};
		if ( isKeyPressed() && !isFormField( event.target ) ) {
			// Since Firefox quickfind interfere with this
			event.preventDefault();
			checkbox.checked = true;
			focusOnChecked( checkbox, input );
		}
	};

	window.addEventListener( 'keydown', onExpandOnSlash, true );
}

/**
 * Add clear button to search field when there are input value
 *
 * @param {HTMLInputElement} input
 * @return {void}
 */
function renderSearchClearButton( input ) {
	const
		clearButton = document.createElement( 'button' ),
		clearIcon = document.createElement( 'span' );

	clearButton.classList.add( 'citizen-search__clear', 'citizen-search__formButton', 'citizen-button' );
	clearIcon.classList.add( 'citizen-ui-icon', 'mw-ui-icon-wikimedia-clear' );
	clearButton.append( clearIcon );

	clearButton.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		clearButton.remove();
		input.value = '';
		input.focus();
	} );

	input.addEventListener( 'input', ( event ) => {
		if ( event.target.value === '' ) {
			clearButton.remove();
		} else {
			event.target.after( clearButton );
		}
	} );
}

/**
 * @param {Window} window
 * @return {void}
 */
function initSearch( window ) {
	const
		searchModule = require( './config.json' ).wgCitizenSearchModule,
		searchBoxes = document.querySelectorAll( '.citizen-search-box' );

	if ( !searchBoxes.length ) {
		return;
	}

	searchBoxes.forEach( ( searchBox ) => {
		const
			input = searchBox.querySelector( 'input[name="search"]' ),
			isPrimarySearch = input && input.getAttribute( 'id' ) === 'searchInput';

		if ( !input ) {
			return;
		}

		// Set up primary search box interactions
		if ( isPrimarySearch ) {
			const checkbox = document.getElementById( 'citizen-search__checkbox' );
			bindExpandOnSlash( window, checkbox, input );
			renderSearchClearButton( input );
			// Focus when toggled
			checkbox.addEventListener( 'input', () => {
				focusOnChecked( checkbox, input );
			} );
		}

		setLoadingIndicatorListeners( searchBox, true, renderSearchLoadingIndicator );
		loadSearchModule( input, searchModule, () => {
			setLoadingIndicatorListeners( searchBox, false, renderSearchLoadingIndicator );
		} );
	} );
}

module.exports = {
	init: initSearch
};
