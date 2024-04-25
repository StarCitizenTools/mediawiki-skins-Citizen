/**
 * TODO: Revisit when we move to MW 1.43 and the interface is more stable
 */

/**
 * Creates default portlet.
 * Based on Vector
 *
 * @param {Element} portlet
 * @return {Element}
 */
function addDefaultPortlet( portlet ) {
	const ul = portlet.querySelector( 'ul' );
	if ( !ul ) {
		return portlet;
	}
	ul.classList.add( 'citizen-menu__content-list' );
	const label = portlet.querySelector( 'label' );
	if ( label ) {
		const labelDiv = document.createElement( 'div' );
		labelDiv.classList.add( 'citizen-menu__heading' );
		labelDiv.innerHTML = label.textContent || '';
		portlet.insertBefore( labelDiv, label );
		label.remove();
	}
	let wrapper = portlet.querySelector( 'div:last-child' );
	if ( wrapper ) {
		ul.remove();
		wrapper.appendChild( ul );
		wrapper.classList.add( 'citizen-menu__content' );
	} else {
		wrapper = document.createElement( 'div' );
		wrapper.classList.add( 'citizen-menu__content' );
		ul.remove();
		wrapper.appendChild( ul );
		portlet.appendChild( wrapper );
	}
	portlet.classList.add( 'citizen-menu' );
	return portlet;
}

/**
 * Polyfill for mw.util.addPortlet for < MW 1.42
 *
 * @return {Element}
 */
function addPortlet() {
	if ( mw.util.addPortlet ) {
		return addDefaultPortlet( mw.util.addPortlet );
	}

	return function ( id, label, before ) {
		const portlet = document.createElement( 'div' );
		portlet.classList.add( 'mw-portlet', 'mw-portlet-' + id, 'emptyPortlet',
			// Additional class is added to allow skins to track portlets added via this mechanism.
			'mw-portlet-js'
		);
		portlet.id = id;
		if ( label ) {
			const labelNode = document.createElement( 'label' );
			labelNode.textContent = label;
			portlet.appendChild( labelNode );
		}
		const listWrapper = document.createElement( 'div' );
		const list = document.createElement( 'ul' );
		listWrapper.appendChild( list );
		portlet.appendChild( listWrapper );
		if ( before ) {
			let referenceNode;
			try {
				referenceNode = document.querySelector( before );
			} catch ( e ) {
				// CSS selector not supported by browser.
			}
			if ( referenceNode ) {
				const parentNode = referenceNode.parentNode;
				parentNode.insertBefore( portlet, referenceNode );
			} else {
				return null;
			}
		}
		mw.hook( 'util.addPortlet' ).fire( portlet, before );
		return addDefaultPortlet( portlet );
	};
}

/** @module addPortlet */
module.exports = addPortlet;
