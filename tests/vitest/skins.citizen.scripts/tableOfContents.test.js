// @vitest-environment jsdom
/* global document */

const fs = require( 'fs' );
const path = require( 'path' );
const Mustache = require( 'mustache' );

// deferUntilFrame — execute callback immediately in tests
vi.mock( '../../../resources/skins.citizen.scripts/deferUntilFrame.js', () => ( {
	default: ( fn ) => fn()
} ) );
// tableOfContentsSections — not under test, stub out
vi.mock( '../../../resources/skins.citizen.scripts/tableOfContentsSections.js', () => ( {
	getTableOfContentsSectionsData: vi.fn( () => [] )
} ) );

const { TableOfContents } = require( '../../../resources/skins.citizen.scripts/tableOfContents.js' );

const TEMPLATES_DIR = path.resolve( __dirname, '../../../templates' );
const listTemplate = fs.readFileSync(
	path.join( TEMPLATES_DIR, 'TableOfContents__list.mustache' ), 'utf8'
);
const lineTemplate = fs.readFileSync(
	path.join( TEMPLATES_DIR, 'TableOfContents__line.mustache' ), 'utf8'
);

/**
 * Template data matching the shape produced by CitizenComponentTableOfContents.
 *
 * Structure:
 *   section1 (top-level parent, toclevel 1)
 *     section1a (child, toclevel 2)
 *   section2 (top-level parent, toclevel 1, no children)
 *   section3 (top-level parent, toclevel 1, no children)
 */
const tocTemplateData = {
	'array-sections': [
		{
			anchor: 'section1',
			linkAnchor: 'section1',
			toclevel: 1,
			number: '1',
			line: 'Section One',
			'is-top-level-section': true,
			'is-parent-section': true,
			'citizen-button-label': 'Toggle Section One subsection',
			'array-sections': [
				{
					anchor: 'section1a',
					linkAnchor: 'section1a',
					toclevel: 2,
					number: '1.1',
					line: 'Section One A',
					'is-top-level-section': false,
					'is-parent-section': false,
					'array-sections': []
				}
			]
		},
		{
			anchor: 'section2',
			linkAnchor: 'section2',
			toclevel: 1,
			number: '2',
			line: 'Section Two',
			'is-top-level-section': true,
			'is-parent-section': true,
			'citizen-button-label': 'Toggle Section Two subsection',
			'array-sections': []
		},
		{
			anchor: 'section3',
			linkAnchor: 'section3',
			toclevel: 1,
			number: '3',
			line: 'Section Three',
			'is-top-level-section': true,
			'is-parent-section': true,
			'citizen-button-label': 'Toggle Section Three subsection',
			'array-sections': []
		}
	]
};

/**
 * Render a ToC DOM from real Mustache templates using template data that
 * mirrors the shape produced by CitizenComponentTableOfContents::getTemplateData().
 *
 * @param {Object} [data] Template data override; defaults to tocTemplateData.
 * @return {{ container: HTMLElement }}
 */
function renderTocDom( data ) {
	const html = Mustache.render( listTemplate, data || tocTemplateData, {
		TableOfContents__line: lineTemplate
	} );

	const wrapper = document.createElement( 'div' );
	wrapper.innerHTML = html;
	const container = wrapper.firstElementChild;

	document.body.appendChild( container );

	return { container };
}

/**
 * Create a mock matchMedia that supports addEventListener.
 *
 * @param {boolean} [matches] Whether the query matches.
 * @return {Function} matchMedia mock.
 */
function createMockMatchMedia( matches = false ) {
	return vi.fn( () => ( {
		matches,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	} ) );
}

/**
 * Create a TableOfContents instance with sensible defaults.
 *
 * @param {HTMLElement} container
 * @param {Object} [overrides]
 * @return {TableOfContents}
 */
function createToc( container, overrides = {} ) {
	return new TableOfContents( {
		container,
		onHeadingClick: vi.fn(),
		onHashChange: vi.fn(),
		onToggleClick: vi.fn(),
		onTogglePinned: vi.fn(),
		window: {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			location: { hash: '' },
			matchMedia: createMockMatchMedia(),
			innerHeight: 800,
			requestAnimationFrame: ( cb ) => cb()
		},
		document,
		mw: {
			util: {
				getTargetFromFragment: vi.fn( () => null ),
				debounce: ( fn ) => fn
			}
		},
		...overrides
	} );
}

afterEach( () => {
	vi.restoreAllMocks();
	document.body.innerHTML = '';
} );

describe( 'TableOfContents', () => {
	describe( 'activateSection', () => {
		it( 'should add active classes to subsection and its top-level ancestor', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-section1a' );

			const sub = document.getElementById( 'toc-section1a' );
			const top = document.getElementById( 'toc-section1' );
			expect( sub.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( true );
			expect( top.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( true );
			expect( top.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
		} );

		it( 'should not re-add classes when activating the same section', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-section1a' );
			const snapshot = new Set( toc.activeIds );

			toc.activateSection( 'toc-section1a' );

			expect( new Set( toc.activeIds ) ).toEqual( snapshot );
		} );

		it( 'should no-op when given a non-existent id', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-does-not-exist' );

			expect( toc.activeIds.size ).toBe( 0 );
		} );
	} );

	describe( 'deactivateSections', () => {
		it( 'should remove active classes and reset state', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-section1a' );
			toc.deactivateSections();

			const sub = document.getElementById( 'toc-section1a' );
			const top = document.getElementById( 'toc-section1' );
			expect( sub.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( false );
			expect( top.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( false );
			expect( toc.activeIds.size ).toBe( 0 );
		} );
	} );

	describe( 'expandSection / collapseSections', () => {
		it( 'should add expanded class and set aria-expanded on expand', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.expandSection( 'toc-section2' );

			const section = document.getElementById( 'toc-section2' );
			const toggle = section.querySelector( '.citizen-toc-toggle' );
			expect( section.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		} );

		it( 'should remove expanded class and set aria-expanded false on collapse', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.expandSection( 'toc-section2' );
			toc.collapseSections( [ 'toc-section2' ] );

			const section = document.getElementById( 'toc-section2' );
			const toggle = section.querySelector( '.citizen-toc-toggle' );
			expect( section.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( false );
			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		} );

		it( 'should not duplicate entries when expanding the same section twice', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.expandSection( 'toc-section2' );
			toc.expandSection( 'toc-section2' );

			expect( toc.getExpandedSectionIds().filter( ( id ) => id === 'toc-section2' ).length ).toBe( 1 );
		} );
	} );

	describe( 'toggleExpandSection', () => {
		it( 'should collapse an expanded top-level section', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.expandSection( 'toc-section2' );
			toc.toggleExpandSection( 'toc-section2' );

			const section = document.getElementById( 'toc-section2' );
			expect( section.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( false );
		} );

		it( 'should expand a collapsed top-level section', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.toggleExpandSection( 'toc-section1' );

			const section = document.getElementById( 'toc-section1' );
			expect( section.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
		} );

		it( 'should no-op for a non-top-level section', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			const before = toc.getExpandedSectionIds().length;
			toc.toggleExpandSection( 'toc-section1a' );

			expect( toc.getExpandedSectionIds().length ).toBe( before );
		} );
	} );

	describe( 'scrollToActiveSection', () => {
		it( 'should call scrollTo when link is above visible area', () => {
			const { container } = renderTocDom();
			const scrollToMock = vi.fn();

			// Make the container appear scrollable
			Object.defineProperty( container, 'scrollHeight', { value: 1000 } );
			Object.defineProperty( container, 'clientHeight', { value: 200 } );
			Object.defineProperty( container, 'scrollTop', { value: 500 } );
			container.scrollTo = scrollToMock;
			container.getBoundingClientRect = vi.fn( () => ( {
				top: 0, bottom: 200, left: 0, right: 100
			} ) );

			// Make the link appear above the container
			const link = document.querySelector( '#toc-section2 .citizen-toc-link' );
			Object.defineProperty( link, 'offsetParent', { value: container } );
			link.getBoundingClientRect = vi.fn( () => ( {
				top: -200, bottom: -180, left: 0, right: 100
			} ) );

			const toc = createToc( container );

			toc.scrollToActiveSection( 'toc-section2' );

			expect( scrollToMock ).toHaveBeenCalledWith( {
				top: expect.any( Number ),
				behavior: 'smooth'
			} );
		} );

		it( 'should use undefined scroll behavior when prefers-reduced-motion', () => {
			const { container } = renderTocDom();
			const scrollToMock = vi.fn();

			Object.defineProperty( container, 'scrollHeight', { value: 1000 } );
			Object.defineProperty( container, 'clientHeight', { value: 200 } );
			Object.defineProperty( container, 'scrollTop', { value: 500 } );
			container.scrollTo = scrollToMock;
			container.getBoundingClientRect = vi.fn( () => ( {
				top: 0, bottom: 200, left: 0, right: 100
			} ) );

			const link = document.querySelector( '#toc-section2 .citizen-toc-link' );
			Object.defineProperty( link, 'offsetParent', { value: container } );
			link.getBoundingClientRect = vi.fn( () => ( {
				top: -200, bottom: -180, left: 0, right: 100
			} ) );

			const win = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				location: { hash: '' },
				matchMedia: createMockMatchMedia( true ),
				innerHeight: 800,
				requestAnimationFrame: ( cb ) => cb()
			};

			const toc = createToc( container, { window: win } );

			toc.scrollToActiveSection( 'toc-section2' );

			expect( scrollToMock ).toHaveBeenCalledWith( {
				top: expect.any( Number ),
				behavior: undefined
			} );
		} );

		it( 'should fall back to parent link when subsection link is hidden', () => {
			const { container } = renderTocDom();
			const scrollToMock = vi.fn();

			Object.defineProperty( container, 'scrollHeight', { value: 1000 } );
			Object.defineProperty( container, 'clientHeight', { value: 200 } );
			Object.defineProperty( container, 'scrollTop', { value: 500 } );
			container.scrollTo = scrollToMock;
			container.getBoundingClientRect = vi.fn( () => ( {
				top: 0, bottom: 200, left: 0, right: 100
			} ) );

			// Subsection link is hidden (offsetParent = null)
			const subLink = document.querySelector( '#toc-section1a .citizen-toc-link' );
			Object.defineProperty( subLink, 'offsetParent', { value: null } );

			// Parent link is visible
			const parentLink = document.querySelector( '#toc-section1 > .citizen-toc-link' );
			Object.defineProperty( parentLink, 'offsetParent', { value: container } );
			parentLink.getBoundingClientRect = vi.fn( () => ( {
				top: -200, bottom: -180, left: 0, right: 100
			} ) );

			const toc = createToc( container );

			// Activate the parent first so getActiveSectionIds().parent returns it
			toc.activateSection( 'toc-section1a' );
			toc.scrollToActiveSection( 'toc-section1a' );

			expect( scrollToMock ).toHaveBeenCalled();
		} );
	} );

	describe( 'changeActiveSection', () => {
		it( 'should deactivate old section and activate new section', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-section1' );
			toc.changeActiveSection( 'toc-section2' );

			const section1 = document.getElementById( 'toc-section1' );
			const section2 = document.getElementById( 'toc-section2' );
			expect( section1.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( false );
			expect( section2.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( true );
		} );

		it( 'should no-op when same ids provided', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			// Activate a top-level section
			toc.changeActiveSections( [ 'toc-section1' ] );
			const spy = vi.spyOn( toc, 'deactivateAllSections' );

			toc.changeActiveSection( 'toc-section1' );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'changeActiveSections', () => {
		it( 'should activate multiple sections with active class', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.changeActiveSections( [ 'toc-section1', 'toc-section2' ] );

			const section1 = document.getElementById( 'toc-section1' );
			const section2 = document.getElementById( 'toc-section2' );
			expect( section1.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( true );
			expect( section2.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( true );
			expect( section1.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( true );
			expect( section2.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( true );
		} );

		it( 'should deactivate previous sections when new set provided', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.changeActiveSections( [ 'toc-section1' ] );
			toc.changeActiveSections( [ 'toc-section2', 'toc-section3' ] );

			const section1 = document.getElementById( 'toc-section1' );
			const section2 = document.getElementById( 'toc-section2' );
			const section3 = document.getElementById( 'toc-section3' );
			expect( section1.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( false );
			expect( section2.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( true );
			expect( section3.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( true );
		} );

		it( 'should expand parent for active subsections', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.changeActiveSections( [ 'toc-section1a' ] );

			const topSection = document.getElementById( 'toc-section1' );
			expect( topSection.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
		} );

		it( 'should no-op when same set provided', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.changeActiveSections( [ 'toc-section1', 'toc-section2' ] );
			const spy = vi.spyOn( toc, 'deactivateAllSections' );

			toc.changeActiveSections( [ 'toc-section1', 'toc-section2' ] );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'updateIndicatorBar', () => {
		it( 'should set transform custom properties when sections active', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			// Mock offsetParent on indicator to be the container (positioning context)
			Object.defineProperty( toc.indicatorBar, 'offsetParent', { value: container } );
			container.getBoundingClientRect = vi.fn( () => ( {
				top: 100, bottom: 500, left: 0, right: 200
			} ) );
			Object.defineProperty( container, 'scrollTop', { value: 0, writable: true } );

			const link1 = document.querySelector( '#toc-section1 > .citizen-toc-link' );
			const link2 = document.querySelector( '#toc-section2 > .citizen-toc-link' );
			Object.defineProperty( link1, 'offsetParent', { value: container } );
			Object.defineProperty( link2, 'offsetParent', { value: container } );
			link1.getBoundingClientRect = vi.fn( () => ( {
				top: 110, bottom: 130, height: 20, left: 0, right: 200
			} ) );
			link2.getBoundingClientRect = vi.fn( () => ( {
				top: 140, bottom: 160, height: 20, left: 0, right: 200
			} ) );

			toc.changeActiveSections( [ 'toc-section1', 'toc-section2' ] );

			expect( toc.indicatorBar.style.getPropertyValue( '--indicator-top' ) ).toBe( '10px' );
			// Unit height is first link height (20px), total span is 50px, scale = 50/20 = 2.5
			expect( toc.indicatorBar.style.getPropertyValue( '--indicator-scale' ) ).toBe( '2.5' );
		} );

		it( 'should set scale to 0 when no sections active', () => {
			const { container } = renderTocDom();
			const toc = createToc( container );

			toc.updateIndicatorBar();

			expect( toc.indicatorBar.style.getPropertyValue( '--indicator-scale' ) ).toBe( '0' );
		} );
	} );

	describe( 'handleHashChange', () => {
		it( 'should expand and activate section matching the hash', () => {
			const { container } = renderTocDom();
			const onHashChange = vi.fn();
			const listItem = document.getElementById( 'toc-section2' );

			const mw = {
				util: {
					getTargetFromFragment: vi.fn( () => listItem ),
					debounce: ( fn ) => fn
				}
			};
			const win = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				location: { hash: '#section2' },
				matchMedia: createMockMatchMedia(),
				innerHeight: 800,
				requestAnimationFrame: ( cb ) => cb()
			};

			const toc = createToc( container, { window: win, mw, onHashChange } );

			toc.handleHashChange();

			expect( mw.util.getTargetFromFragment ).toHaveBeenCalledWith( 'toc-section2' );
			expect( listItem.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
			expect( onHashChange ).toHaveBeenCalledWith( 'toc-section2' );
		} );

		it( 'should no-op when hash does not match any section', () => {
			const { container } = renderTocDom();
			const onHashChange = vi.fn();

			const mw = {
				util: {
					getTargetFromFragment: vi.fn( () => null ),
					debounce: ( fn ) => fn
				}
			};
			const win = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				location: { hash: '#unknown' },
				matchMedia: createMockMatchMedia(),
				innerHeight: 800,
				requestAnimationFrame: ( cb ) => cb()
			};

			const toc = createToc( container, { window: win, mw, onHashChange } );

			toc.handleHashChange();

			expect( onHashChange ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'unmount', () => {
		it( 'should remove hashchange and resize event listeners from window', () => {
			const { container } = renderTocDom();
			const win = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				location: { hash: '' },
				matchMedia: createMockMatchMedia(),
				innerHeight: 800,
				requestAnimationFrame: ( cb ) => cb()
			};

			const toc = createToc( container, { window: win } );

			toc.unmount();

			expect( win.removeEventListener ).toHaveBeenCalledWith(
				'hashchange',
				expect.any( Function )
			);
			expect( win.removeEventListener ).toHaveBeenCalledWith(
				'resize',
				expect.any( Function )
			);
		} );
	} );
} );
