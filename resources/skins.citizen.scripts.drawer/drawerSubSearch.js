/**
 * This enables searching for portals / portal entries in the drawer menu
 */
( function () {
	document.getElementById( 'mw-drawer-search-input' ).addEventListener( 'input', function ( e ) {
		var searchVal;

		if ( typeof e.target.value === 'undefined' ) {
			return;
		}

		searchVal = e.target.value;

		// If the input is empty, show all portals
		if ( searchVal.length === 0 ) {
			document.querySelectorAll( '.mw-portal' ).forEach( function ( portal ) {
				portal.style.display = null;

				portal.querySelectorAll( 'ul li' ).forEach( function ( li ) {
					li.style.display = null;
				} );
			} );

			return;
		}

		// For each Portal
		document.querySelectorAll( '#mw-drawer-menu .mw-portal' ).forEach( function ( portal ) {
			var allHidden = true;

			// Check all entries
			portal.querySelectorAll( 'ul li' ).forEach( function ( li ) {
				// If the query is contained in the link text
				if ( li.querySelector( 'a' ).innerText.toUpperCase().indexOf( searchVal.toUpperCase() ) >= 0 ) {
					// If it's the case, at least one entry is visible
					allHidden = false;
					li.style.display = null;
				} else {
					// Else, hide it
					li.style.display = 'none';
				}
			} );

			// If the portal contains only hidden links, hide it
			portal.style.display = allHidden === true ? 'none' : null;

			// But if the query is contained in the portal header, show the entire portal
			if ( portal.querySelector( 'h3' ).innerText.toUpperCase().indexOf( searchVal.toUpperCase() ) >= 0 ) {
				portal.style.display = null;
				portal.querySelectorAll( 'ul li' ).forEach( function ( li ) {
					li.style.display = null;
				} );
			}
		} );
	} );
}() );
