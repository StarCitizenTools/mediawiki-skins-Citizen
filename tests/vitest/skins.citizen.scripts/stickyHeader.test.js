// @vitest-environment jsdom
/* global document, window, MouseEvent */

const { StickyHeader } = require( '../../../resources/skins.citizen.scripts/stickyHeader.js' );

/**
 * Build a minimal sticky header DOM with fake buttons and click targets.
 *
 * @return {{ stickyHeader: HTMLElement, realTarget: HTMLElement }}
 */
function buildStickyHeaderDom() {
	document.body.innerHTML = `
		<div id="citizen-sticky-header">
			<button class="cdx-button" data-mw-citizen-click-target="#real-target">
				<span></span>
			</button>
			<button class="cdx-button" data-mw-citizen-click-target="#orphan-target">
				<span></span>
			</button>
		</div>
		<button id="real-target" title="Edit"><span>Edit page</span></button>
		<div id="ca-edit-sticky-header">
			<span class="citizen-ui-icon mw-ui-icon-wikimedia-wikiText"></span>
		</div>
	`;

	return {
		stickyHeader: document.getElementById( 'citizen-sticky-header' ),
		realTarget: document.getElementById( 'real-target' )
	};
}

/**
 * Add an original page-tools dropdown and its sticky mount container.
 */
function buildDropdownDom() {
	document.body.insertAdjacentHTML( 'beforeend', `
		<div id="citizen-page-more-dropdown" class="citizen-dropdown">
			<details class="citizen-dropdown-details">
				<summary class="citizen-dropdown-summary citizen-cdx-button--size-large cdx-button" aria-details="citizen-page-actions-more__card"></summary>
			</details>
			<div id="citizen-page-actions-more__card" class="citizen-menu__card">
				<ul><li id="ca-history"><a href="#history">History</a></li></ul>
			</div>
		</div>
		<div id="citizen-sticky-header-more"></div>
	` );
}

/**
 * Add an original languages dropdown and its sticky mount container.
 */
function buildLanguagesDropdownDom() {
	document.body.insertAdjacentHTML( 'beforeend', `
		<div id="citizen-page-languages-dropdown" class="citizen-dropdown">
			<details class="citizen-dropdown-details">
				<summary class="citizen-dropdown-summary citizen-cdx-button--size-large cdx-button" aria-details="citizen-languages__card"></summary>
			</details>
			<div id="citizen-languages__card" class="citizen-menu__card">
				<ul><li id="lang-en"><a href="#en">English</a></li></ul>
			</div>
		</div>
		<div id="citizen-sticky-header-languages"></div>
	` );
}

/**
 * Create a StickyHeader instance using real jsdom document.
 *
 * @param {HTMLElement} stickyHeaderElement
 * @param {Object} [overrides] constructor dep overrides
 * @return {StickyHeader}
 */
function createStickyHeader( stickyHeaderElement, overrides = {} ) {
	return new StickyHeader( {
		stickyHeaderElement,
		document,
		window,
		requestIdleCallback: ( callback ) => callback(),
		...overrides
	} );
}

beforeEach( () => {
	vi.stubGlobal( 'matchMedia', vi.fn( () => ( { matches: false } ) ) );
} );

afterEach( () => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
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

		it( 'should not rewrite the CSS variable when the height is unchanged', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			const setPropertySpy = vi.spyOn( document.documentElement.style, 'setProperty' );

			header.show();
			header.hide();
			header.show();

			expect( setPropertySpy ).toHaveBeenCalledTimes( 1 );
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
		it( 'should remove visible class and keep the height variable in place', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			const header = createStickyHeader( stickyHeader );
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			header.show();

			header.hide();

			expect( document.body.classList.contains( 'citizen-sticky-header-visible' ) ).toBe( false );
			expect( document.documentElement.style.getPropertyValue( '--height-sticky-header' ) ).toBe( '64px' );
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

		it( 'should dismiss an open cloned menu on hide', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			buildDropdownDom();
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			const header = createStickyHeader( stickyHeader );
			header.initDropdowns();
			header.show();
			const cloneDetails = document.getElementById( 'citizen-sticky-header-more' )
				.querySelector( 'details' );
			cloneDetails.open = true;

			header.hide();

			expect( cloneDetails.open ).toBe( false );
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
			buildDropdownDom();
			const header = createStickyHeader( stickyHeader );

			header.initDropdowns();

			const clonedButton = document.getElementById( 'citizen-sticky-header-more' )
				.querySelector( '.citizen-dropdown-summary' );
			expect( clonedButton.classList.contains( 'citizen-cdx-button--size-large' ) ).toBe( false );
			expect( clonedButton.classList.contains( 'cdx-button--size-large' ) ).toBe( true );
		} );

		it( 'should strip the clone root id and aria-details', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			buildDropdownDom();
			const header = createStickyHeader( stickyHeader );

			header.initDropdowns();

			const clone = document.getElementById( 'citizen-sticky-header-more' ).firstElementChild;
			expect( clone.hasAttribute( 'id' ) ).toBe( false );
			expect( document.querySelectorAll( '[id="citizen-page-more-dropdown"]' ) ).toHaveLength( 1 );
			expect( clone.querySelector( '.citizen-dropdown-summary' ).hasAttribute( 'aria-details' ) ).toBe( false );
		} );

		it( 'should defer building until idle fires', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			buildDropdownDom();
			let idleCallback;
			const header = createStickyHeader( stickyHeader, {
				requestIdleCallback: ( callback ) => {
					idleCallback = callback;
				}
			} );

			header.initDropdowns();
			const container = document.getElementById( 'citizen-sticky-header-more' );
			expect( container.children ).toHaveLength( 0 );

			idleCallback();
			expect( container.children ).toHaveLength( 1 );
		} );

		it( 'should not rebuild on a clean ensureDropdowns call', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			buildDropdownDom();
			const header = createStickyHeader( stickyHeader );
			header.initDropdowns();
			const firstClone = document.getElementById( 'citizen-sticky-header-more' ).firstElementChild;

			header.ensureDropdowns();

			expect( document.getElementById( 'citizen-sticky-header-more' ).firstElementChild ).toBe( firstClone );
		} );

		it( 'should rebuild at the next show after a menu mutation and destroy the old instance', async () => {
			const { stickyHeader } = buildStickyHeaderDom();
			buildDropdownDom();
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			const header = createStickyHeader( stickyHeader );
			header.initDropdowns();
			const oldDropdown = header.cloneDropdowns[ 0 ];
			const destroySpy = vi.spyOn( oldDropdown, 'destroy' );

			const newItem = document.createElement( 'li' );
			newItem.innerHTML = '<a href="#new">Gadget item</a>';
			document.querySelector( '#citizen-page-actions-more__card ul' ).appendChild( newItem );
			// jsdom delivers mutation records asynchronously
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			expect( header.dropdownsDirty ).toBe( true );

			header.show();

			expect( destroySpy ).toHaveBeenCalled();
			const clone = document.getElementById( 'citizen-sticky-header-more' ).firstElementChild;
			expect( clone.querySelector( 'a[href="#new"]' ) ).not.toBeNull();
		} );

		it( 'should build a closed clone when the original menu is open', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			buildDropdownDom();
			document.querySelector( '#citizen-page-more-dropdown details' ).open = true;
			const header = createStickyHeader( stickyHeader );

			header.initDropdowns();

			const clone = document.getElementById( 'citizen-sticky-header-more' ).firstElementChild;
			expect( clone.querySelector( 'details' ).open ).toBe( false );
			expect( document.querySelector( '#citizen-page-more-dropdown details' ).open ).toBe( true );
		} );

		it( 'should not rebuild from a late idle callback after a lazy build', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			buildDropdownDom();
			let idleCallback;
			const header = createStickyHeader( stickyHeader, {
				requestIdleCallback: ( callback ) => {
					idleCallback = callback;
				}
			} );
			header.initDropdowns();

			header.ensureDropdowns();
			const container = document.getElementById( 'citizen-sticky-header-more' );
			const firstClone = container.firstElementChild;
			header.dropdownsDirty = true;

			idleCallback();

			expect( container.firstElementChild ).toBe( firstClone );
		} );

		it( 'should not mark the mirror dirty when the original menu merely opens', async () => {
			const { stickyHeader } = buildStickyHeaderDom();
			buildDropdownDom();
			const header = createStickyHeader( stickyHeader );
			header.initDropdowns();

			document.querySelector( '#citizen-page-more-dropdown details' ).open = true;
			// jsdom delivers mutation records asynchronously
			await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

			expect( header.dropdownsDirty ).toBe( false );
		} );

		it( 'should build clones for both dropdowns when both exist', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			buildDropdownDom();
			buildLanguagesDropdownDom();
			const header = createStickyHeader( stickyHeader );

			header.initDropdowns();

			expect( document.getElementById( 'citizen-sticky-header-more' ).children ).toHaveLength( 1 );
			expect( document.getElementById( 'citizen-sticky-header-languages' ).children ).toHaveLength( 1 );
			expect( header.cloneDropdowns ).toHaveLength( 2 );
		} );
	} );

	describe( 'init', () => {
		it( 'should pre-measure the bar height into the CSS variable at idle', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			const header = createStickyHeader( stickyHeader );

			header.init();

			expect( document.documentElement.style.getPropertyValue( '--height-sticky-header' ) ).toBe( '64px' );
		} );

		it( 'should make the first show() skip the variable write', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height: 64, top: 0, bottom: 64, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			const header = createStickyHeader( stickyHeader );
			const setPropertySpy = vi.spyOn( document.documentElement.style, 'setProperty' );

			header.init();
			header.show();

			expect( setPropertySpy ).toHaveBeenCalledTimes( 1 );
			expect( document.body.classList.contains( 'citizen-sticky-header-visible' ) ).toBe( true );
		} );

		it( 'should write a changed height on the next show()', () => {
			const { stickyHeader } = buildStickyHeaderDom();
			let height = 64;
			stickyHeader.getBoundingClientRect = vi.fn( () => ( {
				height, top: 0, bottom: height, left: 0, right: 100, width: 100, x: 0, y: 0
			} ) );
			const header = createStickyHeader( stickyHeader );
			header.init();

			height = 72;
			header.show();

			expect( document.documentElement.style.getPropertyValue( '--height-sticky-header' ) ).toBe( '72px' );
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
