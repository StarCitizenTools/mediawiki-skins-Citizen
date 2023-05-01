/**
 * Set up scroll affordance for an overflowed element
 * TODO: Move this out of tables when this is used by more stuff
 *
 * @param {HTMLElement} element
 * @return {void}
 */
function setupOverflowState( element ) {
	const initState = () => {
		const updateState = () => {
			const
				containerWidth = element.parentNode.offsetWidth,
				contentWidth = element.scrollWidth;

			// Break if no horizontal overflow
			if ( contentWidth <= containerWidth ) {
				element.parentNode.classList.remove( 'citizen-overflow--left' );
				element.parentNode.classList.remove( 'citizen-overflow--right' );
				return;
			}

			const currentPosition = element.parentNode.scrollLeft;

			if ( currentPosition <= 0 ) {
				// At the start
				element.parentNode.classList.remove( 'citizen-overflow--left' );
				element.parentNode.classList.add( 'citizen-overflow--right' );
			} else if ( currentPosition + containerWidth >= contentWidth ) {
				// At the end
				element.parentNode.classList.remove( 'citizen-overflow--right' );
				element.parentNode.classList.add( 'citizen-overflow--left' );
			} else {
				// At the middle
				element.parentNode.classList.add( 'citizen-overflow--left' );
				element.parentNode.classList.add( 'citizen-overflow--right' );
			}
		};

		updateState();

		// Update state on element scroll
		element.parentNode.addEventListener( 'scroll', () => {
			window.requestAnimationFrame( updateState );
		} );
	};

	initState();

	// Listen for window resize
	if ( window.ResizeObserver ) {
		const overflowResizeObserver = new ResizeObserver( mw.util.debounce( 250, initState ) );
		overflowResizeObserver.observe( element );
	}
}

/**
 * Wrap table in div container to make it scrollable without breaking layout
 *
 * @param {HTMLTableElement} table
 * @return {void}
 */
function wrapTable( table ) {
	// Don't do anything if there is a nowrap class
	if ( table.classList.contains( 'citizen-table-nowrap' ) ) {
		return;
	}

	const wrapper = document.createElement( 'div' );

	// Some classes should be inherited from the table
	// For example, float helper classes like floatleft and floatright
	const inheritTableClass = () => {
		const tableClasses = [
			'floatleft',
			'floatright'
		];

		tableClasses.forEach( ( tableClass ) => {
			if ( table.classList.contains( tableClass ) ) {
				wrapper.classList.add( tableClass );
				table.classList.remove( tableClass );
			}
		} );
	};

	wrapper.classList.add( 'citizen-table-wrapper' );
	inheritTableClass();
	table.parentNode.insertBefore( wrapper, table );
	wrapper.appendChild( table );

	setupOverflowState( table );
}

/**
 * @param {HTMLElement} bodyContent
 * @return {void}
 */
function init( bodyContent ) {
	if ( !bodyContent.querySelector( 'table' ) ) {
		return;
	}

	const tables = bodyContent.querySelectorAll( 'table' );

	tables.forEach( ( table ) => {
		wrapTable( table );
	} );
}

module.exports = {
	init: init
};
