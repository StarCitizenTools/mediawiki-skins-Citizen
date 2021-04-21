/**
 * Uncheck CSS hack checkbox when clicked outside
 *
 * @param {HTMLElement|HTMLElement[]} clickableElement
 * @param {HTMLElement} button
 * @param {HTMLElement} checkbox
 */
function uncheckOnClickOutside( clickableElement, button, checkbox ) {
	const listener = ( event ) => {
		let hideCond = event.target !== clickableElement;

		if ( Array.isArray( clickableElement ) ) {
			hideCond = clickableElement.indexOf( event.target ) === -1;
		}

		if ( event.target !== checkbox && hideCond ) {
			if ( event.target !== button ) {
				checkbox.checked = false;
			}
			document.removeEventListener( 'click', listener );
		}
	};

	const keyboardListener = ( event ) => {
		if ( event.key === 'Escape' && checkbox.checked === true ) {
			checkbox.checked = false;
			document.removeEventListener( 'click', listener );
		}
	};

	const checkboxFn = () => {
		if ( checkbox.checked ) {
			document.addEventListener( 'click', listener );
		} else {
			document.removeEventListener( 'click', listener );
		}
	};

	checkbox.removeEventListener( 'click', checkboxFn );
	checkbox.addEventListener( 'click', checkboxFn );

	document.removeEventListener( 'keydown', keyboardListener );
	document.addEventListener( 'keydown', keyboardListener );
}

/**
 * TODO: This can use some refactoring
 * TODO: Merge search handlers to this
 *
 * @param {Document} document
 * @return {void}
 */
function initCheckboxHack( document ) {
	const drawer = {
			button: document.getElementById( 'mw-drawer-button' ),
			checkbox: document.getElementById( 'mw-drawer-checkbox' )
		},
		personalMenu = {
			button: document.getElementById( 'personalmenu-button' ),
			checkbox: document.getElementById( 'personalmenu-checkbox' ),
			element: document.getElementById( 'p-personal' )
		},
		checkboxHackTargets = [ personalMenu ];

	// So that clicking drawer portal header and input won't close the menu
	// Maybe there is cleaner way to do this?
	const getDrawerElements = () => {
		const portals = document.getElementById( 'mw-drawer' ).querySelectorAll( '#mw-drawer-menu .mw-portal' ),
			searchInput = document.getElementById( 'mw-drawer-search-input' ),
			clickableElements = [];

		portals.forEach( ( portal ) => {
			clickableElements.push( portal, portal.firstElementChild );
		} );

		if ( searchInput !== null ) {
			clickableElements.push( searchInput );
		}

		return clickableElements;
	};

	const getTOC = () => {
		const tocContainer = document.getElementById( 'toc' );

		return {
			button: tocContainer.querySelector( '.toctogglelabel' ),
			checkbox: document.getElementById( 'toctogglecheckbox' ),
			element: tocContainer.querySelector( 'ul' )
		};
	};

	drawer.element = getDrawerElements();
	checkboxHackTargets.push( drawer );

	// This should be in ToC script
	// And the media query needs to be synced with the less variable
	// Also this does not monitor screen size changes
	if ( document.body.classList.contains( 'skin-citizen-has-toc' ) &&
		window.matchMedia( 'screen and (max-width: 1300px)' ) ) {
		checkboxHackTargets.push( getTOC() );
	}

	checkboxHackTargets.forEach( ( target ) => {
		uncheckOnClickOutside( target.element, target.button, target.checkbox );
	} );
}

module.exports = {
	init: initCheckboxHack
};
