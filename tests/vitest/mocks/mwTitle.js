// Enough of mw.Title for tests that compare normalised titles. Underscores
// read as spaces and the first letter is capitalised, as on a wiki with
// $wgCapitalLinks. The user namespace is called Benutzer, with User and the
// gendered Benutzerin as aliases. Braces and brackets make a title invalid.
const NAMESPACES = {
	user: [ 2, 'Benutzer' ],
	benutzer: [ 2, 'Benutzer' ],
	benutzerin: [ 2, 'Benutzer' ],
	special: [ -1, 'Special' ]
};

function newFromText( text ) {
	const normalized = text.replace( /_/g, ' ' ).trim();
	if ( !normalized || /[{}[\]]/.test( normalized ) ) {
		return null;
	}
	const colon = normalized.indexOf( ':' );
	const namespace = colon > 0 ?
		NAMESPACES[ normalized.slice( 0, colon ).toLowerCase() ] :
		undefined;
	const main = namespace ? normalized.slice( colon + 1 ) : normalized;
	const title = main.charAt( 0 ).toUpperCase() + main.slice( 1 );
	return {
		getNamespaceId: () => ( namespace ? namespace[ 0 ] : 0 ),
		getMain: () => title.replace( / /g, '_' ),
		getPrefixedText: () => ( namespace ? `${ namespace[ 1 ] }:${ title }` : title )
	};
}

module.exports = { newFromText };
