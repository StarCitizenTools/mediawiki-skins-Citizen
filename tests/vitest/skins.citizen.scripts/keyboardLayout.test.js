// @vitest-environment jsdom
/* global KeyboardEvent */

const {
	isMacPlatform,
	isLetterPressed,
	isAltGraphChar,
	isAccessKeyChord,
	isComposing
} = require( '../../../resources/skins.citizen.scripts/keyboardLayout.js' );

/**
 * Build a real KeyboardEvent so the helpers see the same shape a browser
 * gives them — `getModifierState` in particular, which an object literal
 * would not have.
 *
 * @param {Object} init
 * @return {KeyboardEvent}
 */
function keyEvent( init ) {
	return new KeyboardEvent( 'keydown', init );
}

describe( 'keyboardLayout', () => {
	describe( 'isMacPlatform', () => {
		it( 'prefers userAgentData over the deprecated platform', () => {
			const navigator = { userAgentData: { platform: 'macOS' }, platform: 'Win32' };

			expect( isMacPlatform( navigator ) ).toBe( true );
		} );

		it( 'falls back to platform when userAgentData reports nothing', () => {
			expect( isMacPlatform( { userAgentData: { platform: '' }, platform: 'MacIntel' } ) )
				.toBe( true );
			expect( isMacPlatform( { platform: 'MacIntel' } ) ).toBe( true );
		} );

		it( 'recognises iOS, which shares the Mac modifier conventions', () => {
			expect( isMacPlatform( { platform: 'iPhone' } ) ).toBe( true );
			expect( isMacPlatform( { platform: 'iPad' } ) ).toBe( true );
		} );

		it( 'returns false for other platforms and for a missing navigator', () => {
			expect( isMacPlatform( { platform: 'Win32' } ) ).toBe( false );
			expect( isMacPlatform( { platform: 'Linux x86_64' } ) ).toBe( false );
			expect( isMacPlatform( {} ) ).toBe( false );
			expect( isMacPlatform( null ) ).toBe( false );
			expect( isMacPlatform() ).toBe( false );
		} );
	} );

	describe( 'isLetterPressed', () => {
		it( 'matches the letter the layout typed, whatever its position', () => {
			// Dvorak types "k" from the US QWERTY "v" position.
			expect( isLetterPressed( keyEvent( { key: 'k', code: 'KeyV' } ), 'k' ) ).toBe( true );
			expect( isLetterPressed( keyEvent( { key: 't', code: 'KeyK' } ), 'k' ) ).toBe( false );
		} );

		it( 'ignores case, so Shift and CapsLock do not break the match', () => {
			expect( isLetterPressed( keyEvent( { key: 'K', code: 'KeyK' } ), 'k' ) ).toBe( true );
		} );

		it( 'falls back to the key position when the layout types no Latin letter', () => {
			// Cyrillic keycaps carry a Latin legend on the US positions.
			expect( isLetterPressed( keyEvent( { key: 'л', code: 'KeyK' } ), 'k' ) ).toBe( true );
			// macOS rewrites event.key into a glyph whenever Option is held.
			expect( isLetterPressed( keyEvent( { key: 'Ï', code: 'KeyF' } ), 'f' ) ).toBe( true );
		} );

		it( 'does not case-fold Latin lookalikes into their ASCII counterpart', () => {
			// U+017F long s and U+212A Kelvin sign fold to "s" and "k" under full
			// Unicode case rules. A non-unicode regex must not fold them, or a
			// layout typing either would fire the wrong shortcut. The code is
			// deliberately mismatched so only the key value can decide.
			expect( isLetterPressed( keyEvent( { key: '\u017F', code: 'KeyZ' } ), 's' ) )
				.toBe( false );
			expect( isLetterPressed( keyEvent( { key: '\u212A', code: 'KeyZ' } ), 'k' ) )
				.toBe( false );
		} );

		it( 'survives keys that produce no character at all', () => {
			expect( isLetterPressed( keyEvent( { key: 'Dead', code: 'KeyK' } ), 'k' ) ).toBe( true );
			expect( isLetterPressed( keyEvent( { key: '', code: 'KeyK' } ), 'k' ) ).toBe( true );
			expect( isLetterPressed( { code: 'KeyK' }, 'k' ) ).toBe( true );
			expect( isLetterPressed( { }, 'k' ) ).toBe( false );
		} );
	} );

	describe( 'isAltGraphChar', () => {
		it( 'trusts getModifierState when the browser reports AltGraph', () => {
			// Firefox reports AltGr this way without setting ctrlKey.
			const event = keyEvent( { key: '@', altKey: true, modifierAltGraph: true } );

			expect( isAltGraphChar( event, false ) ).toBe( true );
		} );

		it( 'reads Ctrl+Alt as AltGr, which is how Windows delivers it', () => {
			const event = keyEvent( { key: '@', code: 'KeyQ', ctrlKey: true, altKey: true } );

			expect( isAltGraphChar( event, false ) ).toBe( true );
		} );

		it( 'reads a bare Option character as AltGr on a Mac only', () => {
			const event = keyEvent( { key: '@', code: 'KeyL', altKey: true } );

			expect( isAltGraphChar( event, true ) ).toBe( true );
			expect( isAltGraphChar( event, false ) ).toBe( false );
		} );

		it( 'rejects chords that produce no character', () => {
			// Ctrl+Alt+Arrow is a live desktop shortcut; Option+Arrow is
			// word-wise text navigation on a Mac.
			expect( isAltGraphChar(
				keyEvent( { key: 'ArrowDown', ctrlKey: true, altKey: true } ), false
			) ).toBe( false );
			expect( isAltGraphChar(
				keyEvent( { key: 'ArrowLeft', altKey: true } ), true
			) ).toBe( false );
		} );

		it( 'rejects a plain space, which no AltGr layer produces', () => {
			const event = keyEvent( { key: ' ', code: 'Space', ctrlKey: true, altKey: true } );

			expect( isAltGraphChar( event, false ) ).toBe( false );
		} );

		it( 'rejects anything carrying Command, and anything without Alt', () => {
			expect( isAltGraphChar(
				keyEvent( { key: '@', ctrlKey: true, altKey: true, metaKey: true } ), true
			) ).toBe( false );
			expect( isAltGraphChar( keyEvent( { key: '@', ctrlKey: true } ), true ) ).toBe( false );
		} );
	} );

	describe( 'isAccessKeyChord', () => {
		it( 'accepts Alt+Shift on every platform', () => {
			const event = keyEvent( { key: 'F', altKey: true, shiftKey: true } );

			expect( isAccessKeyChord( event, false ) ).toBe( true );
			expect( isAccessKeyChord( event, true ) ).toBe( true );
		} );

		it( 'accepts Ctrl+Option on a Mac only', () => {
			// Off a Mac the same flags mean AltGr, not an access key.
			const event = keyEvent( { key: 'ƒ', ctrlKey: true, altKey: true } );

			expect( isAccessKeyChord( event, true ) ).toBe( true );
			expect( isAccessKeyChord( event, false ) ).toBe( false );
		} );

		it( 'rejects the bare chords that belong to the browser', () => {
			// Alt+F is the Windows File menu; Ctrl+F is find-in-page.
			expect( isAccessKeyChord( keyEvent( { key: 'f', altKey: true } ), false ) ).toBe( false );
			expect( isAccessKeyChord( keyEvent( { key: 'f', ctrlKey: true } ), true ) ).toBe( false );
		} );

		it( 'rejects anything carrying Command', () => {
			const event = keyEvent( { key: 'F', altKey: true, shiftKey: true, metaKey: true } );

			expect( isAccessKeyChord( event, true ) ).toBe( false );
		} );
	} );

	describe( 'isComposing', () => {
		it( 'reports a keystroke an input method is consuming', () => {
			expect( isComposing( keyEvent( { key: 'Enter', isComposing: true } ) ) ).toBe( true );
		} );

		it( 'reports an ordinary keystroke as not composing', () => {
			expect( isComposing( keyEvent( { key: 'Enter' } ) ) ).toBe( false );
			expect( isComposing( {} ) ).toBe( false );
		} );

		it( 'ignores the legacy keyCode 229, which Android reports for Enter', () => {
			// Chrome on Android sets 229 for almost every non-printable key
			// whether or not anything is being composed, so reading it would
			// disable Enter and Backspace across the palette on mobile.
			const event = keyEvent( { key: 'Enter', keyCode: 229 } );

			expect( isComposing( event ) ).toBe( false );
		} );
	} );
} );
