var DRAWER_ID = 'mw-drawer',
	DRAWER_CHECKBOX_ID = 'mw-drawer-checkbox',
	PERSONAL_MENU_ID = 'p-personal',
	PERSONAL_MENU_CHECKBOX_ID = 'personalmenu-checkbox';

/**
 * Uncheck CSS hack checkbox when clicked outside
 *
 * @param {HTMLElement} element
 * @param {HTMLElement} checkbox
 */
function uncheckOnClickOutside( element, checkbox ) {
	var listener = function ( e ) {
		if ( e.target !== checkbox && e.target !== element ) {
			checkbox.checked = false;
			document.removeEventListener( 'click', listener );
		}
	};
	checkbox.addEventListener( 'click', function () {
		if ( this.checked ) {
			document.addEventListener( 'click', listener );
		}
	} );
}

/**
 * @return {void}
 */
function init() {
	var drawer = document.getElementById( DRAWER_ID ),
		drawerCheckbox = document.getElementById( DRAWER_CHECKBOX_ID ),
		personalMenu = document.getElementById( PERSONAL_MENU_ID ),
		personalMenuCheckbox = document.getElementById( PERSONAL_MENU_CHECKBOX_ID );
	uncheckOnClickOutside( drawer, drawerCheckbox );
	uncheckOnClickOutside( personalMenu, personalMenuCheckbox );
}

module.exports = {
	init: init
};
