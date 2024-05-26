const config = require( './config.json' );

/**
 * Set up scroll affordance for an overflowed element
 * TODO: Move this out of tables when this is used by more stuff
 *
 * @param {HTMLElement} element
 * @return {void}
 */
function setupOverflowState( element ) {
	if ( !element.parentElement ) {
		mw.log.error( '[Citizen] Parent element is null or undefined. Cannot proceed with setupOverflowState.' );
		return;
	}

	const parentNode = element.parentElement;
	let cachedContainerWidth = 0;
	let cachedContentWidth = 0;
	let cachedScrollPosition = 0;

	const toggleClasses = ( classes ) => {
		classes.forEach( ( [ condition, className ] ) => {
			const hasClass = parentNode.classList.contains( className );
			if ( condition && !hasClass ) {
				parentNode.classList.add( className );
			} else if ( !condition && hasClass ) {
				parentNode.classList.remove( className );
			}
		} );
	};

	const updateState = () => {
		const containerWidth = parentNode.offsetWidth;
		const contentWidth = element.scrollWidth;
		const currentPosition = Math.round( parentNode.scrollLeft );

		const areWidthsInvalid = Number.isNaN( containerWidth ) || Number.isNaN( contentWidth );
		if ( areWidthsInvalid ) {
			mw.log.error( '[Citizen] Invalid width values. Cannot calculate overflow state.' );
			return;
		}

		if (
			containerWidth === cachedContainerWidth &&
			contentWidth === cachedContentWidth &&
			currentPosition === cachedScrollPosition
		) {
			return;
		}

		cachedContainerWidth = containerWidth;
		cachedContentWidth = contentWidth;
		cachedScrollPosition = currentPosition;

		const updateClasses = [
			[ currentPosition > 0, 'citizen-overflow--left' ],
			[ currentPosition + containerWidth < contentWidth, 'citizen-overflow--right' ]
		];
		toggleClasses( updateClasses );
	};

	updateState();

	parentNode.addEventListener( 'scroll', () => {
		window.requestAnimationFrame( updateState );
	} );

	const debouncedUpdateState = mw.util.debounce( 250, updateState );
	const isResizeObserverSupported = typeof ResizeObserver === 'function';
	if ( isResizeObserverSupported ) {
		const overflowResizeObserver = new ResizeObserver( debouncedUpdateState );
		overflowResizeObserver.observe( element );
	} else {
		mw.log.warn( '[Citizen] ResizeObserver is not supported in this environment.' );
	}
}

/**
 * Wraps a given HTML table element in a new div container with specific classes,
 * ensuring it does not wrap tables with certain ignored classes. It also manages
 * class inheritance from the table to the wrapper and sets up overflow handling.
 *
 * @param {HTMLTableElement} table - The HTML table element to be wrapped.
 * @return {void}
 */
function wrapTable( table ) {
	try {
		if (
			!config.wgCitizenTableNowrapClasses ||
			!Array.isArray( config.wgCitizenTableNowrapClasses )
		) {
			mw.log.error( '[Citizen] Invalid or missing $wgCitizenTableNowrapClasses. Cannot proceed with wrapping table.' );
			return;
		}

		if ( !table || !table.parentNode ) {
			mw.log.error( '[Citizen] Table or table.parentNode is null or undefined.' );
			return;
		}

		const ignoredClasses = config.wgCitizenTableNowrapClasses;

		if ( ignoredClasses.some( ( cls ) => table.classList.contains( cls ) ) ) {
			return;
		}

		const wrapper = document.createElement( 'div' );
		wrapper.className = 'citizen-table-wrapper';

		const inheritedClasses = [
			'floatleft',
			'floatright'
		];

		const filteredClasses = inheritedClasses.filter( ( cls ) => table.classList.contains( cls ) );

		filteredClasses.forEach( ( cls ) => {
			if ( !wrapper.classList.contains( cls ) ) {
				wrapper.classList.add( cls );
			}
			if ( table.classList.contains( cls ) ) {
				table.classList.remove( cls );
			}
		} );

		table.parentNode.insertBefore( wrapper, table );
		wrapper.appendChild( table );

		setupOverflowState( table );
	} catch ( error ) {
		mw.log.error( `[Citizen] Error occurred while wrapping table: ${ error.message }` );
	}
}

/**
 * Initializes the process of wrapping tables within the given body content.
 *
 * @param {HTMLElement} bodyContent - The body content element containing tables to be wrapped.
 * @return {void}
 */
function init( bodyContent ) {
	const tables = bodyContent.querySelectorAll( 'table:not( table table )' );

	if ( tables.length > 0 ) {
		tables.forEach( ( table ) => {
			wrapTable( table );
		} );
	}
}

module.exports = {
	init: init
};
