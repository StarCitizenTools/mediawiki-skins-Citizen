const config = require( './config.json' );
const htmlHelper = require( './htmlHelper.js' )();
const searchHistory = require( './searchHistory.js' )( config );

function searchPresults() {
	return {
		renderHistory: function ( results, templates ) {
			const items = [];
			results.forEach( ( result, index ) => {
				items.push( {
					id: index,
					href: `${ config.wgScriptPath }/index.php?title=Special:Search&search=${ result }`,
					text: result,
					icon: 'history'
				} );
			} );

			const data = {
				type: 'history',
				'array-list-items': items
			};

			const partials = {
				TypeaheadListItem: templates.TypeaheadListItem
			};

			document.getElementById( 'citizen-typeahead-list-history' ).outerHTML = templates.TypeaheadList.render( data, partials ).html();
			document.getElementById( 'citizen-typeahead-group-history' ).hidden = false;
		},
		render: function ( typeaheadEl, templates ) {
			typeaheadEl.querySelector( '.citizen-typeahead__item-placeholder' )?.remove();
			const historyResults = searchHistory.get();
			if ( historyResults && historyResults.length > 0 ) {
				this.renderHistory( historyResults, templates );
			} else {
				const data = {
					icon: 'articlesSearch',
					type: 'placeholder',
					size: 'lg',
					title: mw.message( 'searchsuggest-search' ).text(),
					desc: mw.message( 'citizen-search-empty-desc' ).text()
				};
				typeaheadEl.append( htmlHelper.getItemElement( data ) );
			}
		},
		clear: function () {
			document.getElementById( 'citizen-typeahead-list-history' ).innerHTML = '';
			document.getElementById( 'citizen-typeahead-group-history' ).hidden = true;
		}
	};
}

/** @module searchPresults */
module.exports = searchPresults;
