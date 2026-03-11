/**
 * Check if the element is a HTML form element or content editable.
 * This is to prevent triggering search box when user is typing on a textfield, input, etc.
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
 * Open the search UI.
 *
 * @param {HTMLDetailsElement} details
 * @return {void}
 */
function openSearch( details ) {
	details.click();
}

/**
 * Bind keyboard shortcuts to open the search UI.
 *
 * @param {Window} window
 * @param {HTMLDetailsElement} details
 * @return {void}
 */
function bindOpenOnSlash( window, details ) {
	const onExpandOnSlash = ( /** @type {KeyboardEvent} */ event ) => {
		const isKeyPressed = () => {
			// "/" key is standard on many sites
			if ( event.code === 'Slash' ) {
				return true;
			// "Ctrl" + "K" (or "Command" + "K" on Mac)
			} else if ( ( event.ctrlKey || event.metaKey ) && event.code === 'KeyK' ) {
				return true;
			// "Alt" + "Shift" + "F" is the MW standard key
			} else if ( event.altKey && event.shiftKey && event.code === 'KeyF' ) {
				return true;
			} else {
				return false;
			}
		};
		if ( isKeyPressed() && !isFormField( event.target ) ) {
			// Since Firefox quickfind interfere with this
			event.preventDefault();
			openSearch( details );
		}
	};

	window.addEventListener( 'keydown', onExpandOnSlash, true );
}

/**
 * Bind the search trigger to open the search UI and prefill the input.
 *
 * @param {Document} document
 * @param {Object} mw
 * @param {HTMLDetailsElement} details
 * @return {void}
 */
function bindSearchTrigger( document, mw, details ) {
	document.querySelectorAll( '.citizen-search-trigger' ).forEach( ( trigger ) => {
		trigger.addEventListener( 'click', ( event ) => {
			openSearch( details );
			if ( event.target.dataset.citizenSearchPrefill ) {
				// Add a delay to ensure the search UI is open
				setTimeout( () => {
					const input = document.querySelector(
						'.citizen-command-palette-header__input .cdx-text-input__input'
					);

					if ( input === null ) {
						return;
					}

					// Escape just to be safe
					input.value = mw.html.escape(
						event.target.dataset.citizenSearchPrefill
					);
				}, 0 );
			}
		} );
	} );
}

/**
 * Initializes the search functionality.
 *
 * @param {Object} deps
 * @param {Window} deps.window
 * @param {Document} deps.document
 * @param {Object} deps.mw
 * @return {void}
 */
function initSearch( { window, document, mw } ) {
	const details = document.getElementById( 'citizen-search-details' );

	bindOpenOnSlash( window, details );
	bindSearchTrigger( document, mw, details );
	mw.loader.load( 'skins.citizen.commandPalette' );
}

module.exports = {
	init: initSearch
};
