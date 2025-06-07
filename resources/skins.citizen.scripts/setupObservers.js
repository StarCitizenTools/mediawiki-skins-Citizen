// Adopted from Vector 2022
const
	scrollObserver = require( './scrollObserver.js' ),
	initSectionObserver = require( './sectionObserver.js' ),
	stickyHeader = require( './stickyHeader.js' ),
	initTableOfContents = require( './tableOfContents.js' ),
	deferUntilFrame = require( './deferUntilFrame.js' ),
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
	TOC_SECTION_ID_PREFIX = 'toc-',
	SCROLL_DOWN_CLASS = 'citizen-scroll--down',
	SCROLL_UP_CLASS = 'citizen-scroll--up',
	PAGE_TITLE_INTERSECTION_CLASS = 'citizen-below-page-title';

/**
 * @callback OnIntersection
 * @param {HTMLElement} element The section that triggered the new intersection change.
 */

/**
 * @ignore
 * @param {Function} changeActiveSection
 * @return {OnIntersection}
 */
const getHeadingIntersectionHandler = ( changeActiveSection ) =>
	/**
	 * @param {HTMLElement} section
	 */
	// eslint-disable-next-line implicit-arrow-linebreak
	( section ) => {
		const headline = section.classList.contains( 'mw-body-content' ) ?
			section :
			section.querySelector( HEADLINE_SELECTOR );
		if ( headline ) {
			changeActiveSection( `${ TOC_SECTION_ID_PREFIX }${ headline.id }` );
		}
	};

/**
 * Return the computed value of the `scroll-margin-top` CSS property of the document element
 * which is also used for the scroll intersection threshold (T317661).
 *
 * @return {number} Value of scroll-margin-top OR 75 if falsy.
 * 75 derived from @scroll-padding-top LESS variable
 * https://gerrit.wikimedia.org/r/c/mediawiki/skins/Vector/+/894696/3/resources/common/variables.less ?
 */
function getDocumentScrollPaddingTop() {
	const defaultScrollPaddingTop = 75;
	const documentStyles = getComputedStyle( document.documentElement );
	const scrollPaddingTopString = documentStyles.getPropertyValue( 'scroll-padding-top' );
	return ( parseInt( scrollPaddingTopString, 10 ) || defaultScrollPaddingTop );
}

/**
 * @param {HTMLElement|null} tocElement
 * @param {HTMLElement|null} bodyContent
 * @param {initSectionObserver} initSectionObserverFn
 * @return {tableOfContents|null}
 */
const setupTableOfContents = ( tocElement, bodyContent, initSectionObserverFn ) => {
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
		}, 3 );
	};

	const tableOfContents = initTableOfContents( {
		container: tocElement,
		onHeadingClick: handleTocSectionChange,
		onHashChange: handleTocSectionChange
	} );
	const elements = () => bodyContent.querySelectorAll( `${ HEADING_SELECTOR }, .mw-body-content` );

	const sectionObserver = initSectionObserverFn( {
		elements: elements(),
		topMargin: getDocumentScrollPaddingTop(),
		onIntersection: getHeadingIntersectionHandler( tableOfContents.changeActiveSection )
	} );
	const updateElements = () => {
		sectionObserver.resume();
		sectionObserver.setElements( elements() );
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

	const setInitialActiveSection = () => {
		const hash = location.hash.slice( 1 );
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
		} else {
			// Fallback to section observer's calculation for the active section.
			sectionObserver.calcIntersection();
		}
	};

	setInitialActiveSection();

	return tableOfContents;
};

/**
 * @return {void}
 */
const main = () => {
	const tocElement = document.getElementById( TOC_ID );
	const bodyContent = document.getElementById( BODY_CONTENT_ID );

	/* eslint-disable no-unused-vars */
	const tableOfContents = setupTableOfContents( tocElement, bodyContent, initSectionObserver );

	const
		stickyHeaderElement = document.getElementById( stickyHeader.STICKY_HEADER_ID ),
		stickyIntersection = document.getElementById( 'citizen-page-header-sticky-sentinel' );

	// eslint-disable-next-line es-x/no-optional-chaining
	const shouldStickyHeader = getComputedStyle( stickyIntersection )?.getPropertyValue( 'display' ) !== 'none';
	const isStickyHeaderAllowed = !!stickyHeaderElement &&
		!!stickyIntersection &&
		shouldStickyHeader;

	const scrollDirectionObserver = scrollObserver.initDirectionObserver(
		() => {
			document.body.classList.remove( SCROLL_UP_CLASS );
			document.body.classList.add( SCROLL_DOWN_CLASS );
		},
		() => {
			document.body.classList.remove( SCROLL_DOWN_CLASS );
			document.body.classList.add( SCROLL_UP_CLASS );
		},
		10
	);

	if ( isStickyHeaderAllowed ) {
		stickyHeader.init( stickyHeaderElement );
	}

	const resumeStickyHeader = () => {
		if (
			isStickyHeaderAllowed &&
			!document.body.classList.contains( stickyHeader.STICKY_HEADER_VISIBLE_CLASS ) &&
			document.body.classList.contains( PAGE_TITLE_INTERSECTION_CLASS )
		) {
			stickyHeader.show( stickyHeaderElement );
			if ( document.documentElement.classList.contains( 'citizen-feature-autohide-navigation-clientpref-1' ) ) {
				scrollDirectionObserver.resume();
			}
		}
	};

	const pauseStickyHeader = () => {
		if ( document.body.classList.contains( stickyHeader.STICKY_HEADER_VISIBLE_CLASS ) ) {
			stickyHeader.hide( stickyHeaderElement );
			scrollDirectionObserver.pause();
		}
	};

	const pageHeaderObserver = scrollObserver.initScrollObserver(
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
	main
};
