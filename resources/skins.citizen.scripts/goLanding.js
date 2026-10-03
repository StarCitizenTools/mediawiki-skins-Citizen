// The keys of the go protocol. The command palette's Recent
// (skins.citizen.commandPalette/services/recentItems.js) requires them from
// here: it leaves the note when it saves a go and applies the landing on its
// next read. Both modules list this file in their packageFiles, so it must
// stay free of requires and of side effects at load.
//
// The note is kept in session storage, so only the tab that made the go
// reads it. The landing is kept in local storage, so the palette in any tab
// applies it.
const GO_NOTE_KEY = 'skin-citizen-command-palette-go-note';
const GO_LANDING_KEY = 'skin-citizen-command-palette-go-landing';

/**
 * Records where a go from the command palette landed, so Recent can show
 * that place instead of the typed query. Special:Search answers a go with
 * a redirect when the query names a page and with its results otherwise,
 * so only the page that loads next can tell which happened.
 *
 * @param {Object} deps
 * @param {Object} deps.mw
 * @param {Performance} deps.performance
 * @param {number} [deps.pageStart] When this page's scripts started, as
 *   `Date.now()` gave it, the clock a note's `savedAt` comes from.
 */
function recordGoLanding( { mw, performance, pageStart } ) {
	const note = mw.storage.session.getObject( GO_NOTE_KEY );
	if ( !note ) {
		return;
	}
	// This check runs once the page is idle, so a note saved after the page's
	// scripts started is for a go made from this page, and is left for the
	// page that go opens. `Date.now()` is coarse, so a note the page before
	// saved just before this one started can carry the same time; it counts.
	if (
		typeof note.savedAt === 'number' &&
		typeof pageStart === 'number' &&
		note.savedAt > pageStart
	) {
		return;
	}
	mw.storage.session.remove( GO_NOTE_KEY );
	if (
		typeof note.key !== 'string' ||
		typeof note.expires !== 'number' ||
		note.expires < Date.now()
	) {
		return;
	}
	const specialPage = mw.config.get( 'wgCanonicalSpecialPageName' );
	// A go to another wiki is redirected to this page, which asks before
	// leaving, so it is not where the go went.
	if ( specialPage === 'GoToInterwiki' ) {
		return;
	}
	if ( specialPage === 'Search' ) {
		if ( mw.util.getParamValue( 'search' ) === note.query ) {
			mw.storage.setObject( GO_LANDING_KEY, { key: note.key, searched: true } );
		}
		return;
	}
	const navigation = typeof performance.getEntriesByType === 'function' ?
		/** @type {PerformanceNavigationTiming|undefined} */ ( performance.getEntriesByType( 'navigation' )[ 0 ] ) :
		undefined;
	if ( !navigation || !( navigation.redirectCount > 0 ) ) {
		return;
	}
	const pageName = String( mw.config.get( 'wgPageName' ) );
	mw.storage.setObject( GO_LANDING_KEY, {
		key: note.key,
		url: mw.util.getUrl( pageName ),
		label: pageName.replace( /_/g, ' ' )
	} );
}

module.exports = { GO_NOTE_KEY, GO_LANDING_KEY, recordGoLanding };
