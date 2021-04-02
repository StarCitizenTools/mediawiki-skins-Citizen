/*
 * Citizen - ToC JS
 * https://starcitizen.tools
 */

/**
 * Add active HTML class to items in table of content based on user viewport.
 *
 * @constructor
 */
function intersectionHandler() {
	var sections = document.querySelectorAll( '.mw-headline' ),
		htmlStyles = window.getComputedStyle( document.documentElement ),
		scrollPaddingTop = htmlStyles.getPropertyValue( 'scroll-padding-top' ),
		// Align with scroll offset set in CSS
		marginTop = "-" + scrollPaddingTop,
		id, id2, toclink, node, active;

	for (let i = 0; i < sections.length; i++) {
		const observer = new IntersectionObserver( ( entry ) => {
			if ( entry[ 0 ].isIntersecting ) {
				id = sections[i].id;
				// Try the ID of the span before
				if ( sections[i].previousSibling !== null ) {
					id2 = sections[i].previousSibling.id || '';
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
		}, {
			// Will break in viewport with short height
			// But calculating bottom margin on the fly is too costly
			rootMargin: marginTop + " 0px -85% 0px"
		} );
		observer.observe( sections[i] );
	}
}

function main() {
	// Check for has-toc class since it is loaded way before #toc is present
	if ( document.body.classList.contains( 'skin-citizen-has-toc' ) ) {
		intersectionHandler();
	}
}

main();
