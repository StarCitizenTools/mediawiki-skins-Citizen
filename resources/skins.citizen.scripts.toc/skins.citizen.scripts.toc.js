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
 * Add active HTML class to items in table of content based on user viewport.
 *
 * @constructor
 */
function ScrollSpy() {
	var sections = document.querySelectorAll( '.mw-headline' );
	window.addEventListener( 'scroll', function () {
		var scrollPos = document.documentElement.scrollTop || document.body.scrollTop,
			section, id, node, active;

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
	} );
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
