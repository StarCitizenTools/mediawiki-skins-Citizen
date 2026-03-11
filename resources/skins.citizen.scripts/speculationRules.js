/* eslint-disable camelcase */

/**
 * Builds the speculation rules object for prerendering wiki pages.
 *
 * @param {string} articlePath - The wiki article path prefix (e.g. '/wiki/').
 * @param {string} specialNamespace - The localized Special namespace name.
 * @return {Object} The speculation rules configuration.
 */
function buildSpecRules( articlePath, specialNamespace ) {
	return {
		prerender: [ {
			where: {
				and: [
					{ href_matches: `${ articlePath }*` },
					{ not: { href_matches: { pathname: `${ articlePath }${ specialNamespace }\\:*` } } },
					{ not: { href_matches: '/.*.php' } },
					{ not: { href_matches: '/*\\?*(^|&)*=*' } },
					{ not: { selector_matches: '[rel~=nofollow]' } }
				]
			},
			eagerness: 'moderate'
		} ]
	};
}

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Object} deps.mw
 * @param {Object} deps.HTMLScriptElement
 * @return {Object}
 */
function createSpeculationRules( { document, mw, HTMLScriptElement } ) {
	function init() {
		if (
			!HTMLScriptElement.supports ||
			!HTMLScriptElement.supports( 'speculationrules' )
		) {
			return;
		}

		const articlePath = mw.config.get( 'wgArticlePath' ).replace( /\$(1)/, '' );
		const namespaces = mw.config.get( 'wgFormattedNamespaces' );
		if ( !articlePath || !namespaces ) {
			return;
		}

		const specRules = buildSpecRules( articlePath, namespaces[ -1 ] );
		const specScript = document.createElement( 'script' );
		specScript.type = 'speculationrules';
		specScript.textContent = JSON.stringify( specRules );
		document.body.append( specScript );
	}

	return { init };
}

module.exports = { createSpeculationRules, buildSpecRules };
