/**
 * Enhance dropdown menus
 * Based on Vector
 */
const
	DROPDOWN_CONTAINER_SELECTOR = '.citizen-dropdown',
	DROPDOWN_DETAILS_SELECTOR = '.citizen-dropdown-details',
	DROPDOWN_SUMMARY_SELECTOR = '.citizen-dropdown-summary',
	DROPDOWN_TARGET_SELECTOR = '.citizen-menu__card';

const isPointerDevice = window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches;

/**
 * Represents a Dropdown menu with enhanced functionality.
 * This class handles the behavior of a dropdown menu, including dismissing the menu when clicking outside,
 * pressing the ESCAPE key, losing focus, or clicking on links.
 * It provides methods to bind and unbind event listeners for different actions.
 * The 'init' method initializes the dropdown menu by adding necessary event listeners.
 *
 * @class
 */
class Dropdown {
	constructor( details, summary, target ) {
		this.details = details;
		this.summary = summary;
		this.target = target;
		this.dismissOnEscape = this.dismissOnEscape.bind( this );
		this.dismissIfExternalEventTarget = this.dismissIfExternalEventTarget.bind( this );
		this.dismissOnLinkClick = this.dismissOnLinkClick.bind( this );
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
	 * Dismiss the target when event is outside the target and summary
	 *
	 * @param {Event} event
	 */
	dismissIfExternalEventTarget( event ) {
		if ( !this.target.contains( event.target ) && !this.summary.contains( event.target ) ) {
			this.dismiss();
		}
	}

	/**
	 * Dismiss the target on clicks to links and link children elements
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
		window.removeEventListener( 'mousedown', this.dismissIfExternalEventTarget );
		window.removeEventListener( 'touchstart', this.dismissIfExternalEventTarget );
		window.removeEventListener( 'focusin', this.dismissIfExternalEventTarget );
		window.removeEventListener( 'keyup', this.dismissOnEscape );
	}

	/**
	 * Bind event listeners for the dropdown menu.
	 */
	bind() {
		this.target.addEventListener( 'click', this.dismissOnLinkClick );
		window.addEventListener( 'mousedown', this.dismissIfExternalEventTarget );
		window.addEventListener( 'touchstart', this.dismissIfExternalEventTarget, { passive: true } );
		window.addEventListener( 'focusin', this.dismissIfExternalEventTarget );
		window.addEventListener( 'keyup', this.dismissOnEscape );
	}

	onDetailsToggle() {
		if ( this.details.open ) {
			this.bind();
		} else {
			this.unbind();
		}
	}

	addKeyhint() {
		if ( !isPointerDevice ) {
			return;
		}

		const links = this.target.querySelectorAll( '.mw-list-item > a[accesskey]' );
		links.forEach( ( link ) => {
			const keyhintText = window.jQuery.fn.updateTooltipAccessKeys.getAccessKeyPrefix() + link.getAttribute( 'accesskey' );
			if ( !keyhintText ) {
				return;
			}
			const keyhint = document.createElement( 'kbd' );
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
		window.addEventListener( 'beforeunload', this.dismiss.bind( this ) );
		this.addKeyhint();
	}
}

function init() {
	const dropdowns = document.querySelectorAll( DROPDOWN_CONTAINER_SELECTOR );

	dropdowns.forEach( ( dropdown ) => {
		const
			details = dropdown.querySelector( DROPDOWN_DETAILS_SELECTOR ),
			summary = dropdown.querySelector( DROPDOWN_SUMMARY_SELECTOR ),
			target = dropdown.querySelector( DROPDOWN_TARGET_SELECTOR );

		if ( !( details && summary && target ) ) {
			return;
		}

		new Dropdown( details, summary, target ).init();
	} );
}

module.exports = {
	init: init
};
