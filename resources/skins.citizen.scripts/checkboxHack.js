/**
 * Based on the core checkboxHack,
 * backported because some features are not avaliable in 1.35,
 * see https://github.com/wikimedia/mediawiki/blob/master/resources/src/mediawiki.page.ready/checkboxHack.js
 */

/**
 * Checkbox hack listener state.
 *
 * @class {Object} CheckboxHackListeners
 * @property {Function} [onUpdateAriaExpandedOnInput]
 * @property {Function} [onToggleOnClick]
 * @property {Function} [onToggleOnSpaceEnter]
 * @property {Function} [onDismissOnClickOutside]
 * @property {Function} [onDismissOnFocusLoss]
 * @ignore
 */

/**
 * Revise the button's `aria-expanded` state to match the checked state.
 *
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} button
 * @return {void}
 * @ignore
 */
function updateAriaExpanded( checkbox, button ) {
	button.setAttribute( 'aria-expanded', checkbox.checked.toString() );
}

/**
 * Set the checked state and fire the 'input' event.
 *
 * @param {HTMLInputElement} checkbox
 * @param {boolean} checked
 * @return {void}
 * @ignore
 */
function setCheckedState( checkbox, checked ) {
	// Chrome and Firefox sends the builtin Event with .bubbles == true and .composed == true.
	/** @type {Event} */
	const event = new Event( 'input', { bubbles: true, composed: true } );

	checkbox.checked = checked;
	checkbox.dispatchEvent( event );
}

/**
 * Returns true if the Event's target is an inclusive descendant of any the checkbox hack's
 * constituents (checkbox, button, or target), and false otherwise.
 *
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} button
 * @param {Node} target
 * @param {Event} event
 * @return {boolean}
 * @ignore
 */
function containsEventTarget( checkbox, button, target, event ) {
	return event.target instanceof Node && (
		checkbox.contains( event.target ) ||
		button.contains( event.target ) ||
		target.contains( event.target )
	);
}

/**
 * Dismiss the target when event is outside the checkbox, button, and target.
 * In simple terms this closes the target (menu, typically) when clicking somewhere else.
 *
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} button
 * @param {Node} target
 * @param {Event} event
 * @return {void}
 * @ignore
 */
function dismissIfExternalEventTarget( checkbox, button, target, event ) {
	if ( checkbox.checked && !containsEventTarget( checkbox, button, target, event ) ) {
		setCheckedState( checkbox, false );
	}
}

/**
 * Update the `aria-expanded` attribute based on checkbox state (target visibility) changes.
 *
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} button
 * @return {CheckboxHackListeners}
 * @ignore
 */
function bindUpdateAriaExpandedOnInput( checkbox, button ) {
	const listener = updateAriaExpanded.bind( undefined, checkbox, button );
	// Whenever the checkbox state changes, update the `aria-expanded` state.
	checkbox.addEventListener( 'input', listener );
	return { onUpdateAriaExpandedOnInput: listener };
}

/**
 * Manually change the checkbox state to avoid a focus change when using a pointing device.
 *
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} button
 * @return {CheckboxHackListeners}
 * @ignore
 */
function bindToggleOnClick( checkbox, button ) {
	const listener = ( event ) => {
		// Do not allow the browser to handle the checkbox. Instead, manually toggle it which does
		// not alter focus.
		event.preventDefault();
		setCheckedState( checkbox, !checkbox.checked );
	};

	button.addEventListener( 'click', listener, true );
	return { onToggleOnClick: listener };
}

/**
 * Manually change the checkbox state when the button is focused and SPACE is pressed.
 *
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} button
 * @return {CheckboxHackListeners}
 * @ignore
 */
function bindToggleOnSpaceEnter( checkbox, button ) {
	const onToggleOnSpaceEnter = ( /** @type {KeyboardEvent} */ event ) => {
		// Only handle SPACE and ENTER.
		if ( event.key !== ' ' && event.key !== 'Enter' ) {
			return;
		}
		event.preventDefault();
		setCheckedState( checkbox, !checkbox.checked );
	};

	button.addEventListener( 'keydown', onToggleOnSpaceEnter, true );
	return { onToggleOnSpaceEnter: onToggleOnSpaceEnter };
}

/**
 * Dismiss the target when clicking elsewhere and update the `aria-expanded` attribute based on
 * checkbox state (target visibility).
 *
 * @param {Window} window
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} button
 * @param {Node} target
 * @return {CheckboxHackListeners}
 * @ignore
 */
function bindDismissOnClickOutside( window, checkbox, button, target ) {
	const listener = dismissIfExternalEventTarget.bind( undefined, checkbox, button, target );

	window.addEventListener( 'click', listener, true );
	return { onDismissOnClickOutside: listener };
}

/**
 * Dismiss the target when focusing elsewhere and update the `aria-expanded` attribute based on
 * checkbox state (target visibility).
 *
 * @param {Window} window
 * @param {HTMLInputElement} checkbox
 * @param {HTMLElement} button
 * @param {Node} target
 * @return {CheckboxHackListeners}
 * @ignore
 */
function bindDismissOnFocusLoss( window, checkbox, button, target ) {
	// If focus is given to any element outside the target, dismiss the target. Setting a focusout
	// listener on the target would be preferable, but this interferes with the click listener.
	const listener = dismissIfExternalEventTarget.bind( undefined, checkbox, button, target );

	window.addEventListener( 'focusin', listener, true );
	return { onDismissOnFocusLoss: listener };
}

/**
 * Dismiss the target when ESCAPE is pressed.
 *
 * @param {Window} window
 * @param {HTMLInputElement} checkbox
 * @return {CheckboxHackListeners}
 * @ignore
 */
function bindDismissOnEscape( window, checkbox ) {
	const onDismissOnEscape = ( /** @type {KeyboardEvent} */ event ) => {
		// Only handle ESCAPE
		if ( event.key !== 'Escape' ) {
			return;
		}
		setCheckedState( checkbox, false );
	};

	window.addEventListener( 'keydown', onDismissOnEscape, true );
	return { onDismissOnEscape: onDismissOnEscape };
}

/**
 * Dismiss the target when clicking or focusing elsewhere and update the `aria-expanded` attribute
 * based on checkbox state (target visibility) changes made by **the user.** When tapping the button
 * itself, clear the focus outline.
 *
 * This function calls the other bind* functions and is the only expected interaction for most use
 * cases. It's constituents are provided distinctly for the other use cases.
 *
 * @param {Window} window
 * @param {HTMLInputElement} checkbox The underlying hidden checkbox that controls target
 *   visibility.
 * @param {HTMLElement} button The visible label icon associated with the checkbox. This button
 *   toggles the state of the underlying checkbox.
 * @param {Node} target The Node to toggle visibility of based on checkbox state.
 * @return {CheckboxHackListeners}
 * @ignore
 */
function bind( window, checkbox, button, target ) {
	const spaceHandlers = bindToggleOnSpaceEnter( checkbox, button );
	// ES6: return Object.assign( bindToggleOnSpaceEnter( checkbox, button ), ... );
	// https://caniuse.com/#feat=mdn-javascript_builtins_object_assign

	/* eslint-disable max-len */
	return {
		onUpdateAriaExpandedOnInput: bindUpdateAriaExpandedOnInput( checkbox ).onUpdateAriaExpandedOnInput,
		onToggleOnClick: bindToggleOnClick( checkbox, button ).onToggleOnClick,
		onToggleOnSpaceEnter: spaceHandlers.onToggleOnSpaceEnter,
		onDismissOnClickOutside: bindDismissOnClickOutside( window, checkbox, button, target ).onDismissOnClickOutside,
		onDismissOnFocusLoss: bindDismissOnFocusLoss( window, checkbox, button, target ).onDismissOnFocusLoss,
		onDismissOnEscape: bindDismissOnEscape( window, checkbox ).onDismissOnEscape
	};
	/* eslint-enable max-len */
}

/**
 * Free all set listeners.
 *
 * @param {Window} window
 * @param {HTMLInputElement} checkbox The underlying hidden checkbox that controls target
 *   visibility.
 * @param {HTMLElement} button The visible label icon associated with the checkbox. This button
 *   toggles the state of the underlying checkbox.
 * @param {CheckboxHackListeners} listeners
 * @return {void}
 * @ignore
 */
function unbind( window, checkbox, button, listeners ) {
	if ( listeners.onDismissOnFocusLoss ) {
		window.removeEventListener( 'focusin', listeners.onDismissOnFocusLoss );
	}
	if ( listeners.onDismissOnClickOutside ) {
		window.removeEventListener( 'click', listeners.onDismissOnClickOutside );
	}
	if ( listeners.onDismissOnEscape ) {
		window.removeEventListener( 'keydown', listeners.onDismissOnEscape );
	}
	if ( listeners.onToggleOnClick ) {
		button.removeEventListener( 'click', listeners.onToggleOnClick );
	}
	if ( listeners.onToggleOnSpaceEnter ) {
		button.removeEventListener( 'keydown', listeners.onToggleOnSpaceEnter );
	}
	if ( listeners.onUpdateAriaExpandedOnInput ) {
		checkbox.removeEventListener( 'input', listeners.onUpdateAriaExpandedOnInput );
	}
}

module.exports = {
	updateAriaExpanded: updateAriaExpanded,
	bindUpdateAriaExpandedOnInput: bindUpdateAriaExpandedOnInput,
	bindToggleOnClick: bindToggleOnClick,
	bindToggleOnSpaceEnter: bindToggleOnSpaceEnter,
	bindDismissOnClickOutside: bindDismissOnClickOutside,
	bindDismissOnEscape: bindDismissOnEscape,
	bindDismissOnFocusLoss: bindDismissOnFocusLoss,
	bind: bind,
	unbind: unbind
};
