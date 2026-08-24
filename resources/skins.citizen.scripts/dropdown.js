/**
 * Enhance dropdown menus
 * Based on Vector
 */
const
	DROPDOWN_CONTAINER_SELECTOR = '.citizen-dropdown',
	DROPDOWN_DETAILS_SELECTOR = '.citizen-dropdown-details',
	DROPDOWN_SUMMARY_SELECTOR = '.citizen-dropdown-summary',
	DROPDOWN_TARGET_SELECTOR = '.citizen-menu__card';

/**
 * Represents a Dropdown menu with enhanced functionality.
 * Handles dismissing the menu when clicking outside,
 * pressing the ESCAPE key, losing focus, or clicking on links.
 */
class Dropdown {
	constructor( { details, summary, target, window, document, isPointerDevice } ) {
		this.details = details;
		this.summary = summary;
		this.target = target;
		this.window = window;
		this.document = document;
		this.isPointerDevice = isPointerDevice;
		this.dismissOnEscape = this.dismissOnEscape.bind( this );
		this.dismissIfExternalEventTarget = this.dismissIfExternalEventTarget.bind( this );
		this.dismissOnLinkClick = this.dismissOnLinkClick.bind( this );
		this.dismissOnBeforeUnload = this.dismiss.bind( this );
		this.onDetailsToggle = this.onDetailsToggle.bind( this );
	}

	dismiss() {
		if ( this.details && this.details.open ) {
			this.details.open = false;
		}
	}

	/**
	 * Dismiss the target when ESCAPE is pressed.
	 *
	 * Must stay bound on capture: a nested control stops Escape on keydown, and
	 * by keyup has already collapsed, so the expanded state this reads is only
	 * available before it runs. `role="combobox"` is what marks a control that
	 * owns Escape — the table of contents and notification toggles carry
	 * aria-expanded without handling any key.
	 *
	 * @param {KeyboardEvent} event
	 */
	dismissOnEscape( event ) {
		if ( event.key !== 'Escape' ) {
			return;
		}
		const target = event.target;
		if ( target && typeof target.closest === 'function' &&
			target.closest( '[role="combobox"][aria-expanded="true"]' ) ) {
			return;
		}
		this.dismiss();
	}

	/**
	 * Dismiss the target when event is outside the target and summary.
	 *
	 * @param {Event} event
	 */
	dismissIfExternalEventTarget( event ) {
		if ( !this.target.contains( event.target ) && !this.summary.contains( event.target ) ) {
			this.dismiss();
		}
	}

	/**
	 * Dismiss the target on clicks to links and link children elements.
	 *
	 * @param {Event} event
	 */
	dismissOnLinkClick( event ) {
		const eventTarget = event.target;
		if ( eventTarget && eventTarget.closest( 'a' ) ) {
			this.dismiss();
		}
	}

	/**
	 * Unbind event listeners for the dropdown menu.
	 */
	unbind() {
		this.target.removeEventListener( 'click', this.dismissOnLinkClick );
		this.window.removeEventListener( 'mousedown', this.dismissIfExternalEventTarget );
		this.window.removeEventListener( 'touchstart', this.dismissIfExternalEventTarget );
		this.window.removeEventListener( 'focusin', this.dismissIfExternalEventTarget );
		this.window.removeEventListener( 'keydown', this.dismissOnEscape, true );
	}

	/**
	 * Bind event listeners for the dropdown menu.
	 */
	bind() {
		this.target.addEventListener( 'click', this.dismissOnLinkClick );
		this.window.addEventListener( 'mousedown', this.dismissIfExternalEventTarget );
		this.window.addEventListener( 'touchstart', this.dismissIfExternalEventTarget, { passive: true } );
		this.window.addEventListener( 'focusin', this.dismissIfExternalEventTarget );
		this.window.addEventListener( 'keydown', this.dismissOnEscape, true );
	}

	/**
	 * Remove all listeners so the instance can be discarded,
	 * e.g. when a cloned menu is rebuilt.
	 */
	destroy() {
		// Safe when nothing is bound — removeEventListener no-ops
		// on unknown handlers.
		this.unbind();
		this.details.removeEventListener( 'toggle', this.onDetailsToggle );
		this.window.removeEventListener( 'beforeunload', this.dismissOnBeforeUnload );
	}

	onDetailsToggle() {
		if ( this.details.open ) {
			this.bind();
		} else {
			this.unbind();
		}
	}

	addKeyhint() {
		if ( !this.isPointerDevice ) {
			return;
		}
		if (
			!this.window.jQuery ||
			!this.window.jQuery.fn.updateTooltipAccessKeys ||
			!this.window.jQuery.fn.updateTooltipAccessKeys.getAccessKeyPrefix
		) {
			return;
		}

		const links = this.target.querySelectorAll( '.mw-list-item > a[accesskey]' );
		links.forEach( ( link ) => {
			// Idempotent — a subtree cloned from an initialized menu
			// already carries hints.
			if ( link.querySelector( '.citizen-keyboard-hint-key' ) ) {
				return;
			}

			const keyhintText = this.window.jQuery.fn.updateTooltipAccessKeys.getAccessKeyPrefix() + link.getAttribute( 'accesskey' );
			if ( !keyhintText ) {
				return;
			}
			const keyhint = this.document.createElement( 'kbd' );
			keyhint.classList.add( 'citizen-keyboard-hint-key' );
			keyhint.innerText = keyhintText
				.replace( /-/g, ' ' )
				.replace( 'ctrl', '⌃' )
				.replace( 'shift', '⇧' )
				.replace( 'option', '⌥' );
			link.append( keyhint );
		} );
	}

	init() {
		this.details.addEventListener( 'toggle', this.onDetailsToggle );
		// T295085: Close all dropdown menus when page is unloaded to prevent them
		// from being open when navigating back to a page.
		this.window.addEventListener( 'beforeunload', this.dismissOnBeforeUnload );
		this.addKeyhint();
	}
}

/**
 * Enhance a single dropdown container.
 *
 * @param {HTMLElement} container
 * @param {Object} deps
 * @param {Window} deps.window
 * @param {Document} deps.document
 * @param {boolean} deps.isPointerDevice
 * @return {Dropdown|null} the initialized dropdown, or null when the
 *  container is missing its details, summary, or card
 */
function initDropdown( container, { window, document, isPointerDevice } ) {
	const
		details = container.querySelector( DROPDOWN_DETAILS_SELECTOR ),
		summary = container.querySelector( DROPDOWN_SUMMARY_SELECTOR ),
		target = container.querySelector( DROPDOWN_TARGET_SELECTOR );

	if ( !( details && summary && target ) ) {
		return null;
	}

	const dropdown = new Dropdown( {
		details, summary, target, window, document, isPointerDevice
	} );
	dropdown.init();
	return dropdown;
}

/**
 * @param {Object} params
 * @param {Document} params.document
 * @param {Window} params.window
 */
function init( { document, window } ) {
	const isPointerDevice = window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches;

	document.querySelectorAll( DROPDOWN_CONTAINER_SELECTOR ).forEach( ( container ) => {
		initDropdown( container, { window, document, isPointerDevice } );
	} );
}

module.exports = {
	init,
	initDropdown,
	Dropdown
};
