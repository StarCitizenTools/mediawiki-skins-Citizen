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
		labelDiv.textContent = label.textContent || '';
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

/** @module addDefaultPortlet */
module.exports = {
	addDefaultPortlet
};
