/* eslint-disable camelcase */
/**
 * Initializes the Speculation Rules API for Citizen
 *
 * @return {void}
 */
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

	const specRules = {
		prerender: [ {
			where: {
				and: [
					{ href_matches: `${ articlePath }*` }, // Under article path
					{ href_matches: `${ articlePath }${ namespaces[ -1 ] }` }, // No special namespace
					{ not: { href_matches: '/.*.php' } }, // Not PHP file
					{ not: { href_matches: '/*\\?*(^|&)*=*' } }, // No query strings
					{ not: { selector_matches: '[rel~=nofollow]' } } // No nofollow link
				]
			},
			eagerness: 'moderate'
		} ]
	};

	const specScript = document.createElement( 'script' );
	specScript.type = 'speculationrules';
	specScript.textContent = JSON.stringify( specRules );
	document.body.append( specScript );
}

module.exports = {
	init: init
};
