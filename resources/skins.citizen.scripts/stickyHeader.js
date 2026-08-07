const
	STICKY_HEADER_ID = 'citizen-sticky-header',
	STICKY_HEADER_VISIBLE_CLASS = 'citizen-sticky-header-visible';

const { initDropdown } = require( './dropdown.js' );

/**
 * Copies attribute from an element to another.
 *
 * @param {Element} from
 * @param {Element} to
 * @param {string} attribute
 */
function copyAttribute( from, to, attribute ) {
	const fromAttr = from.getAttribute( attribute );
	if ( fromAttr ) {
		to.setAttribute( attribute, fromAttr );
	}
}

/**
 * Copies button attributes from an element to another.
 *
 * @param {Element} from
 * @param {Element} to
 */
function copyButtonAttributes( from, to ) {
	copyAttribute( from, to, 'title' );
	// Copy button labels
	if ( to.lastElementChild && from.lastElementChild ) {
		to.lastElementChild.textContent = from.lastElementChild.textContent || '';
	}
}

/**
 * Prepare the menu dropdown for the sticky header.
 *
 * @param {HTMLElement} menuDropdown
 * @return {HTMLElement}
 */
function prepareMenuDropdown( menuDropdown ) {
	const
		menuDropdownClone = menuDropdown.cloneNode( true ),
		menuDropdownStickyElementsWithIds = menuDropdownClone.querySelectorAll( '[ id ]' ),
		menuDropdownButton = menuDropdownClone.querySelector( '.citizen-dropdown-summary' );

	// The descendant sweep below never matches the clone root — strip its id
	// explicitly or the page ends up with two elements sharing it.
	menuDropdownClone.removeAttribute( 'id' );

	// A clone taken while the original menu is open would be born expanded,
	// and a born-open <details> never fires toggle, so its dismissal
	// listeners would never bind. Always build the clone closed.
	menuDropdownClone.querySelector( '.citizen-dropdown-details' )?.removeAttribute( 'open' );

	menuDropdownStickyElementsWithIds.forEach( ( stickyElement ) => {
		// Set up the click target to keep JS click handlers working (#1100)
		stickyElement.setAttribute( 'data-mw-citizen-click-target', `#${ stickyElement.id } > a` );
		// Remove the id attribute to prevent duplicate ids
		stickyElement.removeAttribute( 'id' );
	} );

	// Sticky header buttons use Codex large size (44px) instead of Citizen's (40px)
	menuDropdownButton.classList.remove( 'citizen-cdx-button--size-large' );
	menuDropdownButton.classList.add( 'cdx-button--size-large' );
	menuDropdownButton.setAttribute( 'tabindex', '-1' );

	// The copied aria-details points at the original card (the clone's own
	// card just lost its id above). The bar is aria-hidden, so drop the
	// dangling reference rather than remapping it.
	menuDropdownButton.removeAttribute( 'aria-details' );

	return menuDropdownClone;
}

/**
 * Manages the sticky header behavior including show/hide,
 * fake button click delegation, and dropdown initialization.
 */
class StickyHeader {
	constructor( { stickyHeaderElement, document, window, requestIdleCallback } ) {
		this.stickyHeaderElement = stickyHeaderElement;
		this.document = document;
		this.window = window;
		this.requestIdleCallback = requestIdleCallback;
		this.dropdownSources = [];
		this.cloneDropdowns = [];
		this.dropdownsBuilt = false;
		this.dropdownsDirty = false;
		this.lastHeight = null;
		this.handleClick = this.handleClick.bind( this );
	}

	/**
	 * Update the sticky header height CSS variable, used by other sticky
	 * elements. Root-scoped writes recalc the whole document, so skip
	 * writes when the measured height is unchanged.
	 *
	 * @param {number} value
	 */
	setCSSVariable( value ) {
		if ( value === this.lastHeight ) {
			return;
		}
		this.lastHeight = value;
		this.document.documentElement.style.setProperty( '--height-sticky-header', `${ value }px` );
	}

	/**
	 * Get the target element of a fake button.
	 *
	 * @param {HTMLElement} fakeButton
	 * @return {HTMLElement | null}
	 */
	getClickTarget( fakeButton ) {
		return this.document.querySelector( fakeButton.getAttribute( 'data-mw-citizen-click-target' ) );
	}

	/**
	 * Handle click on a fake button.
	 *
	 * @param {MouseEvent} event
	 */
	handleClick( event ) {
		const fakeButton = event.target.closest( '[data-mw-citizen-click-target]' );
		if ( fakeButton ) {
			const target = this.getClickTarget( fakeButton );
			if ( target !== null ) {
				event.preventDefault();
				event.stopPropagation();
				target.click();
			}
		}
	}

	/**
	 * Unbind event listeners from sticky header.
	 */
	unbind() {
		this.stickyHeaderElement.removeEventListener( 'click', this.handleClick );
	}

	/**
	 * Bind event listeners to sticky header.
	 */
	bind() {
		this.stickyHeaderElement.addEventListener( 'click', this.handleClick );
	}

	/**
	 * Show the sticky header.
	 */
	show() {
		// Rebuilds only if a menu mutated since the last build;
		// otherwise a boolean check.
		this.ensureDropdowns();
		this.document.body.classList.add( STICKY_HEADER_VISIBLE_CLASS );
		this.setCSSVariable( this.stickyHeaderElement.getBoundingClientRect().height );
		this.bind();
	}

	/**
	 * Hide the sticky header. The height variable stays — visibility is
	 * gated by the body class.
	 */
	hide() {
		// Scrolling away dismisses the cloned menus; closing the <details>
		// unbinds their window listeners via the toggle handler.
		this.cloneDropdowns.forEach( ( dropdown ) => dropdown.dismiss() );
		this.document.body.classList.remove( STICKY_HEADER_VISIBLE_CLASS );
		this.unbind();
	}

	/**
	 * Initialize fake buttons in sticky header.
	 */
	initFakeButtons() {
		const fakeButtons = this.stickyHeaderElement.querySelectorAll( '.cdx-button[data-mw-citizen-click-target]' );

		fakeButtons.forEach( ( fakeButton ) => {
			const target = this.getClickTarget( fakeButton );

			if ( !target ) {
				fakeButton.remove();
				return;
			}

			copyButtonAttributes( target, fakeButton );
			fakeButton.classList.add( 'citizen-sticky-header-fake-button' );
		} );
	}

	/**
	 * Update edit icon if visual editor is not present.
	 */
	updateEditIcon() {
		// If the visual editor is not present, the source editor becomes the primary
		// edit button and should use the 'edit' icon instead of the 'wikiText' icon.
		const sourceEditButton = this.document.getElementById( 'ca-edit-sticky-header' );
		const visualEditButton = this.document.getElementById( 'ca-ve-edit-sticky-header' );

		if ( sourceEditButton && !visualEditButton ) {
			const icon = sourceEditButton.querySelector( '.citizen-ui-icon' );
			if ( icon ) {
				icon.classList.remove( 'mw-ui-icon-wikimedia-wikiText' );
				icon.classList.add( 'mw-ui-icon-wikimedia-edit' );
			}
		}
	}

	/**
	 * Register the page-tools dropdowns to be mirrored into the sticky header.
	 *
	 * Cloning is deferred: a MutationObserver marks the mirror dirty when a
	 * gadget mutates an original, and ensureDropdowns() builds at idle; dirty
	 * rebuilds happen on the next show() — after gadgets have loaded, off the
	 * scroll path.
	 */
	initDropdowns() {
		const sources = [
			[ 'citizen-page-more-dropdown', 'citizen-sticky-header-more' ],
			[ 'citizen-page-languages-dropdown', 'citizen-sticky-header-languages' ]
		];

		const menuObserver = new this.window.MutationObserver( ( records ) => {
			// The original's own open/close is not a content change — clones are
			// always built closed, so rebuilding over it would be pure waste.
			const isMeaningful = records.some( ( record ) => !(
				record.type === 'attributes' &&
				record.attributeName === 'open' &&
				record.target.classList.contains( 'citizen-dropdown-details' )
			) );
			if ( isMeaningful ) {
				this.dropdownsDirty = true;
			}
		} );

		sources.forEach( ( [ originalId, containerId ] ) => {
			const original = this.document.getElementById( originalId );
			const container = this.document.getElementById( containerId );
			if ( !original || !container ) {
				return;
			}
			this.dropdownSources.push( { original, container } );
			menuObserver.observe( original, {
				childList: true,
				subtree: true,
				attributes: true,
				characterData: true
			} );
		} );

		if ( this.dropdownSources.length > 0 ) {
			// Prebuild off the critical path so the first show() finds the
			// clones ready instead of paying for them mid-scroll. If a lazy
			// build already happened by the time idle fires, leave dirty
			// rebuilds to show() rather than snapping an in-use clone shut.
			this.requestIdleCallback( () => {
				if ( !this.dropdownsBuilt ) {
					this.ensureDropdowns();
				}
			} );
		}
	}

	/**
	 * Build the cloned dropdowns if missing or stale.
	 * A boolean check when the existing clones are current.
	 */
	ensureDropdowns() {
		if ( this.dropdownsBuilt && !this.dropdownsDirty ) {
			return;
		}

		this.dropdownsBuilt = true;
		this.dropdownsDirty = false;

		if ( this.dropdownSources.length === 0 ) {
			return;
		}

		const isPointerDevice = this.window.matchMedia( '(hover: hover) and (pointer: fine)' ).matches;

		this.cloneDropdowns.forEach( ( dropdown ) => dropdown.destroy() );
		this.cloneDropdowns = [];

		this.dropdownSources.forEach( ( { original, container } ) => {
			container.replaceChildren();
			const clone = prepareMenuDropdown( original );
			container.appendChild( clone );
			const dropdown = initDropdown( clone, {
				window: this.window,
				document: this.document,
				isPointerDevice
			} );
			if ( dropdown ) {
				this.cloneDropdowns.push( dropdown );
			}
		} );
	}

	/**
	 * Initialize sticky header.
	 */
	init() {
		this.initFakeButtons();
		this.updateEditIcon();
		this.initDropdowns();
		// Pre-measure at idle: the hidden bar is laid out and measurable,
		// and the tree-wide recalc of the first variable write happens off
		// the scroll path.
		this.requestIdleCallback( () => {
			this.setCSSVariable( this.stickyHeaderElement.getBoundingClientRect().height );
		} );
	}
}

module.exports = {
	STICKY_HEADER_ID,
	STICKY_HEADER_VISIBLE_CLASS,
	StickyHeader
};
