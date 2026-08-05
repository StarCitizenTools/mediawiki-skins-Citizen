/**
 * Pure keybinding resolver for the command palette.
 *
 * A binding is data: { id, zone, keys, when, worksDuringHelp, handle, hint }.
 * Both the keydown dispatcher and the footer hints derive from the same list,
 * so a hint is visible iff its handler will fire.
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
 * @property {Function} when Predicate `(state) => boolean`; binding active iff true.
 * @property {boolean} [worksDuringHelp] If true, applies even when state.helpVisible.
 * @property {Function} handle Side effect `(state, event) => void`.
 * @property {KeyHint|null} [hint] Footer hint; omit/null for silent bindings.
 */

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
 * @return {KeyBinding|null}
 */
function resolveBinding( state, key, bindings ) {
	const zone = state.actionsFocused ? 'action' : 'input';
	for ( const binding of bindings ) {
		if ( binding.zone !== zone ) {
			continue;
		}
		if ( !binding.keys.includes( key ) ) {
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

module.exports = { resolveBinding, resolveHints };
