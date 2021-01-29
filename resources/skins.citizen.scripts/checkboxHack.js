var DRAWER_ID = 'mw-drawer',
	DRAWER_BUTTON_ID = 'mw-drawer-button',
	DRAWER_CHECKBOX_ID = 'mw-drawer-checkbox',
	PERSONAL_MENU_ID = 'p-personal',
	PERSONAL_MENU_BUTTON_ID = 'personalmenu-button',
	PERSONAL_MENU_CHECKBOX_ID = 'personalmenu-checkbox';

/**
 * Uncheck CSS hack checkbox when clicked outside
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} button
 * @param {HTMLElement} checkbox
 */
function uncheckOnClickOutside( element, button, checkbox ) {
	var listener = function ( e ) {
		if ( e.target !== checkbox && e.target !== element ) {
			if ( e.target !== button ) {
				checkbox.checked = false;
			}
			document.removeEventListener( 'click', listener );
		}
	};

	checkbox.addEventListener( 'click', function () {
		if ( this.checked ) {
			document.addEventListener( 'click', listener );
		}
	} );

	document.addEventListener( 'keydown', function ( event ) {
		if ( event.key === 'Escape' && checkbox.checked === true ) {
			checkbox.checked = false;
			document.removeEventListener( 'click', listener );
		}
	} );
}

/**
 * @return {void}
 */
function init() {
	var drawer = document.getElementById( DRAWER_ID ),
		drawerButton = document.getElementById( DRAWER_BUTTON_ID ),
		drawerCheckbox = document.getElementById( DRAWER_CHECKBOX_ID ),
		personalMenu = document.getElementById( PERSONAL_MENU_ID ),
		personalMenuButton = document.getElementById( PERSONAL_MENU_BUTTON_ID ),
		personalMenuCheckbox = document.getElementById( PERSONAL_MENU_CHECKBOX_ID );
	uncheckOnClickOutside( drawer, drawerButton, drawerCheckbox );
	uncheckOnClickOutside( null, drawerButton, drawerCheckbox );
	uncheckOnClickOutside( personalMenu, personalMenuButton, personalMenuCheckbox );
}

module.exports = {
	init: init
};
