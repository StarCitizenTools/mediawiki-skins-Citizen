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

const SECTION_ID_PREFIX = 'toc-';
const SECTION_CLASS = 'citizen-toc-list-item';
const ACTIVE_SECTION_CLASS = 'citizen-toc-list-item--active';
const EXPANDED_SECTION_CLASS = 'citizen-toc-list-item--expanded';
const TOP_SECTION_CLASS = 'citizen-toc-level-1';
const ACTIVE_TOP_SECTION_CLASS = 'citizen-toc-level-1--active';
const LINK_CLASS = 'citizen-toc-link';
const TOGGLE_CLASS = 'citizen-toc-toggle';
const TOC_CONTENTS_ID = 'mw-panel-toc-list';

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
		/** @type {HTMLElement | undefined} */
		this.activeTopSection = undefined;
		/** @type {HTMLElement | undefined} */
		this.activeSubSection = undefined;
		/** @type {Array<HTMLElement>} */
		this.expandedSections = [];
		this.handleHashChange = this.handleHashChange.bind( this );

		this.initialize();
	}

	/**
	 * Get the ids of the active sections.
	 *
	 * @return {activeSectionIds}
	 */
	getActiveSectionIds() {
		return {
			parent: ( this.activeTopSection ) ? this.activeTopSection.id : undefined,
			child: ( this.activeSubSection ) ? this.activeSubSection.id : undefined
		};
	}

	/**
	 * Does the user prefer reduced motion?
	 *
	 * @return {boolean}
	 */
	prefersReducedMotion() {
		return window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
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
		const selectedTocSection = document.getElementById( id );
		const {
			parent: previousActiveTopId,
			child: previousActiveSubSectionId
		} = this.getActiveSectionIds();

		if (
			!selectedTocSection ||
			( previousActiveTopId === id ) ||
			( previousActiveSubSectionId === id )
		) {
			return;
		}

		// Assign the active top and sub sections, apply classes
		this.activeTopSection = /** @type {HTMLElement|undefined} */ ( selectedTocSection.closest( `.${ TOP_SECTION_CLASS }` ) );
		if ( this.activeTopSection ) {
			// T328089 Sometimes activeTopSection is null
			this.activeTopSection.classList.add( ACTIVE_TOP_SECTION_CLASS, EXPANDED_SECTION_CLASS );
		}
		this.activeSubSection = selectedTocSection;
		this.activeSubSection.classList.add( ACTIVE_SECTION_CLASS );
	}

	/**
	 * Removes the `ACTIVE_SECTION_CLASS` from all ToC sections.
	 */
	deactivateSections() {
		if ( this.activeSubSection ) {
			this.activeSubSection.classList.remove( ACTIVE_SECTION_CLASS );
			this.activeSubSection = undefined;
		}
		if ( this.activeTopSection ) {
			this.activeTopSection.classList.remove(
				ACTIVE_TOP_SECTION_CLASS,
				EXPANDED_SECTION_CLASS
			);
			this.activeTopSection = undefined;
		}
	}

	/**
	 * Scroll active section into view if necessary
	 *
	 * @param {string} id The id of the element to be scrolled to in the Table of Contents.
	 */
	scrollToActiveSection( id ) {
		const section = document.getElementById( id );
		if ( !section ) {
			return;
		}

		// Get currently visible active link
		let link = /** @type {HTMLElement|null} */( section.firstElementChild );
		if ( link && !link.offsetParent ) {
			// If active link is a hidden subsection, use active parent link
			const { parent: activeTopId } = this.getActiveSectionIds();
			const parentSection = document.getElementById( activeTopId || '' );
			if ( parentSection ) {
				link = /** @type {HTMLElement|null} */( parentSection.firstElementChild );
			} else {
				link = null;
			}
		}

		const isContainerScrollable = this.props.container.scrollHeight >
			this.props.container.clientHeight;
		if ( link && isContainerScrollable ) {
			const containerRect = this.props.container.getBoundingClientRect();
			const linkRect = link.getBoundingClientRect();

			// Pixels above or below the TOC where we start scrolling the active section into view
			const hiddenThreshold = 100;
			const midpoint = ( containerRect.bottom - containerRect.top ) / 2;
			const linkHiddenTopValue = containerRect.top - linkRect.top;
			// Because the bottom of the TOC can extend below the viewport,
			// min() is used to find the value where the active section first becomes hidden
			const linkHiddenBottomValue = linkRect.bottom -
				Math.min( containerRect.bottom, window.innerHeight );

			// Respect 'prefers-reduced-motion' user preference
			const scrollBehavior = this.prefersReducedMotion() ? undefined : 'smooth';

			// Manually increment and decrement TOC scroll rather than using scrollToView
			// in order to account for threshold
			if ( linkHiddenTopValue + hiddenThreshold > 0 ) {
				this.props.container.scrollTo( {
					top: this.props.container.scrollTop - linkHiddenTopValue - midpoint,
					behavior: scrollBehavior
				} );
			}
			if ( linkHiddenBottomValue + hiddenThreshold > 0 ) {
				this.props.container.scrollTo( {
					top: this.props.container.scrollTop + linkHiddenBottomValue + midpoint,
					behavior: scrollBehavior
				} );
			}
		}
	}

	/**
	 * Adds the `EXPANDED_SECTION_CLASS` CSS class name
	 * to a top level heading in the ToC.
	 *
	 * @param {string} id
	 */
	expandSection( id ) {
		const tocSection = document.getElementById( id );

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

		const { parent: activeParentId, child: activeChildId } = this.getActiveSectionIds();

		if ( id === activeParentId && id === activeChildId ) {
			return;
		} else {
			this.deactivateSections();
			this.activateSection( id );
			this.scrollToActiveSection( id );
		}
	}

	/**
	 * @param {string} id
	 * @return {boolean}
	 */
	isTopLevelSection( id ) {
		const section = document.getElementById( id );
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
		const hash = location.hash.slice( 1 );
		const listItem = mw.util.getTargetFromFragment( `${ SECTION_ID_PREFIX }${ hash }` );

		if ( !listItem ) {
			return;
		}

		this.expandSection( listItem.id );
		this.changeActiveSection( listItem.id );

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
		window.addEventListener( 'hashchange', this.handleHashChange );
	}

	/**
	 * Unbinds event listener for hash change events.
	 */
	unbindHashChangeListener() {
		window.removeEventListener( 'hashchange', this.handleHashChange );
	}

	/**
	 * Bind event listener for clicking on show/hide Table of Contents links.
	 */
	bindPinnedToggleListeners() {
		if ( !this.props.onTogglePinned ) {
			return;
		}

		document.querySelectorAll( '.citizen-toc-pinnable-header button' ).forEach( ( btn ) => {
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
					this.changeActiveSection( tocSection.id );
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
	 * Binds event listeners and sets the default state of the component.
	 */
	initialize() {
		// Sync component state to the default rendered state of the table of contents.
		this.expandedSections = Array.from(
			this.props.container.querySelectorAll( `.${ EXPANDED_SECTION_CLASS }` )
		);

		// Initialize toggle buttons aria-expanded attribute.
		this.initializeExpandedStatus();

		// Bind event listeners.
		this.bindSubsectionToggleListeners();
		this.bindPinnedToggleListeners();
		this.bindHashChangeListener();
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
		const load = () => mw.loader.using( 'mediawiki.template.mustache' ).then( () => {
			const { parent: activeParentId, child: activeChildId } = this.getActiveSectionIds();
			this.reloadPartialHTML( TOC_CONTENTS_ID, this.getTableOfContentsHTML( sections ) );
			// Reexpand sections that were expanded before the table of contents was reloaded.
			this.reExpandSections();
			// reActivate the active sections
			this.deactivateSections();
			if ( activeParentId ) {
				this.activateSection( activeParentId );
			}
			if ( activeChildId ) {
				this.activateSection( activeChildId );
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
		const htmlElement = document.getElementById( elementId );
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
		const mustacheCompiler = mw.template.getCompiler( 'mustache' );
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
		const tableOfContentsLevel1Sections = this.getTableOfContentsSectionsData( sections, 1 );
		return {
			'array-sections': tableOfContentsLevel1Sections,
			'citizen-is-collapse-sections-enabled': tableOfContentsLevel1Sections.length > 3 && sections.length >= tableOfContentsConfig.CitizenTableOfContentsCollapseAtCount
		};
	}

	/**
	 * Prepares the data for rendering the table of contents,
	 * nesting child sections within their parent sections.
	 * This should yield the same result as the php function
	 * CitizenComponentTableOfContents::getTemplateData(),
	 * please make sure to keep them in sync.
	 *
	 * TODO: CitizenComponentTableOfContents is not implemented as we need to support MW 1.39
	 *
	 * @param {Section[]} sections
	 * @param {number} toclevel
	 * @return {Section[]}
	 */
	getTableOfContentsSectionsData( sections, toclevel = 1 ) {
		const data = [];
		for ( let i = 0; i < sections.length; i++ ) {
			const section = sections[ i ];
			if ( section.toclevel === toclevel ) {
				const childSections = this.getTableOfContentsSectionsData(
					sections.slice( i + 1 ),
					toclevel + 1
				);
				section[ 'array-sections' ] = childSections;
				section[ 'is-top-level-section' ] = toclevel === 1;
				section[ 'is-parent-section' ] = childSections.length > 0;
				data.push( section );
			}
			// Child section belongs to a higher parent.
			if ( section.toclevel < toclevel ) {
				return data;
			}
		}

		return data;
	}

	/**
	 * Cleans up the hash change event listener to prevent memory leaks. This
	 * should be called when the table of contents is permanently no longer
	 * needed.
	 */
	unmount() {
		this.unbindHashChangeListener();
	}

}

TableOfContents.ACTIVE_SECTION_CLASS = ACTIVE_SECTION_CLASS;
TableOfContents.ACTIVE_TOP_SECTION_CLASS = ACTIVE_TOP_SECTION_CLASS;
TableOfContents.EXPANDED_SECTION_CLASS = EXPANDED_SECTION_CLASS;
TableOfContents.LINK_CLASS = LINK_CLASS;
TableOfContents.TOGGLE_CLASS = TOGGLE_CLASS;

module.exports = TableOfContents;
