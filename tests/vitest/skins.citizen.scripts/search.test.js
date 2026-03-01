// @vitest-environment jsdom
/* global document, window, KeyboardEvent, Event */

const mw = require( '../mocks/mw.js' );
const config = require( '../mocks/config.js' );

/**
 * Build a minimal search DOM structure with a details toggle and a search box.
 *
 * @return {{ details: HTMLDetailsElement, searchBox: HTMLElement, input: HTMLInputElement }}
 */
function buildSearchDom() {
	document.body.innerHTML = `
		<details id="citizen-search-details">
			<div class="citizen-search-box">
				<input name="search" id="searchInput">
			</div>
		</details>
	`;

	return {
		details: document.getElementById( 'citizen-search-details' ),
		searchBox: document.querySelector( '.citizen-search-box' ),
		input: document.getElementById( 'searchInput' )
	};
}

/**
 * Dispatch a keydown event from the given target element.
 * Because bindOpenOnSlash uses capture mode, the event reaches the
 * window listener during the capture phase with the correct target.
 *
 * @param {HTMLElement} target
 * @param {Object} opts KeyboardEvent init options
 */
function dispatchKeydown( target, opts ) {
	target.dispatchEvent( new KeyboardEvent( 'keydown', {
		bubbles: true,
		cancelable: true,
		...opts
	} ) );
}

afterEach( () => {
	vi.restoreAllMocks();
	document.body.innerHTML = '';
	config.wgCitizenEnableCommandPalette = false;
	config.wgCitizenSearchModule = 'skins.citizen.search';
} );

describe( 'search', () => {
	describe( 'loadSearchModule', () => {
		it( 'should load search module immediately when input already focused', () => {
			const { input } = buildSearchDom();
			input.focus();

			mw.loader.using.mockClear();
			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			init( { window, document, mw } );

			expect( mw.loader.using ).toHaveBeenCalledWith(
				'skins.citizen.search',
				expect.any( Function )
			);
		} );

		it( 'should defer search module load to focus event as a one-shot listener', () => {
			const { input } = buildSearchDom();

			mw.loader.using.mockClear();
			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			init( { window, document, mw } );

			expect( mw.loader.using ).not.toHaveBeenCalled();

			input.dispatchEvent( new Event( 'focus' ) );

			expect( mw.loader.using ).toHaveBeenCalledWith(
				'skins.citizen.search',
				expect.any( Function )
			);

			// Second focus should not trigger another load (one-shot)
			mw.loader.using.mockClear();
			input.dispatchEvent( new Event( 'focus' ) );

			expect( mw.loader.using ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'keyboard shortcuts', () => {
		it( 'should open search when / key is pressed outside a form field', () => {
			const { details } = buildSearchDom();

			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			init( { window, document, mw } );

			dispatchKeydown( document.body, { code: 'Slash' } );

			expect( details.open ).toBe( true );
		} );

		it( 'should open search on Ctrl+K and call preventDefault', () => {
			const { details } = buildSearchDom();

			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			init( { window, document, mw } );

			const event = new KeyboardEvent( 'keydown', {
				code: 'KeyK',
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			} );
			const preventDefaultSpy = vi.spyOn( event, 'preventDefault' );

			document.body.dispatchEvent( event );

			expect( details.open ).toBe( true );
			expect( preventDefaultSpy ).toHaveBeenCalled();
		} );

		it( 'should ignore shortcuts when target is a form field', () => {
			const { details } = buildSearchDom();

			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			init( { window, document, mw } );

			const textInput = document.createElement( 'input' );
			textInput.setAttribute( 'type', 'text' );
			document.body.appendChild( textInput );

			const textarea = document.createElement( 'textarea' );
			document.body.appendChild( textarea );

			const select = document.createElement( 'select' );
			document.body.appendChild( select );

			const contentEditable = document.createElement( 'div' );
			contentEditable.setAttribute( 'contenteditable', 'true' );
			// JSDOM does not implement isContentEditable, so define it manually
			Object.defineProperty( contentEditable, 'isContentEditable', { value: true } );
			document.body.appendChild( contentEditable );

			[ textInput, textarea, select, contentEditable ].forEach( ( el ) => {
				dispatchKeydown( el, { code: 'Slash' } );
			} );

			expect( details.open ).not.toBe( true );
		} );

		it( 'should fire shortcuts when target is a checkbox or button', () => {
			const { details } = buildSearchDom();

			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			init( { window, document, mw } );

			const checkbox = document.createElement( 'input' );
			checkbox.setAttribute( 'type', 'checkbox' );
			document.body.appendChild( checkbox );

			dispatchKeydown( checkbox, { code: 'Slash' } );

			expect( details.open ).toBe( true );

			// Reset and test with a button
			details.open = false;

			const button = document.createElement( 'button' );
			document.body.appendChild( button );

			dispatchKeydown( button, { code: 'Slash' } );

			expect( details.open ).toBe( true );
		} );
	} );

	describe( 'renderSearchLoadingIndicator', () => {
		it( 'should add loading class on input, remove on focusout, re-add on focusin with value', () => {
			const { searchBox, input } = buildSearchDom();

			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			init( { window, document, mw } );

			// input event adds the loading class
			input.dispatchEvent( new Event( 'input', { bubbles: true } ) );

			expect( searchBox.classList.contains( 'citizen-loading' ) ).toBe( true );

			// focusout removes the loading class
			input.dispatchEvent( new Event( 'focusout', { bubbles: true } ) );

			expect( searchBox.classList.contains( 'citizen-loading' ) ).toBe( false );

			// focusin with a value re-adds the loading class
			input.value = 'test query';
			input.dispatchEvent( new Event( 'focusin', { bubbles: true } ) );

			expect( searchBox.classList.contains( 'citizen-loading' ) ).toBe( true );
		} );
	} );

	describe( 'command palette mode', () => {
		it( 'should load command palette module and use details.click() for shortcuts', () => {
			config.wgCitizenEnableCommandPalette = true;
			vi.resetModules();

			const freshMw = require( '../mocks/mw.js' );
			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			const { details } = buildSearchDom();
			const clickSpy = vi.spyOn( details, 'click' );

			init( { window, document, mw: freshMw } );

			expect( freshMw.loader.load ).toHaveBeenCalledWith( 'skins.citizen.commandPalette' );

			// Keyboard shortcut should use details.click() instead of details.open
			dispatchKeydown( document.body, { code: 'Slash' } );

			expect( clickSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'no search boxes', () => {
		it( 'should no-op gracefully when .citizen-search-box is not in DOM', () => {
			document.body.innerHTML = '<details id="citizen-search-details"></details>';

			mw.loader.using.mockClear();
			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );

			expect( () => {
				init( { window, document, mw } );
			} ).not.toThrow();

			expect( mw.loader.using ).not.toHaveBeenCalled();
		} );
	} );
} );
