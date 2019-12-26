/*
 * Scroll up Header
 * Modified from https://codepen.io/sajjad/pen/vgEZNy
 */

( function () {
	// Hide header on scroll down
	let didScroll,
		lastScrollTop = 0,
		navbarHeight = 0;
	const delta = 0,
		header = document.getElementsByTagName( 'header' )[ 0 ],
		headerContainer = document.querySelector( '.mw-header-container' );
	if ( headerContainer !== null ) {
		navbarHeight = headerContainer.offsetHeight;
	}

	window.addEventListener( 'scroll', () => {
		didScroll = true;
	} );

	function hasScrolled() {
		const st = window.scrollY;

		// Make scroll more than delta
		if ( Math.abs( lastScrollTop - st ) <= delta ) {
			return;
		}

		if ( st > lastScrollTop && st > navbarHeight ) {
			// If scrolled down and past the navbar, add class .nav-up.
			// Scroll Down
			header.classList.remove( 'nav-down' );
			header.classList.add( 'nav-up' );
		} else {
			// Scroll Up
			const body = document.body,
				html = document.documentElement,

				documentHeight = Math.max( body.scrollHeight, body.offsetHeight,
					html.clientHeight, html.scrollHeight, html.offsetHeight );

			if ( st + window.innerHeight < documentHeight ) {
				header.classList.remove( 'nav-up' );
				header.classList.add( 'nav-down' );
			}
		}

		lastScrollTop = st;
	}

	setInterval( function () {
		if ( didScroll ) {
			hasScrolled();
			didScroll = false;
		}
	}, 250 );
}() );
