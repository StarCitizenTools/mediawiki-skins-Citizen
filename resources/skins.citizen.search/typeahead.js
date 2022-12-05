const
	config = require( './config.json' ),
	PREFIX = 'citizen-typeahead',
	SEARCH_LOADING_CLASS = 'citizen-loading';

const activeIndex = {
	index: -1,
	max: config.wgCitizenMaxSearchResults + 1,
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

let typeahead, searchInput;

/*
 * @param {HTMLElement} element
 * @return {void}
 */
function toggleActive( element ) {
	const typeaheadItems = typeahead.querySelectorAll( '.' + PREFIX + '__item' ),
		activeClass = PREFIX + '__item--active';

	for ( let i = 0; i < typeaheadItems.length; i++ ) {
		if ( element !== typeaheadItems[ i ] ) {
			typeaheadItems[ i ].classList.remove( activeClass );
		} else {
			if ( element.classList.contains( activeClass ) ) {
				element.classList.remove( activeClass );
			} else {
				element.classList.add( activeClass );
				searchInput.setAttribute( 'aria-activedescendant', element.id );
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
	const typeaheadItems = typeahead.querySelectorAll( '.' + PREFIX + '__item' );

	if ( event.key === 'ArrowDown' || event.key === 'ArrowUp' ) {
		if ( event.key === 'ArrowDown' ) {
			activeIndex.increment( 1 );
		} else {
			activeIndex.increment( -1 );
		}

		toggleActive( typeaheadItems[ activeIndex.index ] );

	}

	// We assume the first child is link element, maybe it should be more strict?
	const link = typeaheadItems[ activeIndex.index ].firstChild;

	if ( event.key === 'Enter' && link instanceof HTMLLinkElement ) {
		link.click();
	}
}

/*
 * Attach mouse eventlistener to all typeahead items
 *
 * @return {void}
 */
function attachMouseListener() {
	const items = typeahead.querySelectorAll( '.' + PREFIX + '__item' );
	items.forEach( ( item ) => {
		bindMouseHoverEvent( item );
	} );
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
 * @return {void}
 */
function clearSuggestions() {
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

		// TODO: Just use replaceChildren when browser support is >90%
		if ( typeof typeahead.replaceChildren !== 'undefined' ) {
			typeahead.replaceChildren( fragment );
		} else {
			while ( typeahead.hasChildNodes() ) {
				typeahead.removeChild( typeahead.lastChild );
			}
			typeahead.appendChild( fragment );
		}
	}

	// Remove loading animation
	searchInput.parentNode.classList.remove( SEARCH_LOADING_CLASS );
	searchInput.setAttribute( 'aria-activedescendant', '' );
	activeIndex.clear();
}

/**
 * Fetch suggestions from API and render the suggetions in HTML
 *
 * @param {string} searchQuery
 * @return {void}
 */
function getSuggestions( searchQuery ) {
	const renderSuggestions = ( results ) => {
		const
			fragment = document.createDocumentFragment(),
			suggestionLinkPrefix = config.wgScriptPath + '/index.php?title=Special:Search&search=';

		const highlightTitle = ( text ) => {
			const
				sanitizedSearchQuery = mw.html.escape( mw.util.escapeRegExp( searchQuery ) ),
				regex = new RegExp( sanitizedSearchQuery, 'i' );
			return text.replace( regex, '<span class="' + PREFIX + '__highlight">$&</span>' );
		};

		const getRedirectLabel = ( title, matchedTitle ) => {
			// Check if the redirect is useful
			// See T303013
			const isRedirectUseful = () => {
				// Change to lowercase then remove space and dashes
				const cleanup = ( text ) => {
					return text.toLowerCase().replace( /-|\s/g, '' );
				};
				title = cleanup( title );
				matchedTitle = cleanup( matchedTitle );
				return !( title.includes( matchedTitle ) || matchedTitle.includes( title ) );
			};

			let html = '';

			// Result is a redirect
			// Show the redirect title and highlight it
			if ( matchedTitle && isRedirectUseful() ) {
				html = '<div class="' + PREFIX + '__labelItem" title="' + mw.message( 'search-redirect', matchedTitle ).plain() + '">' +
					/* Article redirect icon */
					'<span class="citizen-ui-icon mw-ui-icon-wikimedia-articleRedirect"></span>' +
					/* Since we are matching that redirect title, it should be highlighted */
					highlightTitle( matchedTitle ) +
					'</div>';
			}

			return html;
		};

		// FIXME: Assign ID to each item
		results.forEach( ( result ) => {
			const suggestion = getMenuItem( {
				link: suggestionLinkPrefix + encodeURIComponent( result.key ),
				/* FIXME: Null check should happen at gateway */
				thumbnail: result.thumbnail ?? '',
				title: highlightTitle( result.title ),
				label: getRedirectLabel( result.title, result.matchedTitle ),
				description: result.description
			} );

			fragment.append( suggestion );
		} );
		typeahead.prepend( fragment );
	};

	// Add loading animation
	searchInput.parentNode.classList.add( SEARCH_LOADING_CLASS );

	/* eslint-disable-next-line compat/compat */
	const controller = new AbortController(),
		abortFetch = () => {
			controller.abort();
		};

	const gateway = require( './gateway/gateway.js' ),
		getResults = gateway.getResults( searchQuery, controller );

	// Abort fetch if the input is detected
	// So that fetch request won't be queued up
	searchInput.addEventListener( 'input', abortFetch, { once: true } );

	getResults.then( ( results ) => {
		searchInput.removeEventListener( 'input', abortFetch );
		clearSuggestions();
		if ( results !== null ) {
			renderSuggestions( results );
			attachMouseListener();
		}
		activeIndex.setMax( results.length );
	} ).catch( ( error ) => {
		searchInput.removeEventListener( 'input', abortFetch );

		searchInput.parentNode.classList.remove( SEARCH_LOADING_CLASS );
		// User can trigger the abort when the fetch event is pending
		// There is no need for an error
		if ( error.name !== 'AbortError' ) {
			const message = 'Uh oh, a wild error appears! ' + error;
			throw new Error( message );
		}
	} );
}

/**
 * Generate menu item HTML using the existing template
 *
 * @param {Object} data
 * @return {HTMLElement|void}
 */
function getMenuItem( data ) {
	const template = document.getElementById( PREFIX + '-template' );

	// Shouldn't happen but just to be safe
	if ( !( template instanceof HTMLTemplateElement ) ) {
		return;
	}

	const
		item = template.content.cloneNode( true ),
		link = item.querySelector( '.' + PREFIX + '__content' ),
		thumbnail = item.querySelector( '.' + PREFIX + '__thumbnail img' ),
		title = item.querySelector( '.' + PREFIX + '__title' ),
		label = item.querySelector( '.' + PREFIX + '__label' ),
		description = item.querySelector( '.' + PREFIX + '__description' );

	if ( data.link ) {
		link.setAttribute( 'href', data.link );
	}
	if ( data.thumbnail ) {
		thumbnail.setAttribute( 'src', data.thumbnail );
	}
	title.innerHTML = data.title ?? '';
	label.innerHTML = data.label ?? '';
	// Description only contains text
	description.textContent = data.description ?? '';

	return item;
}

/**
 * Update the typeahead element
 *
 * @param {Object} messages
 * @return {void}
 */
function updateTypeahead( messages ) {
	const searchQuery = searchInput.value,
		footer = document.getElementById( PREFIX + '-footer' ),
		footerText = footer.querySelector( '.' + PREFIX + '__description' ),
		fullTextUrl = config.wgScriptPath + '/index.php?title=Special:Search&fulltext=1&search=';

	if ( searchQuery.length > 0 ) {
		const footerQuery = mw.html.escape( searchQuery );
		footerText.innerHTML = messages.fulltext + ' <strong>' + footerQuery + '</strong>';
		footerQuery.textContent = searchQuery;
		footer.setAttribute( 'href', fullTextUrl + searchQuery );
		getSuggestions( searchQuery );
	} else {
		footerText.textContent = messages.empty;
		footer.setAttribute( 'href', fullTextUrl );
		clearSuggestions();
	}
}

/**
 * @param {HTMLElement} searchForm
 * @param {HTMLInputElement} input
 * @return {void}
 */
function initTypeahead( searchForm, input ) {
	const
		expandedClass = 'citizen-typeahead--expanded',
		messages = {
			empty: mw.message( 'citizen-search-fulltext-empty' ).text(),
			fulltext: mw.message( 'citizen-search-fulltext' ).text()
		},
		template = mw.template.get(
			'skins.citizen.search',
			'resources/skins.citizen.search/templates/typeahead.mustache'
		),
		data = {
			'msg-citizen-search-fulltext': messages.empty
		};

	const onBlur = ( event ) => {
		const focusIn = typeahead.contains( event.relatedTarget );

		if ( !focusIn ) {
			// HACK: On Safari, users are unable to click any links because the blur
			// event dismiss the links before it is clicked. This should fix it.
			setTimeout( () => {
				searchInput.setAttribute( 'aria-activedescendant', '' );
				typeahead.classList.remove( expandedClass );
				searchInput.removeEventListener( 'keydown', keyboardEvents );
				searchInput.removeEventListener( 'blur', onBlur );
			}, 10 );
		}
	};

	const onFocus = () => {
		// Refresh the typeahead since the query will be emptied when blurred
		updateTypeahead( messages );
		typeahead.classList.add( expandedClass );
		searchInput.addEventListener( 'keydown', keyboardEvents );
		searchInput.addEventListener( 'blur', onBlur );
	};

	// Make them accessible outside of the function
	typeahead = template.render( data ).get()[ 1 ];
	searchInput = input;

	searchForm.append( typeahead );
	searchForm.setAttribute( 'aria-owns', 'searchform-suggestions' );
	searchInput.setAttribute( 'aria-autocomplete', 'list' );
	searchInput.setAttribute( 'aria-controls', 'searchform-suggestions' );

	// Attach mouse listener to inital typeahead items
	attachMouseListener();

	// Since searchInput is focused before the event listener is set up
	onFocus();
	searchInput.addEventListener( 'focus', onFocus );

	// Run once in case there is searchQuery before eventlistener is attached
	if ( searchInput.value.length > 0 ) {
		updateTypeahead( messages );
	}

	searchInput.addEventListener( 'input', () => {
		mw.util.debounce( 100, updateTypeahead( messages ) );
	} );

}

module.exports = {
	init: initTypeahead
};
