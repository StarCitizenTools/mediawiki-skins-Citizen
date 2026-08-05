// @vitest-environment jsdom
/* global document, window, KeyboardEvent */

function buildSearchDom() {
	document.body.innerHTML = '<details id="citizen-search-details"></details>';
}

/**
 * A stand-in for `window` that reports macOS. Only `navigator` and
 * `addEventListener` are read by the module under test, and the listener still
 * lands on the real window so `dispatchKeydown` reaches it.
 *
 * @return {Object}
 */
function macWindow() {
	return {
		navigator: { platform: 'MacIntel' },
		addEventListener: window.addEventListener.bind( window )
	};
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

			dispatchKeydown( document.body, { key: '/', code: 'Slash' } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'calls triggerOpen() when / needs Shift, as on German layouts', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			dispatchKeydown( document.body, { key: '/', code: 'Digit7', shiftKey: true } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'calls triggerOpen() from the numpad, which types the same character', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			// Deliberate: the shortcut is the "/" character, not a position, so
			// excluding NumpadDivide would mean reintroducing position logic.
			dispatchKeydown( document.body, { key: '/', code: 'NumpadDivide' } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'ignores the US slash position when it types another character (T1731)', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			// Nordic layouts put "-" where US QWERTY has "/".
			dispatchKeydown( document.body, { key: '-', code: 'Slash' } );
			// US QWERTY with Shift on that same key types "?".
			dispatchKeydown( document.body, { key: '?', code: 'Slash', shiftKey: true } );

			expect( triggerOpen ).not.toHaveBeenCalled();
		} );

		it( 'ignores Ctrl+/ and Command+/ so the chord stays free', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			dispatchKeydown( document.body, { key: '/', code: 'Slash', ctrlKey: true } );
			dispatchKeydown( document.body, { key: '/', code: 'Slash', metaKey: true } );

			expect( triggerOpen ).not.toHaveBeenCalled();
		} );

		it( 'calls triggerOpen() for a / typed with AltGr', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			// Windows reports AltGr as Ctrl+Alt.
			dispatchKeydown( document.body, { key: '/', code: 'Minus', ctrlKey: true, altKey: true } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'calls triggerOpen() on Ctrl+K and calls preventDefault', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			const event = new KeyboardEvent( 'keydown', {
				key: 'k',
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

		it( 'matches Ctrl+K by the letter typed, not the key position', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			// Dvorak types "k" from the US QWERTY "v" position...
			dispatchKeydown( document.body, { key: 'k', code: 'KeyV', ctrlKey: true } );

			expect( triggerOpen ).toHaveBeenCalledTimes( 1 );

			// ...and types "t" from the US QWERTY "k" position.
			dispatchKeydown( document.body, { key: 't', code: 'KeyK', ctrlKey: true } );

			expect( triggerOpen ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'falls back to the key position on non-Latin layouts', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			// Cyrillic keycaps carry a Latin legend following the US positions.
			dispatchKeydown( document.body, { key: 'л', code: 'KeyK', ctrlKey: true } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'ignores Ctrl+Shift+K, which browsers bind to devtools', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			dispatchKeydown( document.body, { key: 'K', code: 'KeyK', ctrlKey: true, shiftKey: true } );

			expect( triggerOpen ).not.toHaveBeenCalled();
		} );

		it( 'calls triggerOpen() on Alt+Shift+F', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			dispatchKeydown( document.body, { key: 'F', code: 'KeyF', altKey: true, shiftKey: true } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'calls triggerOpen() on Command+K', () => {
			buildSearchDom();
			init( { window: macWindow(), document, triggerOpen } );

			dispatchKeydown( document.body, { key: 'k', code: 'KeyK', metaKey: true } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'falls back to the key position when Alt rewrites the character', () => {
			buildSearchDom();
			init( { window: macWindow(), document, triggerOpen } );

			// macOS types Option+Shift+F as "Ï", so no Latin letter is left
			// to match on and only the position can decide.
			dispatchKeydown( document.body, { key: 'Ï', code: 'KeyF', altKey: true, shiftKey: true } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'calls triggerOpen() on Ctrl+Option+F, the macOS access key chord', () => {
			buildSearchDom();
			init( { window: macWindow(), document, triggerOpen } );

			dispatchKeydown( document.body, { key: 'ƒ', code: 'KeyF', altKey: true, ctrlKey: true } );

			expect( triggerOpen ).toHaveBeenCalled();
		} );

		it( 'ignores Ctrl+Alt+F off macOS, where it is an AltGr character', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			dispatchKeydown( document.body, { key: 'f', code: 'KeyF', altKey: true, ctrlKey: true } );

			expect( triggerOpen ).not.toHaveBeenCalled();
		} );

		it( 'ignores Alt+Shift+F once Ctrl or Command joins the chord', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			dispatchKeydown( document.body, {
				key: 'F', code: 'KeyF', altKey: true, shiftKey: true, ctrlKey: true
			} );
			dispatchKeydown( document.body, {
				key: 'F', code: 'KeyF', altKey: true, shiftKey: true, metaKey: true
			} );

			expect( triggerOpen ).not.toHaveBeenCalled();
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
				dispatchKeydown( el, { key: '/', code: 'Slash' } );
			} );

			expect( triggerOpen ).not.toHaveBeenCalled();
		} );

		it( 'fires shortcuts when target is a checkbox or button', () => {
			buildSearchDom();
			init( { window, document, triggerOpen } );

			const checkbox = document.createElement( 'input' );
			checkbox.setAttribute( 'type', 'checkbox' );
			document.body.appendChild( checkbox );

			dispatchKeydown( checkbox, { key: '/', code: 'Slash' } );

			expect( triggerOpen ).toHaveBeenCalledTimes( 1 );

			const button = document.createElement( 'button' );
			document.body.appendChild( button );

			dispatchKeydown( button, { key: '/', code: 'Slash' } );

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

		it( 'reads prefill from the trigger when a descendant is clicked', () => {
			document.body.innerHTML =
				'<details id="citizen-search-details"></details>' +
				'<div class="citizen-search-trigger" data-citizen-search-prefill="Ship:">' +
					'<div class="hangar-searchbar">Search ships <i></i></div>' +
				'</div>';

			init( { window, document, triggerOpen } );

			document.querySelector( '.hangar-searchbar i' ).click();

			expect( triggerOpen ).toHaveBeenCalledWith( 'Ship:' );
		} );
	} );
} );
