/*
 * Lazyloading images with Native API or IntersectionObserver
 * TODO: Remove the features since it is depreciated by $wgNativeImageLazyLoading in 1.35
 */

/**
 * @param {document} document
 * @return {void}
 */
function main( document ) {
	// Native API
	if ( 'loading' in HTMLImageElement.prototype ) {
		document.querySelectorAll( 'img.lazy' ).forEach( function ( img ) {
			img.setAttribute( 'src', img.getAttribute( 'data-src' ) );
			img.removeAttribute( 'data-src' );

			if ( img.hasAttribute( 'data-srcset' ) ) {
				img.setAttribute( 'srcset', img.getAttribute( 'data-srcset' ) );
				img.removeAttribute( 'data-srcset' );
			}

			img.classList.remove( 'lazy' );
		} );
	} else {
		// IntersectionObserver API
		if ( typeof IntersectionObserver !== 'undefined' && 'forEach' in NodeList.prototype ) {
			const observer = new IntersectionObserver( ( changes ) => {
				if ( 'connection' in navigator && navigator.connection.saveData === true ) {
					return;
				}

				changes.forEach( ( change ) => {
					if ( change.isIntersecting ) {
						change.target.setAttribute( 'src', change.target.getAttribute( 'data-src' ) );
						change.target.removeAttribute( 'data-src' );

						if ( change.target.hasAttribute( 'data-srcset' ) ) {
							change.target.setAttribute( 'srcset', change.target.getAttribute( 'data-srcset' ) );
							change.target.removeAttribute( 'data-srcset' );
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
	}
}

main( document );
