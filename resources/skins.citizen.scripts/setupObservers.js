// Adopted from Vector 2022
const
	{ createDirectionObserver, createScrollObserver } = require( './scrollObserver.js' ),
	{ StickyHeader, STICKY_HEADER_ID, STICKY_HEADER_VISIBLE_CLASS } = require( './stickyHeader.js' ),
	TOC_ID = 'citizen-toc',
	SCROLL_DOWN_CLASS = 'citizen-scroll--down',
	SCROLL_UP_CLASS = 'citizen-scroll--up',
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

	const stickyHeaderInstance = isStickyHeaderAllowed ?
		new StickyHeader( { stickyHeaderElement, document } ) :
		null;

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

	if ( stickyHeaderInstance ) {
		stickyHeaderInstance.init();
	}

	const resumeStickyHeader = () => {
		if (
			stickyHeaderInstance &&
			!document.body.classList.contains( STICKY_HEADER_VISIBLE_CLASS ) &&
			document.body.classList.contains( PAGE_TITLE_INTERSECTION_CLASS )
		) {
			stickyHeaderInstance.show();
			if ( document.documentElement.classList.contains( 'citizen-feature-autohide-navigation-clientpref-1' ) ) {
				scrollDirectionObserver.resume();
			}
		}
	};

	const pauseStickyHeader = () => {
		if (
			stickyHeaderInstance &&
			document.body.classList.contains( STICKY_HEADER_VISIBLE_CLASS )
		) {
			stickyHeaderInstance.hide();
			scrollDirectionObserver.pause();
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
