// const config = require( './config.json' );
// const htmlHelper = require( './htmlHelper.js' )();
const searchAction = require( './searchAction.js' )();

/**
 * Returns an object with methods related to search results handling.
 *
 * @return {Object} An object with the following methods:
 *   - getRedirectLabel: A function that generates HTML for a search result label with redirection information.
 *   - highlightTitle: A function that highlights a matched title within a given text.
 *   - fetch: A function that fetches search results based on a query value using an active search client.
 *   - render: A function that renders search results in a specified typeahead element.
 *   - clear: A function that clears search results from a typeahead element.
 */
function searchResults() {
	return {
		getRedirectLabel: function ( title, matchedTitle, queryValue ) {
			const normalizeText = ( text ) => {
				return text.replace( /[-\s]/g, ( match ) => match.toLowerCase() ).toLowerCase();
			};

			const redirectMessageCache = {};
			const getRedirectMessage = () => {
				if ( !redirectMessageCache[ matchedTitle ] ) {
					redirectMessageCache[ matchedTitle ] = mw.message( 'search-redirect', matchedTitle ).plain();
				}
				return redirectMessageCache[ matchedTitle ];
			};

			const isRedirectUseful = () => {
				const cleanTitle = normalizeText( title );
				const cleanMatchedTitle = normalizeText( matchedTitle );

				return !(
					cleanTitle.includes( cleanMatchedTitle ) ||
					cleanMatchedTitle.includes( cleanTitle )
				);
			};

			const generateRedirectHtml = () => {
				const div = document.createElement( 'div' );
				div.classList.add( 'citizen-typeahead__labelItem' );
				div.title = getRedirectMessage( matchedTitle );

				const spanIcon = document.createElement( 'span' );
				spanIcon.classList.add( 'citizen-ui-icon', 'mw-ui-icon-wikimedia-articleRedirect' );
				div.appendChild( spanIcon );

				const spanText = document.createElement( 'span' );
				spanText.textContent = this.highlightTitle( matchedTitle, queryValue );
				div.appendChild( spanText );

				return div.outerHTML;
			};

			let html = '';
			if ( matchedTitle && isRedirectUseful() ) {
				html = generateRedirectHtml();
			}

			return html;
		},
		highlightTitle: ( function () {
			const regexCache = {};
			return function ( title, match ) {
				if ( !match ) {
					return title;
				}
				if ( !regexCache[ match ] ) {
					regexCache[ match ] = new RegExp( mw.util.escapeRegExp( match ), 'i' );
				}
				const regex = regexCache[ match ];
				return title.replace( regex, '<span class="citizen-typeahead__highlight">$&</span>' );
			};
		}() ),
		fetch: function ( queryValue, activeSearchClient ) {
			return activeSearchClient.fetchByTitle( queryValue );
		},
		render: function ( typeaheadEl, searchQuery ) {
			searchAction.render( typeaheadEl, searchQuery );
		},
		clear: function ( typeaheadEl ) {
			searchAction.clear( typeaheadEl );
		}
	};
}

/** @module searchResults */
module.exports = searchResults;
