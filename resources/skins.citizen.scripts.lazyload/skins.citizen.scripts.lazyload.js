/*
 * Citizen - Lazyload JS
 * https://starcitizen.tools
 *
 * Lazyloading images with Native API or IntersectionObserver
 */
( function () {
	var observer;

	// Native API
	if ( 'loading' in HTMLImageElement.prototype ) {
		document.querySelectorAll( 'img.lazy' ).forEach( function ( img ) {
			img.setAttribute( 'src', img.getAttribute( 'data-src' ) );

			if ( img.hasAttribute( 'data-srcset' ) ) {
				img.setAttribute( 'srcset', img.getAttribute( 'data-srcset' ) );
			}

			img.classList.remove( 'lazy' );
		} );

		return;
	}

	// IntersectionObserver API
	if ( typeof IntersectionObserver !== 'undefined' && 'forEach' in NodeList.prototype ) {
		observer = new IntersectionObserver( function ( changes ) {
			if ( 'connection' in navigator && navigator.connection.saveData === true ) {
				return;
			}

			changes.forEach( function ( change ) {
				if ( change.isIntersecting ) {
					change.target.setAttribute( 'src', change.target.getAttribute( 'data-src' ) );

					if ( change.target.hasAttribute( 'data-srcset' ) ) {
						change.target.setAttribute( 'srcset', change.target.getAttribute( 'data-srcset' ) );
					}

					change.target.classList.remove( 'lazy' );
					observer.unobserve( change.target );
				}
			} );
		} );

		document.querySelectorAll( 'img.lazy' ).forEach( function ( img ) {
			observer.observe( img );
		} );
	}
}() );
