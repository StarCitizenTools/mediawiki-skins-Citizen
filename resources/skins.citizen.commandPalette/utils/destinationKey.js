const resolveSpecialPage = require( './resolveSpecialPage.js' );

/**
 * The page a link opens, as a normalised title, or null when the link opens
 * something other than a page view: a search, an edit, a diff.
 *
 * `Special:Search` without `fulltext` counts as the page its query names,
 * since that is where it goes when the page exists.
 *
 * @param {URL} link
 * @return {string|null}
 */
function pageOf( link ) {
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

	let title = mw.Title.newFromText( text );
	let special = title && resolveSpecialPage( title );
	if ( special && special.name === 'Search' ) {
		title = mw.Title.newFromText( params.get( 'search' ) || '' );
		params.delete( 'search' );
		special = title && resolveSpecialPage( title );
	}
	if ( !title || params.toString() ) {
		return null;
	}
	// Every name of a special page opens it under its local name.
	return ( special ? special.title : title ).getPrefixedText();
}

/**
 * What an item opens. One page reached from different modes, or through
 * different aliases of its namespace, or a special page by any of its names,
 * has one key; anything that is not a page is keyed by its link, and an item
 * without a link by its id.
 *
 * @param {{id: string|number, url?: string}} item
 * @return {string}
 */
function destinationKey( item ) {
	if ( !item.url ) {
		return `id:${ item.id }`;
	}
	let link;
	try {
		link = new URL( item.url, window.location.href );
	} catch ( e ) {
		return `url:${ item.url }`;
	}
	const page = link.origin === window.location.origin ? pageOf( link ) : null;
	return page === null ? `url:${ link.href }` : `page:${ page }`;
}

module.exports = destinationKey;
