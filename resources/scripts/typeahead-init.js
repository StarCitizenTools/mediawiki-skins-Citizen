/**
 * Based on https://gerrit.wikimedia.org/g/wikimedia/portals/+/refs/heads/master
 * See T219590 for more details
 */

/* global wmTest, WMTypeAhead, _, addEvent */

( function ( WMTypeAhead ) {

	var inputEvent,
		searchInput = document.getElementById( 'search-input' ),
		typeAhead = new WMTypeAhead( 'search-form', 'searchInput' );

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
		typeAhead.query( searchInput.value, document.getElementById( 'searchLanguage' ).value );
	}, 100 ) );

}( WMTypeAhead ) );
