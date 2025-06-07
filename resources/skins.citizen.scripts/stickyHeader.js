const
	STICKY_HEADER_ID = 'citizen-sticky-header',
	STICKY_HEADER_VISIBLE_CLASS = 'citizen-sticky-header-visible';

/**
 * Update sticky header CSS variable, used by other sticky elements
 *
 * @param {number} value
 * @return {void}
 */
function setCSSVariable( value ) {
	document.documentElement.style.setProperty( '--height-sticky-header', `${ value }px` );
}

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
 * Copies attribute from an element to another.
 *
 * @param {Element} from
 * @param {Element} to
 */
function copyButtonAttributes( from, to ) {
	copyAttribute( from, to, 'title' );
	// Copy button labels
	if ( to.lastElementChild && from.lastElementChild ) {
		to.lastElementChild.innerHTML = from.lastElementChild.textContent || '';
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
		// Remove the id attribute to prevent duplicate ids
		stickyElement.removeAttribute( 'id' );
	} );

	// Make the button look like a cdx-button
	menuDropdownButton.classList.add(
		'cdx-button',
		'cdx-button--fake-button',
		'cdx-button--fake-button--enabled',
		'cdx-button--weight-quiet',
		'cdx-button--size-large',
		'cdx-button--icon-only'
	);
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
 * Get the target element of a fake button.
 *
 * @param {HTMLElement} fakeButton
 * @return {HTMLElement | null}
 */
function getClickTarget( fakeButton ) {
	return document.querySelector( fakeButton.getAttribute( 'data-mw-citizen-click-target' ) );
}

/**
 * Handle click on a fake button.
 *
 * @param {MouseEvent} event
 * @return {void}
 */
function handleClick( event ) {
	const fakeButton = event.target.closest( '.citizen-sticky-header-fake-button' );
	if ( fakeButton ) {
		const target = getClickTarget( fakeButton );
		if ( target !== null ) {
			target.click();
		}
	}
}

/**
 * Unbind event listeners from sticky header.
 *
 * @param {HTMLElement} stickyHeader
 * @return {void}
 */
function unbind( stickyHeader ) {
	stickyHeader.removeEventListener( 'click', handleClick );
}

/**
 * Bind event listeners to sticky header.
 *
 * @param {HTMLElement} stickyHeader
 * @return {void}
 */
function bind( stickyHeader ) {
	stickyHeader.addEventListener( 'click', handleClick );
}

/**
 * Show the sticky header.
 *
 * @param {HTMLElement} stickyHeader
 * @return {void}
 */
function show( stickyHeader ) {
	document.body.classList.add( STICKY_HEADER_VISIBLE_CLASS );
	setCSSVariable( stickyHeader.getBoundingClientRect().height );
	bind( stickyHeader );
}

/**
 * Hide the sticky header.
 *
 * @param {HTMLElement} stickyHeader
 * @return {void}
 */
function hide( stickyHeader ) {
	// Dismiss dropdown menus and search if active
	if ( stickyHeader && stickyHeader.contains( document.activeElement ) ) {
		document.body.click();
	}
	setCSSVariable( 0 );
	document.body.classList.remove( STICKY_HEADER_VISIBLE_CLASS );
	unbind( stickyHeader );
}

/**
 * Initialize sticky header.
 *
 * @param {HTMLElement} stickyHeader
 * @return {void}
 */
function init( stickyHeader ) {
	const fakeButtons = stickyHeader.querySelectorAll( '.cdx-button[data-mw-citizen-click-target]' );

	fakeButtons.forEach( ( fakeButton ) => {
		const target = getClickTarget( fakeButton );

		if ( !target ) {
			fakeButton.remove();
			return;
		}

		copyButtonAttributes( target, fakeButton );
		fakeButton.classList.add( 'citizen-sticky-header-fake-button' );
	} );

	const
		moreMenuDropdown = document.getElementById( 'citizen-page-more-dropdown' ),
		moreMenuDropdownContainer = document.getElementById( 'citizen-sticky-header-more' ),
		languagesDropdown = document.getElementById( 'citizen-page-languages-dropdown' ),
		languagesDropdownContainer = document.getElementById( 'citizen-sticky-header-languages' );

	appendDropdown( moreMenuDropdown, moreMenuDropdownContainer );
	appendDropdown( languagesDropdown, languagesDropdownContainer );
}

module.exports = {
	STICKY_HEADER_ID,
	STICKY_HEADER_VISIBLE_CLASS,
	show,
	hide,
	init
};
