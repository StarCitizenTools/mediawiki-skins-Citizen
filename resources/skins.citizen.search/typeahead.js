const
	PREFIX = 'citizen-typeahead',
	SEARCH_LOADING_CLASS = 'citizen-loading';

// Config object from getCitizenSearchResourceLoaderConfig()
const config = require( './config.json' );

const htmlHelper = require( './htmlHelper.js' )();
const searchPresults = require( './searchPresults.js' )();
const searchClient = require( './searchClient.js' )( config );
const searchHistory = require( './searchHistory.js' )( config );
const searchResults = require( './searchResults.js' )();
const searchQuery = require( './searchQuery.js' )();

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
		displayElement: undefined,
		// Trigger update only when character is composed (e.g. CJK IME)
		isComposing: false,
		init: function ( inputEl ) {
			this.element = inputEl;

			const wrapper = document.createElement( 'div' );
			wrapper.classList.add( 'citizen-typeahead-input-group' );
			this.element.parentNode.insertBefore( wrapper, this.element );

			const overlay = document.createElement( 'div' );
			overlay.classList.add( 'citizen-typeahead-input-overlay' );
			this.displayElement = document.createElement( 'span' );
			this.displayElement.classList.add( 'citizen-typeahead-input-overlay-query' );
			overlay.append( this.displayElement );

			this.element.classList.add( 'citizen-typeahead-input' );
			this.element.setAttribute( 'aria-autocomplete', 'list' );
			this.element.setAttribute( 'aria-controls', typeahead.element.id );

			wrapper.append( overlay, this.element );
			this.element.addEventListener( 'focus', this.onFocus );
			this.element.focus();
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
			// FIXME: Should probably clean up this somehow
			typeahead.element.addEventListener( 'click', typeahead.onClick );
			typeahead.input.element.addEventListener( 'keydown', typeahead.input.onKeydown );
			typeahead.input.element.addEventListener( 'input', typeahead.input.onInput );
			typeahead.input.element.addEventListener( 'blur', typeahead.onBlur );
		},
		onInput: function () {
			typeahead.input.displayElement.innerText = typeahead.input.element.value;
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
				event.preventDefault();
				if ( event.key === 'ArrowDown' ) {
					typeahead.items.increment( 1 );
				} else {
					typeahead.items.increment( -1 );
				}
				typeahead.items.toggle( typeahead.items.elements[ typeahead.items.index ] );
			}

			/* Enter to click on the active item */
			if ( typeahead.items.elements[ typeahead.items.index ] ) {
				const link = typeahead.items.elements[ typeahead.items.index ].querySelector( `.${ PREFIX }__content` );
				if ( event.key === 'Enter' && link instanceof HTMLAnchorElement ) {
					event.preventDefault();
					link.click();
				}
			}
		}
	},
	items: {
		/** @type {NodeList | undefined} */
		elements: undefined,
		groupElements: undefined,
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
		clearIndex: function () {
			this.setIndex( -1 );
		},
		/**
		 * Sets 'citizen-typeahead__item--active' class on the element
		 *
		 * @param {HTMLElement} item
		 */
		toggle: function ( item ) {
			this.elements.forEach( ( element, index ) => {
				if ( item !== element ) {
					element.classList.remove( 'citizen-typeahead__item--active' );
				} else {
					if ( item.classList.contains( 'citizen-typeahead__item--active' ) ) {
						item.classList.remove( 'citizen-typeahead__item--active' );
					} else {
						item.classList.add( 'citizen-typeahead__item--active' );
						typeahead.input.element.setAttribute( 'aria-activedescendant', item.id );
						this.setIndex( index );
					}
				}
			} );
		},
		// So that mouse hover events are the same as keyboard hover events
		bindMouseHoverEvent: function () {
			this.elements.forEach( ( element ) => {
				element.addEventListener( 'mouseenter', ( event ) => {
					this.toggle( event.currentTarget );
				} );
				element.addEventListener( 'mouseleave', ( event ) => {
					this.toggle( event.currentTarget );
				} );
			} );
		},
		set: function () {
			this.groupElements = typeahead.element.querySelectorAll( '.citizen-typeahead-item-group' );
			this.elements = typeahead.element.querySelectorAll( '.citizen-typeahead__item[role="option"]' );
			this.bindMouseHoverEvent();
			this.setMax( this.elements.length );
		},
		clear: function () {
			if ( !this.elements ) {
				return;
			}
			this.groupElements.forEach( ( element ) => {
				element.remove();
			} );
			this.elements = undefined;
		}
	},
	suggestions: {
		/** @type {NodeList | undefined} */
		elements: undefined,
		set: function () {
			this.elements = typeahead.element.querySelectorAll( '.citizen-typeahead__item-page' );
		},
		/* Remove all existing suggestions from typeahead */
		clear: function () {
			if ( !this.elements ) {
				return;
			}

			this.set();
			typeahead.input.element.setAttribute( 'aria-activedescendant', '' );
			typeahead.items.clearIndex();
			// Remove loading animation
			typeahead.form.element.classList.remove( SEARCH_LOADING_CLASS );
		}
	},
	onBlur: function ( event ) {
		if ( !typeahead.element.contains( event.relatedTarget ) ) {
			// HACK: On Safari, users are unable to click any links because the blur
			// event dismiss the links before it is clicked. This should fix it.
			setTimeout( () => {
				typeahead.form.element.parentElement.classList.remove( 'citizen-search__card--expanded' );
				typeahead.input.element.setAttribute( 'aria-activedescendant', '' );
				typeahead.element.removeEventListener( 'click', typeahead.onClick );
				typeahead.input.element.removeEventListener( 'keydown', typeahead.input.onKeydown );
				typeahead.input.element.removeEventListener( 'input', typeahead.input.onInput );
				typeahead.input.element.removeEventListener( 'compositionstart', typeahead.input.onCompositionstart );
				typeahead.input.element.removeEventListener( 'compositionend', typeahead.input.onCompositionend );
				typeahead.input.element.removeEventListener( 'blur', this.onBlur );
			}, 10 );
		}
	},
	onClick: function ( event ) {
		// Extra safety so closest won't tranverse out of the typeahead
		if ( typeahead.element.contains( event.target ) ) {
			const item = event.target.closest( '.citizen-typeahead__item' );
			if ( item instanceof HTMLElement ) {
				let historyLabel;
				// User click on a suggestion -> save the matched title > title
				if ( item.classList.contains( 'citizen-typeahead__item-page' ) ) {
					historyLabel = item.querySelector( '.citizen-typeahead__label' ).innerText || item.querySelector( '.citizen-typeahead__title' ).innerText;
				} else {
					historyLabel = searchQuery.value;
				}
				if ( historyLabel ) {
					searchHistory.add( historyLabel );
				}
			}
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
					searchQuery.remove( `/${ command } ` );
				}
			}
		}
		return Promise.resolve( `Search client updated to ${ searchClient.active.id }.` );
	},
	updateSearchQuery: function () {
		if ( searchQuery.value === typeahead.input.element.value ) {
			return Promise.reject( `Search query has not changed: ${ searchQuery.value }.` );
		}

		searchQuery.setValue( typeahead.input.element.value );

		typeahead.updateSearchClient();

		// TODO: Merge this with the search client command and put this somewhere else
		const replaceRules = [
			{
				startWith: '{{',
				pattern: /{{(.[^}]*)}?}?/,
				replace: 'Template:$1',
				clients: [ 'mwActionApi', 'mwRestApi' ]
			},
			{
				startWith: '[[',
				pattern: /\[\[(.[^\]]*)\]?\]?/,
				replace: '$1',
				clients: [ 'mwActionApi', 'mwRestApi' ]
			}
		];

		replaceRules.forEach( ( rule ) => {
			if ( rule.clients.includes( searchClient.active.id ) && searchQuery.value.startsWith( rule.startWith ) ) {
				searchQuery.replace( rule.pattern, rule.replace );
			}
		} );

		return Promise.resolve( `Search query updated to ${ searchQuery.value }.` );
	},
	afterSeachQueryInput: function () {
		typeahead.updateSearchQuery().then( updateTypeaheadItems )
			.catch( () => {
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

		searchHistory.init();

		searchPresults.render( this.element );
		// Init the value in case of undef error
		typeahead.items.set();

		// Run once in case there is searchQuery before eventlistener is attached
		if ( this.input.element.value.length > 0 ) {
			this.afterSeachQueryInput();
		}
	}
};

/**
 * Fetch suggestions from API and render the suggetions in HTML
 *
 */
function getSuggestions() {
	const renderSuggestions = ( results ) => {
		const fragment = document.createDocumentFragment();
		if ( results.length > 0 ) {
			/**
			 * Return the redirect title with search query highlight
			 *
			 * @param {string} text
			 * @return {string}
			 */
			const highlightTitle = ( text ) => {
				const regex = new RegExp( mw.util.escapeRegExp( searchQuery.valueHtml ), 'i' );
				return text.replace( regex, `<span class="${ PREFIX }__highlight">$&</span>` );
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
					html = `<div class="${ PREFIX }__labelItem" title="${ mw.message( 'search-redirect', matchedTitle ).plain() }">
							<span class="citizen-ui-icon mw-ui-icon-wikimedia-articleRedirect"></span>
							<span>${ highlightTitle( matchedTitle ) }</span>
						</div>`;
				}

				return html;
			};

			// Create suggestion items
			const itemGroupData = {
				id: 'suggestion',
				items: []
			};
			results.forEach( ( result ) => {
				const data = {
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
				itemGroupData.items.push( data );
			} );
			fragment.append( htmlHelper.getItemGroupElement( itemGroupData ) );
		} else {
			// Update placeholder with no result content
			const data = {
				icon: 'articleNotFound',
				type: 'placeholder',
				size: 'lg',
				title: mw.message( 'citizen-search-noresults-title', searchQuery.valueHtml ).text(),
				desc: mw.message( 'citizen-search-noresults-desc' ).text()
			};
			fragment.append( htmlHelper.getItemElement( data ) );
		}

		htmlHelper.removeItemGroup( typeahead.element, 'suggestion' );
		typeahead.element.querySelector( '.citizen-typeahead__item-placeholder' )?.remove();
		typeahead.element.append( fragment );
		typeahead.suggestions.set();
		// In case if somehow typeahead.suggestions.clear() didn't clear the loading animation
		typeahead.form.element.classList.remove( SEARCH_LOADING_CLASS );
		typeahead.items.set();
	};

	// Add loading animation
	typeahead.form.element.classList.add( SEARCH_LOADING_CLASS );

	const { abort, fetch } = searchClient.active.client.fetchByTitle( searchQuery.value );

	// Abort fetch if the input is detected
	// So that fetch request won't be queued up
	typeahead.input.element.addEventListener( 'input', abort, { once: true } );

	fetch?.then( ( response ) => {
		typeahead.input.element.removeEventListener( 'input', abort );
		typeahead.suggestions.clear();
		if ( response.results !== null ) {
			renderSuggestions( response.results );
		}
	} ).catch( ( error ) => {
		typeahead.input.element.removeEventListener( 'input', abort );
		typeahead.form.element.classList.remove( SEARCH_LOADING_CLASS );
		// User can trigger the abort when the fetch event is pending
		// There is no need for an error
		if ( error.name !== 'AbortError' ) {
			const message = `Uh oh, a wild error appears! ${ error }`;
			throw new Error( message );
		}
	} );
}

/**
 * Update the typeahead element
 *
 */
function updateTypeaheadItems() {
	if ( searchQuery.isValid ) {
		searchPresults.clear( typeahead.element );
		searchResults.render( typeahead.element, searchQuery );
		getSuggestions();
	} else {
		searchResults.clear( typeahead.element );
		typeahead.items.clear();
		searchPresults.render( typeahead.element );
		typeahead.items.set();
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
