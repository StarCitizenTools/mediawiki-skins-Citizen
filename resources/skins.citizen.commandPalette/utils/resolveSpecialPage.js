const specialPages = require( '../specialPages.json' );

/** @type {Map<string, {name: string, localName: string}>|null} */
let pagesByName = null;

/**
 * A special page name as the wiki compares it: ignoring case, with spaces
 * read as underscores.
 *
 * @param {string} name
 * @return {string}
 */
function fold( name ) {
	return name.replace( / /g, '_' ).toUpperCase();
}

/**
 * @return {Map<string, {name: string, localName: string}>}
 */
function getPagesByName() {
	if ( pagesByName === null ) {
		pagesByName = new Map();
		for ( const entry of specialPages ) {
			const [ name, localName = name, ...aliases ] = typeof entry === 'string' ? [ entry ] : entry;
			const page = { name, localName };
			for ( const alias of [ name, localName, ...aliases ] ) {
				pagesByName.set( fold( alias ), page );
			}
		}
	}
	return pagesByName;
}

/**
 * The special page a title names, under whichever of the page's names, as the
 * wiki resolves it before redirecting to the page's local name.
 *
 * @param {mw.Title} title
 * @return {{name: string, title: mw.Title}|null} The page's canonical name,
 *  and the title, subpage kept, under the page's local name; null when the
 *  title names no registered special page.
 */
function resolveSpecialPage( title ) {
	if ( title.getNamespaceId() !== -1 ) {
		return null;
	}
	const main = title.getMain();
	const slash = main.indexOf( '/' );
	const page = getPagesByName().get( fold( slash === -1 ? main : main.slice( 0, slash ) ) );
	if ( !page ) {
		return null;
	}
	const localTitle = mw.Title.makeTitle(
		-1, slash === -1 ? page.localName : page.localName + main.slice( slash )
	);
	return localTitle && { name: page.name, title: localTitle };
}

module.exports = resolveSpecialPage;
