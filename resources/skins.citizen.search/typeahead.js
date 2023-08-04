const
	PREFIX = 'citizen-typeahead',
	SEARCH_LOADING_CLASS = 'citizen-loading',
	ITEM_CLASS = `${PREFIX}__item`,
	ACTIVE_CLASS = `${ITEM_CLASS}--active`,
	HIDDEN_CLASS = `${ITEM_CLASS}--hidden`;

// Config object from getCitizenSearchResourceLoaderConfig()
const config = require( './config.json' );

const searchClient = require( './searchClient.js' )( config );
const searchQuery = require( './searchQuery.js' )();

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

let /** @type {HTMLCollection | undefined} */ typeaheadItems;

const typeahead = {
	/** @type {HTMLElement | undefined} */
	element: undefined,
	form: {
		/** @type {HTMLFormElement | undefined} */
		element: undefined,
		init: function ( formEl ) {
			this.element = formEl;
			this.element.setAttribute( 'aria-owns', typeahead.element.id );
			this.element.append( typeahead.element );
		}
	},
	input: {
		/** @type {HTMLInputElement | undefined} */
		element: undefined,
		// Trigger update only when character is composed (e.g. CJK IME)
		isComposing: false,
		init: function ( inputEl ) {
			this.element = inputEl;
			// Since searchInput is focused before the event listener is set up
			this.onFocus();
			this.element.setAttribute( 'aria-autocomplete', 'list' );
			this.element.setAttribute( 'aria-controls', typeahead.element.id );
			this.element.addEventListener( 'focus', this.onFocus );
		},
		onCompositionstart: function () {
			typeahead.input.element.addEventListener( 'compositionend', typeahead.input.onCompositionend );
			typeahead.input.isComposing = true;
		},
		onCompositionend: function () {
			typeahead.input.isComposing = false;
			typeahead.input.dispatchEvent( new Event( 'input' ) );
		},
		onFocus: function () {
			// Refresh the typeahead since the query will be emptied when blurred
			typeahead.afterSeachQueryInput();
			typeahead.form.element.parentElement.classList.add( 'citizen-search__card--expanded' );
			typeahead.input.element.addEventListener( 'keydown', typeahead.input.onKeydown );
			typeahead.input.element.addEventListener( 'input', typeahead.input.onInput );
			typeahead.input.element.addEventListener( 'blur', typeahead.onBlur );
		},
		onInput: function () {
			typeahead.input.element.addEventListener( 'compositionstart', typeahead.input.onCompositionstart );
			if ( typeahead.input.isComposing !== true ) {
				mw.util.debounce( 100, typeahead.afterSeachQueryInput() );
			}
		},
		onKeydown: function ( event ) {
			if ( event.defaultPrevented ) {
				return; // Do nothing if the event was already processed
			}

			/* Moves the active item up and down */
			if ( event.key === 'ArrowDown' || event.key === 'ArrowUp' ) {
				if ( event.key === 'ArrowDown' ) {
					activeIndex.increment( 1 );
				} else {
					activeIndex.increment( -1 );
				}
				toggleActive( typeaheadItems[ activeIndex.index ] );
			}

			/* Enter to click on the active item */
			if ( typeaheadItems[ activeIndex.index ] ) {
				const link = typeaheadItems[ activeIndex.index ].querySelector( `.${PREFIX}__content` );
				if ( event.key === 'Enter' && link instanceof HTMLAnchorElement ) {
					event.preventDefault();
					link.click();
				}
			}
		}
	},
	onBlur: function ( event ) {
		if ( !typeahead.element.contains( event.relatedTarget ) ) {
			// HACK: On Safari, users are unable to click any links because the blur
			// event dismiss the links before it is clicked. This should fix it.
			setTimeout( () => {
				typeahead.form.element.parentElement.classList.remove( 'citizen-search__card--expanded' );
				typeahead.input.element.setAttribute( 'aria-activedescendant', '' );
				typeahead.input.element.removeEventListener( 'keydown', typeahead.input.onKeydown );
				typeahead.input.element.removeEventListener( 'input', typeahead.input.onInput );
				typeahead.input.element.removeEventListener( 'compositionstart', typeahead.input.onCompositionstart );
				typeahead.input.element.removeEventListener( 'compositionend', typeahead.input.onCompositionend );
				typeahead.input.element.removeEventListener( 'blur', this.onBlur );
			}, 10 );
		}
	},
	updateSearchClient: function () {
		searchClient.setActive( config.wgCitizenSearchGateway );

		// Search command experiement
		if ( typeahead.input.element.value.startsWith( '/' ) ) {
			const command = typeahead.input.element.value.split( ' ' )[ 0 ].slice( 1 );
			if ( command.length > 0 ) {
				const searchClientData = searchClient.getData( 'command', command );
				// Multi-search clients experiment
				if ( searchClientData ) {
					searchClient.setActive( searchClientData.id );
					searchQuery.removeCommand( command );
				}
			}
		}
		return Promise.resolve( `Search client updated to ${searchClient.active.id}.` );
	},
	updateSearchQuery: function () {
		if ( searchQuery.value === typeahead.input.element.value ) {
			return Promise.reject( `Search query has not changed: ${searchQuery.value}.` );
		}
		searchQuery.setValue( typeahead.input.element.value );
		return Promise.resolve( `Search query updated to ${searchQuery.value}.` );
	},
	afterSeachQueryInput: function () {
		typeahead.updateSearchQuery().then( async () => {
			await typeahead.updateSearchClient();
			updateTypeaheadItems();
		} )
			.catch( ( reject ) => {
			// Don't do anything if search query has not changed.
			} );
	},
	init: function ( formEl, inputEl ) {
		const template = mw.template.get( 'skins.citizen.search', 'resources/skins.citizen.search/templates/typeahead.mustache' );
		const data = {
			'msg-searchsuggest-search': mw.message( 'searchsuggest-search' ).text(),
			'msg-citizen-search-empty-desc': mw.message( 'citizen-search-empty-desc' ).text()
		};
		this.element = template.render( data ).get()[ 1 ];
		this.form.init( formEl );
		this.input.init( inputEl );

		// Init the value in case of undef error
		updateActiveIndex();

		// Run once in case there is searchQuery before eventlistener is attached
		if ( this.input.element.value.length > 0 ) {
			this.afterSeachQueryInput();
		}
	}
};

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
	typeaheadItems = typeahead.element.querySelectorAll( `.${ITEM_CLASS}` );
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
				typeahead.input.element.setAttribute( 'aria-activedescendant', element.id );
				activeIndex.setIndex( i );
			}
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
	const typeaheadChildren = typeahead.element.children;

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
		typeahead.element.innerHTML = '';
		typeahead.element.append( fragment );
	}

	// Remove loading animation
	typeahead.input.element.parentNode.classList.remove( SEARCH_LOADING_CLASS );
	typeahead.input.element.setAttribute( 'aria-activedescendant', '' );
	activeIndex.clear();
}

/**
 * Fetch suggestions from API and render the suggetions in HTML
 *
 * @param {HTMLElement} placeholder
 */
function getSuggestions( placeholder ) {
	const renderSuggestions = ( results ) => {
		if ( results.length > 0 ) {
			const fragment = document.createDocumentFragment();
			/**
			 * Return the redirect title with search query highlight
			 *
			 * @param {string} text
			 * @return {string}
			 */
			const highlightTitle = ( text ) => {
				const regex = new RegExp( mw.util.escapeRegExp( searchQuery.valueHtml ), 'i' );
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
					link: result.url,
					title: highlightTitle( result.title ),
					desc: result.description
				};
				data.label = getRedirectLabel( result.title, result.label );
				if ( result.thumbnail ) {
					data.thumbnail = result.thumbnail.url;
				} else {
					// Thumbnail placeholder icon
					data.icon = 'image';
				}
				fragment.append( getMenuItem( data ) );
			} );
			// Hide placeholder
			placeholder.classList.add( HIDDEN_CLASS );
			typeahead.element.prepend( fragment );
		} else {
			// Update placeholder with no result content
			updateMenuItem(
				placeholder,
				{
					icon: 'articleNotFound',
					type: 'placeholder',
					size: 'lg',
					title: mw.message( 'citizen-search-noresults-title', searchQuery.valueHtml ).text(),
					desc: mw.message( 'citizen-search-noresults-desc' ).text()
				}
			);
			placeholder.classList.remove( HIDDEN_CLASS );
		}
	};

	// Add loading animation
	typeahead.input.element.parentNode.classList.add( SEARCH_LOADING_CLASS );

	const { abort, fetch } = searchClient.active.client.fetchByTitle( searchQuery.value );

	// Abort fetch if the input is detected
	// So that fetch request won't be queued up
	typeahead.input.element.addEventListener( 'input', abort, { once: true } );

	fetch?.then( ( response ) => {
		typeahead.input.element.removeEventListener( 'input', abort );
		clearSuggestions();
		if ( response.results !== null ) {
			renderSuggestions( response.results );
			updateActiveIndex();
		}
	} ).catch( ( error ) => {
		typeahead.input.element.removeEventListener( 'input', abort );
		typeahead.input.element.parentNode.classList.remove( SEARCH_LOADING_CLASS );
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
function updateTypeaheadItems() {
	const placeholder = typeahead.element.querySelector( `.${ITEM_CLASS}-placeholder` );

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
				query = `<span class="citizen-typeahead__query">${searchQuery.valueHtml}</span>`,
				itemLink = data.link + searchQuery.valueHtml,
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
				typeahead.element.append( item );
			}
		};

		// Fulltext search
		updateToolItem( {
			id: 'fulltext',
			link: `${config.wgScriptPath}/index.php?title=Special:Search&fulltext=1&search=`,
			icon: 'articleSearch',
			msg: searchQuery.isValid ? 'citizen-search-fulltext' : 'citizen-search-fulltext-empty'
		} );

		// MediaSearch
		if ( config.isMediaSearchExtensionEnabled ) {
			updateToolItem( {
				id: 'mediasearch',
				link: `${config.wgScriptPath}/index.php?title=Special:MediaSearch&type=image&search=`,
				icon: 'imageGallery',
				msg: searchQuery.isValid ? 'citizen-search-mediasearch' : 'citizen-search-mediasearch-empty'
			} );
		}
	};

	getTools();
	if ( searchQuery.isValid ) {
		getSuggestions( placeholder );
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
 * @param {HTMLFormElement} formEl
 * @param {HTMLInputElement} inputEl
 */
function initTypeahead( formEl, inputEl ) {
	typeahead.init( formEl, inputEl );
}

module.exports = {
	init: initTypeahead
};
