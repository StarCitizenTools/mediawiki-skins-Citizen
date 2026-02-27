// @vitest-environment jsdom
/* global document */

// deferUntilFrame — execute callback immediately in tests
vi.mock( '../../../resources/skins.citizen.scripts/deferUntilFrame.js', () => ( {
	default: ( fn ) => fn()
} ) );
// tableOfContentsSections — not under test, stub out
vi.mock( '../../../resources/skins.citizen.scripts/tableOfContentsSections.js', () => ( {
	getTableOfContentsSectionsData: vi.fn( () => [] )
} ) );

const { TableOfContents } = require( '../../../resources/skins.citizen.scripts/tableOfContents.js' );

/**
 * Build a minimal ToC DOM structure with top-level and nested sections.
 *
 * Structure:
 *   container
 *     #toc-section1.citizen-toc-list-item.citizen-toc-level-1
 *       a.citizen-toc-link
 *       button.citizen-toc-toggle
 *       ul
 *         #toc-section1a.citizen-toc-list-item
 *           a.citizen-toc-link
 *     #toc-section2.citizen-toc-list-item.citizen-toc-level-1
 *       a.citizen-toc-link
 *       button.citizen-toc-toggle
 *
 * @return {{ container: HTMLElement }}
 */
function buildTocDom() {
	const container = document.createElement( 'div' );

	// Section 1 — top level with a subsection
	const section1 = document.createElement( 'li' );
	section1.id = 'toc-section1';
	section1.classList.add( 'citizen-toc-list-item', 'citizen-toc-level-1' );

	const link1 = document.createElement( 'a' );
	link1.classList.add( 'citizen-toc-link' );
	section1.appendChild( link1 );

	const toggle1 = document.createElement( 'button' );
	toggle1.classList.add( 'citizen-toc-toggle' );
	section1.appendChild( toggle1 );

	const subList = document.createElement( 'ul' );
	const section1a = document.createElement( 'li' );
	section1a.id = 'toc-section1a';
	section1a.classList.add( 'citizen-toc-list-item' );

	const link1a = document.createElement( 'a' );
	link1a.classList.add( 'citizen-toc-link' );
	section1a.appendChild( link1a );

	subList.appendChild( section1a );
	section1.appendChild( subList );

	// Section 2 — top level, no subsections
	const section2 = document.createElement( 'li' );
	section2.id = 'toc-section2';
	section2.classList.add( 'citizen-toc-list-item', 'citizen-toc-level-1' );

	const link2 = document.createElement( 'a' );
	link2.classList.add( 'citizen-toc-link' );
	section2.appendChild( link2 );

	const toggle2 = document.createElement( 'button' );
	toggle2.classList.add( 'citizen-toc-toggle' );
	section2.appendChild( toggle2 );

	container.appendChild( section1 );
	container.appendChild( section2 );

	// Attach to document so getElementById works
	document.body.appendChild( container );

	return { container };
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
			matchMedia: vi.fn( () => ( { matches: false } ) ),
			innerHeight: 800
		},
		document,
		mw: {
			util: {
				getTargetFromFragment: vi.fn( () => null )
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
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-section1a' );

			const sub = document.getElementById( 'toc-section1a' );
			const top = document.getElementById( 'toc-section1' );
			expect( sub.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( true );
			expect( top.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( true );
			expect( top.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
		} );

		it( 'should not re-add classes when activating the same section', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-section1a' );
			const firstActiveTop = toc.activeTopSection;
			const firstActiveSub = toc.activeSubSection;

			toc.activateSection( 'toc-section1a' );

			expect( toc.activeTopSection ).toBe( firstActiveTop );
			expect( toc.activeSubSection ).toBe( firstActiveSub );
		} );

		it( 'should no-op when given a non-existent id', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-does-not-exist' );

			expect( toc.activeTopSection ).toBeUndefined();
			expect( toc.activeSubSection ).toBeUndefined();
		} );
	} );

	describe( 'deactivateSections', () => {
		it( 'should remove active classes and reset state', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-section1a' );
			toc.deactivateSections();

			const sub = document.getElementById( 'toc-section1a' );
			const top = document.getElementById( 'toc-section1' );
			expect( sub.classList.contains( 'citizen-toc-list-item--active' ) ).toBe( false );
			expect( top.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( false );
			expect( toc.activeTopSection ).toBeUndefined();
			expect( toc.activeSubSection ).toBeUndefined();
		} );
	} );

	describe( 'expandSection / collapseSections', () => {
		it( 'should add expanded class and set aria-expanded on expand', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.expandSection( 'toc-section2' );

			const section = document.getElementById( 'toc-section2' );
			const toggle = section.querySelector( '.citizen-toc-toggle' );
			expect( section.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'true' );
		} );

		it( 'should remove expanded class and set aria-expanded false on collapse', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.expandSection( 'toc-section2' );
			toc.collapseSections( [ 'toc-section2' ] );

			const section = document.getElementById( 'toc-section2' );
			const toggle = section.querySelector( '.citizen-toc-toggle' );
			expect( section.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( false );
			expect( toggle.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
		} );

		it( 'should not duplicate entries when expanding the same section twice', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.expandSection( 'toc-section2' );
			toc.expandSection( 'toc-section2' );

			expect( toc.getExpandedSectionIds().filter( ( id ) => id === 'toc-section2' ).length ).toBe( 1 );
		} );
	} );

	describe( 'toggleExpandSection', () => {
		it( 'should collapse an expanded top-level section', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.expandSection( 'toc-section2' );
			toc.toggleExpandSection( 'toc-section2' );

			const section = document.getElementById( 'toc-section2' );
			expect( section.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( false );
		} );

		it( 'should expand a collapsed top-level section', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.toggleExpandSection( 'toc-section1' );

			const section = document.getElementById( 'toc-section1' );
			expect( section.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
		} );

		it( 'should no-op for a non-top-level section', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			const before = toc.getExpandedSectionIds().length;
			toc.toggleExpandSection( 'toc-section1a' );

			expect( toc.getExpandedSectionIds().length ).toBe( before );
		} );
	} );

	describe( 'scrollToActiveSection', () => {
		it( 'should call scrollTo when link is above visible area', () => {
			const { container } = buildTocDom();
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
			const { container } = buildTocDom();
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
				matchMedia: vi.fn( () => ( { matches: true } ) ),
				innerHeight: 800
			};

			const toc = createToc( container, { window: win } );

			toc.scrollToActiveSection( 'toc-section2' );

			expect( scrollToMock ).toHaveBeenCalledWith( {
				top: expect.any( Number ),
				behavior: undefined
			} );
		} );

		it( 'should fall back to parent link when subsection link is hidden', () => {
			const { container } = buildTocDom();
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
			const { container } = buildTocDom();
			const toc = createToc( container );

			toc.activateSection( 'toc-section1' );
			toc.changeActiveSection( 'toc-section2' );

			const section1 = document.getElementById( 'toc-section1' );
			const section2 = document.getElementById( 'toc-section2' );
			expect( section1.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( false );
			expect( section2.classList.contains( 'citizen-toc-level-1--active' ) ).toBe( true );
		} );

		it( 'should no-op when parent and child ids both match', () => {
			const { container } = buildTocDom();
			const toc = createToc( container );

			// Activate a top-level section (parent === child === the same id)
			toc.activateSection( 'toc-section1' );
			const spy = vi.spyOn( toc, 'deactivateSections' );

			toc.changeActiveSection( 'toc-section1' );

			expect( spy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'handleHashChange', () => {
		it( 'should expand and activate section matching the hash', () => {
			const { container } = buildTocDom();
			const onHashChange = vi.fn();
			const listItem = document.getElementById( 'toc-section2' );

			const mw = {
				util: {
					getTargetFromFragment: vi.fn( () => listItem )
				}
			};
			const win = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				location: { hash: '#section2' },
				matchMedia: vi.fn( () => ( { matches: false } ) ),
				innerHeight: 800
			};

			const toc = createToc( container, { window: win, mw, onHashChange } );

			toc.handleHashChange();

			expect( mw.util.getTargetFromFragment ).toHaveBeenCalledWith( 'toc-section2' );
			expect( listItem.classList.contains( 'citizen-toc-list-item--expanded' ) ).toBe( true );
			expect( onHashChange ).toHaveBeenCalledWith( 'toc-section2' );
		} );

		it( 'should no-op when hash does not match any section', () => {
			const { container } = buildTocDom();
			const onHashChange = vi.fn();

			const mw = {
				util: {
					getTargetFromFragment: vi.fn( () => null )
				}
			};
			const win = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				location: { hash: '#unknown' },
				matchMedia: vi.fn( () => ( { matches: false } ) ),
				innerHeight: 800
			};

			const toc = createToc( container, { window: win, mw, onHashChange } );

			toc.handleHashChange();

			expect( onHashChange ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'unmount', () => {
		it( 'should remove hashchange event listener from window', () => {
			const { container } = buildTocDom();
			const win = {
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				location: { hash: '' },
				matchMedia: vi.fn( () => ( { matches: false } ) ),
				innerHeight: 800
			};

			const toc = createToc( container, { window: win } );

			toc.unmount();

			expect( win.removeEventListener ).toHaveBeenCalledWith(
				'hashchange',
				expect.any( Function )
			);
		} );
	} );
} );
