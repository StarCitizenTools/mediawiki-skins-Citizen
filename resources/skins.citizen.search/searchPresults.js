const config = require( './config.json' );
const htmlHelper = require( './htmlHelper.js' )();
const searchHistory = require( './searchHistory.js' )( config );

function searchPresults() {
	return {
		elements: undefined,
		addSearchHistory: function ( fragment ) {
			const historyData = searchHistory.get();
			if ( !historyData?.length > 0 ) {
				return fragment;
			}

			const itemGroupData = {
				id: 'history',
				items: []
			};

			historyData.forEach( ( result ) => {
				const data = {
					icon: 'history',
					// TODO: Add option to prepend the result to input field
					link: `${ config.wgScriptPath }/index.php?title=Special:Search&search=${ result }`,
					type: 'history',
					size: 'sm',
					title: result
				};
				itemGroupData.items.push( data );
			} );

			fragment.append( htmlHelper.getItemGroupElement( itemGroupData ) );
			return fragment;
		},
		render: function ( typeaheadEl ) {
			const fragment = document.createDocumentFragment();
			this.addSearchHistory( fragment );

			if ( fragment.childNodes.length === 0 ) {
				const data = {
					icon: 'articlesSearch',
					type: 'placeholder',
					size: 'lg',
					title: mw.message( 'searchsuggest-search' ).text(),
					desc: mw.message( 'citizen-search-empty-desc' ).text()
				};
				fragment.append( htmlHelper.getItemElement( data ) );
			}

			typeaheadEl.querySelector( '.citizen-typeahead__item-placeholder' )?.remove();
			typeaheadEl.append( fragment );
			this.set( typeaheadEl );
		},
		set: function ( typeaheadEl ) {
			// FIXME: Clean this up when we add top pages
			this.elements = typeaheadEl.querySelectorAll( '.citizen-typeahead-item-group[data-mw-citizen-typeahead-group="history"]' );
		},
		clear: function ( typeaheadEl ) {
			htmlHelper.removeItemGroup( typeaheadEl, 'history' );
			this.elements = undefined;
		}
	};
}

/** @module searchPresults */
module.exports = searchPresults;
