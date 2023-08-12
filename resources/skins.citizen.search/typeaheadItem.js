/**
 * @typedef {Object} TypeaheadItemData
 * @property {string} id
 * @property {string} type
 * @property {string} link
 * @property {string} icon
 * @property {string} thumbnail
 * @property {string} title
 * @property {string} label
 * @property {string} desc
 */

function typeaheadItem() {
	return {
		/**
		 * Generate menu item HTML using the existing template
		 *
		 * @param {TypeaheadItemData} data
		 * @return {HTMLElement|void}
		 */
		get: function ( data ) {
			// TODO: Should we use template element or Mustache or just Javascript?
			const template = document.getElementById( 'citizen-typeahead-template' );

			// Shouldn't happen but just to be safe
			if ( !( template instanceof HTMLTemplateElement ) ) {
				return;
			}

			const
				fragment = template.content.cloneNode( true ),
				item = fragment.querySelector( '.citizen-typeahead__item' );

			this.update( item, data );
			return fragment;
		},
		/**
		 * Update typeahead item element
		 *
		 * @param {HTMLElement} item
		 * @param {TypeaheadItemData} data
		 */
		update: function ( item, data ) {
			if ( data.id ) {
				item.setAttribute( 'id', data.id );
			}
			if ( data.type ) {
				item.classList.add( `citizen-typeahead__item-${data.type}` );
			}
			if ( data.size ) {
				item.classList.add( `citizen-typeahead__item-${data.size}` );
			}
			if ( data.link ) {
				const link = item.querySelector( '.citizen-typeahead__content' );
				link.setAttribute( 'href', data.link );
			}
			if ( data.icon || data.thumbnail ) {
				const thumbnail = item.querySelector( '.citizen-typeahead__thumbnail' );
				if ( data.thumbnail ) {
					thumbnail.style.backgroundImage = `url('${data.thumbnail}')`;
				} else {
					thumbnail.classList.add(
						'citizen-typeahead__thumbnail',
						'citizen-ui-icon',
						`mw-ui-icon-wikimedia-${data.icon}`
					);
				}
			}
			if ( data.title ) {
				const title = item.querySelector( '.citizen-typeahead__title' );
				title.innerHTML = data.title;
			}
			if ( data.label ) {
				const label = item.querySelector( '.citizen-typeahead__label' );
				label.innerHTML = data.label;
			}
			if ( data.desc ) {
				const desc = item.querySelector( '.citizen-typeahead__description' );
				desc.innerHTML = data.desc;
			}
		}
	};
}

/** @module typeaheadItem */
module.exports = typeaheadItem;
