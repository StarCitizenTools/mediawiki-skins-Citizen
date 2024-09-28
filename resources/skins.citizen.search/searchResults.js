// const config = require( './config.json' );
const searchAction = require( './searchAction.js' )();

/**
 * Returns an object with methods for handling search results in a citizen search context.
 * It includes methods for getting redirect labels, highlighting titles, getting placeholder HTML,
 * getting results HTML, fetching search results, rendering search actions, and clearing search results.
 *
 * Methods:
 * - getRedirectLabel: Returns a redirect label for a matched title based on query value.
 * - highlightTitle: Highlights a title based on a matching query.
 * - getPlaceholderHTML: Returns HTML for a placeholder when no search results are found.
 * - getResultsHTML: Returns HTML for displaying search results.
 * - fetch: Fetches search results based on a query value using an active search client.
 * - render: Renders search actions on a typeahead element with a search query.
 * - clear: Clears search results from a typeahead element.
 *
 * @return {Object} An object with methods for handling search results.
 */
function searchResults() {
	const textCache = {};
	const redirectMessageCache = {};
	const regexCache = {};

	return {
		getRedirectLabel: function ( title, matchedTitle, queryValue ) {
			const normalizeText = ( text ) => {
				if ( !textCache[ text ] ) {
					textCache[ text ] = text.replace( /[-\s]/g, ( match ) => match.toLowerCase() ).toLowerCase();
				}
				return textCache[ text ];
			};

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
				div.title = getRedirectMessage();

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
		highlightTitle: function ( title, match ) {
			if ( !match ) {
				return title;
			}
			if ( !regexCache[ match ] ) {
				regexCache[ match ] = new RegExp( mw.util.escapeRegExp( match ), 'i' );
			}
			const regex = regexCache[ match ];
			return title.replace( regex, '<span class="citizen-typeahead__highlight">$&</span>' );
		},
		getPlaceholderHTML: function ( queryValue, templates ) {
			const data = {
				icon: 'articleNotFound',
				title: mw.message( 'citizen-search-noresults-title', queryValue ).text(),
				description: mw.message( 'citizen-search-noresults-desc' ).text()
			};
			return templates.TypeaheadPlaceholder.render( data ).html();
		},
		getResultsHTML: function ( results, queryValue, templates ) {
			const items = [];

			results.forEach( ( result, index ) => {
				const item = {
					id: index,
					href: result.url,
					title: this.highlightTitle( result.title, queryValue ),
					description: result.description,
					'html-end': this.getRedirectLabel( result.title, result.label ),
					image: {}
				};
				if ( result.thumbnail && result.thumbnail.url ) {
					item.image.url = result.thumbnail.url;
				} else {
					// Show placeholder icon
					item.image.class = 'citizen-typeahead-list-item-image--placeholder citizen-ui-icon mw-ui-icon-wikimedia-image';
				}
				items.push( item );
			} );

			const data = {
				type: 'page',
				'array-list-items': items
			};

			const partials = {
				TypeaheadListItem: templates.TypeaheadListItem
			};

			return templates.TypeaheadList.render( data, partials ).html();
		},
		fetch: function ( queryValue, activeSearchClient ) {
			return activeSearchClient.fetchByTitle( queryValue );
		},
		render: function ( searchQuery, templates ) {
			searchAction.render( searchQuery, templates );
		},
		clear: function () {
			// TODO: This should not be here
			document.getElementById( 'citizen-typeahead-list-page' ).innerHTML = '';
			document.getElementById( 'citizen-typeahead-group-page' ).hidden = true;
			searchAction.clear();
		},
		init: function () {
			searchAction.init();
		}
	};
}

/** @module searchResults */
module.exports = searchResults;
