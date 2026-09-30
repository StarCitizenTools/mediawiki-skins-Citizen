// @vitest-environment jsdom
/* global document, KeyboardEvent */

const { init } = require( '../../../resources/skins.citizen.scripts/accessKeyFallback.js' );

/**
 * A fresh stand-in for `window` per test, so no listener outlives its test.
 * Only `jQuery`, `navigator` and `addEventListener` are read by the module. An
 * element rather than a bare EventTarget, so a keydown can bubble up to it.
 *
 * @param {Object} [options]
 * @param {string} [options.layout] the engine jquery.client reports
 * @param {string} [options.platform]
 * @param {boolean} [options.hasClient] whether jquery.client is loaded
 * @return {HTMLElement & { jQuery: Object, navigator: Object }}
 */
function createWindow( { layout = 'webkit', platform = 'Win32', hasClient = true } = {} ) {
	const win = document.createElement( 'div' );
	win.jQuery = hasClient ? { client: { profile: () => ( { layout } ) } } : {};
	win.navigator = { platform };
	return win;
}

/**
 * Press a key the way Blink delivers it on Windows and Linux: the keydown, then
 * the character event, on which Blink activates the last element whose access key
 * is the typed character — whatever the keydown's listeners did — then the keyup.
 *
 * @param {EventTarget} target where the keydown is dispatched
 * @param {Object} opts KeyboardEvent init
 * @return {KeyboardEvent}
 */
function pressKey( target, opts ) {
	const event = new KeyboardEvent( 'keydown', { bubbles: true, cancelable: true, ...opts } );
	target.dispatchEvent( event );
	const matches = Array.from( document.querySelectorAll( '[accesskey]' ) ).filter(
		( element ) => element.getAttribute( 'accesskey' ).toLowerCase() === event.key.toLowerCase()
	);
	// Blink's chord is Alt, with or without Shift.
	if ( event.altKey && !event.ctrlKey && !event.metaKey && matches.length ) {
		matches[ matches.length - 1 ].click();
	}
	target.dispatchEvent( new KeyboardEvent( 'keyup', { bubbles: true, ...opts } ) );
	return event;
}

/**
 * @param {string} html
 * @return {Function} click listener on the element with `id="target"`
 */
function setUpTarget( html ) {
	document.body.innerHTML = html;
	const onClick = vi.fn();
	document.getElementById( 'target' ).addEventListener( 'click', onClick );
	return onClick;
}

// The physical J key of a Russian (ЙЦУКЕН) layout.
const RUSSIAN_J = { key: 'о', code: 'KeyJ', altKey: true };

afterEach( () => {
	document.body.innerHTML = '';
} );

describe( 'accessKeyFallback', () => {
	describe( 'activation', () => {
		it( 'activates the access key at the key position when the layout types a non-Latin letter', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow();
			init( { window: win, document } );

			const event = pressKey( win, RUSSIAN_J );

			expect( onClick ).toHaveBeenCalledTimes( 1 );
			expect( event.defaultPrevented ).toBe( false );
		} );

		it( 'activates again on every press', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, RUSSIAN_J );
			pressKey( win, RUSSIAN_J );

			expect( onClick ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'works with Shift held, which Blink ignores', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, { key: 'О', code: 'KeyJ', altKey: true, shiftKey: true } );

			expect( onClick ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'focuses a text field without clicking it', () => {
			const onClick = setUpTarget( '<input id="target" type="text" accesskey="b">' );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, { key: 'и', code: 'KeyB', altKey: true } );

			expect( document.activeElement ).toBe( document.getElementById( 'target' ) );
			expect( onClick ).not.toHaveBeenCalled();
		} );

		it( 'clicks a checkbox', () => {
			document.body.innerHTML = '<input type="checkbox" accesskey="w">';
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, { key: 'ц', code: 'KeyW', altKey: true } );

			expect( document.querySelector( 'input' ).checked ).toBe( true );
		} );

		it.each( [
			[ 'Greek final sigma', 'ς', 'KeyW', 'w' ],
			[ 'Hebrew', 'ח', 'KeyJ', 'j' ],
			[ 'Georgian', 'ჯ', 'KeyJ', 'j' ],
			[ 'Arabic', 'ت', 'KeyJ', 'j' ],
			[ 'a Thai mark', 'ี', 'KeyU', 'u' ],
			[ 'a Devanagari mark', 'ा', 'KeyE', 'e' ]
		] )( 'maps %s', ( _, key, code, accessKey ) => {
			const onClick = setUpTarget( `<a id="target" href="#t" accesskey="${ accessKey }">Target</a>` );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, { key, code, altKey: true } );

			expect( onClick ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'still applies to a keydown the page cancels, as Blink\'s own lookup does', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow();
			win.addEventListener( 'keydown', ( event ) => event.preventDefault(), true );
			init( { window: win, document } );

			pressKey( win, RUSSIAN_J );

			expect( onClick ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'still applies to a keydown a component stops, as Blink\'s own lookup does', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow();
			const component = win.appendChild( document.createElement( 'div' ) );
			component.addEventListener( 'keydown', ( event ) => event.stopPropagation() );
			init( { window: win, document } );

			pressKey( component, RUSSIAN_J );

			expect( onClick ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'takes the last element in document order when several share a key, as Blink does', () => {
			const onLast = setUpTarget( `
				<a href="#first" accesskey="j">First</a>
				<a id="target" href="#last" accesskey="J">Last</a>
			` );
			const onFirst = vi.fn();
			document.querySelector( 'a' ).addEventListener( 'click', onFirst );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, RUSSIAN_J );

			expect( onLast ).toHaveBeenCalledTimes( 1 );
			expect( onFirst ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'keys the browser resolves itself', () => {
		it( 'leaves a Latin letter to the browser alone', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, { key: 'j', code: 'KeyJ', altKey: true } );

			expect( onClick ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'leaves a key the page assigns in the layout\'s own script', () => {
			const onLatin = setUpTarget( `
				<a id="target" href="#latin" accesskey="j">Latin</a>
				<a href="#cyrillic" accesskey="о">Cyrillic</a>
			` );
			const onCyrillic = vi.fn();
			document.querySelector( '[accesskey="о"]' ).addEventListener( 'click', onCyrillic );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, RUSSIAN_J );

			expect( onCyrillic ).toHaveBeenCalledTimes( 1 );
			expect( onLatin ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'keys with no fallback', () => {
		it( 'does not map punctuation a Latin layout types on a letter position, as on Dvorak', () => {
			const onClick = setUpTarget( '<a id="target" href="#watch" accesskey="w">Watch</a>' );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, { key: ',', code: 'KeyW', altKey: true } );

			expect( onClick ).not.toHaveBeenCalled();
		} );

		it( 'does not map a Latin letter typed on another position, as on Turkish-F', () => {
			const onClick = setUpTarget( '<a id="target" href="#edit" accesskey="e">Edit</a>' );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, { key: 'ğ', code: 'KeyE', altKey: true } );

			expect( onClick ).not.toHaveBeenCalled();
		} );

		it.each( [
			[ 'a dead key', 'Dead' ],
			[ 'a key an input method takes', 'Process' ],
			[ 'an unidentified key', 'Unidentified' ],
			[ 'a letter shared between scripts', 'µ' ],
			[ 'a mark shared between scripts', '\u0301' ]
		] )( 'does not map %s', ( _, key ) => {
			document.body.innerHTML = '<a href="#links" accesskey="j">What links here</a>';
			const win = createWindow();
			init( { window: win, document } );

			win.dispatchEvent( new KeyboardEvent( 'keydown', { key, code: 'KeyJ', altKey: true } ) );

			expect( document.querySelector( '[hidden][accesskey]' ) ).toBeNull();
		} );

		it( 'maps only letter positions', () => {
			const onClick = setUpTarget( '<a id="target" href="#two" accesskey="2">Two</a>' );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, { key: 'ё', code: 'Digit2', altKey: true } );

			expect( onClick ).not.toHaveBeenCalled();
		} );

		it( 'adds no access key when nothing has the position\'s letter', () => {
			document.body.innerHTML = '<a href="#links" accesskey="j">What links here</a>';
			const win = createWindow();
			init( { window: win, document } );

			win.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'в', code: 'KeyD', altKey: true } ) );

			expect( document.querySelector( '[accesskey="в"]' ) ).toBeNull();
		} );

		it( 'clears the stand-in on keyup', () => {
			document.body.innerHTML = '<a href="#links" accesskey="j">What links here</a>';
			const win = createWindow();
			init( { window: win, document } );

			win.dispatchEvent( new KeyboardEvent( 'keydown', RUSSIAN_J ) );
			win.dispatchEvent( new KeyboardEvent( 'keyup', RUSSIAN_J ) );

			expect( document.querySelector( '[hidden][accesskey]' ) ).toBeNull();
		} );

		it( 'clears the stand-in on the next keydown', () => {
			document.body.innerHTML = '<a href="#links" accesskey="j">What links here</a>';
			const win = createWindow();
			init( { window: win, document } );

			win.dispatchEvent( new KeyboardEvent( 'keydown', RUSSIAN_J ) );
			win.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'о', code: 'KeyJ' } ) );

			expect( document.querySelector( '[hidden][accesskey]' ) ).toBeNull();
		} );

		it( 'ignores a key pressed while an input method is composing', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow();
			init( { window: win, document } );

			pressKey( win, { ...RUSSIAN_J, isComposing: true } );

			expect( onClick ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'chord', () => {
		it( 'needs Alt', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow();
			init( { window: win, document } );

			win.dispatchEvent( new KeyboardEvent( 'keydown', { key: 'о', code: 'KeyJ' } ) );

			expect( document.querySelector( '[accesskey="о"]' ) ).toBeNull();
			expect( onClick ).not.toHaveBeenCalled();
		} );

		it.each( [
			// Windows delivers AltGr as Ctrl+Alt, so this is typing, not a chord.
			[ 'Ctrl', { ctrlKey: true } ],
			[ 'Meta', { metaKey: true } ]
		] )( 'leaves the stand-in alone when %s is held with Alt', ( _, modifier ) => {
			document.body.innerHTML = '<a href="#links" accesskey="j">What links here</a>';
			const win = createWindow();
			init( { window: win, document } );

			win.dispatchEvent( new KeyboardEvent( 'keydown', { ...RUSSIAN_J, ...modifier } ) );

			expect( document.querySelector( '[hidden][accesskey]' ) ).toBeNull();
		} );
	} );

	describe( 'engines', () => {
		it( 'leaves Gecko, which resolves these layouts from the user\'s own Latin layout', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow( { layout: 'gecko' } );
			init( { window: win, document } );

			pressKey( win, RUSSIAN_J );

			expect( onClick ).not.toHaveBeenCalled();
		} );

		it( 'does nothing on macOS', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow( { platform: 'MacIntel' } );
			init( { window: win, document } );

			pressKey( win, RUSSIAN_J );

			expect( onClick ).not.toHaveBeenCalled();
		} );

		it( 'does nothing when the engine cannot be identified', () => {
			const onClick = setUpTarget( '<a id="target" href="#links" accesskey="j">What links here</a>' );
			const win = createWindow( { hasClient: false } );
			init( { window: win, document } );

			pressKey( win, RUSSIAN_J );

			expect( onClick ).not.toHaveBeenCalled();
		} );
	} );
} );
