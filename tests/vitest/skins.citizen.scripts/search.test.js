// @vitest-environment jsdom
/* global document, window, KeyboardEvent */

const mw = require( '../mocks/mw.js' );

/**
 * Build a minimal search DOM structure with a details toggle.
 *
 * @return {{ details: HTMLDetailsElement }}
 */
function buildSearchDom() {
	document.body.innerHTML = `
		<details id="citizen-search-details"></details>
	`;

	return {
		details: document.getElementById( 'citizen-search-details' )
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
} );

describe( 'search', () => {
	describe( 'initSearch', () => {
		it( 'should load command palette module', () => {
			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			buildSearchDom();
			mw.loader.load.mockClear();

			init( { window, document, mw } );

			expect( mw.loader.load ).toHaveBeenCalledWith( 'skins.citizen.commandPalette' );
		} );
	} );

	describe( 'keyboard shortcuts', () => {
		it( 'should call details.click() when / key is pressed outside a form field', () => {
			const { details } = buildSearchDom();
			const clickSpy = vi.spyOn( details, 'click' );

			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			init( { window, document, mw } );

			dispatchKeydown( document.body, { code: 'Slash' } );

			expect( clickSpy ).toHaveBeenCalled();
		} );

		it( 'should call details.click() on Ctrl+K and call preventDefault', () => {
			const { details } = buildSearchDom();
			const clickSpy = vi.spyOn( details, 'click' );

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

			expect( clickSpy ).toHaveBeenCalled();
			expect( preventDefaultSpy ).toHaveBeenCalled();
		} );

		it( 'should ignore shortcuts when target is a form field', () => {
			const { details } = buildSearchDom();
			const clickSpy = vi.spyOn( details, 'click' );

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

			expect( clickSpy ).not.toHaveBeenCalled();
		} );

		it( 'should fire shortcuts when target is a checkbox or button', () => {
			const { details } = buildSearchDom();
			const clickSpy = vi.spyOn( details, 'click' );

			const { init } = require( '../../../resources/skins.citizen.scripts/search.js' );
			init( { window, document, mw } );

			const checkbox = document.createElement( 'input' );
			checkbox.setAttribute( 'type', 'checkbox' );
			document.body.appendChild( checkbox );

			dispatchKeydown( checkbox, { code: 'Slash' } );

			expect( clickSpy ).toHaveBeenCalledTimes( 1 );

			const button = document.createElement( 'button' );
			document.body.appendChild( button );

			dispatchKeydown( button, { code: 'Slash' } );

			expect( clickSpy ).toHaveBeenCalledTimes( 2 );
		} );
	} );
} );
