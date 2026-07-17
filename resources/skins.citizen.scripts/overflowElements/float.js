/**
 * Resolves the effective float direction of an element before it is wrapped.
 *
 * Covers floats the inherited-class migration does not know about: inline
 * `style="float: right"` and wiki-defined classes (Common.css,
 * TemplateStyles). Logical values are resolved against the element's
 * computed direction so RTL wikis map correctly.
 *
 * @param {HTMLElement} element
 * @param {Window} window
 * @return {string|null} 'left', 'right', or null when not floated
 */
function detectFloatDirection( element, window ) {
	const style = window.getComputedStyle( element );
	const value = style.float;
	if ( value === 'left' || value === 'right' ) {
		return value;
	}
	if ( value === 'inline-start' ) {
		return style.direction === 'rtl' ? 'right' : 'left';
	}
	if ( value === 'inline-end' ) {
		return style.direction === 'rtl' ? 'left' : 'right';
	}
	return null;
}

module.exports = { detectFloatDirection };
