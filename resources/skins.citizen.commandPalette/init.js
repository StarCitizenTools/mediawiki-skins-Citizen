const
	Vue = require( 'vue' ),
	App = require( './components/App.vue' ),
	config = require( './config.json' );

/**
 * Initialize the command palette
 *
 * @return {void}
 */
function initApp() {
	const teleportTarget = require( 'mediawiki.page.ready' ).teleportTarget;

	// We can't mount directly to the teleportTarget or it will break OOUI overlays
	const overlay = document.createElement( 'div' );
	overlay.classList.add( 'citizen-command-palette-overlay' );
	teleportTarget.appendChild( overlay );

	const app = Vue.createMwApp( App, {}, config );

	const commandPalette = app.mount( overlay );

	registerButton( commandPalette );
	bindKeyboardShortcuts( commandPalette );
}

/**
 * Setup the button to open the command palette
 * This is very hacky, but it works for now.
 *
 * @param {Vue} commandPalette
 * @return {void}
 */
function registerButton( commandPalette ) {
	const details = document.getElementById( 'citizen-search-details' );
	// Remove the search card from the DOM so it won't be triggered by the button
	document.getElementById( 'citizen-search__card' )?.remove();

	details.open = false;
	details.addEventListener( 'click', () => {
		commandPalette.open();
	} );
}

/**
 * Manually toggle the details state when the keyboard button is SLASH is pressed.
 *
 * @param {Vue} commandPalette
 * @return {void}
 */
function bindKeyboardShortcuts( commandPalette ) {
	const onExpandOnSlash = ( event ) => {
		const isKeyPressed = () => {
			// "/"
			if ( event.key === '/' ) {
				return true;
			// "Ctrl" + "K" (or "Command" + "K" on Mac)
			} else if ( ( event.ctrlKey || event.metaKey ) && event.key.toLowerCase() === 'k' ) {
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
			commandPalette.open();
		}
	};

	document.addEventListener( 'keydown', onExpandOnSlash, true );
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

initApp();
