/*
 * Citizen - Search JS
 * https://starcitizen.tools
 *
 * Focus on search input when checkbox is toggled
 * Open the search box when the input is in focus
 */
( function () {
	document.getElementById( 'search-toggle' ).addEventListener( 'click', function ( event ) {
		if ( event.target.checked !== false ) {
			event.target.focus();
		}
	} );

	document.getElementById( 'searchInput' ).addEventListener( 'focus', function ( event ) {
		if ( event.target.checked === false ) {
			event.target.checked = true;
		}
	} );
}() );
