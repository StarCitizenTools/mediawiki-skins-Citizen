const config = require( './config.json' );
const urlGenerator = require( './urlGenerator.js' );

const fulltextParam = {
	fulltext: '1'
};
const mediasearchParam = {
	type: 'image'
};
const editpageParam = {
	action: 'edit'
};

function searchAction() {
	return {
		urlGeneratorInstance: urlGenerator( config ),
		// Assume user can't edit by default
		userCanEdit: false,
		userRights: undefined,
		render: function ( searchQuery, templates ) {
			const items = [];

			// TODO: Save this in a separate JSON file
			// Fulltext search
			fulltextParam.search = searchQuery.value;
			items.push( {
				id: 'fulltext',
				href: this.urlGeneratorInstance.generateUrl( 'Special:Search', fulltextParam ),
				icon: 'articleSearch',
				text: mw.message( config.isAdvancedSearchExtensionEnabled ?
					'citizen-search-advancedsearch' :
					'citizen-search-fulltext'
				)
			} );

			// MediaSearch
			if ( config.isMediaSearchExtensionEnabled ) {
				mediasearchParam.search = searchQuery.value;
				items.push( {
					id: 'mediasearch',
					href: this.urlGeneratorInstance.generateUrl( 'Special:MediaSearch', mediasearchParam ),
					icon: 'imageGallery',
					text: mw.message( 'citizen-search-mediasearch' )
				} );
			}

			/*
			For some reason title.exists() always returns null
			const title = mw.Title.newFromUserInput( searchQuery.value );
			console.log( title.exists() );
			*/

			if ( this.userCanEdit ) {
				// Edit/create page
				// TODO: Check whether the page exists
				items.push( {
					id: 'editpage',
					href: this.urlGeneratorInstance.generateUrl( searchQuery.value, editpageParam ),
					icon: 'edit',
					text: mw.message( 'citizen-search-editpage' )
				} );
			}

			const data = {
				type: 'action',
				'array-list-items': items
			};

			const partials = {
				TypeaheadListItem: templates.TypeaheadListItem
			};

			document.getElementById( 'citizen-typeahead-list-action' ).outerHTML = templates.TypeaheadList.render( data, partials ).html();
			document.getElementById( 'citizen-typeahead-group-action' ).hidden = false;
		},
		clear: function () {
			document.getElementById( 'citizen-typeahead-list-action' ).innerHTML = '';
			document.getElementById( 'citizen-typeahead-group-action' ).hidden = true;
		},
		init: function () {
			mw.user.getRights().done( ( rights ) => {
				this.userCanEdit = rights.includes( 'createpage', 'edit' );
			} );
		}
	};
}

/** @module searchAction */
module.exports = searchAction;
