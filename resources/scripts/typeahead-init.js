/* eslint-disable */

/**
 * Based on https://gerrit.wikimedia.org/g/wikimedia/portals/+/refs/heads/master
 * See T219590 for more details
 */

/* global WMTypeAhead, _, addEvent */
( function ( WMTypeAhead ) {

	let inputEvent,
		searchInput = document.getElementById( 'searchInput' ),
		typeAhead = new WMTypeAhead( 'searchform', 'searchInput' );

	/**
	 * Testing for 'input' event and falling back to 'propertychange' event for IE.
	 */
	if ( 'oninput' in document ) {
		inputEvent = 'input';
	} else {
		inputEvent = 'propertychange';
	}

	/**
	 * Attaching type-ahead query action to 'input' event.
	 */
	addEvent( searchInput, inputEvent, _.debounce( function () {
		typeAhead.query( searchInput.value );
	}, 100 ) );

}( WMTypeAhead ) );
