// const config = require( './config.json' );
const htmlHelper = require( './htmlHelper.js' )();
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
		getPlaceholderHTML: function ( queryValue ) {
			const data = {
				icon: 'articleNotFound',
				type: 'placeholder',
				size: 'lg',
				title: mw.message( 'citizen-search-noresults-title', queryValue ).text(),
				desc: mw.message( 'citizen-search-noresults-desc' ).text()
			};
			return htmlHelper.getItemElement( data );
		},
		getResultsHTML: function ( results, queryValue ) {
			const createSuggestionItem = ( result ) => {
				const data = {
					type: 'page',
					size: 'md',
					link: result.url,
					title: this.highlightTitle( result.title, queryValue ),
					desc: result.description
				};
				data.label = this.getRedirectLabel( result.title, result.label );
				if ( result.thumbnail ) {
					data.thumbnail = result.thumbnail.url;
				} else {
					// Thumbnail placeholder icon
					data.icon = 'image';
				}
				return data;
			};

			const items = results.map( ( result ) => createSuggestionItem( result ) );
			const itemGroupData = {
				id: 'suggestion',
				items: items
			};
			return htmlHelper.getItemGroupElement( itemGroupData );
		},
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
