// Adopted from Vector 2022
/** @module TableOfContents */

/**
 * TableOfContents Mustache templates
 */
const templateTocContents = require( /** @type {string} */ ( './templates/TableOfContents__list.mustache' ) );
const templateTocLine = require( /** @type {string} */ ( './templates/TableOfContents__line.mustache' ) );
/**
 * TableOfContents Config object for filling mustache templates
 */
const tableOfContentsConfig = require( /** @type {string} */ ( './tableOfContentsConfig.json' ) );
const deferUntilFrame = require( './deferUntilFrame.js' );
const { getTableOfContentsSectionsData } = require( './tableOfContentsSections.js' );

const SECTION_ID_PREFIX = 'toc-';
const SECTION_CLASS = 'citizen-toc-list-item';
const ACTIVE_SECTION_CLASS = 'citizen-toc-list-item--active';
const EXPANDED_SECTION_CLASS = 'citizen-toc-list-item--expanded';
const TOP_SECTION_CLASS = 'citizen-toc-level-1';
const ACTIVE_TOP_SECTION_CLASS = 'citizen-toc-level-1--active';
const LINK_CLASS = 'citizen-toc-link';
const TOGGLE_CLASS = 'citizen-toc-toggle';
const TOC_CONTENTS_ID = 'mw-panel-toc-list';
const INDICATOR_CLASS = 'citizen-toc-indicator';
const COLLAPSE_ENABLED_CLASS = 'citizen-toc--collapse-enabled';

/**
 * Fired when the user clicks a toc link. Note that this callback takes
 * precedence over the onHashChange callback. The onHashChange callback will not
 * be called when the user clicks a toc link.
 *
 * @callback onHeadingClick
 * @param {string} id The id of the clicked list item.
 */

/**
 * Fired when the page's hash fragment has changed. Note that if the user clicks
 * a link inside the TOC, the `onHeadingClick` callback will fire instead of the
 * `onHashChange` callback to avoid redundant behavior.
 *
 * @callback onHashChange
 * @param {string} id The id of the list item that corresponds to the hash change event.
 */

/**
 * @callback onToggleClick
 * @param {string} id The id of the list item corresponding to the arrow.
 */

/**
 * @callback onTogglePinned
 */

/**
 * @typedef {Object} TableOfContentsProps
 * @property {HTMLElement} container The container element for the table of contents.
 * @property {onHeadingClick} onHeadingClick Called when a section link is clicked.
 * @property {onHashChange} onHashChange Called when a hash change event
 * matches the id of a LINK_CLASS anchor element.
 * @property {onToggleClick} [onToggleClick] Called when an arrow is clicked.
 * @property {onTogglePinned} onTogglePinned Called when pinned toggle buttons are clicked.
 * @property {Window} window
 * @property {Document} document
 * @property {Object} mw
 */

/**
 * @typedef {Object} Section
 * @property {number} toclevel
 * @property {string} anchor
 * @property {string} line
 * @property {string} number
 * @property {string} index
 * @property {number} byteoffset
 * @property {string} fromtitle
 * @property {boolean} is-parent-section
 * @property {boolean} is-top-level-section
 * @property {Section[]} array-sections
 * @property {string} level
 */

/**
 * @typedef {Object} SectionsListData
 * @property {Section[]} array-sections
 * @property {boolean} citizen-is-collapse-sections-enabled
 */

/**
 * @typedef {Object} ArraySectionsData
 * @property {number} number-section-count
 * @property {Section[]} array-sections
 */

/**
 * @typedef {Object} activeSectionIds
 * @property {string|undefined} parent - The active  top level section ID
 * @property {string|undefined} child - The active subsection ID
 */

/**
 * Class representing the Table of Contents.
 */
class TableOfContents {
	/**
	 * Initializes the sidebar's Table of Contents.
	 *
	 * @param {TableOfContentsProps} props
	 */
	constructor( props ) {
		this.props = props;
		this.window = props.window;
		this.document = props.document;
		this.mw = props.mw;
		/** @type {Set<string>} */
		this.activeIds = new Set();
		/** @type {HTMLElement | null} */
		this.indicatorBar = null;
		/** @type {Array<HTMLElement>} */
		this.expandedSections = [];
		this.handleHashChange = this.handleHashChange.bind( this );

		// Cache reduced motion preference and listen for changes.
		this.reducedMotionQuery = this.window.matchMedia( '(prefers-reduced-motion: reduce)' );
		this.reducedMotionEnabled = this.reducedMotionQuery.matches;
		this.handleReducedMotionChange = ( e ) => {
			this.reducedMotionEnabled = e.matches;
		};
		this.reducedMotionQuery.addEventListener( 'change', this.handleReducedMotionChange );

		this.initialize();
	}

	/**
	 * Get the ids of the active sections.
	 * With multi-section activation, this returns the first active section's
	 * parent and child ids as a best-effort approximation for reload state.
	 *
	 * @return {activeSectionIds}
	 */
	getActiveSectionIds() {
		const ids = [ ...this.activeIds ];
		if ( ids.length === 0 ) {
			return { parent: undefined, child: undefined };
		}
		const firstEl = this.document.getElementById( ids[ 0 ] );
		const topSection = firstEl ? firstEl.closest( `.${ TOP_SECTION_CLASS }` ) : null;
		return {
			parent: topSection ? topSection.id : ids[ 0 ],
			child: ids[ 0 ]
		};
	}

	/**
	 * Does the user prefer reduced motion?
	 *
	 * @return {boolean}
	 */
	prefersReducedMotion() {
		return this.reducedMotionEnabled;
	}

	/**
	 * Sets an `ACTIVE_SECTION_CLASS` on the element with an id that matches `id`.
	 * Sets an `ACTIVE_TOP_SECTION_CLASS` on the top level heading (e.g. element with the
	 * `TOP_SECTION_CLASS`).
	 * If the element is a top level heading, the element will have both classes.
	 *
	 * @param {string} id The id of the element to be activated in the Table of Contents.
	 */
	activateSection( id ) {
		const selectedTocSection = this.document.getElementById( id );

		if ( !selectedTocSection || this.activeIds.has( id ) ) {
			return;
		}

		// Assign the active top and sub sections, apply classes
		const topSection = /** @type {HTMLElement|undefined} */ ( selectedTocSection.closest( `.${ TOP_SECTION_CLASS }` ) );
		if ( topSection ) {
			// T328089 Sometimes activeTopSection is null
			topSection.classList.add( ACTIVE_TOP_SECTION_CLASS, EXPANDED_SECTION_CLASS );
		}
		selectedTocSection.classList.add( ACTIVE_SECTION_CLASS );
		this.activeIds.add( id );
	}

	/**
	 * Removes the `ACTIVE_SECTION_CLASS` from all ToC sections and clears activeIds.
	 */
	deactivateAllSections() {
		for ( const id of this.activeIds ) {
			const el = this.document.getElementById( id );
			if ( el ) {
				el.classList.remove( ACTIVE_SECTION_CLASS );
				const topSection = el.closest( `.${ TOP_SECTION_CLASS }` );
				if ( topSection ) {
					topSection.classList.remove( ACTIVE_TOP_SECTION_CLASS );
				}
			}
		}
		this.activeIds.clear();
	}

	/**
	 * Removes all `ACTIVE_SECTION_CLASS` CSS class names from the ToC sections.
	 */
	deactivateSections() {
		this.deactivateAllSections();
		this.updateIndicatorBar();
	}

	/**
	 * Activate multiple sections simultaneously and update the indicator bar.
	 *
	 * @param {string[]} ids The ids of the sections to activate.
	 */
	changeActiveSections( ids ) {
		const newKey = ids.slice().sort( ( a, b ) => a.localeCompare( b ) ).join( ',' );
		const oldKey = [ ...this.activeIds ].sort( ( a, b ) => a.localeCompare( b ) ).join( ',' );
		if ( newKey === oldKey ) {
			return;
		}

		this.deactivateAllSections();

		const topSectionsToExpand = new Set();
		for ( const id of ids ) {
			const el = this.document.getElementById( id );
			if ( !el ) {
				continue;
			}
			el.classList.add( ACTIVE_SECTION_CLASS );
			this.activeIds.add( id );

			const topSection = /** @type {HTMLElement|null} */ ( el.closest( `.${ TOP_SECTION_CLASS }` ) );
			if ( topSection ) {
				topSection.classList.add( ACTIVE_TOP_SECTION_CLASS );
				topSectionsToExpand.add( topSection.id );
			}
		}

		for ( const topId of topSectionsToExpand ) {
			this.expandSection( topId );
		}

		// Defer geometry reads to the next frame so class mutations above
		// don't force a synchronous layout reflow, and batch both measure
		// phases ahead of both apply phases so the writes (the unit-height
		// custom property affects layout) never sit between reads.
		this.window.requestAnimationFrame( () => {
			const indicatorMetrics = this.measureIndicator();
			const scrollAdjustment = ids.length > 0 ?
				this.measureScrollAdjustment( ids[ 0 ] ) :
				null;
			this.applyIndicator( indicatorMetrics );
			this.applyScrollAdjustment( scrollAdjustment );
		} );
	}

	/**
	 * Find the first and last visible links among the active sections.
	 *
	 * @return {{ first: HTMLElement|null, last: HTMLElement|null }}
	 */
	getActiveLinks() {
		let first = null;
		let last = null;
		for ( const id of this.activeIds ) {
			const el = this.document.getElementById( id );
			if ( !el ) {
				continue;
			}
			const link = el.querySelector( `.${ LINK_CLASS }` );
			if ( link && link.offsetParent !== null ) {
				if ( !first ) {
					first = link;
				}
				last = link;
			}
		}
		return { first, last };
	}

	/**
	 * Measure everything the indicator bar update needs. Geometry reads
	 * only — callers can batch this ahead of any write phase.
	 *
	 * @return {Object|null} Metrics for applyIndicator(), or null when
	 * there is no indicator bar.
	 */
	measureIndicator() {
		if ( !this.indicatorBar ) {
			return null;
		}
		if ( this.activeIds.size === 0 ) {
			return { hide: true };
		}

		const { first: firstLink, last: lastLink } = this.getActiveLinks();
		if ( !firstLink || !lastLink ) {
			return { hide: true };
		}

		const unitHeight = this.indicatorUnitHeight ||
			firstLink.getBoundingClientRect().height;

		// Use the indicator's offset parent (its CSS positioning context) as reference
		const positioningParent = this.indicatorBar.offsetParent || this.props.container;
		const containerRect = positioningParent.getBoundingClientRect();
		const firstRect = firstLink.getBoundingClientRect();
		const lastRect = lastLink.getBoundingClientRect();

		return {
			hide: false,
			unitHeight,
			top: firstRect.top - containerRect.top + positioningParent.scrollTop,
			height: lastRect.bottom - firstRect.top
		};
	}

	/**
	 * Apply previously measured indicator metrics. Style writes only.
	 *
	 * @param {Object|null} metrics Result of measureIndicator().
	 */
	applyIndicator( metrics ) {
		if ( !metrics ) {
			return;
		}
		if ( metrics.hide ) {
			this.indicatorBar.style.setProperty( '--indicator-scale', '0' );
			return;
		}

		// Cache the unit height (one link row) for scaleY calculation
		if ( !this.indicatorUnitHeight && metrics.unitHeight > 0 ) {
			this.indicatorUnitHeight = metrics.unitHeight;
			this.indicatorBar.style.setProperty(
				'--indicator-unit-height', metrics.unitHeight + 'px'
			);
		}

		const scale = this.indicatorUnitHeight > 0 ?
			metrics.height / this.indicatorUnitHeight : 0;

		this.indicatorBar.style.setProperty( '--indicator-top', metrics.top + 'px' );
		this.indicatorBar.style.setProperty( '--indicator-scale', String( scale ) );
	}

	/**
	 * Update the indicator bar position and height based on active sections.
	 */
	updateIndicatorBar() {
		this.applyIndicator( this.measureIndicator() );
	}

	/**
	 * Measure whether and how far the ToC container needs scrolling to keep
	 * the active section visible. Geometry reads only.
	 *
	 * @param {string} id The id of the element to be scrolled to in the Table of Contents.
	 * @return {Object|null} Adjustment for applyScrollAdjustment(), or null
	 * when no scrolling is needed.
	 */
	measureScrollAdjustment( id ) {
		const section = this.document.getElementById( id );
		if ( !section ) {
			return null;
		}

		// Get currently visible active link
		let link = /** @type {HTMLElement|null} */( section.firstElementChild );
		if ( link && !link.offsetParent ) {
			// If active link is a hidden subsection, use active parent link
			const { parent: activeTopId } = this.getActiveSectionIds();
			const parentSection = this.document.getElementById( activeTopId || '' );
			if ( parentSection ) {
				link = /** @type {HTMLElement|null} */( parentSection.firstElementChild );
			} else {
				link = null;
			}
		}

		const isContainerScrollable = this.props.container.scrollHeight >
			this.props.container.clientHeight;
		if ( !link || !isContainerScrollable ) {
			return null;
		}

		const containerRect = this.props.container.getBoundingClientRect();
		const linkRect = link.getBoundingClientRect();

		return {
			midpoint: ( containerRect.bottom - containerRect.top ) / 2,
			linkHiddenTopValue: containerRect.top - linkRect.top,
			// Because the bottom of the TOC can extend below the viewport,
			// min() is used to find the value where the active section first becomes hidden
			linkHiddenBottomValue: linkRect.bottom -
				Math.min( containerRect.bottom, this.window.innerHeight ),
			scrollTop: this.props.container.scrollTop
		};
	}

	/**
	 * Apply a previously measured scroll adjustment. No geometry reads.
	 *
	 * @param {Object|null} adjustment Result of measureScrollAdjustment().
	 */
	applyScrollAdjustment( adjustment ) {
		if ( !adjustment ) {
			return;
		}

		const { linkHiddenTopValue, linkHiddenBottomValue, midpoint } = adjustment;
		// Pixels above or below the TOC where we start scrolling the active section into view
		const hiddenThreshold = 100;
		// Respect 'prefers-reduced-motion' user preference
		const scrollBehavior = this.prefersReducedMotion() ? undefined : 'smooth';
		// Track the target instead of re-reading scrollTop between the two
		// adjustments so this phase stays free of geometry reads. When both
		// adjustments fire with instant scrolling, the chained value skips
		// the browser's clamping of the first jump — a few pixels off, only
		// reachable with a scrollable container shorter than the threshold.
		let targetTop = adjustment.scrollTop;

		// Manually increment and decrement TOC scroll rather than using scrollToView
		// in order to account for threshold
		if ( linkHiddenTopValue + hiddenThreshold > 0 ) {
			targetTop = targetTop - linkHiddenTopValue - midpoint;
			this.props.container.scrollTo( {
				top: targetTop,
				behavior: scrollBehavior
			} );
		}
		if ( linkHiddenBottomValue + hiddenThreshold > 0 ) {
			targetTop = targetTop + linkHiddenBottomValue + midpoint;
			this.props.container.scrollTo( {
				top: targetTop,
				behavior: scrollBehavior
			} );
		}
	}

	/**
	 * Scroll active section into view if necessary
	 *
	 * @param {string} id The id of the element to be scrolled to in the Table of Contents.
	 */
	scrollToActiveSection( id ) {
		this.applyScrollAdjustment( this.measureScrollAdjustment( id ) );
	}

	/**
	 * Adds the `EXPANDED_SECTION_CLASS` CSS class name
	 * to a top level heading in the ToC.
	 *
	 * @param {string} id
	 */
	expandSection( id ) {
		const tocSection = this.document.getElementById( id );

		if ( !tocSection ) {
			return;
		}

		const topSection = /** @type {HTMLElement} */ ( tocSection.closest( `.${ TOP_SECTION_CLASS }` ) );
		const toggle = topSection.querySelector( `.${ TOGGLE_CLASS }` );

		if ( topSection && toggle && !this.expandedSections.includes( topSection ) ) {
			toggle.setAttribute( 'aria-expanded', 'true' );
			topSection.classList.add( EXPANDED_SECTION_CLASS );
			this.expandedSections.push( topSection );
		}
	}

	/**
	 * Get the IDs of expanded sections.
	 *
	 * @return {Array<string>}
	 */
	getExpandedSectionIds() {
		return this.expandedSections.map( ( s ) => s.id );
	}

	/**
	 * @param {string} id
	 */
	changeActiveSection( id ) {
		this.changeActiveSections( [ id ] );
	}

	/**
	 * @param {string} id
	 * @return {boolean}
	 */
	isTopLevelSection( id ) {
		const section = this.document.getElementById( id );
		return !!section && section.classList.contains( TOP_SECTION_CLASS );
	}

	/**
	 * Removes all `EXPANDED_SECTION_CLASS` CSS class names
	 * from the top level sections in the ToC.
	 *
	 * @param {Array<string>} [selectedIds]
	 */
	collapseSections( selectedIds ) {
		const sectionIdsToCollapse = selectedIds || this.getExpandedSectionIds();
		this.expandedSections = this.expandedSections.filter( ( section ) => {
			const isSelected = sectionIdsToCollapse.includes( section.id );
			const toggle = isSelected ? section.getElementsByClassName( TOGGLE_CLASS ) : undefined;
			if ( isSelected && toggle && toggle.length > 0 ) {
				toggle[ 0 ].setAttribute( 'aria-expanded', 'false' );
				section.classList.remove( EXPANDED_SECTION_CLASS );
				return false;
			}
			return true;
		} );
	}

	/**
	 * @param {string} id
	 */
	toggleExpandSection( id ) {
		const expandedSectionIds = this.getExpandedSectionIds();
		const indexOfExpandedSectionId = expandedSectionIds.indexOf( id );
		if ( this.isTopLevelSection( id ) ) {
			if ( indexOfExpandedSectionId >= 0 ) {
				this.collapseSections( [ id ] );
			} else {
				this.expandSection( id );
			}
			this.updateIndicatorBar();
		}
	}

	/**
	 * Set aria-expanded attribute for all toggle buttons.
	 */
	initializeExpandedStatus() {
		const parentSections = this.props.container.querySelectorAll( `.${ TOP_SECTION_CLASS }` );
		parentSections.forEach( ( section ) => {
			const expanded = section.classList.contains( EXPANDED_SECTION_CLASS );
			const toggle = section.querySelector( `.${ TOGGLE_CLASS }` );
			if ( toggle ) {
				toggle.setAttribute( 'aria-expanded', expanded.toString() );
			}
		} );
	}

	/**
	 * Event handler for hash change event.
	 */
	handleHashChange() {
		const hash = this.window.location.hash.slice( 1 );
		const listItem = this.mw.util.getTargetFromFragment( `${ SECTION_ID_PREFIX }${ hash }` );

		if ( !listItem ) {
			return;
		}

		this.expandSection( listItem.id );
		this.props.onHashChange( listItem.id );
	}

	/**
	 * Bind event listener for hash change events that match the hash of
	 * LINK_CLASS.
	 *
	 * Note that if the user clicks a link inside the TOC, the onHeadingClick
	 * callback will fire instead of the onHashChange callback, since it takes
	 * precedence.
	 */
	bindHashChangeListener() {
		this.window.addEventListener( 'hashchange', this.handleHashChange );
	}

	/**
	 * Unbinds event listener for hash change events.
	 */
	unbindHashChangeListener() {
		this.window.removeEventListener( 'hashchange', this.handleHashChange );
	}

	/**
	 * Bind event listener for clicking on show/hide Table of Contents links.
	 */
	bindPinnedToggleListeners() {
		if ( !this.props.onTogglePinned ) {
			return;
		}

		this.document.querySelectorAll( '.citizen-toc-pinnable-header button' ).forEach( ( btn ) => {
			btn.addEventListener( 'click', () => {
				this.props.onTogglePinned();
			} );
		} );
	}

	/**
	 * Bind event listeners for clicking on section headings and toggle buttons.
	 */
	bindSubsectionToggleListeners() {
		this.props.container.addEventListener( 'click', ( e ) => {
			if (
				!( e.target instanceof HTMLElement )
			) {
				return;
			}

			const tocSection =
				/** @type {HTMLElement | null} */ ( e.target.closest( `.${ SECTION_CLASS }` ) );

			if ( tocSection && tocSection.id ) {
				// In case section link contains HTML,
				// test if click occurs on any child elements.
				if ( e.target.closest( `.${ LINK_CLASS }` ) ) {
					// Temporarily unbind the hash change listener to avoid redundant
					// behavior caused by firing both the onHeadingClick callback and the
					// onHashChange callback. Instead, only fire the onHeadingClick
					// callback.
					this.unbindHashChangeListener();

					this.expandSection( tocSection.id );
					this.props.onHeadingClick( tocSection.id );

					deferUntilFrame( () => {
						this.bindHashChangeListener();
					}, 3 );
				}
				// Toggle button does not contain child elements,
				// so classList check will suffice.
				if ( e.target.closest( `.${ TOGGLE_CLASS }` ) ) {
					this.toggleExpandSection( tocSection.id );
					if ( this.props.onToggleClick ) {
						this.props.onToggleClick( tocSection.id );
					}
				}
			}

		} );
	}

	/**
	 * Invalidate cached indicator unit height so it is recalculated on next update.
	 */
	invalidateIndicatorCache() {
		this.indicatorUnitHeight = 0;
	}

	/**
	 * Binds event listeners and sets the default state of the component.
	 */
	initialize() {
		// Sync component state to the default rendered state of the table of contents.
		this.expandedSections = Array.from(
			this.props.container.querySelectorAll( `.${ EXPANDED_SECTION_CLASS }` )
		);

		// Find the indicator bar element.
		this.indicatorBar = this.props.container.querySelector( `.${ INDICATOR_CLASS }` );

		// Initialize toggle buttons aria-expanded attribute.
		this.initializeExpandedStatus();

		// Bind event listeners.
		this.bindSubsectionToggleListeners();
		this.bindPinnedToggleListeners();
		this.bindHashChangeListener();

		// Recalculate indicator on resize (element sizes change).
		// Debounce to avoid calling getBoundingClientRect on every pixel of resize.
		this.handleResize = this.mw.util.debounce( () => {
			this.invalidateIndicatorCache();
			this.updateIndicatorBar();
		}, 200 );
		this.window.addEventListener( 'resize', this.handleResize );
	}

	/**
	 * Reexpands all sections that were expanded before the table of contents was reloaded.
	 * Edited Sections are not reexpanded, as the ID of the edited section is changed after reload.
	 */
	reExpandSections() {
		this.initializeExpandedStatus();
		const expandedSectionIds = this.getExpandedSectionIds();
		for ( const id of expandedSectionIds ) {
			this.expandSection( id );
		}
	}

	/**
	 * Reloads the table of contents from saved data
	 *
	 * @param {Section[]} sections
	 * @return {Promise<any>}
	 */
	reloadTableOfContents( sections ) {
		if ( sections.length < 1 ) {
			this.reloadPartialHTML( TOC_CONTENTS_ID, '' );
			return Promise.resolve( [] );
		}
		const load = () => this.mw.loader.using( 'mediawiki.template.mustache' ).then( () => {
			const idsToReactivate = [ ...this.activeIds ];
			const tocData = this.getTableOfContentsData( sections );
			this.reloadPartialHTML( TOC_CONTENTS_ID, this.getTableOfContentsListHtml( tocData ) );
			// Toggle collapse class based on new section count.
			this.props.container.classList.toggle(
				COLLAPSE_ENABLED_CLASS,
				!!tocData[ 'citizen-is-collapse-sections-enabled' ]
			);
			// Re-acquire indicator bar since innerHTML replacement destroyed the old DOM node.
			this.indicatorBar = this.props.container.querySelector( `.${ INDICATOR_CLASS }` );
			this.invalidateIndicatorCache();
			// Reexpand sections that were expanded before the table of contents was reloaded.
			this.reExpandSections();
			// Reactivate the previously active sections using the unified path
			// so expandedSections and indicator state stay consistent.
			this.deactivateSections();
			if ( idsToReactivate.length > 0 ) {
				this.changeActiveSections( idsToReactivate );
			}
		} );
		return new Promise( ( resolve ) => {
			load().then( () => {
				resolve( sections );
			} );
		} );
	}

	/**
	 * Replaces the contents of the given element with the given HTML
	 *
	 * @param {string} elementId
	 * @param {string} html
	 */
	reloadPartialHTML( elementId, html ) {
		const htmlElement = this.document.getElementById( elementId );
		if ( htmlElement ) {
			htmlElement.innerHTML = html;
		}
	}

	/**
	 * Generates the HTML for the table of contents.
	 *
	 * @param {Section[]} sections
	 * @return {string}
	 */
	getTableOfContentsHTML( sections ) {
		return this.getTableOfContentsListHtml( this.getTableOfContentsData( sections ) );
	}

	/**
	 * Generates the table of contents List HTML from the templates
	 *
	 * @param {Object} data
	 * @return {string}
	 */
	getTableOfContentsListHtml( data ) {
		const mustacheCompiler = this.mw.template.getCompiler( 'mustache' );
		const compiledTemplateTocContents = mustacheCompiler.compile( templateTocContents );

		// Identifier 'TableOfContents__line' is not in camel case
		// (template name is 'TableOfContents__line')
		const partials = {
			// eslint-disable-next-line camelcase
			TableOfContents__line: mustacheCompiler.compile( templateTocLine )
		};

		return compiledTemplateTocContents.render( data, partials ).html();
	}

	/**
	 * @param {Section[]} sections
	 * @return {SectionsListData}
	 */
	getTableOfContentsData( sections ) {
		const tableOfContentsLevel1Sections = getTableOfContentsSectionsData( sections, 1 );
		return {
			'array-sections': tableOfContentsLevel1Sections,
			'citizen-is-collapse-sections-enabled': tableOfContentsLevel1Sections.length > 3 && sections.length >= tableOfContentsConfig.CitizenTableOfContentsCollapseAtCount
		};
	}

	/**
	 * Cleans up the hash change event listener to prevent memory leaks. This
	 * should be called when the table of contents is permanently no longer
	 * needed.
	 */
	unmount() {
		this.unbindHashChangeListener();
		if ( this.handleResize ) {
			this.window.removeEventListener( 'resize', this.handleResize );
		}
		if ( this.reducedMotionQuery && this.handleReducedMotionChange ) {
			this.reducedMotionQuery.removeEventListener( 'change', this.handleReducedMotionChange );
		}
	}

}

TableOfContents.ACTIVE_SECTION_CLASS = ACTIVE_SECTION_CLASS;
TableOfContents.ACTIVE_TOP_SECTION_CLASS = ACTIVE_TOP_SECTION_CLASS;
TableOfContents.EXPANDED_SECTION_CLASS = EXPANDED_SECTION_CLASS;
TableOfContents.LINK_CLASS = LINK_CLASS;
TableOfContents.TOGGLE_CLASS = TOGGLE_CLASS;
TableOfContents.INDICATOR_CLASS = INDICATOR_CLASS;

module.exports = { TableOfContents };
