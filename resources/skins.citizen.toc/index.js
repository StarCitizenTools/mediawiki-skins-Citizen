// Adopted from Vector 2022
const
	{ createSectionObserver } = require( './sectionObserver.js' ),
	{ TableOfContents } = require( './tableOfContents.js' ),
	{ createSectionLabel } = require( './sectionLabel.js' ),
	// deferUntilFrame.js is listed in both this module's and
	// skins.citizen.scripts' packageFiles — keep the two in sync
	deferUntilFrame = require( '../skins.citizen.scripts/deferUntilFrame.js' ),
	TOC_ID = 'citizen-toc',
	BODY_CONTENT_ID = 'bodyContent',
	// Support two variants of heading markup: (see T13555, T358452)
	// (old) <h2> <span class="mw-headline" id="...">...</span> ... </h2>
	// (new) <div class="mw-heading"> <h2 id="...">...</h2> ... </div>
	// [more information: https://www.mediawiki.org/wiki/Heading_HTML_changes]
	HEADING_TAGS = [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
	HEADING_SELECTOR = [ '.mw-heading', ...HEADING_TAGS.map( ( tag ) => `${ tag }:not([id])` ) ]
		.map( ( sel ) => `.mw-parser-output ${ sel }` ).join( ', ' ),
	HEADLINE_SELECTOR = [ '.mw-headline', ...HEADING_TAGS.map( ( tag ) => `${ tag }[id]` ) ]
		.map( ( sel ) => `.mw-parser-output ${ sel }` ).join( ', ' ),
	TOC_SECTION_ID_PREFIX = 'toc-';

/**
 * @callback OnIntersection
 * @param {HTMLElement[]} sections The sections currently visible in the viewport.
 */

/**
 * @ignore
 * @param {Function} changeActiveSections
 * @return {OnIntersection}
 */
const getHeadingIntersectionHandler = ( changeActiveSections ) =>
	/**
	 * @param {HTMLElement[]} sections
	 */
	// eslint-disable-next-line implicit-arrow-linebreak
	( sections ) => {
		const ids = [];
		for ( const section of sections ) {
			const headline = section.classList.contains( 'mw-body-content' ) ?
				section :
				section.querySelector( HEADLINE_SELECTOR );
			if ( headline ) {
				ids.push( `${ TOC_SECTION_ID_PREFIX }${ headline.id }` );
			}
		}
		if ( ids.length > 0 ) {
			changeActiveSections( ids );
		}
	};

/**
 * Return the computed value of the `scroll-margin-top` CSS property of the document element
 * which is also used for the scroll intersection threshold (T317661).
 *
 * @param {Window} window
 * @param {Document} document
 * @return {number} Value of scroll-margin-top OR 75 if falsy.
 * 75 derived from @scroll-padding-top LESS variable
 * https://gerrit.wikimedia.org/r/c/mediawiki/skins/Vector/+/894696/3/resources/common/variables.less ?
 */
function getDocumentScrollPaddingTop( window, document ) {
	const defaultScrollPaddingTop = 75;
	const documentStyles = window.getComputedStyle( document.documentElement );
	const scrollPaddingTopString = documentStyles.getPropertyValue( 'scroll-padding-top' );
	return ( parseInt( scrollPaddingTopString, 10 ) || defaultScrollPaddingTop );
}

/**
 * @param {HTMLElement|null} tocElement
 * @param {HTMLElement|null} bodyContent
 * @param {Object} deps
 * @param {Document} deps.document
 * @param {Window} deps.window
 * @param {Object} deps.mw
 * @param {typeof IntersectionObserver} deps.IntersectionObserver
 * @return {TableOfContents|null}
 */
const setupTableOfContents = (
	tocElement, bodyContent, { document, window, mw, IntersectionObserver }
) => {
	if ( !(
		tocElement &&
		bodyContent
	) ) {
		return null;
	}

	const handleTocSectionChange = () => {
		// eslint-disable-next-line no-use-before-define
		sectionObserver.pause();

		// T297614: We want the link that the user has clicked inside the TOC or the
		// section that corresponds to the hashchange event to be "active" (e.g.
		// bolded) regardless of whether the browser's scroll position corresponds
		// to that section. Therefore, we need to temporarily ignore section
		// observer until the browser has finished scrolling to the section (if
		// needed).
		//
		// However, because the scroll event happens asynchronously after the user
		// clicks on a link and may not even happen at all (e.g. the user has
		// scrolled all the way to the bottom and clicks a section that is already
		// in the viewport), determining when we should resume section observer is a
		// bit tricky.
		//
		// Because a scroll event may not even be triggered after clicking the link,
		// we instead allow the browser to perform a maximum number of repaints
		// before resuming sectionObserver. Per T297614#7687656, Firefox 97.0 wasn't
		// consistently activating the table of contents section that the user
		// clicked even after waiting 2 frames. After further investigation, it
		// sometimes waits up to 3 frames before painting the new scroll position so
		// we have that as the limit.
		deferUntilFrame( () => {
			// eslint-disable-next-line no-use-before-define
			sectionObserver.resume();
			// eslint-disable-next-line no-use-before-define
			sectionObserver.calcIntersection();
		}, 3 );
	};

	const tableOfContents = new TableOfContents( {
		container: tocElement,
		onHeadingClick: handleTocSectionChange,
		onHashChange: handleTocSectionChange,
		window,
		document,
		mw
	} );
	const elements = () => bodyContent.querySelectorAll( `${ HEADING_SELECTOR }, .mw-body-content` );

	// Whether the scroll spy has activated any section yet. The initial
	// activation is deferred to idle (see below); once the spy has fired,
	// its live state is authoritative and the deferred pass must not run.
	let sectionsActivated = false;

	const sectionLabel = createSectionLabel( { document, window } );
	sectionLabel.init();

	const sectionObserver = createSectionObserver( {
		window,
		mw,
		IntersectionObserver,
		elements: elements(),
		topMargin: getDocumentScrollPaddingTop( window, document ),
		onIntersection: getHeadingIntersectionHandler( ( ids ) => {
			sectionsActivated = true;
			tableOfContents.changeActiveSections( ids );
			sectionLabel.syncFromCard();
		} )
	} );
	const updateElements = () => {
		sectionObserver.resume();
		sectionObserver.setElements( elements() );
		// A rebuild reactivates its sections internally, so the control has to
		// be told to read the card again.
		sectionLabel.syncFromCard();
	};

	mw.hook( 've.activationStart' ).add( () => {
		sectionObserver.pause();
	} );
	mw.hook( 'wikipage.tableOfContents' ).add( ( sections ) => {
		tableOfContents.reloadTableOfContents( sections ).then( () => {
			updateElements();
		} );
	} );
	mw.hook( 've.deactivationComplete' ).add( () => {
		updateElements();
	} );

	// The spy used to be paused below desktop, where the ToC is a collapsed
	// popover and nobody could see which row was active. The contents control
	// now carries the active section as its own value, so on a narrow screen
	// the spy is the only thing telling a reader where they are — the width it
	// was skipped on is the width it matters most.
	//
	// Recalculate active sections on window resize since viewport dimensions change.
	window.addEventListener( 'resize', mw.util.debounce( () => {
		sectionObserver.calcIntersection();
	}, 200 ) );

	const setInitialActiveSection = () => {
		const hash = window.location.hash.slice( 1 );
		// If hash fragment is blank, determine the active section with section
		// observer.
		if ( hash === '' ) {
			sectionObserver.calcIntersection();
			return;
		}

		// T325086: If hash fragment is present and corresponds to a toc section,
		// expand the section.
		const hashSection = /** @type {HTMLElement|null} */ ( mw.util.getTargetFromFragment( `${ TOC_SECTION_ID_PREFIX }${ hash }` ) );
		if ( hashSection ) {
			tableOfContents.expandSection( hashSection.id );
		}

		// T325086: If hash fragment corresponds to a section AND the user is at
		// bottom of page, activate the section. Otherwise, use section observer to
		// calculate the active section.
		//
		// Note that even if a hash fragment is present, it's possible for the
		// browser to scroll to a position that is different from the position of
		// the section that corresponds to the hash fragment. This can happen when
		// the browser remembers a prior scroll position after refreshing the page,
		// for example.
		if (
			hashSection &&
			Math.round( window.innerHeight + window.scrollY ) >= document.body.scrollHeight
		) {
			tableOfContents.changeActiveSection( hashSection.id );
			sectionLabel.syncFromCard();
		} else {
			// Fallback to section observer's calculation for the active section.
			sectionObserver.calcIntersection();
		}
	};

	// The boot idle tasks flip document-level classes (performance mode,
	// animations-ready) and append to <body>; geometry reads issued before
	// those writes are painted force a full-page reflow. Run the initial
	// activation at idle plus one frame so its reads land on clean layout.
	mw.requestIdleCallback( () => {
		deferUntilFrame( () => {
			// If the user scrolled or clicked in the meantime, the spy's
			// live state wins — the boot-time hash heuristic (T325086)
			// would activate a stale target.
			if ( !sectionsActivated ) {
				setInitialActiveSection();
			}
		}, 1 );
	}, { timeout: 3000 } );

	return tableOfContents;
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
	setupTableOfContents(
		document.getElementById( TOC_ID ),
		document.getElementById( BODY_CONTENT_ID ),
		{ document, window, mw, IntersectionObserver }
	);
};

module.exports = {
	init
};
