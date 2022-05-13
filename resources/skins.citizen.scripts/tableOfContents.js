const ACTIVE_ITEM_CLASS = 'toc__item--active';

/**
 * Toggle active HTML class to items in table of content based on user viewport.
 *
 * @param {Element} toc TOC element
 * @return {void}
 */
function initToC( toc ) {
	const
		headlines = document.querySelectorAll( '.mw-headline' ),
		marginTop = '-' + window.getComputedStyle( document.documentElement ).getPropertyValue( 'scroll-padding-top' );

	for ( let i = 0; i < headlines.length; i++ ) {
		/* eslint-disable compat/compat */
		const observer = new IntersectionObserver( ( entry ) => {
		/* eslint-enable compat/compat */
			if ( entry[ 0 ].isIntersecting ) {
				const
					headlineId = headlines[ i ].id,
					// Get the decoded ID from the span before
					decodedId = ( headlines[ i ].previousSibling !== null ) ?
						headlines[ i ].previousSibling.id : '',
					links = toc.querySelector( "a[href='#" + headlineId + "']" ) ||
						toc.querySelector( "a[href='#" + decodedId + "']" ),
					targetLink = links.parentNode,
					activeLink = toc.querySelector( '.' + ACTIVE_ITEM_CLASS );

				if ( activeLink !== null ) {
					activeLink.classList.remove( ACTIVE_ITEM_CLASS );
				}
				if ( targetLink !== null ) {
					targetLink.classList.add( ACTIVE_ITEM_CLASS );
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

module.exports = {
	init: initToC
};
