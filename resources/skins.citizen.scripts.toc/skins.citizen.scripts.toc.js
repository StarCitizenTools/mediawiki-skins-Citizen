/*
 * Citizen - ToC JS
 * https://starcitizen.tools
 *
 * Smooth scroll fallback and Scrollspy
 */

( function () {
	/**
	 * Implement smooth scroll when an item in table of content is clicked.
	 * @param {string} linkTarget The link element selector to add the click event listener to
	 */
	function SmoothScroll( linkTarget ) {
		var navLinks, link;

		if ( 'scrollBehavior' in document.documentElement.style ) {
			return;
		}

		navLinks = document.querySelectorAll( linkTarget );

		if ( navLinks.length === 0 ) {
			return;
		}

		function clickEventListener( event ) {
			event.preventDefault();
			event.target.scrollIntoView( {
				behavior: 'smooth'
			} );
		}

		for ( link in navLinks ) {
			if ( Object.prototype.hasOwnProperty.call( navLinks, link ) ) {
				navLinks[ link ].addEventListener( 'click', clickEventListener );
			}
		}
	}

	/**
	 * Add active HTML class to items in table of content based on user viewport.
	 * @param {string} target The element selector to add the scroll listener to
	 */
	function ScrollSpy( target ) {
		var sections, section, id, node, active;

		sections = document.querySelectorAll( target );

		function scrollListener() {
			var scrollPos = document.documentElement.scrollTop || document.body.scrollTop;

			for ( section in sections ) {
				if (
					Object.prototype.hasOwnProperty.call( sections, section ) &&
					sections[ section ].offsetTop <= scrollPos
				) {
					id = mw.util.escapeIdForAttribute( sections[ section ].id );
					node = document.querySelector( "a[href='#" + id + "']" ).parentNode;
					active = document.querySelector( '.active' );

					if ( active !== null ) {
						active.classList.remove( 'active' );
					}

					if ( node !== null ) {
						node.classList.add( 'active' );
					}
				}
			}
		}

		window.addEventListener( 'scroll', scrollListener );
	}

	/**
	 * Run SmoothScroll() and ScrollSpy() when table of content is present.
	 */
	function CheckToC() {
		if ( document.getElementById( '#toc' ) ) {
			SmoothScroll( '#toc a' );
			ScrollSpy( '.mw-headline' );
		}
	}

	if ( document.readyState !== 'loading' ) {
		CheckToC();
	} else if ( document.addEventListener ) {
		// All modern browsers to register DOMContentLoaded
		document.addEventListener( 'DOMContentLoaded', CheckToC );
	} else {
		// Old IE browsers
		document.attachEvent( 'onreadystatechange', function () {
			if ( document.readyState === 'complete' ) {
				CheckToC();
			}
		} );
	}
}() );
