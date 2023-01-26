/**
 * Extend core checkboxHacks
 *
 * @see https://github.com/wikimedia/Vector/blob/master/resources/skins.vector.js/checkbox.js
 */

const
	checkboxHack = require( 'mediawiki.page.ready' ).checkboxHack,
	CHECKBOX_HACK_CONTAINER_SELECTOR = '.citizen-menu-checkbox-container',
	CHECKBOX_HACK_CHECKBOX_SELECTOR = '.citizen-menu-checkbox-checkbox',
	CHECKBOX_HACK_BUTTON_SELECTOR = '.citizen-menu-checkbox-button',
	CHECKBOX_HACK_TARGET_SELECTOR = '.citizen-menu-checkbox-target';

/**
 * Set the checked state and fire the 'input' event.
 * Copied from core as it is not accessible outside
 *
 * @param {HTMLInputElement} checkbox
 * @param {boolean} checked
 * @return {void}
 * @ignore
 */
function setCheckedState( checkbox, checked ) {
	/** @type {Event} @ignore */
	checkbox.checked = checked;
	// Chrome and Firefox sends the builtin Event with .bubbles == true and .composed == true.
	let e;
	if ( typeof Event === 'function' ) {
		e = new Event( 'input', { bubbles: true, composed: true } );
	}
	checkbox.dispatchEvent( e );
}

/**
 * Dismiss the target when ESCAPE is pressed.
 *
 * @param {Window} window
 * @param {HTMLInputElement} checkbox
 * @return {function(): void} Cleanup function that removes the added event listeners.
 * @ignore
 */
function bindDismissOnEscape( window, checkbox ) {
	const onKeyup = ( /** @type {KeyboardEvent} */ event ) => {
		// Only handle ESCAPE
		if ( event.key !== 'Escape' ) {
			return;
		}
		setCheckedState( checkbox, false );
	};

	window.addEventListener( 'keyup', onKeyup, true );
	return function () {
		window.removeEventListener( 'keyup', onKeyup );
	};
}

/**
 * Close all menus through unchecking all checkbox hacks
 *
 * @return {void}
 */
function uncheckCheckboxHacks() {
	const checkboxes = document.querySelectorAll( CHECKBOX_HACK_CHECKBOX_SELECTOR + ':checked' );

	checkboxes.forEach( ( checkbox ) => {
		setCheckedState( checkbox, false );
	} );
}

/**
 * Enhance dropdownMenu functionality and accessibility using core's checkboxHack.
 * Based on Vector
 *
 * @return {void}
 */
function bind() {
	// Search for all dropdown containers using the CHECKBOX_HACK_CONTAINER_SELECTOR.
	const containers = document.querySelectorAll( CHECKBOX_HACK_CONTAINER_SELECTOR );

	containers.forEach( ( container ) => {
		const
			checkbox = container.querySelector( CHECKBOX_HACK_CHECKBOX_SELECTOR ),
			button = container.querySelector( CHECKBOX_HACK_BUTTON_SELECTOR ),
			target = container.querySelector( CHECKBOX_HACK_TARGET_SELECTOR );

		if ( !( checkbox && button && target ) ) {
			return;
		}

		// Core CheckboxHack
		checkboxHack.bind( window, checkbox, button, target );
		// Citizen CheckboxHack
		bindDismissOnEscape( window, checkbox );
	} );
}

module.exports = {
	bind: bind,
	uncheckCheckboxHacks: uncheckCheckboxHacks
};
