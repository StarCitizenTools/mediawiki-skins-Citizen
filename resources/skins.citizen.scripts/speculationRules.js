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
	const articlePath = mw.config.get( 'wgArticlePath' );
	const article = articlePath.replace( /\$(1)/, '*' );
	if ( !article ) {
		return;
	}

	const specRules = {
		prerender: [ {
			where: {
				href_matches: article
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
