// @vitest-environment jsdom
/* global document, window, KeyboardEvent */

function buildSearchDom() {
	document.body.innerHTML = '<details id="citizen-search-details"></details>';
}

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
	let triggerOpen;
	let init;

	beforeEach( () => {
		triggerOpen = vi.fn();
		init = require( '../../../resources/skins.citizen.scripts/search.js' ).init;
	} );

	describe( 'initSearch', () => {
		it( 'no longer requires an mw dependency (eager load is gone)', () => {
			buildSearchDom();

			expect( () => init( { window, document, triggerOpen } ) ).not.toThrow();
		} );
	} );

	describe( 'keyboard shortcuts', () => {
		it( 'calls triggerOpen() when / is pressed outside a form field', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			dispatchKeydown( document.body, { code: 'Slash' } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'calls triggerOpen() on Ctrl+K and calls preventDefault', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			const event = new KeyboardEvent( 'keydown', {
				code: 'KeyK',
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			} );
			const preventDefaultSpy = vi.spyOn( event, 'preventDefault' );

			document.body.dispatchEvent( event );

			expect( triggerOpen ).toHaveBeenCalled();
			expect( preventDefaultSpy ).toHaveBeenCalled();
		} );

		it( 'calls triggerOpen() on Alt+Shift+F', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			dispatchKeydown( document.body, { code: 'KeyF', altKey: true, shiftKey: true } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'ignores shortcuts when target is a form field', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			const textInput = document.createElement( 'input' );
			textInput.setAttribute( 'type', 'text' );
			document.body.appendChild( textInput );

			const textarea = document.createElement( 'textarea' );
			document.body.appendChild( textarea );

			const select = document.createElement( 'select' );
			document.body.appendChild( select );

			const contentEditable = document.createElement( 'div' );
			contentEditable.setAttribute( 'contenteditable', 'true' );
			Object.defineProperty( contentEditable, 'isContentEditable', { value: true } );
			document.body.appendChild( contentEditable );

			[ textInput, textarea, select, contentEditable ].forEach( ( el ) => {
				dispatchKeydown( el, { code: 'Slash' } );
			} );

			expect( triggerOpen ).not.toHaveBeenCalled();
		} );

		it( 'fires shortcuts when target is a checkbox or button', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			const checkbox = document.createElement( 'input' );
			checkbox.setAttribute( 'type', 'checkbox' );
			document.body.appendChild( checkbox );

			dispatchKeydown( checkbox, { code: 'Slash' } );

			expect( triggerOpen ).toHaveBeenCalledTimes( 1 );

			const button = document.createElement( 'button' );
			document.body.appendChild( button );

			dispatchKeydown( button, { code: 'Slash' } );

			expect( triggerOpen ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'auxiliary search triggers', () => {
		it( 'calls triggerOpen with prefill text from data attribute', () => {
			document.body.innerHTML =
				'<details id="citizen-search-details"></details>' +
				'<a class="citizen-search-trigger" data-citizen-search-prefill="hello">go</a>';

			init( { window, document, triggerOpen } );

			document.querySelector( '.citizen-search-trigger' ).click();

			expect( triggerOpen ).toHaveBeenCalledWith( 'hello' );
		} );

		it( 'calls triggerOpen with null when no prefill', () => {
			document.body.innerHTML =
				'<details id="citizen-search-details"></details>' +
				'<a class="citizen-search-trigger">go</a>';

			init( { window, document, triggerOpen } );

			document.querySelector( '.citizen-search-trigger' ).click();

			expect( triggerOpen ).toHaveBeenCalledWith( null );
		} );
	} );
} );
