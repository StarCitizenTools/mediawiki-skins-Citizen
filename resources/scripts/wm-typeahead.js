/**
 * Based on https://gerrit.wikimedia.org/g/wikimedia/portals/+/refs/heads/master
 * See T219590 for more details
 */

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

/* global addEvent, getDevicePixelRatio */

window.WMTypeAhead = function(appendTo, searchInput) { // eslint-disable-line no-unused-vars

    var typeAheadID = 'typeahead-suggestions',
        typeAheadEl = document.getElementById(typeAheadID), // Type-ahead DOM element.
        appendEl = document.getElementById(appendTo),
        searchEl = document.getElementById(searchInput),
        thumbnailSize = getDevicePixelRatio() * 80,
        maxSearchResults = 6,
        searchLang,
        searchString,
        typeAheadItems,
        activeItem,
        ssActiveIndex;

    // Only create typeAheadEl once on page.
    if (!typeAheadEl) {
        typeAheadEl = document.createElement('div');
        typeAheadEl.id = typeAheadID;
        appendEl.appendChild(typeAheadEl);
    }

    /**
     * Serializes a JS object into a URL parameter string.
     *
     * @param {Object} obj - object whose properties will be serialized
     * @return {string}
     */
    function serialize(obj) {
        var serialized = [],
            prop;

        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) { // eslint-disable-line no-prototype-builtins
                serialized.push(prop + '=' + encodeURIComponent(obj[prop]));
            }
        }
        return serialized.join('&');
    }

    /**
     * Keeps track of the search query callbacks. Consists of an array of
     * callback functions and an index that keeps track of the order of requests.
     * Callbacks are deleted by replacing the callback function with a no-op.
     */
    window.callbackStack = {
        queue: {},
        index: -1,
        incrementIndex: function() {
            this.index += 1;
            return this.index;
        },
        addCallback: function(func) {
            var index = this.incrementIndex();
            this.queue[index] = func(index);
            return index;
        },
        deleteSelfFromQueue: function(i) {
            delete this.queue[i];
        },
        deletePrevCallbacks: function(j) {
            var callback;

            this.deleteSelfFromQueue(j);

            for (callback in this.queue) {
                if (callback < j) {
                    this.queue[callback] = this.deleteSelfFromQueue.bind(
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
        setMax: function(x) {
            this.max = x;
        },
        increment: function(i) {
            this.index += i;
            if (this.index < 0) {
                this.setIndex(this.max - 1);
            } // Index reaches top
            if (this.index === this.max) {
                this.setIndex(0);
            } // Index reaches bottom
            return this.index;
        },
        setIndex: function(i) {
            if (i <= this.max - 1) {
                this.index = i;
            }
            return this.index;
        },
        clear: function() {
            this.setIndex(-1);
        }
    };

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
        setTimeout(function() {
            var searchScript = document.getElementById('api_opensearch');
            typeAheadEl.innerHTML = '';
            if (searchScript) {
                searchScript.src = false;
            }
            ssActiveIndex.clear();
        }, 300);
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
    function forceLinkFollow(e) {
        var el = e.relatedTarget;
        if (el && /suggestion-link/.test(el.className)) {
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

    function loadQueryScript(string, lang) {
        var script = document.getElementById('api_opensearch'),
            docHead = document.getElementsByTagName('head')[0],
            hostname,
            callbackIndex,
            searchQuery;

        // Variables declared in parent function.
        searchLang = encodeURIComponent(lang) || 'en';
        searchString = encodeURIComponent(string);
        if (searchString.length === 0) {
            clearTypeAhead();
            return;
        }

        // Change sitename here
        // TODO: Make it configurable from the skin
        hostname = mw.config.get('wgServer') + mw.config.get('wgScriptPath')+ '/api.php?';

        // If script already exists, remove it.
        if (script) {
            docHead.removeChild(script);
        }

        script = document.createElement('script');
        script.id = 'api_opensearch';


        callbackIndex = window.callbackStack.addCallback(window.portalOpensearchCallback);

        // Removed description prop
        // TODO: Use text extract or PCS for description
        searchQuery = {
            action: 'query',
            format: 'json',
            generator: 'prefixsearch',
            prop: 'pageprops|pageimages|extracts',
            exlimit: '6',
            exintro: 1,
            exchars: mw.config.get( 'wgCitizenExchars' ),
            explaintext: 1,
            redirects: '',
            ppprop: 'displaytitle',
            piprop: 'thumbnail',
            pithumbsize: thumbnailSize,
            pilimit: maxSearchResults,
            gpssearch: string,
            gpsnamespace: 0,
            gpslimit: maxSearchResults,
            callback: 'callbackStack.queue[' + callbackIndex + ']'
        };

        script.src = hostname + serialize(searchQuery);
        docHead.appendChild(script);
    }

    // END loadQueryScript

    /**
     * Highlights the part of the suggestion title that matches the search query.
     * Used inside the generateTemplateString function.
     *
     * @param {string} title - The title of the search suggestion.
     * @param {string} searchString - The string to highlight.
     * @return {string} The title with highlighted part in an <em> tag.
     */
    function highlightTitle(title, searchString) {

        var sanitizedSearchString = mw.html.escape(mw.RegExp.escape(searchString)),
            searchRegex = new RegExp(sanitizedSearchString, 'i'),
            startHighlightIndex = title.search(searchRegex),
            formattedTitle = mw.html.escape(title),
            endHighlightIndex,
            strong,
            beforeHighlight,
            aferHighlight;

        if (startHighlightIndex >= 0) {

            endHighlightIndex = startHighlightIndex + sanitizedSearchString.length;
            strong = title.substring(startHighlightIndex, endHighlightIndex);
            beforeHighlight = title.substring(0, startHighlightIndex);
            aferHighlight = title.substring(endHighlightIndex, title.length);
            formattedTitle = beforeHighlight + mw.html.element('em', { 'class': 'suggestion-highlight' }, strong) + aferHighlight;
        }

        return formattedTitle;
    } // END highlightTitle

    /**
     * Generates a template string based on an array of search suggestions.
     *
     * @param {Array} suggestions - An array of search suggestion results.
     * @return {string} A string representing the search suggestions DOM
     */
    function generateTemplateString(suggestions) {
        var string = '<div class="suggestions-dropdown">',
            suggestionLink,
            suggestionThumbnail,
            suggestionText,
            suggestionTitle,
            suggestionDescription,
            page,
            sanitizedThumbURL = false,
            descriptionText = '',
            pageDescription = '',
            i;

        for (i = 0; i < suggestions.length; i++) {

            if (!suggestions[i]) {
                continue;
            }

            page = suggestions[i];
            // Changed to TextExtracts
            pageDescription = page.extract || '';

            // Ensure that the value from the previous iteration isn't used
            sanitizedThumbURL = false;

            if (page.thumbnail && page.thumbnail.source) {
                sanitizedThumbURL = page.thumbnail.source.replace(/"/g, '%22');
                sanitizedThumbURL = sanitizedThumbURL.replace(/'/g, '%27');
            }

            // Ensure that the value from the previous iteration isn't used
            descriptionText = '';

            // Check if description exists
            if (pageDescription) {
                // If the description is an array, use the first item
                if (typeof pageDescription === 'object' && pageDescription[0]) {
                    descriptionText = pageDescription[0].toString();
                } else {
                    // Otherwise, use the description as is.
                    descriptionText = pageDescription.toString();
                }
            }

            // Filter out no text from TextExtracts
            if (descriptionText == '...') {
                descriptionText = '';
            }

            suggestionDescription = mw.html.element('p', { 'class': 'suggestion-description' }, descriptionText);

            suggestionTitle = mw.html.element('h3', { 'class': 'suggestion-title' }, new mw.html.Raw(highlightTitle(page.title, searchString)));

            suggestionText = mw.html.element('div', { 'class': 'suggestion-text' }, new mw.html.Raw(suggestionTitle + suggestionDescription));

            suggestionThumbnail = mw.html.element('div', {
                'class': 'suggestion-thumbnail',
                style: (sanitizedThumbURL) ? 'background-image:url(' + sanitizedThumbURL + ')' : false
            }, '');

            // TODO: Make it configurable from the skin
            suggestionLink = mw.html.element('a', {
                'class': 'suggestion-link',
                href: mw.config.get('wgServer') + '/' + encodeURIComponent(page.title.replace(/ /gi, '_'))
            }, new mw.html.Raw(suggestionText + suggestionThumbnail));

            string += suggestionLink;

        }

        string += '</div>';

        return string;
    } // END generateTemplateString

    /**
     * - Removes 'active' class from a collection of elements.
     * - Adds 'active' class to an item if missing.
     * - Removes 'active' class from item if present.
     *
     * @param {HTMLElement} item Item to add active class to.
     * @param {NodeList} collection Sibling items.
     */

    function toggleActiveClass(item, collection) {

        var activeClass = ' active', // Prefixed with space.
            colItem,
            i;

        for (i = 0; i < collection.length; i++) {

            colItem = collection[i];
            // Remove the class name from everything except item.
            if (colItem !== item) {
                colItem.className = colItem.className.replace(activeClass, '');
            } else {
                // If item has class name, remove it
                if (/ active/.test(item.className)) {
                    item.className = item.className.replace(activeClass, '');
                } else {
                    // It item doesn't have class name, add it.
                    item.className += activeClass;
                    ssActiveIndex.setIndex(i);
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
    window.portalOpensearchCallback = function(i) {

        var callbackIndex = i,
            orderedResults = [],
            suggestions,
            item,
            result,
            templateDOMString,
            listEl;

        return function(xhrResults) {

            window.callbackStack.deletePrevCallbacks(callbackIndex);

            if (document.activeElement !== searchEl) {
                return;
            }

            suggestions = (xhrResults.query && xhrResults.query.pages) ?
                xhrResults.query.pages : [];

            for (item in suggestions) {
                result = suggestions[item];
                orderedResults[result.index - 1] = result;
            }

            templateDOMString = generateTemplateString(orderedResults);

            ssActiveIndex.setMax(orderedResults.length);
            ssActiveIndex.clear();

            typeAheadEl.innerHTML = templateDOMString;

            typeAheadItems = typeAheadEl.childNodes[0].childNodes;

            // Attaching hover events
            for (i = 0; i < typeAheadItems.length; i++) {
                listEl = typeAheadItems[i];
                // Requires the addEvent global polyfill
                addEvent(listEl, 'mouseenter', toggleActiveClass.bind(this, listEl, typeAheadItems));
                addEvent(listEl, 'mouseleave', toggleActiveClass.bind(this, listEl, typeAheadItems));
            }
        };
    };

    /**
     * Keyboard events: up arrow, down arrow and enter.
     * moves the 'active' suggestion up and down.
     *
     * @param {event} event
     */
    function keyboardEvents(event) {

        var e = event || window.event,
            keycode = e.which || e.keyCode,
            suggestionItems,
            searchSuggestionIndex;

        if (!typeAheadEl.firstChild) {
            return;
        }

        if (keycode === 40 || keycode === 38) {
            suggestionItems = typeAheadEl.firstChild.childNodes;

            if (keycode === 40) {
                searchSuggestionIndex = ssActiveIndex.increment(1);
            } else {
                searchSuggestionIndex = ssActiveIndex.increment(-1);
            }

            activeItem = (suggestionItems) ? suggestionItems[searchSuggestionIndex] : false;

            toggleActiveClass(activeItem, suggestionItems);

        }
        if (keycode === 13 && activeItem) {

            if (e.preventDefault) {
                e.preventDefault();
            } else {
                (e.returnValue = false);
            }

            activeItem.children[0].click();
        }
    }

    addEvent(searchEl, 'keydown', keyboardEvents);

    addEvent(searchEl, 'blur', function(e) {
        clearTypeAhead();
        forceLinkFollow(e);
    });

    return {
        typeAheadEl: typeAheadEl,
        query: loadQueryScript
    };
};

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
 * @returns {number} Device pixel ratio
 */
function getDevicePixelRatio () {

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
		attachedEvents.push( [ obj, evt, fn ] );
		obj.attachEvent( 'on' + evt, fn );
	}
}