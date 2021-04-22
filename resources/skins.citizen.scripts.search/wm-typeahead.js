/* eslint-disable */

/**
 * Based on https://gerrit.wikimedia.org/g/wikimedia/portals/+/refs/heads/master
 * See T219590 for more details
 */
/**
* Below are additional dependency extracted from polyfills.js
* TODO: Optimize and clear unneeded code
*/
/**
 * Detects reported or approximate device pixel ratio.
 * * 1.0 means 1 CSS pixel is 1 hardware pixel
 * * 2.0 means 1 CSS pixel is 2 hardware pixels
 * * etc.
 *
 * Uses window.devicePixelRatio if available, or CSS media queries on IE.
 *
 * @return {number} Device pixel ratio
 */
function getDevicePixelRatio() {

	if ( window.devicePixelRatio !== undefined ) {
		// Most web browsers:
		// * WebKit (Safari, Chrome, Android browser, etc)
		// * Opera
		// * Firefox 18+
		return window.devicePixelRatio;
	} else if ( window.msMatchMedia !== undefined ) {
		// Windows 8 desktops / tablets, probably Windows Phone 8
		//
		// IE 10 doesn't report pixel ratio directly, but we can get the
		// screen DPI and divide by 96. We'll bracket to [1, 1.5, 2.0] for
		// simplicity, but you may get different values depending on zoom
		// factor, size of screen and orientation in Metro IE.
		if ( window.msMatchMedia( '(min-resolution: 192dpi)' ).matches ) {
			return 2;
		} else if ( window.msMatchMedia( '(min-resolution: 144dpi)' ).matches ) {
			return 1.5;
		} else {
			return 1;
		}
	} else {
		// Legacy browsers...
		// Assume 1 if unknown.
		return 1;
	}
}

function addEvent( obj, evt, fn ) {

	if ( !obj ) {
		return;
	}

	if ( obj.addEventListener ) {
		obj.addEventListener( evt, fn, false );
	} else if ( obj.attachEvent ) {
		obj.attachedEvents.push( [ obj, evt, fn ] );
		obj.attachEvent( 'on' + evt, fn );
	}
}

/**
 * WMTypeAhead.
 * Displays search suggestions with thumbnail and description
 * as user types into an input field.
 *
 * @constructor
 * @param {string} appendTo  - ID of a container element that the suggestions will be appended to.
 * @param {string} searchInput - ID of a search input whose value will be used to generate
 *                               search suggestions.
 *
 * @return {Object} Returns an object with the following properties:
 * @return {HTMLElement} return.typeAheadEl The type-ahead DOM object.
 * @return {Function} return.query A function that loads the type-ahead suggestions.
 *
 * @example
 * var typeAhead = new WMTypeAhead('containerID', 'inputID');
 * typeAhead.query('search string', 'en');
 *
 */
window.WMTypeAhead = function ( appendTo, searchInput ) {

	let typeAheadID = 'typeahead-suggestions',
		typeAheadEl = document.getElementById( typeAheadID ), // Type-ahead DOM element.
		appendEl = document.getElementById( appendTo ),
		searchEl = document.getElementById( searchInput ),
		server = mw.config.get( 'wgServer' ),
		scriptPath = mw.config.get( 'wgScriptPath' ),
		searchurl = server + scriptPath + '/index.php?title=Special%3ASearch&search=',
		thumbnailSize = Math.round( getDevicePixelRatio() * 80 ),
		useREST = mw.config.get( 'wgCitizenSearchUseREST' ),
		descriptionSource = mw.config.get( 'wgCitizenSearchDescriptionSource' ),
		maxSearchResults = mw.config.get( 'wgCitizenMaxSearchResults' ),
		cacheExpiry = mw.config.get( 'wgSearchSuggestCacheExpiry' ),
		searchString,
		typeAheadItems,
		activeItem,
		ssActiveIndex,
		api = new mw.Api();

	// Only create typeAheadEl once on page.
	if ( !typeAheadEl ) {
		typeAheadEl = document.createElement( 'div' );
		typeAheadEl.id = typeAheadID;
		appendEl.appendChild( typeAheadEl );
	}

	/**
	 * Keeps track of the search query callbacks. Consists of an array of
	 * callback functions and an index that keeps track of the order of requests.
	 * Callbacks are deleted by replacing the callback function with a no-op.
	 */
	window.callbackStack = {
		queue: {},
		index: -1,
		incrementIndex: function () {
			this.index += 1;
			return this.index;
		},
		addCallback: function ( func ) {
			const index = this.incrementIndex();
			this.queue[ index ] = func( index );
			return index;
		},
		deleteSelfFromQueue: function ( i ) {
			delete this.queue[ i ];
		},
		deletePrevCallbacks: function ( j ) {
			let callback;

			this.deleteSelfFromQueue( j );

			for ( callback in this.queue ) {
				if ( callback < j ) {
					this.queue[ callback ] = this.deleteSelfFromQueue.bind(
						window.callbackStack, callback
					);
				}
			}
		}
	};

	/**
	 * Maintains the 'active' state on search suggestions.
	 * Makes sure the 'active' element is synchronized between mouse and keyboard usage,
	 * and cleared when new search suggestions appear.
	 */
	ssActiveIndex = {
		index: -1,
		max: maxSearchResults,
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

	/**
	 * Removed the actual child nodes from typeAheadEl
	 * @see {typeAheadEl}
	 */
	function clearTypeAheadElements() {
		if ( typeof typeAheadEl === 'undefined' ) {
			return;
		}

		while ( typeAheadEl.firstChild !== null ) {
			typeAheadEl.removeChild( typeAheadEl.firstChild );
		}
	}

	/**
	 * Removes the type-ahead suggestions from the DOM.
	 * Reason for timeout: The typeahead is set to clear on input blur.
	 * When a user clicks on a search suggestion, they triggers the input blur
	 * and remove the typeahead before a click event is registered.
	 * The timeout makes it so a click on the search suggestion is registered before
	 * an input blur.
	 * 300ms is used to account for the click delay on mobile devices.
	 *
	 */
	function clearTypeAhead() {
		setTimeout( function () {
			clearTypeAheadElements();
			ssActiveIndex.clear();
		}, 300 );
	}

	/**
	 * Manually redirects the page to the href of a given element.
	 *
	 * For Chrome on Android to solve T221628.
	 * When search suggestions below the fold are clicked, the blur event
	 * on the search input is triggered and the page scrolls the search input
	 * into view. However, the originating click event does not redirect
	 * the page.
	 *
	 * @param {Event} e
	 */
	function forceLinkFollow( e ) {
		const el = e.relatedTarget;
		if ( el && /suggestion-link/.test( el.className ) ) {
			window.location = el.href;
		}
	}

	/**
	 * Inserts script element containing the Search API results into document head.
	 * The script itself calls the 'portalOpensearchCallback' callback function,
	 *
	 * @param {string} string - query string to search.
	 * @param {string} lang - ISO code of language to search in.
	 */
	function loadQueryScript( string ) {
		let callbackIndex,
			searchQuery;

		// Variables declared in parent function.
		searchString = encodeURIComponent( string );
		if ( searchString.length === 0 ) {
			clearTypeAhead();
			return;
		}

		callbackIndex = window.callbackStack.addCallback( window.portalOpensearchCallback );

		// Check if use REST API
		if ( useREST ) {
			fetch(`${scriptPath}/rest.php/v1/search/title?q=${searchString}&limit=${maxSearchResults}`)
				.then(async function (response) {
					var data = await response.json();
					clearTypeAheadElements();
					window.callbackStack.queue[ callbackIndex ]( data, string );
				} );
		} else {
			// TODO: Not sure if static cache expiry is a good idea
			// A value based on the size of the wiki and the
			// length of the search string might be a better idea
			searchQuery = {
				action: 'query',
				smaxage: cacheExpiry,
				maxage: cacheExpiry,
				generator: 'prefixsearch',
				prop: 'pageprops|pageimages',
				redirects: '',
				ppprop: 'displaytitle',
				piprop: 'thumbnail',
				pithumbsize: thumbnailSize,
				pilimit: maxSearchResults,
				gpssearch: string,
				gpsnamespace: 0,
				gpslimit: maxSearchResults
			};

			switch ( descriptionSource ) {
				case 'wikidata':
					searchQuery.prop += '|description';
					break;
				case 'textextracts':
					searchQuery.prop += '|extracts';
					searchQuery.exchars = '60';
					searchQuery.exintro = '1';
					searchQuery.exlimit = maxSearchResults;
					searchQuery.explaintext = '1';
					break;
				case 'pagedescription':
					searchQuery.prop += '|pageprops';
					searchQuery.ppprop = 'description';
					break;
			}

			api.get( searchQuery )
				.done( ( data ) => {
					clearTypeAheadElements();
					window.callbackStack.queue[ callbackIndex ]( data, string );
				} );
		}
	} // END loadQueryScript

	/**
	 * Highlights the part of the suggestion title that matches the search query.
	 * Used inside the generateTemplateString function.
	 *
	 * @param {string} title - The title of the search suggestion.
	 * @param {string} searchString - The string to highlight.
	 * @return {string} The title with highlighted part in an <em> tag.
	 */
	function highlightTitle( title, searchString ) {
		let sanitizedSearchString = mw.html.escape( mw.util.escapeRegExp( searchString ) ),
			searchRegex = new RegExp( sanitizedSearchString, 'i' ),
			startHighlightIndex = title.search( searchRegex ),
			formattedTitle = mw.html.escape( title ),
			endHighlightIndex,
			strong,
			beforeHighlight,
			aferHighlight;

		if ( startHighlightIndex >= 0 ) {
			endHighlightIndex = startHighlightIndex + sanitizedSearchString.length;
			strong = title.substring( startHighlightIndex, endHighlightIndex );
			beforeHighlight = title.substring( 0, startHighlightIndex );
			aferHighlight = title.substring( endHighlightIndex, title.length );
			formattedTitle = beforeHighlight + mw.html.element( 'em', { class: 'suggestion-highlight' }, strong ) + aferHighlight;
		}

		return formattedTitle;
	} // END highlightTitle

	/**
	 * Get indiviual suggestion items
	 *
	 * @param {Array} suggestions - An array of search suggestion results.
	 * @return {Array} props - An array of formatted search suggestion results for Mustache
	 */
	function getSuggestionProps( suggestions ) {
		let props = [],
			i,
			page,
			suggestionLinkID,
			suggestionDescription,
			sanitizedThumbURL,
			pageDescription;

		for ( i = 0; i < suggestions.length; i++ ) {
			if ( !suggestions[ i ] ) {
				continue;
			}

			page = suggestions[ i ];

			// Ensure that the value from the previous iteration isn't used
			suggestionDescription = '';
			sanitizedThumbURL = false;
			pageDescription = '';

			// Add ID if first or last suggestion
			if ( i === 0 ) {
				suggestionLinkID = 'suggestion-link-first';
			} else if ( i === suggestions.length - 1 ) {
				suggestionLinkID = 'suggestion-link-last';
			} else {
				suggestionLinkID = '';
			}

			if ( useREST ) {
				suggestionDescription = page.description;

				if ( page.thumbnail && page.thumbnail.url ) {
					sanitizedThumbURL = page.thumbnail.url.replace( /"/g, '%22' );
				}
			} else {

				switch ( descriptionSource ) {
					case 'wikidata':
						pageDescription = page.description || '';
						break;
					case 'textextracts':
						pageDescription = page.extract || '';
						break;
					case 'pagedescription':
						pageDescription = page.pageprops.description.substring(0, 60) + '...' || '';
						break;
				}

				// Check if description exists
				if ( pageDescription ) {
					// If the description is an array, use the first item
					if ( typeof pageDescription === 'object' && pageDescription[ 0 ] ) {
						suggestionDescription = pageDescription[ 0 ].toString();
					} else {
						// Otherwise, use the description as is.
						suggestionDescription = pageDescription.toString();
					}

					// Filter out no text from TextExtracts
					if ( suggestionDescription === '...' ) {
						suggestionDescription = '';
					}
				}

				if ( page.thumbnail && page.thumbnail.source ) {
					sanitizedThumbURL = page.thumbnail.source.replace( /"/g, '%22' );
				}
			}

			if ( sanitizedThumbURL ) {
				sanitizedThumbURL = sanitizedThumbURL.replace( /'/g, '%27' );
			}

			props[ i ] = {
				'id': suggestionLinkID,
				'url': server + ( new mw.Title( page.title, page.ns ?? 0 ).getUrl() ),
				'thumb-url': sanitizedThumbURL,
				'title': highlightTitle( page.title, searchString ),
				'description': suggestionDescription
			};
		}

		return props;
	}

	/**
	 * Generates the HTML template based on an array of search suggestions.
	 * TODO: Maybe ES6 export is faster?
	 *
	 * @param {Array} suggestions - An array of search suggestion results.
	 * @return {String} HTML of the search suggestion results.
	 */
	function generateSuggestionsHTML( suggestions ) {
		let template,
			data,
			html;

		// Initalize Mustache template
		template = mw.template.get( 
			'skins.citizen.scripts.search', 
			'resources/skins.citizen.scripts.search/templates/suggestions.mustache'
		);

		data = {
			'html-fulltext-url': searchurl + searchString + '&fulltext=1',
			'msg-citizen-search-fulltext': mw.message( 'citizen-search-fulltext' ).text(),
			'html-searchstring': decodeURI( searchString ),
			'array-suggestion-links': []
		};

		if ( suggestions.length > 0 ) {
			data['array-suggestion-links'] = getSuggestionProps( suggestions );
		}

		html = template.render( data )[1].outerHTML;

		return html;
	} // END generateTemplate

	/**
	 * - Removes 'active' class from a collection of elements.
	 * - Adds 'active' class to an item if missing.
	 * - Removes 'active' class from item if present.
	 *
	 * @param {HTMLElement} item Item to add active class to.
	 * @param {NodeList} collection Sibling items.
	 */
	function toggleActiveClass( item, collection ) {
		let activeClass = ' active', // Prefixed with space.
			colItem,
			i;

		for ( i = 0; i < collection.length; i++ ) {
			colItem = collection[ i ];
			// Remove the class name from everything except item.
			if ( colItem !== item ) {
				colItem.className = colItem.className.replace( activeClass, '' );
			} else {
				// If item has class name, remove it
				if ( / active/.test( item.className ) ) {
					item.className = item.className.replace( activeClass, '' );
				} else {
					// It item doesn't have class name, add it.
					item.className += activeClass;
					ssActiveIndex.setIndex( i );
				}
			}
		}
	}

	/**
	 * Search API callback. Returns a closure that holds the index of the request.
	 * Deletes previous callbacks based on this index. This prevents callbacks for old
	 * requests from executing. Then:
	 *  - parses the search results
	 *  - generates the template String
	 *  - inserts the template string into the DOM
	 *  - attaches event listeners on each suggestion item.
	 *
	 * @param {number} i
	 * @return {Function}
	 */
	window.portalOpensearchCallback = function ( i ) {
		let callbackIndex = i,
			orderedResults = [],
			suggestions,
			item,
			result,
			listEl;

		return function ( xhrResults, queryString ) {
			// console.log(xhrResults);
			window.callbackStack.deletePrevCallbacks( callbackIndex );

			if ( document.activeElement !== searchEl ) {
				return;
			}

			if ( useREST ) {
				suggestions = xhrResults.pages;
			} else {
				suggestions = ( xhrResults.query && xhrResults.query.pages ) ?
					xhrResults.query.pages : [];
			}

			if ( suggestions.length === 0 ) {
				typeAheadEl.innerHTML = generateSuggestionsHTML( [] );
				return;
			}

			if ( useREST ) {
				// Already ordered
				orderedResults = suggestions;
			} else {
				for ( item in suggestions ) {
					if ( Object.prototype.hasOwnProperty.call( suggestions, item ) ) {
						result = suggestions[ item ];
						orderedResults[ result.index - 1 ] = result;
					}
				}
			}

			ssActiveIndex.setMax( orderedResults.length );
			ssActiveIndex.clear();

			typeAheadEl.innerHTML = generateSuggestionsHTML( orderedResults );

			typeAheadItems = typeAheadEl.childNodes[ 0 ].children;

			// Attaching hover events
			for ( i = 0; i < typeAheadItems.length; i++ ) {
				listEl = typeAheadItems[ i ];
				// Requires the addEvent global polyfill
				addEvent( listEl, 'mouseenter', toggleActiveClass.bind( this, listEl, typeAheadItems ) );
				addEvent( listEl, 'mouseleave', toggleActiveClass.bind( this, listEl, typeAheadItems ) );
			}
		};
	};

	/**
	 * Keyboard events: up arrow, down arrow and enter.
	 * moves the 'active' suggestion up and down.
	 *
	 * @param {event} event
	 */
	function keyboardEvents( event ) {
		let e = event || window.event,
			keycode = e.which || e.keyCode,
			suggestionItems,
			searchSuggestionIndex;

		if ( !typeAheadEl.firstChild ) {
			return;
		}

		if ( keycode === 40 || keycode === 38 ) {
			suggestionItems = typeAheadEl.firstChild.children;

			if ( keycode === 40 ) {
				searchSuggestionIndex = ssActiveIndex.increment( 1 );
			} else {
				searchSuggestionIndex = ssActiveIndex.increment( -1 );
			}

			activeItem = ( suggestionItems ) ? suggestionItems[ searchSuggestionIndex ] : false;

			toggleActiveClass( activeItem, suggestionItems );

		}
		if ( keycode === 13 && activeItem ) {

			if ( e.preventDefault ) {
				e.preventDefault();
			} else {
				( e.returnValue = false );
			}

			activeItem.children[ 0 ].click();
		}
	}

	addEvent( searchEl, 'keydown', keyboardEvents );

	addEvent( searchEl, 'blur', function ( e ) {
		clearTypeAhead();
		// Don't interfere with special clicks (e.g. to open in new tab)
		if ( !( e.which !== 1 || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey ) ) {
			forceLinkFollow( e );
		}
	} );

	return {
		typeAheadEl: typeAheadEl,
		query: loadQueryScript
	};
};
