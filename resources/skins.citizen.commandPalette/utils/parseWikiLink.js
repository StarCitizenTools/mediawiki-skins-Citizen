/**
 * The title of this wiki a link addresses, and the query parameters beside
 * it. A link reaches a title through the article path or through
 * `index.php?title=`; any other link, or one to another site, addresses none.
 *
 * @param {URL} link
 * @return {{title: mw.Title, params: URLSearchParams}|null}
 */
function parseWikiLink( link ) {
	if ( link.origin !== window.location.origin ) {
		return null;
	}
	const params = new URLSearchParams( link.search );
	let text = params.get( 'title' );
	params.delete( 'title' );
	if ( text !== null ) {
		if ( link.pathname !== mw.config.get( 'wgScript' ) ) {
			return null;
		}
	} else {
		const [ before, after = '' ] = String( mw.config.get( 'wgArticlePath' ) ).split( '$1' );
		const path = link.pathname;
		if ( !path.startsWith( before ) || !path.endsWith( after ) ) {
			return null;
		}
		try {
			text = decodeURIComponent( path.slice( before.length, path.length - after.length ) );
		} catch ( e ) {
			return null;
		}
	}
	const title = mw.Title.newFromText( text );
	return title ? { title, params } : null;
}

module.exports = parseWikiLink;
