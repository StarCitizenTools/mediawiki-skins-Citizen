/**
 * Toggle active HTML class to items in table of content based on user viewport.
 *
 * @return {void}
 */
function intersectionHandler() {
	const headlines = document.querySelectorAll( '.mw-headline' ),
		toc = document.getElementById( 'toc' ),
		marginTop = '-' + window.getComputedStyle( document.documentElement ).getPropertyValue( 'scroll-padding-top' );

	for ( let i = 0; i < headlines.length; i++ ) {
		/* eslint-disable compat/compat */
		const observer = new IntersectionObserver( ( entry ) => {
		/* eslint-enable compat/compat */
			if ( entry[ 0 ].isIntersecting ) {
				const headlineId = headlines[ i ].id,
					// Get the decoded ID from the span before
					decodedId = ( headlines[ i ].previousSibling !== null ) ?
						headlines[ i ].previousSibling.id : '',
					links = toc.querySelector( "a[href='#" + headlineId + "']" ) ||
						toc.querySelector( "a[href='#" + decodedId + "']" ),
					targetLink = links.parentNode,
					activeLink = toc.querySelector( '.active' );

				if ( activeLink !== null ) {
					activeLink.classList.remove( 'active' );
				}
				if ( targetLink !== null ) {
					targetLink.classList.add( 'active' );
				}
			}
		}, {
			// Will break in viewport with short height
			// But calculating bottom margin on the fly is too costly
			rootMargin: marginTop + ' 0px -85% 0px'
		} );
		observer.observe( headlines[ i ] );
	}
}

/**
 * @return {void}
 */
function initTOC() {
	// Check for has-toc class since it is loaded way before #toc is present
	if ( document.body.classList.contains( 'skin-citizen-has-toc' ) ) {
		intersectionHandler();
	}
}

initTOC();
