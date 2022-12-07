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
	const ACTIVE_CLASS = PREFIX + '__item--active';
	const typeaheadItems = typeahead.querySelectorAll( '.' + PREFIX + '__item' );

	for ( let i = 0; i < typeaheadItems.length; i++ ) {
		if ( element !== typeaheadItems[ i ] ) {
			typeaheadItems[ i ].classList.remove( ACTIVE_CLASS );
		} else {
			if ( element.classList.contains( ACTIVE_CLASS ) ) {
				element.classList.remove( ACTIVE_CLASS );
			} else {
				element.classList.add( ACTIVE_CLASS );
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

	if ( typeaheadItems[ activeIndex.index ] ) {
		const link = typeaheadItems[ activeIndex.index ].querySelector( '.' + PREFIX + '__content' );
		if ( event.key === 'Enter' && link instanceof HTMLAnchorElement ) {
			event.preventDefault();
			link.click();
		}
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
		nonSuggestionCount = 3;

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
 * @param {string} htmlSafeSearchQuery
 * @param {HTMLElement} placeholder
 * @return {void}
 */
function getSuggestions( searchQuery, htmlSafeSearchQuery, placeholder ) {
	const renderSuggestions = ( results ) => {
		if ( results.length > 0 ) {
			const
				fragment = document.createDocumentFragment(),
				suggestionLinkPrefix = config.wgScriptPath + '/index.php?title=Special:Search&search=';

			const highlightTitle = ( text ) => {
				const regex = new RegExp( mw.util.escapeRegExp( htmlSafeSearchQuery ), 'i' );
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
					const
						cleanTitle = cleanup( title ),
						cleanMatchedTitle = cleanup( matchedTitle );

					return !( cleanTitle.includes( cleanMatchedTitle ) || cleanMatchedTitle.includes( cleanTitle ) );
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

			// Create suggestion items
			results.forEach( ( result, index ) => {
				const data = {
					id: PREFIX + '-suggestion-' + index,
					link: suggestionLinkPrefix + encodeURIComponent( result.key ),
					title: highlightTitle( result.title ),
					// Just to be safe, not sure if the default API is HTML escaped
					description: result.description
				};
				if ( result.matchedTitle ) {
					data.label = getRedirectLabel( result.title, result.matchedTitle );
				}
				if ( result.thumbnail ) {
					data.thumbnail = result.thumbnail;
				} else {
					// Thumbnail placeholder icon
					data.icon = 'image';
				}
				fragment.append( getMenuItem( data ) );
			} );
			// Hide placeholder
			placeholder.classList.add( PREFIX + '__placeholder--hidden' );
			typeahead.prepend( fragment );
		} else {
			// Update placeholder with no result content
			updateMenuItem(
				placeholder,
				{
					icon: 'articleNotFound',
					class: PREFIX + '__placeholder ' + PREFIX + '__placeholder--noResult',
					title: mw.message( 'citizen-search-noresults-title', htmlSafeSearchQuery ).text(),
					description: mw.message( 'citizen-search-noresults-desc' ).text()
				}
			);
		}
	};

	// Add loading animation
	searchInput.parentNode.classList.add( SEARCH_LOADING_CLASS );

	const
		controller = new AbortController(),
		abortFetch = () => {
			controller.abort();
		};

	const
		gateway = require( './gateway/gateway.js' ),
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
 * Update menu item element
 *
 * @param {HTMLElement} item
 * @param {Object} data
 * @return {void}
 */
function updateMenuItem( item, data ) {
	if ( data.id ) {
		item.setAttribute( 'id', data.id );
	}
	if ( data.class ) {
		// So that it can overwrite the original class
		// We use that in placeholder
		item.setAttribute( 'class', data.class );
	}
	if ( data.link ) {
		const link = item.querySelector( '.' + PREFIX + '__content' );
		link.setAttribute( 'href', data.link );
	}
	if ( data.icon || data.thumbnail ) {
		const thumbnail = item.querySelector( '.' + PREFIX + '__thumbnail' );
		if ( data.thumbnail ) {
			thumbnail.style.backgroundImage = 'url(' + data.thumbnail + ')';
		} else {
			// FIXME: There is probably a cleaner way
			thumbnail.setAttribute( 'class', PREFIX + '__thumbnail citizen-ui-icon mw-ui-icon-wikimedia-' + data.icon );
		}
	}
	if ( data.title ) {
		const title = item.querySelector( '.' + PREFIX + '__title' );
		title.innerHTML = data.title;
	}
	if ( data.label ) {
		const label = item.querySelector( '.' + PREFIX + '__label' );
		label.innerHTML = data.label;
	}
	if ( data.description ) {
		const description = item.querySelector( '.' + PREFIX + '__description' );
		description.innerHTML = data.description;
	}
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
		fragment = template.content.cloneNode( true ),
		item = fragment.querySelector( '.' + PREFIX + '__item' );
	updateMenuItem( item, data );
	return fragment;
}

/**
 * Update the typeahead element
 *
 * @param {Object} messages
 * @return {void}
 */
function updateTypeahead( messages ) {
	const
		searchQuery = searchInput.value,
		htmlSafeSearchQuery = mw.html.escape( searchQuery ),
		hasQuery = searchQuery.length > 0,
		placeholder = typeahead.querySelector( '.' + PREFIX + '__placeholder' );

	const updateFullTextSearchItem = () => {
		const
			FULLTEXT_ID = PREFIX + '-fulltext',
			HIDDEN_CLASS = PREFIX + '__item--hidden';

		const
			fulltextEl = document.getElementById( FULLTEXT_ID ),
			highlightedQuery = '<strong>' + htmlSafeSearchQuery + '</strong>',
			fulltextText = mw.message( 'citizen-search-fulltext', highlightedQuery );

		const item = getMenuItem( {
			icon: 'articleSearch',
			id: FULLTEXT_ID,
			link: config.wgScriptPath + '/index.php?title=Special:Search&fulltext=1&search=' + htmlSafeSearchQuery,
			description: fulltextText
		} );

		// Update existing element instead of creating a new one
		if ( fulltextEl ) {
			updateMenuItem( fulltextEl, { description: fulltextText } );
			// FIXME: There is probably a more efficient way
			if ( hasQuery ) {
				fulltextEl.classList.remove( HIDDEN_CLASS );
			} else {
				fulltextEl.classList.add( HIDDEN_CLASS );
			}
		} else {
			typeahead.append( item );
		}
	};

	updateFullTextSearchItem();

	if ( hasQuery ) {
		getSuggestions( searchQuery, htmlSafeSearchQuery, placeholder );
	} else {
		clearSuggestions();
		// Update placeholder with no query content
		updateMenuItem(
			placeholder,
			{
				icon: 'articlesSearch',
				class: PREFIX + '__placeholder ' + PREFIX + '__placeholder--noQuery',
				title: messages.searchsuggestSearch,
				description: messages.fulltextEmpty
			}
		);
	}
}

/**
 * @param {HTMLElement} searchForm
 * @param {HTMLInputElement} input
 * @return {void}
 */
function initTypeahead( searchForm, input ) {
	const EXPANDED_CLASS = 'citizen-typeahead--expanded';

	const
		messages = {
			fulltextEmpty: mw.message( 'citizen-search-fulltext-empty' ).text(),
			searchsuggestSearch: mw.message( 'searchsuggest-search' ).text()
		},
		template = mw.template.get(
			'skins.citizen.search',
			'resources/skins.citizen.search/templates/typeahead.mustache'
		),
		data = {
			'msg-citizen-search-fulltext-empty': messages.fulltextEmpty,
			'msg-searchsuggest-search': messages.searchsuggestSearch
		};

	const onBlur = ( event ) => {
		const focusIn = typeahead.contains( event.relatedTarget );

		if ( !focusIn ) {
			// HACK: On Safari, users are unable to click any links because the blur
			// event dismiss the links before it is clicked. This should fix it.
			setTimeout( () => {
				searchInput.setAttribute( 'aria-activedescendant', '' );
				typeahead.classList.remove( EXPANDED_CLASS );
				searchInput.removeEventListener( 'keydown', keyboardEvents );
				searchInput.removeEventListener( 'blur', onBlur );
			}, 10 );
		}
	};

	const onFocus = () => {
		// Refresh the typeahead since the query will be emptied when blurred
		updateTypeahead( messages );
		typeahead.classList.add( EXPANDED_CLASS );
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
