// Adopted from Vector 2022
const
	{ createDirectionObserver, createScrollObserver } = require( './scrollObserver.js' ),
	{ MOBILE_QUERY, StickyHeader, STICKY_HEADER_ID, STICKY_HEADER_VISIBLE_CLASS } = require( './stickyHeader.js' ),
	TOC_ID = 'citizen-toc',
	SCROLL_DOWN_CLASS = 'citizen-scroll--down',
	SCROLL_UP_CLASS = 'citizen-scroll--up',
	AUTOHIDE_CLASS = 'citizen-feature-autohide-navigation-clientpref-1',
	PAGE_TITLE_INTERSECTION_CLASS = 'citizen-below-page-title';

/**
 * The table of contents scroll spy is only useful on pages that render a
 * ToC, so its code lives in a separate module loaded on demand. The server
 * queues the module on ToC pages (batched into the initial module request);
 * this element check re-requests it for cached HTML that predates the
 * server-side condition, which mw.loader dedupes into a no-op.
 *
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {typeof IntersectionObserver} deps.IntersectionObserver
 * @return {void}
 */
const loadTableOfContents = ( { document, window, mw, IntersectionObserver } ) => {
	if ( !document.getElementById( TOC_ID ) ) {
		return;
	}

	mw.loader.using( 'skins.citizen.toc' ).then(
		( require ) => {
			require( 'skins.citizen.toc' ).init(
				{ document, window, mw, IntersectionObserver }
			);
		},
		( e ) => {
			// The ToC list is server-rendered and stays navigable without
			// the module — losing it only costs the scroll spy, so log
			// and move on.
			mw.log.warn( 'Failed to load skins.citizen.toc', e );
		}
	);
};

/**
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {typeof IntersectionObserver} deps.IntersectionObserver
 * @return {void}
 */
const init = ( { document, window, mw, IntersectionObserver } ) => {
	loadTableOfContents( { document, window, mw, IntersectionObserver } );

	const
		stickyHeaderElement = document.getElementById( STICKY_HEADER_ID ),
		stickyIntersection = document.getElementById( 'citizen-page-header-sticky-sentinel' );

	const shouldStickyHeader = window.getComputedStyle( stickyIntersection )?.getPropertyValue( 'display' ) !== 'none';
	const isStickyHeaderAllowed = !!stickyHeaderElement &&
		!!stickyIntersection &&
		shouldStickyHeader;

	// Bound to a local first: a guard on the expression does not narrow the
	// type inside the callbacks below.
	const mobileQuery = typeof window.matchMedia === 'function' ?
		window.matchMedia( MOBILE_QUERY ) :
		null;
	const isNarrow = () => ( mobileQuery ? mobileQuery.matches : false );

	// Built on first use rather than up front, because below tablet the bar is
	// hidden and there is nothing for it to do — and building it is not free:
	// it clones the page-tools dropdowns and keeps a MutationObserver on each
	// for the rest of the page's life. A viewport that never crosses the
	// breakpoint never pays for either.
	let stickyHeaderInstance = null;
	const ensureStickyHeader = () => {
		if ( !isStickyHeaderAllowed || isNarrow() ) {
			return null;
		}
		if ( !stickyHeaderInstance ) {
			stickyHeaderInstance = new StickyHeader( {
				stickyHeaderElement,
				document,
				window,
				requestIdleCallback: mw.requestIdleCallback
			} );
			stickyHeaderInstance.init();
		}
		return stickyHeaderInstance;
	};

	const scrollDirectionObserver = createDirectionObserver( {
		window,
		throttle: mw.util.throttle,
		onScrollDown: () => {
			document.body.classList.remove( SCROLL_UP_CLASS );
			document.body.classList.add( SCROLL_DOWN_CLASS );
		},
		onScrollUp: () => {
			document.body.classList.remove( SCROLL_DOWN_CLASS );
			document.body.classList.add( SCROLL_UP_CLASS );
		},
		threshold: 10
	} );

	// Autohide moves the page actions and the contents control, which are on
	// screen at every width. It used to be started and stopped alongside the
	// sticky header, which was harmless while that bar existed everywhere and
	// would have taken autohide down with it on mobile once it stopped.
	const resumeStickyHeader = () => {
		if ( !document.body.classList.contains( PAGE_TITLE_INTERSECTION_CLASS ) ) {
			return;
		}
		if ( document.documentElement.classList.contains( AUTOHIDE_CLASS ) ) {
			scrollDirectionObserver.resume();
		}
		const stickyHeader = ensureStickyHeader();
		if ( stickyHeader && !document.body.classList.contains( STICKY_HEADER_VISIBLE_CLASS ) ) {
			stickyHeader.show();
		}
	};

	const pauseStickyHeader = () => {
		scrollDirectionObserver.pause();
		if (
			stickyHeaderInstance &&
			document.body.classList.contains( STICKY_HEADER_VISIBLE_CLASS )
		) {
			stickyHeaderInstance.hide();
		}
	};

	const scrollObserver = createScrollObserver( { IntersectionObserver } );
	const pageHeaderObserver = scrollObserver.observe(
		() => {
			document.body.classList.add( PAGE_TITLE_INTERSECTION_CLASS );
			resumeStickyHeader();
		},
		() => {
			document.body.classList.remove( PAGE_TITLE_INTERSECTION_CLASS );
			pauseStickyHeader();
		}
	);

	pageHeaderObserver.observe( stickyIntersection );

	// A rotation can cross the breakpoint, and the bar belongs on screen on
	// exactly one side of it.
	if ( mobileQuery && typeof mobileQuery.addEventListener === 'function' ) {
		mobileQuery.addEventListener( 'change', () => {
			if ( isNarrow() ) {
				pauseStickyHeader();
			} else {
				resumeStickyHeader();
			}
		} );
	}

	mw.hook( 've.activationStart' ).add( () => {
		pauseStickyHeader();
	} );

	mw.hook( 've.deactivationComplete' ).add( () => {
		resumeStickyHeader();
	} );
};

module.exports = {
	init
};
