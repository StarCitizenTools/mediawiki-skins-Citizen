/**
 * Pure keybinding resolver for the command palette.
 *
 * A binding is data: { id, zone, keys, modifiers, when, worksDuringHelp,
 * handle, hint }. Both the keydown dispatcher and the footer hints derive from
 * the same list, so a hint is visible iff its handler will fire.
 *
 * @typedef {Object} KeyHint
 * @property {string} msgKey i18n message key for the label.
 * @property {string} kbd Glyph(s) shown in the <kbd> chip.
 * @property {number} [order=100] Ascending sort order in the footer.
 *
 * @typedef {Object} KeyBinding
 * @property {string} id Stable identifier (tests, debugging).
 * @property {'input'|'action'} zone Focus zone where this binding applies.
 * @property {string[]} keys `event.key` values that trigger this binding. The
 *   two horizontal arrows are logical: the palette mirrors the physical arrow
 *   for RTL interface languages before resolving.
 * @property {string|string[]} [modifiers='none'] Which modifier state the
 *   binding claims, from `none`, `shift`, `accel` (Ctrl, or Command on a Mac),
 *   `accel+shift`, or `any`. An array accepts several. Anything not named here
 *   — an Alt chord, the Windows key — is unclaimable except via `any`, so it
 *   stays with the browser.
 * @property {Function} when Predicate `(state) => boolean`; binding active iff true.
 * @property {boolean} [worksDuringHelp] If true, applies even when state.helpVisible.
 * @property {Function} handle Side effect `(state, event) => void`.
 * @property {KeyHint|null} [hint] Footer hint; omit/null for silent bindings.
 */

/**
 * Reduce a keyboard event to the modifier state a binding can claim.
 *
 * Two of these are normalisations rather than readings, and they are the point
 * of the whole exercise: a character composed with AltGr, and a capital typed
 * with Shift, are *typed text* rather than chords, so both report `none`. That
 * knowledge used to live in a guard that spoke for every binding at once, which
 * is why a plain space and a `?` picked up modifier states nobody chose.
 *
 * @param {KeyboardEvent} event
 * @param {boolean} isMac
 * @param {Function} isAltGraphChar
 * @return {string} one of `none`, `shift`, `accel`, `accel+shift`, `other`
 */
function modifierToken( event, isMac, isAltGraphChar ) {
	if ( isAltGraphChar( event, isMac ) ) {
		return 'none';
	}
	const accel = isMac ? event.metaKey : event.ctrlKey;
	// Alt on its own, and the Windows key, are nobody's to claim.
	const foreign = event.altKey || ( isMac ? event.ctrlKey : event.metaKey );
	// Shift only counts as a modifier on a key that produces no character —
	// otherwise `?` and `@` would be unreachable.
	const shift = event.shiftKey && ( event.key || '' ).length !== 1;
	if ( foreign ) {
		return 'other';
	}
	if ( accel ) {
		return shift ? 'accel+shift' : 'accel';
	}
	return shift ? 'shift' : 'none';
}

/**
 * Whether a binding claims the given modifier state.
 *
 * @param {KeyBinding} binding
 * @param {string} token
 * @return {boolean}
 */
function acceptsModifiers( binding, token ) {
	const spec = binding.modifiers === undefined ? 'none' : binding.modifiers;
	if ( spec === 'any' ) {
		return true;
	}
	return Array.isArray( spec ) ? spec.includes( token ) : spec === token;
}

/**
 * Whether a binding is currently active in the given state.
 *
 * @param {Object} state
 * @param {KeyBinding} binding
 * @return {boolean}
 */
function isActive( state, binding ) {
	if ( state.helpVisible && !binding.worksDuringHelp ) {
		return false;
	}
	return binding.when( state );
}

/**
 * Find the first binding that should fire for the given event.
 *
 * Takes the key rather than the event: callers pass a direction-mirrored key
 * under RTL, and accepting an event here would invite reading other properties
 * off it — which would then diverge between RTL and LTR without anything
 * failing.
 *
 * @param {Object} state
 * @param {string} key
 * @param {KeyBinding[]} bindings
 * @param {string} [modifiers='none'] Modifier state from `modifierToken`.
 * @return {KeyBinding|null}
 */
function resolveBinding( state, key, bindings, modifiers ) {
	const zone = state.actionsFocused ? 'action' : 'input';
	// Defaulting here matches the field's own default, so a caller that does
	// not care is correct by construction rather than by omission.
	const token = modifiers || 'none';
	for ( const binding of bindings ) {
		if ( binding.zone !== zone ) {
			continue;
		}
		if ( !binding.keys.includes( key ) ) {
			continue;
		}
		if ( !acceptsModifiers( binding, token ) ) {
			continue;
		}
		if ( !isActive( state, binding ) ) {
			continue;
		}
		return binding;
	}
	return null;
}

/**
 * Collect visible hints for a zone, sorted and deduped.
 *
 * @param {Object} state
 * @param {'input'|'action'} zone
 * @param {KeyBinding[]} bindings
 * @return {KeyHint[]}
 */
function resolveHints( state, zone, bindings ) {
	const candidates = [];
	for ( const binding of bindings ) {
		if ( binding.zone !== zone ) {
			continue;
		}
		if ( !binding.hint ) {
			continue;
		}
		if ( !isActive( state, binding ) ) {
			continue;
		}
		candidates.push( binding.hint );
	}
	candidates.sort( ( a, b ) => ( a.order || 100 ) - ( b.order || 100 ) );
	const seen = new Set();
	const hints = [];
	for ( const hint of candidates ) {
		if ( seen.has( hint.kbd ) ) {
			continue;
		}
		seen.add( hint.kbd );
		hints.push( hint );
	}
	return hints;
}

module.exports = { modifierToken, resolveBinding, resolveHints };
