const config = require( './config.json' );
const typeaheadItem = require( './typeaheadItem.js' )();
const searchHistory = require( './searchHistory.js' )( config );

function presult() {
	return {
		elements: undefined,
		addSearchHistory: function ( fragment ) {
			const historyData = searchHistory.get();
			if ( historyData?.length > 0 ) {
				historyData.forEach( ( result, index ) => {
					const data = {
						icon: 'history',
						id: `citizen-typeahead-history-${index}`,
						// TODO: Add option to prepend the result to input field
						link: `${config.wgScriptPath}/index.php?title=Special:Search&search=${result}`,
						type: 'history',
						size: 'sm',
						desc: result
					};
					fragment.append( typeaheadItem.get( data ) );
				} );
			}
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
				fragment.append( typeaheadItem.get( data ) );
			}

			typeaheadEl.prepend( fragment );
			this.set( typeaheadEl );
		},
		set: function ( typeaheadEl ) {
			this.elements = typeaheadEl.querySelectorAll( '.citizen-typeahead__item-history' );
		}
	};
}

/** @module presult */
module.exports = presult;
