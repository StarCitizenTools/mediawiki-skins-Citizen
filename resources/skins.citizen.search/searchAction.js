const config = require( './config.json' );
const htmlHelper = require( './htmlHelper.js' )();

function searchAction() {
	return {
		userRights: undefined,
		getUserRights: async function () {
			// Get and cache user rights
			this.userRights = await mw.user.getRights();
			return this.userRights;
		},
		init: function ( typeaheadEl, itemGroupData ) {
			const actionData = {
				type: 'action',
				size: 'chip'
			};
			itemGroupData.items = itemGroupData.items.map( ( item ) => ( { ...item, ...actionData } ) );
			typeaheadEl.append( htmlHelper.getItemGroupElement( itemGroupData ) );
		},
		render: async function ( typeaheadEl, searchQuery ) {
			const itemGroupData = {
				id: 'action',
				items: []
			};

			// TODO: Save this in a separate JSON file
			// Fulltext search
			itemGroupData.items.push( {
				// id: 'fulltext',
				link: `${ config.wgScriptPath }/index.php?title=Special:Search&fulltext=1&search=${ searchQuery.valueHtml }`,
				icon: 'articleSearch',
				msg: 'citizen-search-fulltext'
			} );

			// MediaSearch
			if ( config.isMediaSearchExtensionEnabled ) {
				itemGroupData.items.push( {
					// id: 'mediasearch',
					link: `${ config.wgScriptPath }/index.php?title=Special:MediaSearch&type=image&search=${ searchQuery.valueHtml }`,
					icon: 'imageGallery',
					msg: 'citizen-search-mediasearch'
				} );
			}

			/*
			For some reason title.exists() always returns null
			const title = mw.Title.newFromUserInput( searchQuery.value );
			console.log( title.exists() );
			*/

			const userRights = this.userRights ?? await this.getUserRights();
			if ( userRights.includes( 'createpage', 'edit' ) ) {
				// Edit/create page
				// TODO: Check whether the page exists
				itemGroupData.items.push( {
					// id: 'editpage',
					link: `${ config.wgScriptPath }/index.php?title=${ searchQuery.valueHtml }&action=edit`,
					icon: 'edit',
					msg: 'citizen-search-editpage'
				} );
			}

			if ( !typeaheadEl.querySelector( '.citizen-typeahead-item-group[data-group="action"]' ) ) {
				this.init( typeaheadEl, itemGroupData );
			}

			itemGroupData.items.forEach( ( item, index ) => {
				const actionEl = document.getElementById( `citizen-typeahead-action-${ index }` );
				htmlHelper.updateItemElement( actionEl, {
					link: item.link,
					/* eslint-disable-next-line mediawiki/msg-doc */
					label: mw.message( item.msg )
				} );
			} );
		},
		clear: function ( typeaheadEl ) {
			htmlHelper.removeItemGroup( typeaheadEl, 'action' );
		}
	};
}

/** @module searchAction */
module.exports = searchAction;
