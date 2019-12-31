/*
 * Citizen - ToC JS
 * https://starcitizen.tools
 *
 * Smooth scroll fallback and Scrollspy
 */

const SmoothScroll = () => {
		if ( !( 'scrollBehavior' in document.documentElement.style ) ) {
			const navLinks = document.querySelectorAll( '#toc a' ),
				eventListener = e => {
					e.preventDefault();
					e.target.scrollIntoView( {
						behavior: 'smooth'
					} );
				};

			for ( let link in navLinks ) {
				if ( Object.prototype.hasOwnProperty.call( navLinks, link ) ) {
					navLinks[ link ].addEventListener( 'click', eventListener );
				}
			}
		}
	},

	ScrollSpy = () => {
		const sections = document.querySelectorAll( '.mw-headline' );

		window.addEventListener( 'scroll', () => {
			const scrollPos = document.documentElement.scrollTop || document.body.scrollTop;

			for ( let section in sections ) {
				if ( Object.prototype.hasOwnProperty.call( sections, section ) &&
					sections[ section ].offsetTop <= scrollPos ) {
					const id = mw.util.escapeIdForAttribute( sections[ section ].id ),
						node = document.querySelector( `a[href * = "${id}"]` ).parentNode,
						active = document.querySelector( '.active' );

					if (active !== null) {
						active.classList.remove( 'active' );
					}

					if ( node !== null ) {
						node.classList.add( 'active' );
					}
				}
			}
		} );
	},

	CheckToC = () => {
		if ( document.getElementById( 'toc' ) ) {
			SmoothScroll();
			ScrollSpy();
		}
	};

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
