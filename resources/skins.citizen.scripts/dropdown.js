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
	 * @param {Event} event
	 */
	dismissOnEscape( event ) {
		if ( event.key === 'Escape' ) {
			this.dismiss();
		}
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
		this.window.removeEventListener( 'keyup', this.dismissOnEscape );
	}

	/**
	 * Bind event listeners for the dropdown menu.
	 */
	bind() {
		this.target.addEventListener( 'click', this.dismissOnLinkClick );
		this.window.addEventListener( 'mousedown', this.dismissIfExternalEventTarget );
		this.window.addEventListener( 'touchstart', this.dismissIfExternalEventTarget, { passive: true } );
		this.window.addEventListener( 'focusin', this.dismissIfExternalEventTarget );
		this.window.addEventListener( 'keyup', this.dismissOnEscape );
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
 * @param {Object} params
 * @param {Document} params.document
 * @param {Window} params.window
 */
function init( { document, window } ) {
	const isPointerDevice = window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches;
	const dropdowns = document.querySelectorAll( DROPDOWN_CONTAINER_SELECTOR );

	dropdowns.forEach( ( container ) => {
		const
			details = container.querySelector( DROPDOWN_DETAILS_SELECTOR ),
			summary = container.querySelector( DROPDOWN_SUMMARY_SELECTOR ),
			target = container.querySelector( DROPDOWN_TARGET_SELECTOR );

		if ( !( details && summary && target ) ) {
			return;
		}

		new Dropdown( { details, summary, target, window, document, isPointerDevice } ).init();
	} );
}

module.exports = {
	init,
	Dropdown
};
