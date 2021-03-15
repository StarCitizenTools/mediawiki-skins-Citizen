/*
 * Citizen - ToC JS
 * https://starcitizen.tools
 *
 * Smooth scroll fallback and Scrollspy
 */

/**
 * Implement smooth scroll when an item in table of content is clicked.
 *
 * @constructor
 */
function SmoothScroll() {
	var navLinks, eventListener, link;
	if ( !( 'scrollBehavior' in document.documentElement.style ) ) {
		navLinks = document.querySelectorAll( '#toc a' );
		eventListener = function clickHandler( e ) {
			e.preventDefault();
			e.target.scrollIntoView( {
				behavior: 'smooth'
			} );
		};

		for ( link in navLinks ) {
			if ( Object.prototype.hasOwnProperty.call( navLinks, link ) ) {
				navLinks[ link ].addEventListener( 'click', eventListener );
			}
		}
	}
}

/**
 * Throttle scroll event
 *
 * @param {Function} fn - function
 * @param {number} wait - wait time in ms
 * @return {Function}
 */
function throttle( fn, wait ) {
	var time = Date.now();
	return function () {
		if ( ( time + wait - Date.now() ) < 0 ) {
			fn();
			time = Date.now();
		}
	};
}

/**
 * Add active HTML class to items in table of content based on user viewport.
 *
 * @constructor
 */
function ScrollSpy() {
	var sections = document.querySelectorAll( '.mw-headline' ),
		mwbody = document.querySelector( '.mw-body' ),
		mwbodyStyle = window.getComputedStyle( mwbody ),
		scrollOffset = parseInt( mwbodyStyle.marginTop, 10 ) + 1;

	window.addEventListener( 'scroll', throttle( function () {
		var scrollPos = document.documentElement.scrollTop || document.body.scrollTop,
			section, id, id2, toclink, node, active;

		scrollPos += scrollOffset;

		for ( section in sections ) {
			if (
				Object.prototype.hasOwnProperty.call( sections, section ) &&
				sections[ section ].offsetTop <= scrollPos
			) {
				id = sections[ section ].id;
				// Try the ID of the span before
				if ( sections[ section ].previousSibling !== null ) {
					id2 = sections[ section ].previousSibling.id || '';
				}
				toclink = document.querySelector( "a[href='#" + id + "']" ) || document.querySelector( "a[href='#" + id2 + "']" );
				node = toclink.parentNode;
				active = document.querySelector( '.active' );
				if ( active !== null ) {
					active.classList.remove( 'active' );
				}
				if ( node !== null ) {
					node.classList.add( 'active' );
				}
			}
		}
	}, 10 ), { passive: true } );
}

/**
 * Run SmoothScroll() and ScrollSpy() when table of content is present.
 *
 * @constructor
 */
function CheckToC() {
	if ( document.getElementById( 'toc' ) ) {
		SmoothScroll();
		ScrollSpy();
	}
}

function main() {
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
}

main();
