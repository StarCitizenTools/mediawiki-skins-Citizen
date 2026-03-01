// @vitest-environment jsdom
/* global document, MouseEvent */

const { StickyHeader } = require( '../../../resources/skins.citizen.scripts/stickyHeader.js' );

/**
 * Build a minimal sticky header DOM with fake buttons and click targets.
 *
 * Structure:
 *   stickyHeader#citizen-sticky-header
 *     button.cdx-button[data-mw-citizen-click-target="#real-target"]
 *       span (label child)
 *     button.cdx-button[data-mw-citizen-click-target="#orphan-target"] (no real target)
 *       span (label child)
 *   #real-target[title="Edit"]
 *     span "Edit page"
 *   #ca-edit-sticky-header
 *     span.citizen-ui-icon.mw-ui-icon-wikimedia-wikiText
 *
 * @return {{ stickyHeader: HTMLElement, realTarget: HTMLElement }}
 */
function buildStickyHeaderDom() {
	const stickyHeader = document.createElement( 'div' );
	stickyHeader.id = 'citizen-sticky-header';

	// Fake button with a valid target
	const fakeButton = document.createElement( 'button' );
	fakeButton.classList.add( 'cdx-button' );
	fakeButton.setAttribute( 'data-mw-citizen-click-target', '#real-target' );
	const fakeLabel = document.createElement( 'span' );
	fakeLabel.textContent = '';
	fakeButton.appendChild( fakeLabel );
	stickyHeader.appendChild( fakeButton );

	// Fake button with no matching target (orphan)
	const orphanButton = document.createElement( 'button' );
	orphanButton.classList.add( 'cdx-button' );
	orphanButton.setAttribute( 'data-mw-citizen-click-target', '#orphan-target' );
	const orphanLabel = document.createElement( 'span' );
	orphanLabel.textContent = '';
	orphanButton.appendChild( orphanLabel );
	stickyHeader.appendChild( orphanButton );

	// Real target element
	const realTarget = document.createElement( 'button' );
	realTarget.id = 'real-target';
	realTarget.setAttribute( 'title', 'Edit' );
	const realLabel = document.createElement( 'span' );
	realLabel.textContent = 'Edit page';
	realTarget.appendChild( realLabel );

	// Source edit button for updateEditIcon tests
	const sourceEditButton = document.createElement( 'div' );
	sourceEditButton.id = 'ca-edit-sticky-header';
	const icon = document.createElement( 'span' );
	icon.classList.add( 'citizen-ui-icon', 'mw-ui-icon-wikimedia-wikiText' );
	sourceEditButton.appendChild( icon );

	document.body.appendChild( stickyHeader );
	document.body.appendChild( realTarget );
	document.body.appendChild( sourceEditButton );

	return { stickyHeader, realTarget };
}

/**
 * Create a StickyHeader instance using real jsdom document.
 *
 * @param {HTMLElement} stickyHeaderElement
 * @return {StickyHeader}
 */
function createStickyHeader( stickyHeaderElement ) {
	return new StickyHeader( {
		stickyHeaderElement,
		document
	} );
}

afterEach( () => {
	vi.restoreAllMocks();
	document.body.innerHTML = '';
	document.body.className = '';
	document.documentElement.style.cssText = '';
} );

describe( 'StickyHeader', () => {
	describe( 'handleClick', () => {
		it( 'should delegate click to real target and call preventDefault + stopPropagation', () => {
			const { stickyHeader, realTarget } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			header.bind();
			const targetClickSpy = vi.fn();
			realTarget.addEventListener( 'click', targetClickSpy );
			const fakeButton = stickyHeader.querySelector( '[data-mw-citizen-click-target="#real-target"]' );
			const event = new MouseEvent( 'click', { bubbles: true } );
			const preventDefaultSpy = vi.spyOn( event, 'preventDefault' );
			const stopPropagationSpy = vi.spyOn( event, 'stopPropagation' );

			fakeButton.dispatchEvent( event );

			expect( preventDefaultSpy ).toHaveBeenCalled();
			expect( stopPropagationSpy ).toHaveBeenCalled();
			expect( targetClickSpy ).toHaveBeenCalled();
		} );

		it( 'should do nothing when clicked element has no data-mw-citizen-click-target', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			header.bind();
			const plainButton = document.createElement( 'button' );
			plainButton.classList.add( 'cdx-button' );
			stickyHeader.appendChild( plainButton );
			const event = new MouseEvent( 'click', { bubbles: true } );
			const preventDefaultSpy = vi.spyOn( event, 'preventDefault' );

			plainButton.dispatchEvent( event );

			expect( preventDefaultSpy ).not.toHaveBeenCalled();
		} );

		it( 'should do nothing when click target selector matches no element', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			header.bind();
			const orphanButton = stickyHeader.querySelector( '[data-mw-citizen-click-target="#orphan-target"]' );
			const event = new MouseEvent( 'click', { bubbles: true } );
			const preventDefaultSpy = vi.spyOn( event, 'preventDefault' );

			orphanButton.dispatchEvent( event );

			expect( preventDefaultSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'show', () => {
		it( 'should add visible class and set CSS variable', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );

			header.show();

			expect( document.body.classList.contains( 'citizen-sticky-header-visible' ) ).toBe( true );
			expect( document.documentElement.style.getPropertyValue( '--height-sticky-header' ) ).toBe( '64px' );
		} );

		it( 'should bind click listener on show', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			const realTarget = document.getElementById( 'real-target' );
			const targetClickSpy = vi.fn();
			realTarget.addEventListener( 'click', targetClickSpy );

			header.show();
			const fakeButton = stickyHeader.querySelector( '[data-mw-citizen-click-target="#real-target"]' );
			fakeButton.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );

			expect( targetClickSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'hide', () => {
		it( 'should remove visible class and set CSS variable to 0', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			header.show();

			header.hide();

			expect( document.body.classList.contains( 'citizen-sticky-header-visible' ) ).toBe( false );
			expect( document.documentElement.style.getPropertyValue( '--height-sticky-header' ) ).toBe( '0px' );
		} );

		it( 'should unbind click listener on hide', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			header.show();
			const realTarget = document.getElementById( 'real-target' );
			const targetClickSpy = vi.fn();
			realTarget.addEventListener( 'click', targetClickSpy );

			header.hide();
			const fakeButton = stickyHeader.querySelector( '[data-mw-citizen-click-target="#real-target"]' );
			fakeButton.dispatchEvent( new MouseEvent( 'click', { bubbles: true } ) );

			expect( targetClickSpy ).not.toHaveBeenCalled();
		} );

		it( 'should click body to dismiss when sticky header contains the active element', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			header.show();
			// Place a focusable element inside the sticky header and focus it
			const input = document.createElement( 'input' );
			stickyHeader.appendChild( input );
			input.focus();
			const bodyClickSpy = vi.spyOn( document.body, 'click' );

			header.hide();

			expect( bodyClickSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'initFakeButtons', () => {
		it( 'should copy attributes to valid buttons, remove orphaned buttons, and add class', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );

			header.initFakeButtons();

			// Valid fake button should have copied attributes and the extra class
			const validButton = stickyHeader.querySelector( '[data-mw-citizen-click-target="#real-target"]' );
			expect( validButton ).not.toBeNull();
			expect( validButton.getAttribute( 'title' ) ).toBe( 'Edit' );
			expect( validButton.lastElementChild.textContent ).toBe( 'Edit page' );
			expect( validButton.classList.contains( 'citizen-sticky-header-fake-button' ) ).toBe( true );

			// Orphan fake button should have been removed
			const orphanButton = stickyHeader.querySelector( '[data-mw-citizen-click-target="#orphan-target"]' );
			expect( orphanButton ).toBeNull();
		} );
	} );

	describe( 'initDropdowns / prepareMenuDropdown', () => {
		it( 'should swap citizen-cdx-button--size-large to cdx-button--size-large on cloned dropdown button', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );

			// Create a dropdown to clone
			const dropdown = document.createElement( 'details' );
			dropdown.id = 'citizen-page-more-dropdown';
			const summary = document.createElement( 'summary' );
			summary.classList.add(
				'citizen-dropdown-summary',
				'citizen-cdx-button--size-large',
				'cdx-button'
			);
			dropdown.appendChild( summary );
			document.body.appendChild( dropdown );

			// Create the container in the sticky header
			const container = document.createElement( 'div' );
			container.id = 'citizen-sticky-header-more';
			document.body.appendChild( container );

			header.initDropdowns();

			const clonedButton = container.querySelector( '.citizen-dropdown-summary' );
			expect( clonedButton.classList.contains( 'citizen-cdx-button--size-large' ) ).toBe( false );
			expect( clonedButton.classList.contains( 'cdx-button--size-large' ) ).toBe( true );
		} );
	} );

	describe( 'updateEditIcon', () => {
		it( 'should swap wikiText icon to edit icon when VE button is absent', () => {
			buildStickyHeaderDom();
			const stickyEl = document.getElementById( 'citizen-sticky-header' );
			const header = createStickyHeader( stickyEl );

			header.updateEditIcon();

			const icon = document.querySelector( '#ca-edit-sticky-header .citizen-ui-icon' );
			expect( icon.classList.contains( 'mw-ui-icon-wikimedia-wikiText' ) ).toBe( false );
			expect( icon.classList.contains( 'mw-ui-icon-wikimedia-edit' ) ).toBe( true );
		} );

		it( 'should not swap icon when VE button is present', () => {
			buildStickyHeaderDom();
			// Add the visual edit button so both are present
			const veButton = document.createElement( 'div' );
			veButton.id = 'ca-ve-edit-sticky-header';
			document.body.appendChild( veButton );
			const stickyEl = document.getElementById( 'citizen-sticky-header' );
			const header = createStickyHeader( stickyEl );

			header.updateEditIcon();

			const icon = document.querySelector( '#ca-edit-sticky-header .citizen-ui-icon' );
			expect( icon.classList.contains( 'mw-ui-icon-wikimedia-wikiText' ) ).toBe( true );
			expect( icon.classList.contains( 'mw-ui-icon-wikimedia-edit' ) ).toBe( false );
		} );
	} );
} );
