const { isComposing, isMacPlatform } = require( './keyboardLayout.js' );

/**
 * Access keys for layouts that do not type Latin letters, in Chromium on
 * Windows, Linux and ChromeOS.
 *
 * Blink looks an access key up by the character the active layout types, so on a
 * Cyrillic, Greek or Arabic layout Alt+J asks for "о" and none of MediaWiki's
 * Latin access keys can be reached. The Latin legend on those keycaps follows the
 * key position, so the element to activate is the one for that position's letter.
 *
 * The lookup itself stays Blink's: during keydown a hidden stand-in takes the
 * typed character as its access key and passes its activation on. Blink looks up
 * on the character event that follows keydown, and drops that event when the
 * browser takes the chord as its own shortcut, so Alt+D still reaches the browser
 * exactly as it does on a Latin layout. Its lookup ignores a keydown that was
 * cancelled or stopped, so the stand-in is set in the capture phase and ignores
 * both too.
 *
 * The stand-in only ever holds a character no element claims, and only until the
 * next keyup or keydown, so it cannot take a key from the page.
 *
 * Not used on:
 * - Gecko, which also tries the user's own Latin layout. A key position only
 *   approximates that: on an AZERTY board the W legend sits where the position
 *   reads Z.
 * - macOS, where the keydown reports an Option glyph instead of the character the
 *   lookup will use, so the stand-in cannot be pointed at it.
 */

// A single letter or mark belonging to a script other than Latin: Thai and Inscript
// layouts type marks on letter positions. Latin layouts put punctuation (Dvorak,
// AZERTY) and Latin letters (the Turkish F layout) there, and the position's
// letter is not what their user meant.
const NON_LATIN_CHARACTER = /^(?![\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}])[\p{Letter}\p{Mark}]$/u;

// Input types an access key clicks; every other input type is only focused.
const CLICKED_INPUT_TYPES = [ 'button', 'checkbox', 'color', 'file', 'image', 'radio', 'reset', 'submit' ];

/**
 * The element Blink picks for a key: the last in document order.
 *
 * @param {Document} document
 * @param {string} key
 * @return {HTMLElement|null}
 */
function findByAccessKey( document, key ) {
	const wanted = key.toLowerCase();
	let found = null;
	for ( const element of document.querySelectorAll( '[accesskey]' ) ) {
		if (
			element instanceof HTMLElement &&
			( element.getAttribute( 'accesskey' ) || '' ).toLowerCase() === wanted
		) {
			found = element;
		}
	}
	return found;
}

/**
 * Focus the element, then click it unless it takes text.
 *
 * @param {HTMLElement} element
 * @return {void}
 */
function activate( element ) {
	element.focus();
	if (
		element instanceof HTMLTextAreaElement ||
		element instanceof HTMLSelectElement ||
		( element instanceof HTMLInputElement && !CLICKED_INPUT_TYPES.includes( element.type ) )
	) {
		return;
	}
	element.click();
}

/**
 * @param {Object} deps
 * @param {Window & { jQuery?: typeof jQuery }} deps.window
 * @param {Document} deps.document
 * @return {void}
 */
function init( { window, document } ) {
	const $ = window.jQuery;
	if (
		!$ ||
		!$.client ||
		$.client.profile().layout === 'gecko' ||
		isMacPlatform( window.navigator )
	) {
		return;
	}

	const standIn = document.createElement( 'span' );
	standIn.hidden = true;
	/** @type {string|null} */
	let letter = null;

	standIn.addEventListener( 'click', () => {
		const element = letter && findByAccessKey( document, letter );
		if ( element ) {
			activate( element );
		}
	} );

	const reset = () => {
		standIn.removeAttribute( 'accesskey' );
		letter = null;
	};

	window.addEventListener( 'keyup', reset, true );
	window.addEventListener( 'keydown', ( event ) => {
		reset();
		// Blink's chord is Alt, with or without Shift.
		if ( isComposing( event ) || !event.altKey || event.ctrlKey || event.metaKey ) {
			return;
		}
		const position = /^Key([A-Z])$/.exec( event.code );
		if (
			!position ||
			!NON_LATIN_CHARACTER.test( event.key ) ||
			findByAccessKey( document, event.key ) ||
			!findByAccessKey( document, position[ 1 ] )
		) {
			return;
		}
		letter = position[ 1 ];
		standIn.setAttribute( 'accesskey', event.key );
		if ( !standIn.isConnected ) {
			document.body.append( standIn );
		}
	}, true );
}

module.exports = {
	init
};
