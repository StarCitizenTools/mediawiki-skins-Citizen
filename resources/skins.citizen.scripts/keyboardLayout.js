/**
 * Keyboard-layout helpers shared by the global search shortcuts and the
 * command palette dispatcher.
 *
 * `event.code` names a position on a US QWERTY reference layout, not the
 * character that was typed, so matching on it fires a shortcut from whatever key
 * happens to sit there. Character shortcuts match `event.key` instead.
 *
 * Listed in both `skins.citizen.scripts` and `skins.citizen.commandPalette` in
 * skin.json.
 */

/**
 * Whether the user is on a Mac, which composes characters with Option where
 * other platforms use AltGr, and uses Control+Option where they use Alt+Shift.
 *
 * `userAgentData` is Chromium-only; `platform` is deprecated but universal.
 *
 * @param {Navigator|null} [navigator]
 * @return {boolean}
 */
function isMacPlatform( navigator ) {
	if ( !navigator ) {
		return false;
	}
	const platform = ( navigator.userAgentData && navigator.userAgentData.platform ) ||
		navigator.platform || '';
	return /mac|iphone|ipad/i.test( platform );
}

/**
 * Whether a letter shortcut was pressed, by the letter typed rather than the
 * key position.
 *
 * Position is the better guess in the one case where no Latin letter is typed
 * at all: Cyrillic, Greek and Arabic keycaps carry a Latin legend that follows
 * the US positions. macOS rewrites `event.key` into a glyph for every Option
 * chord (Option+Shift+F reports "Ï"), which lands in the same fallback.
 *
 * The regex is deliberately ASCII-only — full Unicode case folding maps U+017F
 * and U+212A onto "s" and "k".
 *
 * @param {KeyboardEvent} event
 * @param {string} letter lowercase ASCII letter
 * @return {boolean}
 */
function isLetterPressed( event, letter ) {
	if ( /^[a-z]$/i.test( event.key ) ) {
		return event.key.toLowerCase() === letter;
	}
	return event.code === `Key${ letter.toUpperCase() }`;
}

/**
 * Whether the event is a character composed with AltGr rather than a chord.
 *
 * Windows delivers AltGr as Ctrl+Alt; Macs compose the same characters with
 * Option alone, which the modifier flags cannot tell apart from an Alt chord.
 * Both have to read as "the user typed a character".
 *
 * The single-character test is what keeps real chords out — Ctrl+Alt+ArrowDown
 * and Option+ArrowLeft are both live elsewhere. A plain space is excluded with
 * them: Ctrl+Alt+Space is a chord, and layouts that put a space on the AltGr
 * layer emit U+00A0, never U+0020.
 *
 * @param {KeyboardEvent} event
 * @param {boolean} isMac
 * @return {boolean}
 */
function isAltGraphChar( event, isMac ) {
	if (
		event.metaKey ||
		!event.altKey ||
		( event.key || '' ).length !== 1 ||
		event.key === ' '
	) {
		return false;
	}
	if ( typeof event.getModifierState === 'function' && event.getModifierState( 'AltGraph' ) ) {
		return true;
	}
	return event.ctrlKey || isMac;
}

/**
 * Whether the event carries the modifiers MediaWiki uses for access keys.
 *
 * There is no single chord — `mediawiki.util`'s `getAccessKeyModifiers`
 * resolves it per platform. It also returns a bare Alt for legacy Edge and a
 * bare Ctrl for unrecognised browsers on a Mac; neither is claimed here,
 * because Alt+F is the Windows File menu and Ctrl+F is find-in-page.
 *
 * @param {KeyboardEvent} event
 * @param {boolean} isMac
 * @return {boolean}
 */
function isAccessKeyChord( event, isMac ) {
	if ( event.metaKey ) {
		return false;
	}
	if ( event.altKey && event.shiftKey && !event.ctrlKey ) {
		return true;
	}
	return isMac && event.ctrlKey && event.altKey && !event.shiftKey;
}

/**
 * Whether an input method is composing text, rather than the user pressing a
 * key meant for the page. The key that commits or cancels a candidate still
 * dispatches keydown.
 *
 * The legacy `keyCode === 229` tell is deliberately not read: Chrome on Android
 * reports it for almost every non-printable key, Enter included, whether or not
 * anything is composing, so trusting it disables Enter and Backspace there.
 *
 * That leaves engines which end the composition just before the commit keydown,
 * where `isComposing` is already false. Closing that needs
 * `compositionstart`/`compositionend` tracked on the input, cleared a tick after
 * the end so the commit still sees it.
 *
 * @param {KeyboardEvent} event
 * @return {boolean}
 */
function isComposing( event ) {
	return Boolean( event.isComposing );
}

module.exports = {
	isMacPlatform,
	isLetterPressed,
	isAltGraphChar,
	isAccessKeyChord,
	isComposing
};
