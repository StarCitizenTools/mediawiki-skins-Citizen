const
	STICKY_HEADER_ID = 'citizen-sticky-header',
	STICKY_HEADER_VISIBLE_CLASS = 'citizen-sticky-header-visible';

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

	return menuDropdownClone;
}

/**
 * Append dropdown to the sticky header.
 *
 * @param {HTMLElement} dropdown
 * @param {HTMLElement} container
 * @return {void}
 */
function appendDropdown( dropdown, container ) {
	if ( !dropdown || !container ) {
		return;
	}

	const dropdownClone = prepareMenuDropdown( dropdown );
	container.appendChild( dropdownClone );
}

/**
 * Manages the sticky header behavior including show/hide,
 * fake button click delegation, and dropdown initialization.
 */
class StickyHeader {
	constructor( { stickyHeaderElement, document } ) {
		this.stickyHeaderElement = stickyHeaderElement;
		this.document = document;
		this.handleClick = this.handleClick.bind( this );
	}

	/**
	 * Update sticky header CSS variable, used by other sticky elements.
	 *
	 * @param {number} value
	 */
	setCSSVariable( value ) {
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
		this.document.body.classList.add( STICKY_HEADER_VISIBLE_CLASS );
		this.setCSSVariable( this.stickyHeaderElement.getBoundingClientRect().height );
		this.bind();
	}

	/**
	 * Hide the sticky header.
	 */
	hide() {
		// Dismiss dropdown menus and search if active
		if ( this.stickyHeaderElement.contains( this.document.activeElement ) ) {
			this.document.body.click();
		}
		this.setCSSVariable( 0 );
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
	 * Initialize dropdown menus in sticky header.
	 */
	initDropdowns() {
		const
			moreMenuDropdown = this.document.getElementById( 'citizen-page-more-dropdown' ),
			moreMenuDropdownContainer = this.document.getElementById( 'citizen-sticky-header-more' ),
			languagesDropdown = this.document.getElementById( 'citizen-page-languages-dropdown' ),
			languagesDropdownContainer = this.document.getElementById( 'citizen-sticky-header-languages' );

		appendDropdown( moreMenuDropdown, moreMenuDropdownContainer );
		appendDropdown( languagesDropdown, languagesDropdownContainer );
	}

	/**
	 * Initialize sticky header.
	 */
	init() {
		this.initFakeButtons();
		this.updateEditIcon();
		this.initDropdowns();
	}
}

module.exports = {
	STICKY_HEADER_ID,
	STICKY_HEADER_VISIBLE_CLASS,
	StickyHeader
};
