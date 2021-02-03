var DRAWER_ID = 'mw-drawer',
	DRAWER_BUTTON_ID = 'mw-drawer-button',
	DRAWER_CHECKBOX_ID = 'mw-drawer-checkbox',
	PERSONAL_MENU_ID = 'p-personal',
	PERSONAL_MENU_BUTTON_ID = 'personalmenu-button',
	PERSONAL_MENU_CHECKBOX_ID = 'personalmenu-checkbox';

/**
 * Uncheck CSS hack checkbox when clicked outside
 *
 * @param {HTMLElement|HTMLElement[]} clickableElement
 * @param {HTMLElement} button
 * @param {HTMLElement} checkbox
 */
function uncheckOnClickOutside( clickableElement, button, checkbox ) {
	var listener = function ( e ) {
		var hideCond = e.target !== clickableElement;

		if ( Array.isArray( clickableElement ) ) {
			hideCond = clickableElement.indexOf( e.target ) === -1;
		}

		if ( e.target !== checkbox && hideCond ) {
			if ( e.target !== button ) {
				checkbox.checked = false;
			}
			document.removeEventListener( 'click', listener );
		}
	};

	var keyboardListener = function ( event ) {
		if ( event.key === 'Escape' && checkbox.checked === true ) {
			checkbox.checked = false;
			document.removeEventListener( 'click', listener );
		}
	};

	var checkboxFn = function () {
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
 * @return {void}
 */
function init() {
	var drawer = document.getElementById( DRAWER_ID ),
		drawerButton = document.getElementById( DRAWER_BUTTON_ID ),
		drawerCheckbox = document.getElementById( DRAWER_CHECKBOX_ID ),
		drawerSearch = document.getElementById( 'mw-drawer-search-input' ),
		personalMenu = document.getElementById( PERSONAL_MENU_ID ),
		personalMenuButton = document.getElementById( PERSONAL_MENU_BUTTON_ID ),
		personalMenuCheckbox = document.getElementById( PERSONAL_MENU_CHECKBOX_ID ),
		clickableDrawerElements = [];

	drawer.querySelectorAll( '#mw-drawer-menu .mw-portal' ).forEach( function ( portal ) {
		clickableDrawerElements.push( portal );
	} );

	drawer.querySelectorAll( '#mw-drawer-menu .mw-portal h3' ).forEach( function ( portalHeading ) {
		clickableDrawerElements.push( portalHeading );
	} );

	if ( drawerSearch !== null ) {
		clickableDrawerElements.push( drawerSearch );
	}

	uncheckOnClickOutside( clickableDrawerElements, drawerButton, drawerCheckbox );
	uncheckOnClickOutside( personalMenu, personalMenuButton, personalMenuCheckbox );
}

module.exports = {
	init: init
};
