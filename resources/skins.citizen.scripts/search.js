const {
	isMacPlatform,
	isLetterPressed,
	isAltGraphChar,
	isAccessKeyChord
} = require( './keyboardLayout.js' );

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
 * The chords that open the command palette.
 *
 * A flat list rather than a branching chain, so each entry sees the untouched
 * event and adding one cannot change what another matches.
 *
 * @type {Array<function( KeyboardEvent, boolean ): boolean>}
 */
const OPEN_SHORTCUTS = [
	// "/". A bare Ctrl or Command means a chord, but AltGr types "/" on some
	// layouts and Windows delivers that as Ctrl+Alt.
	( event, isMac ) => event.key === '/' &&
		!event.metaKey &&
		( !event.ctrlKey || isAltGraphChar( event, isMac ) ),

	// Ctrl+K, or Command+K on a Mac. Any further modifier makes it someone
	// else's chord — Ctrl+Shift+K opens the browser console.
	( event ) => ( event.ctrlKey || event.metaKey ) &&
		!event.altKey &&
		!event.shiftKey &&
		isLetterPressed( event, 'k' ),

	// "F" is the access key MediaWiki assigns to search; its modifiers are
	// platform-dependent.
	( event, isMac ) => isAccessKeyChord( event, isMac ) && isLetterPressed( event, 'f' )
];

/**
 * Bind keyboard shortcuts that open the command palette.
 *
 * @param {Window} window
 * @param {Function} triggerOpen
 * @return {void}
 */
function bindOpenOnSlash( window, triggerOpen ) {
	const isMac = isMacPlatform( window.navigator );

	const onExpandOnSlash = ( /** @type {KeyboardEvent} */ event ) => {
		const isKeyPressed = OPEN_SHORTCUTS.some( ( matches ) => matches( event, isMac ) );
		if ( isKeyPressed && !isFormField( event.target ) ) {
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
		trigger.addEventListener( 'click', () => {
			triggerOpen( trigger.dataset.citizenSearchPrefill || null );
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
