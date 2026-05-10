/**
 * Check if the element is a HTML form element or content editable.
 * Used to gate keyboard shortcuts so typing in an input does not
 * accidentally open the command palette.
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
 * Bind keyboard shortcuts that open the command palette.
 *
 * @param {Window} window
 * @param {Function} triggerOpen
 * @return {void}
 */
function bindOpenOnSlash( window, triggerOpen ) {
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
			// Firefox quickfind would otherwise intercept "/"
			event.preventDefault();
			triggerOpen();
		}
	};

	window.addEventListener( 'keydown', onExpandOnSlash, true );
}

/**
 * Bind external `.citizen-search-trigger` links (with optional
 * `data-citizen-search-prefill`) to open the palette with optional
 * prefill text.
 *
 * @param {Document} document
 * @param {Function} triggerOpen
 * @return {void}
 */
function bindSearchTrigger( document, triggerOpen ) {
	document.querySelectorAll( '.citizen-search-trigger' ).forEach( ( trigger ) => {
		trigger.addEventListener( 'click', ( event ) => {
			const prefill = event.target.dataset && event.target.dataset.citizenSearchPrefill ?
				event.target.dataset.citizenSearchPrefill :
				null;
			triggerOpen( prefill );
		} );
	} );
}

/**
 * Initializes the search functionality (keyboard shortcuts and
 * auxiliary triggers). The command palette itself is owned by
 * `commandPalette.js`; this module just routes user intent to it.
 *
 * @param {Object} deps
 * @param {Window} deps.window
 * @param {Document} deps.document
 * @param {Function} deps.triggerOpen
 * @return {void}
 */
function initSearch( { window, document, triggerOpen } ) {
	bindOpenOnSlash( window, triggerOpen );
	bindSearchTrigger( document, triggerOpen );
}

module.exports = {
	init: initSearch
};
