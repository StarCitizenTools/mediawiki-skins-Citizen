const config = require( './config.json' );
const htmlHelper = require( './htmlHelper.js' )();

function searchAction() {
	return {
		init: function ( typeaheadEl, itemGroupData ) {
			const actionData = {
				type: 'action',
				size: 'sm'
			};
			itemGroupData.items = itemGroupData.items.map( ( item ) => ( { ...item, ...actionData } ) );
			typeaheadEl.append( htmlHelper.getItemGroupElement( itemGroupData ) );
		},
		render: function ( typeaheadEl, searchQuery ) {
			const itemGroupData = {
				id: 'action',
				items: []
			};

			// TODO: Save this in a separate JSON file
			// Fulltext search
			itemGroupData.items.push( {
				// id: 'fulltext',
				link: `${config.wgScriptPath}/index.php?title=Special:Search&fulltext=1&search=${searchQuery.valueHtml}`,
				icon: 'articleSearch',
				msg: 'citizen-search-fulltext'
			} );

			// Edit/create page
			// TODO: Check if user has right, and whether the page exists
			itemGroupData.items.push( {
				// id: 'editpage',
				link: `${config.wgScriptPath}/index.php?title=${searchQuery.valueHtml}&action=edit`,
				icon: 'edit',
				msg: 'citizen-search-editpage'
			} );

			// MediaSearch
			if ( config.isMediaSearchExtensionEnabled ) {
				itemGroupData.items.push( {
					// id: 'mediasearch',
					link: `${config.wgScriptPath}/index.php?title=Special:MediaSearch&type=image&search=${searchQuery.valueHtml}`,
					icon: 'imageGallery',
					msg: 'citizen-search-mediasearch'
				} );
			}

			if ( !typeaheadEl.querySelector( '.citizen-typeahead-item-group[data-group="action"]' ) ) {
				this.init( typeaheadEl, itemGroupData );
			}

			itemGroupData.items.forEach( ( item, index ) => {
				const actionEl = document.getElementById( `citizen-typeahead-action-${index}` );
				htmlHelper.updateItemElement( actionEl, {
					link: item.link,
					title: searchQuery.value,
					/* eslint-disable-next-line mediawiki/msg-doc */
					label: mw.message( item.msg )
				} );
			} );
		}
	};
}

/** @module searchAction */
module.exports = searchAction;
