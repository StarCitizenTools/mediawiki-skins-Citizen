const PREFIX = 'citizen-typeahead';
const SEARCH_LOADING_CLASS = 'citizen-loading';

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
		isLoading: false,
		init: function ( formEl ) {
			const typeaheadFormElement = formEl;
			this.element = typeaheadFormElement;
			typeaheadFormElement.setAttribute( 'aria-owns', typeahead.element.id );
			typeaheadFormElement.appendChild( typeahead.element );
		},
		setLoadingState: function ( state ) {
			this.element.classList.toggle( SEARCH_LOADING_CLASS, state );
			this.isLoading = state;
		}
	},
	input: {
		/** @type {HTMLInputElement | undefined} */
		element: undefined,
		displayElement: undefined,
		// Trigger update only when character is composed (e.g. CJK IME)
		isComposing: false,
		init: function ( inputEl ) {
			const typeaheadInputElement = inputEl;
			this.element = typeaheadInputElement;

			const wrapper = document.createElement( 'div' );
			wrapper.classList.add( 'citizen-typeahead-input-group' );
			typeaheadInputElement.parentNode.insertBefore( wrapper, typeaheadInputElement );

			const overlay = document.createElement( 'div' );
			overlay.classList.add( 'citizen-typeahead-input-overlay' );
			this.displayElement = document.createElement( 'span' );
			this.displayElement.textContent = typeaheadInputElement.value;
			this.displayElement.classList.add( 'citizen-typeahead-input-overlay-query' );
			overlay.append( this.displayElement );

			typeaheadInputElement.classList.add( 'citizen-typeahead-input' );
			typeaheadInputElement.setAttribute( 'aria-autocomplete', 'list' );
			typeaheadInputElement.setAttribute( 'aria-controls', typeahead.element.id );

			wrapper.append( overlay, typeaheadInputElement );
			typeaheadInputElement.addEventListener( 'focus', this.onFocus );

			const isVisible = typeaheadInputElement.offsetWidth > 0 ||
				typeaheadInputElement.offsetHeight > 0;
			const isFocusable = !typeaheadInputElement.disabled && !typeaheadInputElement.readOnly;

			if ( isVisible && isFocusable ) {
				requestAnimationFrame( () => {
					typeaheadInputElement.focus();
				} );
			}
		},
		onCompositionstart: function () {
			typeahead.input.element.addEventListener( 'compositionend', typeahead.input.onCompositionend );
			typeahead.input.isComposing = true;
		},
		onCompositionend: function () {
			typeahead.input.isComposing = false;
			typeahead.input.element.dispatchEvent( new Event( 'input' ) );
		},
		onFocus: function () {
			const typeaheadInputElement = typeahead.input.element;
			// Refresh the typeahead since the query will be emptied when blurred
			typeahead.afterSearchQueryInput();
			typeahead.form.element.parentElement.classList.add( 'citizen-search__card--expanded' );
			// FIXME: Should probably clean up this somehow
			typeahead.element.addEventListener( 'click', typeahead.onClick );
			typeaheadInputElement.addEventListener( 'keydown', typeahead.input.onKeydown );
			typeaheadInputElement.addEventListener( 'input', typeahead.input.onInput );
			typeaheadInputElement.addEventListener( 'blur', typeahead.onBlur );
		},
		onInput: function () {
			const typeaheadInputElement = typeahead.input.element;
			typeahead.input.displayElement.textContent = typeaheadInputElement.value;
			typeaheadInputElement.addEventListener( 'compositionstart', typeahead.input.onCompositionstart );
			if ( typeahead.input.isComposing !== true ) {
				mw.util.debounce( typeahead.afterSearchQueryInput(), 100 );
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
			const typeaheadElement = typeahead.element;
			this.groupElements = typeaheadElement.querySelectorAll( '.citizen-typeahead-item-group' );
			this.elements = typeaheadElement.querySelectorAll( '.citizen-typeahead__item[role="option"]' );
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
			typeahead.form.setLoadingState( false );
		}
	},
	onBlur: function ( event ) {
		const typeaheadElement = typeahead.element;
		const typeaheadInputElement = typeahead.input.element;
		if ( !typeaheadElement.contains( event.relatedTarget ) ) {
			// HACK: On Safari, users are unable to click any links because the blur
			// event dismiss the links before it is clicked. This should fix it.
			setTimeout( () => {
				typeahead.form.element.parentElement.classList.remove( 'citizen-search__card--expanded' );
				typeaheadInputElement.setAttribute( 'aria-activedescendant', '' );
				typeaheadElement.removeEventListener( 'click', typeahead.onClick );
				typeaheadInputElement.removeEventListener( 'keydown', typeahead.input.onKeydown );
				// input listener need to stay on to make clear button works
				// typeaheadInputElement.removeEventListener( 'input', typeahead.input.onInput );
				typeaheadInputElement.removeEventListener( 'compositionstart', typeahead.input.onCompositionstart );
				typeaheadInputElement.removeEventListener( 'compositionend', typeahead.input.onCompositionend );
				typeaheadInputElement.removeEventListener( 'blur', this.onBlur );
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
		const typeaheadInputElement = typeahead.input.element;
		searchClient.setActive( config.wgCitizenSearchGateway );

		// Search command experiement
		if ( typeaheadInputElement.value.startsWith( '/' ) ) {
			const command = typeaheadInputElement.value.split( ' ' )[ 0 ].slice( 1 );
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
		const currentQuery = typeahead.input.element.value;
		if ( searchQuery.value === currentQuery ) {
			return Promise.reject( `Search query has not changed: ${ searchQuery.value }.` );
		}

		searchQuery.setValue( currentQuery );

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
	afterSearchQueryInput: function () {
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
			this.afterSearchQueryInput();
		}
	}
};

/**
 * Fetch suggestions from API and render the suggetions in HTML
 *
 */
// eslint-disable-next-line es-x/no-async-functions
async function getSuggestions() {
	const typeaheadInputElement = typeahead.input.element;

	const renderSuggestions = ( results ) => {
		const fragment = document.createDocumentFragment();
		if ( results.length > 0 ) {
			fragment.append( searchResults.getResultsHTML( results, searchQuery.valueHtml ) );
		} else {
			// Update placeholder with no result content
			fragment.append( searchResults.getPlaceholderHTML( searchQuery.valueHtml ) );
		}

		htmlHelper.removeItemGroup( typeahead.element, 'suggestion' );
		typeahead.element.querySelector( '.citizen-typeahead__item-placeholder' )?.remove();
		typeahead.element.append( fragment );
		typeahead.suggestions.set();
		// In case if somehow typeahead.suggestions.clear() didn't clear the loading animation
		typeahead.form.setLoadingState( false );
		typeahead.items.set();
	};

	// Add loading animation
	typeahead.form.setLoadingState( true );

	const { abort, fetch } = searchResults.fetch( searchQuery.value, searchClient.active.client );

	const inputEventListener = () => {
		abort();
		typeaheadInputElement.removeEventListener( 'input', inputEventListener );
	};
	typeaheadInputElement.addEventListener( 'input', inputEventListener, { once: true } );

	try {
		const response = await fetch;
		typeahead.suggestions.clear();
		renderSuggestions( response.results );
	} catch ( error ) {
		typeahead.form.setLoadingState( false );
		// User can trigger the abort when the fetch event is pending
		// There is no need for an error
		if ( error.name !== 'AbortError' ) {
			const message = `Uh oh, a wild error appears! ${ error }`;
			throw new Error( message );
		}
	}
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
