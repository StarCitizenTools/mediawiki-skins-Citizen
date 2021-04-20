/**
 * Enables searching for portals / portal entries in the drawer menu
 */

/**
 * @param {Event} event
 * @return {void}
 */
function onDrawerSearchInput( event ) {
	const portals = document.getElementById( 'mw-drawer-menu' ).querySelectorAll( '.mw-portal' ),
		searchVal = event.target.value;
	let items;

	// If the input is empty, show all portals
	if ( searchVal.length === 0 ) {
		portals.forEach( ( portal ) => {
			portal.style.display = null;
			items = portal.querySelectorAll( 'ul li' );

			items.forEach( ( item ) => {
				item.style.display = null;
			} );
		} );

		return;
	}

	// For each Portal
	portals.forEach( ( portal ) => {
		let isAllHidden = true;
		items = portal.querySelectorAll( 'ul li' );

		// Check all entries
		items.forEach( function ( item ) {
			// If the query is contained in the link text
			if ( item.querySelector( 'a' ).innerText.toUpperCase().indexOf( searchVal.toUpperCase() ) >= 0 ) {
				// If it's the case, at least one entry is visible
				isAllHidden = false;
				item.style.display = null;
			} else {
				// Else, hide it
				item.style.display = 'none';
			}
		} );

		// If the portal contains only hidden links, hide it
		portal.style.display = isAllHidden === true ? 'none' : null;

		// But if the query is contained in the portal header, show the entire portal
		if ( portal.querySelector( 'h3' ).innerText.toUpperCase().indexOf( searchVal.toUpperCase() ) >= 0 ) {
			portal.style.display = null;
			items.forEach( ( item ) => {
				item.style.display = null;
			} );
		}
	} );
}

/**
 * @param {document} document
 * @return {void}
 */
function initDrawerSubSearch( document ) {
	// Listen to drawer toggle
	document.getElementById( 'mw-drawer-checkbox' ).addEventListener( 'change', () => {
		const searchInput = document.getElementById( 'mw-drawer-search-input' ),
			inputListener = ( event ) => {
				if ( typeof event.target.value !== 'undefined' ) {
					onDrawerSearchInput( event );
				}
			};

		// Add eventlistener when the drawer is opened
		// Remove when drawer is closed
		if ( event.target.checked ) {
			searchInput.addEventListener( 'input', inputListener );
		} else {
			searchInput.removeEventListener( 'input', inputListener );
		}
	} );
}

initDrawerSubSearch( document );
