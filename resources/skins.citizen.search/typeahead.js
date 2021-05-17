// Should the whole thing be a class?
const wgScriptPath = mw.config.get( 'wgScriptPath' ),
	maxResults = mw.config.get( 'wgCitizenMaxSearchResults' );

const activeIndex = {
	index: -1,
	max: maxResults + 1,
	setMax: function ( x ) {
		this.max = x + 1;
	},
	increment: function ( i ) {
		this.index += i;
		if ( this.index < 0 ) {
			this.setIndex( this.max - 1 );
		} // Index reaches top
		if ( this.index === this.max ) {
			this.setIndex( 0 );
		} // Index reaches bottom
		return this.index;
	},
	setIndex: function ( i ) {
		if ( i <= this.max - 1 ) {
			this.index = i;
		}
		return this.index;
	},
	clear: function () {
		this.setIndex( -1 );
	}
};

let typeahead;

/*
 * @param {HTMLElement} element
 * @return {void}
 */
function toggleActive( element ) {
	const typeaheadItems = typeahead.querySelectorAll( 'li > a' ),
		activeClass = 'citizen-typeahead-option--active';

	/* eslint-disable mediawiki/class-doc */
	for ( let i = 0; i < typeaheadItems.length; i++ ) {
		if ( element !== typeaheadItems[ i ] ) {
			typeaheadItems[ i ].classList.remove( activeClass );
		} else {
			if ( element.classList.contains( activeClass ) ) {
				element.classList.remove( activeClass );
			} else {
				element.classList.add( activeClass );
				activeIndex.setIndex( i );
			}
		}
	}
	/* eslint-enable mediawiki/class-doc */
}

/**
 * Keyboard events: up arrow, down arrow and enter.
 * moves the 'active' suggestion up and down.
 *
 * @param {Event} event
 */
function keyboardEvents( event ) {
	if ( event.defaultPrevented ) {
		return; // Do nothing if the event was already processed
	}

	// Is children slower?
	const typeaheadItems = typeahead.querySelectorAll( 'li > a' );

	if ( event.key === 'ArrowDown' || event.key === 'ArrowUp' ) {
		if ( event.key === 'ArrowDown' ) {
			activeIndex.increment( 1 );
		} else {
			activeIndex.increment( -1 );
		}

		toggleActive( typeaheadItems[ activeIndex.index ] );

	}
	if ( event.key === 'Enter' && typeaheadItems[ activeIndex.index ] ) {
		event.preventDefault();
		typeaheadItems[ activeIndex.index ].click();
	}
}

/*
 * Bind mouseenter and mouseleave event to reproduce mouse hover event
 *
 * @param {HTMLElement} element
 * @return {void}
 */
function bindMouseHoverEvent( element ) {
	element.addEventListener( 'mouseenter', ( event ) => {
		toggleActive( event.currentTarget );
	} );
	element.addEventListener( 'mouseleave', ( event ) => {
		toggleActive( event.currentTarget );
	} );
}

/**
 * Remove all existing suggestions from typeahead
 *
 * @param {HTMLElement} searchInput
 * @return {void}
 */
function clearSuggestions( searchInput ) {
	const typeaheadItems = typeahead.children,
		nonSuggestionCount = 2;

	if ( typeaheadItems.length > nonSuggestionCount ) {
		// Splice would be cleaner but it is slower (?)
		const fragment = new DocumentFragment(),
			nonSuggestionItems = [ ...typeaheadItems ].slice(
				typeaheadItems.length - nonSuggestionCount, typeaheadItems.length
			);

		nonSuggestionItems.forEach( ( item ) => {
			fragment.append( item );
		} );

		typeahead.replaceChildren( fragment );
	}

	// Remove loading animation
	searchInput.parentNode.classList.remove( 'search-form__loading' );
	activeIndex.clear();
}

/**
 * Fetch suggestions from API and render the suggetions in HTML
 *
 * @param {string} searchQuery
 * @param {HTMLElement} searchInput
 * @return {void}
 */
function getSuggestions( searchQuery, searchInput ) {
	const renderSuggestions = ( results ) => {
		const prefix = 'citizen-typeahead-suggestion',
			template = document.getElementById( prefix + '-template' ),
			fragment = document.createDocumentFragment(),
			suggestionLinkPrefix = wgScriptPath + '/index.php?title=Special:Search&search=',
			sanitizedSearchQuery = mw.html.escape( mw.util.escapeRegExp( searchQuery ) ),
			regex = new RegExp( sanitizedSearchQuery, 'i' );

		// Maybe there is a cleaner way?
		// Maybe there is a faster way compared to multiple querySelector?
		// Should I just use regular for loop for faster performance?
		results.forEach( ( result ) => {
			const suggestion = template.content.cloneNode( true ),
				suggestionLink = suggestion.querySelector( '.' + prefix ),
				suggestionThumbnail = suggestion.querySelector( '.' + prefix + '__thumbnail img' ),
				suggestionTitle = suggestion.querySelector( '.' + prefix + '__title' ),
				suggestionDescription = suggestion.querySelector( '.' + prefix + '__description' );

			// Give <a> element a unique ID
			suggestionLink.id = prefix + '-' + result.id;
			suggestionLink.setAttribute( 'href', suggestionLinkPrefix + result.title );

			if ( result.thumbnail ) {
				suggestionThumbnail.setAttribute( 'src', result.thumbnail );
			}

			// Highlight title
			suggestionTitle.innerHTML = result.title.replace( regex, '<span class="' + prefix + '__title__highlight">$&</span>' );
			suggestionDescription.textContent = result.description;

			fragment.append( suggestion );
		} );

		typeahead.prepend( fragment );
	};

	// Attach mouseenter events to newly created suggestions
	const attachMouseListener = () => {
		const suggestions = typeahead.querySelectorAll( '.citizen-typeahead-suggestion' );
		suggestions.forEach( ( suggestion ) => {
			bindMouseHoverEvent( suggestion );
		} );
	};

	// Add loading animation
	searchInput.parentNode.classList.add( 'search-form__loading' );

	const gateway = require( './gateway/gateway.js' );
	const getResults = gateway.getResults( searchQuery );

	// Abort fetch if the input is detected
	// So that fetch request won't be queued up
	searchInput.addEventListener( 'input', gateway.abortFetch, { once: true } );

	getResults.then( ( results ) => {
		searchInput.removeEventListener( 'input', gateway.abortFetch );
		clearSuggestions( searchInput );
		searchInput.parentNode.classList.remove( 'search-form__loading' );

		if ( results !== null ) {
			renderSuggestions( results );
			activeIndex.setMax( results.length );
			attachMouseListener();
		}
	} ).catch( ( error ) => {
		searchInput.parentNode.classList.remove( 'search-form__loading' );

		// User can trigger the abort when the fetch event is pending
		// There is no need for an error
		if ( error.name !== 'AbortError' ) {
			const message = 'Uh oh, a wild error appears! ' + error;
			throw new Error( message );
		}
	} );
}

/**
 * Update the typeahead element
 *
 * @param {HTMLElement} searchInput
 * @return {void}
 */
function updateTypeahead( searchInput ) {
	const searchQuery = searchInput.value;

	const updateFooter = () => {
		const footer = document.getElementById( 'searchform-suggestions-footer' ),
			footerQuery = footer.querySelector( 'strong' ),
			fullTextUrl = wgScriptPath + '/index.php?title=Special:Search&fulltext=1&search=' + searchQuery;

		footerQuery.textContent = searchQuery;
		footer.setAttribute( 'href', fullTextUrl );
	};

	updateFooter();

	if ( searchQuery.length > 0 ) {
		getSuggestions( searchQuery, searchInput );
	} else {
		clearSuggestions( searchInput );
	}
}

/**
 * @param {HTMLElement} searchForm
 * @param {HTMLInputElement} searchInput
 * @return {void}
 */
function initTypeahead( searchForm, searchInput ) {
	const expandedClass = 'citizen-typeahead--expanded',
		template = mw.template.get(
			'skins.citizen.search',
			'resources/skins.citizen.search/templates/typeahead.mustache'
		);

	const debounce = function ( func, timeout ) {
		let timer;
		return ( ...args ) => {
			clearTimeout( timer );
			timer = setTimeout( () => {
				func.apply( this, args );
			}, timeout );
		};
	};

	typeahead = template.render().get()[ 1 ];

	searchForm.append( typeahead );

	const footer = document.getElementById( 'searchform-suggestions-footer' );
	bindMouseHoverEvent( footer );

	const onFocus = function () {
		/* eslint-disable-next-line mediawiki/class-doc */
		typeahead.classList.add( expandedClass );
		searchInput.addEventListener( 'keydown', keyboardEvents );
	};

	const onBlur = function () {
		/* eslint-disable-next-line mediawiki/class-doc */
		typeahead.classList.remove( expandedClass );
		searchInput.removeEventListener( 'keydown', keyboardEvents );
	};

	// Since searchInput is focused before the event listener is set up
	onFocus();
	searchInput.addEventListener( 'focus', onFocus );
	// searchInput.addEventListener( 'blur', onBlur );

	// Run once in case there is searchQuery before eventlistener is attached
	if ( searchInput.value.length > 0 ) {
		updateTypeahead( searchInput );
	}

	searchInput.addEventListener( 'input', () => {
		debounce( updateTypeahead( searchInput ), 100 );
	} );

}

module.exports = {
	init: initTypeahead
};
