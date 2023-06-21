const
	PREFIX = 'citizen-typeahead',
	SEARCH_LOADING_CLASS = 'citizen-loading',
	ITEM_CLASS = `${PREFIX}__item`,
	ACTIVE_CLASS = `${ITEM_CLASS}--active`,
	HIDDEN_CLASS = `${ITEM_CLASS}--hidden`;

/**
 * Config object from getCitizenSearchResourceLoaderConfig()
 */
const config = require( './config.json' );

const activeIndex = {
	index: -1,
	max: 0,
	setMax: function ( x ) {
		this.max = x;
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

let /** @type {HTMLElement | undefined} */ typeahead;
let /** @type {HTMLElement | undefined} */ searchInput;
let /** @type {HTMLCollection | undefined} */ typeaheadItems;

/**
 * @typedef {Object} MenuItemData
 * @property {string} id
 * @property {string} type
 * @property {string} link
 * @property {string} icon
 * @property {string} thumbnail
 * @property {string} title
 * @property {string} label
 * @property {string} desc
 */

/**
 * Retrieve the current list of item elements to update the active index
 */
function updateActiveIndex() {
	typeaheadItems = typeahead.querySelectorAll( `.${ITEM_CLASS}` );
	activeIndex.setMax( typeaheadItems.length );
}

/**
 * Sets an 'ACTIVE_CLASS' on the element
 *
 * @param {HTMLElement} element
 */
function toggleActive( element ) {
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

	if ( event.key === 'ArrowDown' || event.key === 'ArrowUp' ) {
		if ( event.key === 'ArrowDown' ) {
			activeIndex.increment( 1 );
		} else {
			activeIndex.increment( -1 );
		}
		toggleActive( typeaheadItems[ activeIndex.index ] );
	}

	if ( typeaheadItems[ activeIndex.index ] ) {
		const link = typeaheadItems[ activeIndex.index ].querySelector( `.${PREFIX}__content` );
		if ( event.key === 'Enter' && link instanceof HTMLAnchorElement ) {
			event.preventDefault();
			link.click();
		}
	}
}

/**
 * Bind mouseenter and mouseleave event to reproduce mouse hover event
 *
 * @param {HTMLElement} element
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
 */
function clearSuggestions() {
	const typeaheadChildren = typeahead.children;

	if ( typeaheadChildren.length > 0 ) {
		// Do all the work in document fragment then replace the whole list
		// It is more performant this way
		const
			fragment = new DocumentFragment(),
			template = document.getElementById( `${PREFIX}-template` );

		[ ...typeaheadChildren ].forEach( ( item ) => {
			if ( !item.classList.contains( `${ITEM_CLASS}-page` ) ) {
				fragment.append( item );
			}
		} );
		fragment.append( template );
		typeahead.innerHTML = '';
		typeahead.append( fragment );
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
 */
function getSuggestions( searchQuery, htmlSafeSearchQuery, placeholder ) {
	const renderSuggestions = ( results ) => {
		if ( results.length > 0 ) {
			const
				fragment = document.createDocumentFragment(),
				suggestionLinkPrefix = `${config.wgScriptPath}/index.php?title=Special:Search&search=`;
			/**
			 * Return the redirect title with search query highlight
			 *
			 * @param {string} text
			 * @return {string}
			 */
			const highlightTitle = ( text ) => {
				const regex = new RegExp( mw.util.escapeRegExp( htmlSafeSearchQuery ), 'i' );
				return text.replace( regex, `<span class="${PREFIX}__highlight">$&</span>` );
			};
			/**
			 * Return the HTML of the redirect label
			 *
			 * @param {string} title
			 * @param {string} matchedTitle
			 * @return {string}
			 */
			const getRedirectLabel = ( title, matchedTitle ) => {
				/**
				 * Check if the redirect is useful (T303013)
				 *
				 * @return {boolean}
				 */
				const isRedirectUseful = () => {
					// Change to lowercase then remove space and dashes
					const cleanup = ( text ) => {
						return text.toLowerCase().replace( /-|\s/g, '' );
					};
					const
						cleanTitle = cleanup( title ),
						cleanMatchedTitle = cleanup( matchedTitle );

					return !(
						cleanTitle.includes( cleanMatchedTitle ) ||
						cleanMatchedTitle.includes( cleanTitle )
					);
				};

				let html = '';
				// Result is a redirect
				// Show the redirect title and highlight it
				if ( matchedTitle && isRedirectUseful() ) {
					html = `<div class="${PREFIX}__labelItem" title="${mw.message( 'search-redirect', matchedTitle ).plain()}">
							<span class="citizen-ui-icon mw-ui-icon-wikimedia-articleRedirect"></span>
							<span>${highlightTitle( matchedTitle )}</span>
						</div>`;
				}

				return html;
			};

			// Create suggestion items
			results.forEach( ( result, index ) => {
				const data = {
					id: `${PREFIX}-suggestion-${index}`,
					type: 'page',
					size: 'md',
					link: suggestionLinkPrefix + encodeURIComponent( result.key ),
					title: highlightTitle( result.title ),
					// Just to be safe, not sure if the default API is HTML escaped
					desc: result.desc
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
			placeholder.classList.add( HIDDEN_CLASS );
			typeahead.prepend( fragment );
		} else {
			// Update placeholder with no result content
			updateMenuItem(
				placeholder,
				{
					icon: 'articleNotFound',
					type: 'placeholder',
					size: 'lg',
					title: mw.message( 'citizen-search-noresults-title', htmlSafeSearchQuery ).text(),
					desc: mw.message( 'citizen-search-noresults-desc' ).text()
				}
			);
			placeholder.classList.remove( HIDDEN_CLASS );
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
			updateActiveIndex();
		}
	} ).catch( ( error ) => {
		searchInput.removeEventListener( 'input', abortFetch );
		searchInput.parentNode.classList.remove( SEARCH_LOADING_CLASS );
		// User can trigger the abort when the fetch event is pending
		// There is no need for an error
		if ( error.name !== 'AbortError' ) {
			const message = `Uh oh, a wild error appears! ${error}`;
			throw new Error( message );
		}
	} );
}

/**
 * Update menu item element
 *
 * @param {HTMLElement} item
 * @param {MenuItemData} data
 */
function updateMenuItem( item, data ) {
	if ( data.id ) {
		item.setAttribute( 'id', data.id );
	}
	if ( data.type ) {
		item.classList.add( `${ITEM_CLASS}-${data.type}` );
	}
	if ( data.size ) {
		item.classList.add( `${ITEM_CLASS}-${data.size}` );
	}
	if ( data.link ) {
		const link = item.querySelector( `.${PREFIX}__content` );
		link.setAttribute( 'href', data.link );
	}
	if ( data.icon || data.thumbnail ) {
		const thumbnail = item.querySelector( `.${PREFIX}__thumbnail` );
		if ( data.thumbnail ) {
			thumbnail.style.backgroundImage = `url('${data.thumbnail}')`;
		} else {
			thumbnail.classList.add(
				`${PREFIX}__thumbnail`,
				'citizen-ui-icon',
				`mw-ui-icon-wikimedia-${data.icon}`
			);
		}
	}
	if ( data.title ) {
		const title = item.querySelector( `.${PREFIX}__title` );
		title.innerHTML = data.title;
	}
	if ( data.label ) {
		const label = item.querySelector( `.${PREFIX}__label` );
		label.innerHTML = data.label;
	}
	if ( data.desc ) {
		const desc = item.querySelector( `.${PREFIX}__description` );
		desc.innerHTML = data.desc;
	}
}

/**
 * Generate menu item HTML using the existing template
 *
 * @param {MenuItemData} data
 * @return {HTMLElement|void}
 */
function getMenuItem( data ) {
	const template = document.getElementById( `${PREFIX}-template` );

	// Shouldn't happen but just to be safe
	if ( !( template instanceof HTMLTemplateElement ) ) {
		return;
	}

	const
		fragment = template.content.cloneNode( true ),
		item = fragment.querySelector( `.${ITEM_CLASS}` );
	updateMenuItem( item, data );
	bindMouseHoverEvent( item );
	return fragment;
}

/**
 * Update the typeahead element
 *
 */
function updateTypeahead() {
	const
		searchQuery = searchInput.value,
		htmlSafeSearchQuery = mw.html.escape( searchQuery ),
		hasQuery = searchQuery.length > 0,
		placeholder = typeahead.querySelector( `.${ITEM_CLASS}-placeholder` );

	/**
	 * Get a list of tools for the typeahead footer
	 */
	const getTools = () => {
		/**
		 * Update a tool item or create it if it does not exist
		 *
		 * @param {Object} data
		 */
		const updateToolItem = ( data ) => {
			const
				itemId = `${PREFIX}-${data.id}`,
				query = `<span class="citizen-typeahead__query">${htmlSafeSearchQuery}</span>`,
				itemLink = data.link + htmlSafeSearchQuery,
				/* eslint-disable-next-line mediawiki/msg-doc */
				itemDesc = mw.message( data.msg, query );

			let item = document.getElementById( itemId );

			// Update existing element instead of creating a new one
			if ( item ) {
				// FIXME: Probably more efficient to just replace the query than the whole messaage?
				updateMenuItem(
					item,
					{
						link: itemLink,
						desc: itemDesc
					}
				);
			} else {
				item = getMenuItem( {
					icon: data.icon,
					id: itemId,
					type: 'tool',
					size: 'sm',
					link: itemLink,
					desc: itemDesc
				} );
				typeahead.append( item );
			}
		};

		// Fulltext search
		updateToolItem( {
			id: 'fulltext',
			link: `${config.wgScriptPath}/index.php?title=Special:Search&fulltext=1&search=`,
			icon: 'articleSearch',
			msg: hasQuery ? 'citizen-search-fulltext' : 'citizen-search-fulltext-empty'
		} );

		// MediaSearch
		if ( config.isMediaSearchExtensionEnabled ) {
			updateToolItem( {
				id: 'mediasearch',
				link: `${config.wgScriptPath}/index.php?title=Special:MediaSearch&type=image&search=`,
				icon: 'imageGallery',
				msg: hasQuery ? 'citizen-search-mediasearch' : 'citizen-search-mediasearch-empty'
			} );
		}
	};

	getTools();
	if ( hasQuery ) {
		getSuggestions( searchQuery, htmlSafeSearchQuery, placeholder );
	} else {
		clearSuggestions();
		// Update placeholder with no query content
		updateMenuItem(
			placeholder,
			{
				icon: 'articlesSearch',
				title: mw.message( 'searchsuggest-search' ).text(),
				desc: mw.message( 'citizen-search-empty-desc' ).text()
			}
		);
		placeholder.classList.remove( HIDDEN_CLASS );
		updateActiveIndex();
	}
}

/**
 * @param {HTMLElement} searchForm
 * @param {HTMLInputElement} input
 */
function initTypeahead( searchForm, input ) {
	const EXPANDED_CLASS = 'citizen-search__card--expanded';

	const
		template = mw.template.get(
			'skins.citizen.search',
			'resources/skins.citizen.search/templates/typeahead.mustache'
		),
		data = {
			'msg-searchsuggest-search': mw.message( 'searchsuggest-search' ).text(),
			'msg-citizen-search-empty-desc': mw.message( 'citizen-search-empty-desc' ).text()
		};

	const onBlur = ( event ) => {
		const focusIn = typeahead.contains( event.relatedTarget );

		if ( !focusIn ) {
			// HACK: On Safari, users are unable to click any links because the blur
			// event dismiss the links before it is clicked. This should fix it.
			setTimeout( () => {
				searchInput.setAttribute( 'aria-activedescendant', '' );
				searchForm.parentElement.classList.remove( EXPANDED_CLASS );
				searchInput.removeEventListener( 'keydown', keyboardEvents );
				searchInput.removeEventListener( 'blur', onBlur );
			}, 10 );
		}
	};

	const onFocus = () => {
		// Refresh the typeahead since the query will be emptied when blurred
		updateTypeahead();
		searchForm.parentElement.classList.add( EXPANDED_CLASS );
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

	// Init the value in case of undef error
	updateActiveIndex();
	// Since searchInput is focused before the event listener is set up
	onFocus();
	searchInput.addEventListener( 'focus', onFocus );

	// Run once in case there is searchQuery before eventlistener is attached
	if ( searchInput.value.length > 0 ) {
		updateTypeahead();
	}

	// Trigger update only when character is composed (e.g. CJK IME)
	searchInput.composing = false;
	searchInput.addEventListener( 'compositionstart', () => {
		searchInput.composing = true;
	} );
	searchInput.addEventListener( 'compositionend', () => {
		if ( searchInput.composing ) {
			searchInput.composing = false;
			searchInput.dispatchEvent( new Event( 'input' ) );
		}
	} );
	searchInput.addEventListener( 'input', () => {
		if ( searchInput.composing !== true ) {
			mw.util.debounce( 100, updateTypeahead() );
		}
	} );

}

module.exports = {
	init: initTypeahead
};
