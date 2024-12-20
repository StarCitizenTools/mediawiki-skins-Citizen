const scrollObserver = require( './scrollObserver.js' );

/**
 * Class representing a Wikitable.
 *
 * @class
 */
class Wikitable {
	constructor( element ) {
		this.table = element;
		this.tbody = this.table.querySelector( 'tbody' );
		this.thead = this.getThead();
		this.originalTh = this.thead.querySelectorAll( 'th' );
	}

	moveFirstRowToThead() {
		const thead = document.createElement( 'thead' );
		const firstRow = this.tbody.rows[ 0 ];
		if ( !firstRow ) {
			return;
		}
		this.table.insertBefore( thead, this.tbody );
		thead.appendChild( firstRow );
		return thead;
	}

	getThead() {
		const thead = this.table.querySelector( 'thead' );
		if ( thead ) {
			return thead;
		}
		return this.moveFirstRowToThead();
	}

	syncHeader() {
		const stickyCells = this.colgroup.querySelectorAll( 'col' );
		this.originalTh.forEach( ( cell, index ) => {
			stickyCells[ index ].style.minWidth = cell.getBoundingClientRect().width + 'px';
		} );
	}

	init() {
		const stickyHeader = document.createElement( 'table' );
		// Copy attributes from original table to sticky header
		for ( const { name, value } of this.table.attributes ) {
			stickyHeader.setAttribute( name, value );
		}

		if ( this.table.classList ) {
			for ( const className of this.table.classList ) {
				stickyHeader.classList.add( className );
			}
		}
		stickyHeader.classList.add( 'wikitable-stickyHeader' );

		const colgroup = document.createElement( 'colgroup' );
		for ( let i = 0; i < this.originalTh.length; i++ ) {
			const colEl = document.createElement( 'col' );
			colgroup.appendChild( colEl );
		}
		this.colgroup = colgroup;
		this.syncHeader();
		stickyHeader.append( this.thead.cloneNode( true ), colgroup );
		this.table.parentNode.insertBefore( stickyHeader, this.table );

		const overflowContainer = this.table.closest( '.citizen-overflow-content' );
		if ( !overflowContainer ) {
			return;
		}

		const onOverflowScroll = () => {
			window.requestAnimationFrame( () => {
				stickyHeader.style.setProperty( '--wikitable-scroll-x', -overflowContainer.scrollLeft + 'px' );
			} );
		};

		const observer = scrollObserver.initScrollObserver(
			() => {
				overflowContainer.removeEventListener( 'scroll', onOverflowScroll );
			},
			() => {
				overflowContainer.addEventListener( 'scroll', onOverflowScroll );
			}
		);
		observer.observe( this.table );
	}
}

/**
 * Initializes the process of wrapping overflow elements within the given body content.
 *
 * @param {HTMLElement} bodyContent - The body content element
 * @return {void}
 */
function init( bodyContent ) {
	// We only apply enhancement to sticky tables now, but this can be expanded later
	const wikitables = bodyContent.querySelectorAll( '.wikitable--sticky' );
	if ( !wikitables.length ) {
		return;
	}

	wikitables.forEach( ( el ) => {
		const wikitable = new Wikitable( el );
		wikitable.init();
	} );
}

module.exports = {
	init: init
};
