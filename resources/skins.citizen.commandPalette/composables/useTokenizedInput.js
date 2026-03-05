const { ref, computed } = require( 'vue' );

/**
 * Composable that manages tokenized input state for the command palette.
 * Tokens are visual chips (e.g. "Talk:") that represent structural filters.
 * The composable exposes a fullQuery computed that serializes tokens + freeText
 * into a plain string for the orchestrator.
 *
 * @param {Array<Object>} tokenPatterns Array of token pattern definitions from modes.
 * @param {Object} activeMode Vue ref to the currently active mode (null = root).
 * @return {Object} Token state and methods.
 */
function useTokenizedInput( tokenPatterns, activeMode ) {
	let tokenCounter = 0;
	const tokens = ref( [] );
	const freeText = ref( '' );
	const selectedIndex = ref( -1 );
	let suppressDetection = false;

	const fullQuery = computed( () => {
		const prefixTokens = tokens.value.filter( ( t ) => t.position === 'prefix' );
		const anyTokens = tokens.value.filter( ( t ) => t.position !== 'prefix' );
		const parts = [
			...prefixTokens.map( ( t ) => t.raw ),
			...anyTokens.map( ( t ) => t.raw ),
			freeText.value
		];
		return parts.join( '' );
	} );

	/**
	 * Adds a token to the list.
	 *
	 * @param {Object} token Token descriptor with label, raw, modeId, and optional position.
	 */
	function addToken( token ) {
		tokens.value = [ ...tokens.value, {
			id: 'token-' + ( tokenCounter++ ),
			label: token.label,
			raw: token.raw,
			modeId: token.modeId,
			position: token.position || 'any'
		} ];
	}

	/**
	 * Removes a token by index and suppresses auto-detection for the next
	 * setFreeText call (the orchestrator handles prepending the raw text).
	 *
	 * @param {number} index The index of the token to remove.
	 */
	function removeToken( index ) {
		tokens.value = tokens.value.filter( ( _, i ) => i !== index );
		selectedIndex.value = -1;
		suppressDetection = true;
	}

	/**
	 * Selects a token by index (for keyboard/click highlight).
	 *
	 * @param {number} index The index of the token to select.
	 */
	function selectToken( index ) {
		selectedIndex.value = index;
	}

	/**
	 * Deselects any selected token.
	 */
	function deselectToken() {
		selectedIndex.value = -1;
	}

	/**
	 * Checks whether a pattern is eligible to match in the current state.
	 *
	 * @param {Object} pattern The token pattern to check.
	 * @return {boolean}
	 */
	function isPatternEligible( pattern ) {
		if ( pattern.activeIn === 'root' && activeMode && activeMode.value ) {
			return false;
		}
		if ( pattern.position === 'prefix' && !tokens.value.every( ( t ) => t.position === 'prefix' ) ) {
			return false;
		}
		return true;
	}

	/**
	 * Tries to match one eligible pattern against text.
	 * If matched, adds the token and returns the remaining text.
	 *
	 * @param {string} text The text to match against.
	 * @return {{ remaining: string }|null} The remaining text, or null if no match.
	 */
	function tryMatchOneToken( text ) {
		for ( const pattern of tokenPatterns ) {
			if ( !isPatternEligible( pattern ) ) {
				continue;
			}
			const result = pattern.match( text );
			if ( !result || !result.raw.length ) {
				continue;
			}
			addToken( {
				label: result.label,
				raw: result.raw,
				modeId: pattern.modeId,
				position: pattern.position
			} );
			return { remaining: text.slice( result.raw.length ) };
		}
		return null;
	}

	/**
	 * Runs auto-detection on text against registered tokenPatterns.
	 * For each match found, creates a token and strips the matched portion,
	 * then re-runs detection on the remaining text.
	 *
	 * @param {string} text The text to detect tokens in.
	 * @return {string} The remaining text after all matches are stripped.
	 */
	function detectTokens( text ) {
		let remaining = text;
		let match;
		while ( ( match = tryMatchOneToken( remaining ) ) ) {
			remaining = match.remaining;
		}
		return remaining;
	}

	/**
	 * Sets the free text value. Runs auto-detection against registered
	 * tokenPatterns unless detection is suppressed (e.g. after removeToken).
	 *
	 * @param {string} text The new free text value.
	 */
	function setFreeText( text ) {
		if ( suppressDetection ) {
			freeText.value = text;
			suppressDetection = false;
			return;
		}
		freeText.value = detectTokens( text );
	}

	/**
	 * Clears all tokens, freeText, and selection.
	 */
	function clear() {
		tokens.value = [];
		freeText.value = '';
		selectedIndex.value = -1;
		suppressDetection = false;
	}

	return {
		tokens,
		freeText,
		selectedIndex,
		fullQuery,
		addToken,
		removeToken,
		setFreeText,
		selectToken,
		deselectToken,
		clear
	};
}

module.exports = useTokenizedInput;
