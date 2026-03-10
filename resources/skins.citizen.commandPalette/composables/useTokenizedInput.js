const { ref, computed } = require( 'vue' );

/**
 * Composable that manages tokenized input state for the command palette.
 * Tokens are visual chips (e.g. "Talk:") that represent structural filters.
 * The composable exposes a fullQuery computed that serializes tokens + freeText
 * into a plain string for the orchestrator.
 *
 * @param {Function} getTokenPatterns Function that returns the current token pattern array.
 * @param {Object} activeMode Vue ref to the currently active mode (null = root).
 * @return {Object} Token state and methods.
 */
function useTokenizedInput( getTokenPatterns, activeMode ) {
	let tokenCounter = 0;
	const tokens = ref( [] );
	const freeText = ref( '' );
	const selectedIndex = ref( -1 );
	let suppressDetection = false;
	let suppressedTextLength = 0;

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
		const entry = {
			id: 'token-' + ( tokenCounter++ ),
			label: token.label,
			raw: token.raw,
			modeId: token.modeId,
			position: token.position || 'any'
		};
		if ( token.variant ) {
			entry.variant = token.variant;
		}
		tokens.value = [ ...tokens.value, entry ];
	}

	/**
	 * Removes a token by index and suppresses auto-detection until the user
	 * types new content (text length grows). This prevents the removed token's
	 * raw text from being immediately re-tokenized while the user edits it.
	 *
	 * @param {number} index The index of the token to remove.
	 */
	function removeToken( index ) {
		tokens.value = tokens.value.filter( ( _, i ) => i !== index );
		selectedIndex.value = -1;
		suppressDetection = true;
		suppressedTextLength = Infinity;
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
		const modeActive = activeMode && activeMode.value;
		if ( pattern.activeIn === 'root' ) {
			if ( modeActive ) {
				return false;
			}
		} else if ( !modeActive || modeActive.id !== pattern.activeIn ) {
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
		for ( const pattern of getTokenPatterns() ) {
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
				position: pattern.position,
				variant: pattern.variant
			} );
			return { remaining: text.slice( result.raw.length ) };
		}
		return null;
	}

	/**
	 * Tries to match one eligible eagerMatch pattern against text.
	 * eagerMatch is an optional, more lenient matcher on token patterns
	 * (e.g. allowing end-of-string as a terminator) used only after
	 * the standard pass has already matched at least one token.
	 *
	 * @param {string} text The text to match against.
	 * @return {{ remaining: string }|null} The remaining text, or null if no match.
	 */
	function tryMatchOneEagerToken( text ) {
		for ( const pattern of getTokenPatterns() ) {
			if ( !isPatternEligible( pattern ) || !pattern.eagerMatch ) {
				continue;
			}
			const result = pattern.eagerMatch( text );
			if ( !result || !result.raw.length ) {
				continue;
			}
			addToken( {
				label: result.label,
				raw: result.raw,
				modeId: pattern.modeId,
				position: pattern.position,
				variant: pattern.variant
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
	 * After the standard pass, if at least one token was matched (indicating
	 * a paste or bulk input), runs an eager pass that uses patterns' optional
	 * eagerMatch to capture terminal tokens like trailing printouts.
	 *
	 * @param {string} text The text to detect tokens in.
	 * @return {string} The remaining text after all matches are stripped.
	 */
	function detectTokens( text ) {
		let remaining = text;
		// Strip leading whitespace if it would expose a matching pattern.
		// This handles cases like typing " [[Located in::Germany]]" after
		// a previously tokenized condition.
		remaining = stripWhitespaceIfTokenFollows( remaining );
		let match;
		let matchedCount = 0;
		while ( ( match = tryMatchOneToken( remaining ) ) ) {
			remaining = match.remaining;
			matchedCount++;
			// Strip inter-token whitespace so pasted text like
			// "[[Category:City]] [[Located in::Germany]]" keeps matching.
			remaining = stripWhitespaceIfTokenFollows( remaining );
		}

		// Eager pass: when tokens were matched in this call (paste/bulk input),
		// try lenient matching on the remaining text to capture terminal tokens
		// (e.g. the last printout in "[[Category:City]]|?Pop|?Origin country").
		if ( matchedCount > 0 && remaining.trim() ) {
			const trimmed = remaining.replace( /^\s+/, '' );
			const eager = tryMatchOneEagerToken( trimmed );
			if ( eager ) {
				remaining = eager.remaining;
			}
		}

		return remaining;
	}

	/**
	 * Strips leading whitespace from text only if removing it would expose
	 * a matching token pattern (side-effect-free peek).
	 *
	 * @param {string} text The text to check.
	 * @return {string} The possibly trimmed text.
	 */
	function stripWhitespaceIfTokenFollows( text ) {
		const trimmed = text.replace( /^\s+/, '' );
		if ( trimmed !== text && wouldMatchAnyPattern( trimmed ) ) {
			return trimmed;
		}
		return text;
	}

	/**
	 * Checks whether any eligible pattern would match the given text,
	 * without adding a token (side-effect-free peek).
	 *
	 * @param {string} text The text to check.
	 * @return {boolean}
	 */
	function wouldMatchAnyPattern( text ) {
		for ( const pattern of getTokenPatterns() ) {
			if ( !isPatternEligible( pattern ) ) {
				continue;
			}
			const result = pattern.match( text );
			if ( result && result.raw.length ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Sets the free text value. Runs auto-detection against registered
	 * tokenPatterns unless detection is suppressed (e.g. after removeToken).
	 *
	 * Detection stays suppressed while the text is shrinking or unchanged
	 * (user is backspacing/editing the removed token). It resumes once the
	 * text grows (user typed new content past the edit point).
	 *
	 * @param {string} text The new free text value.
	 */
	function setFreeText( text ) {
		if ( suppressDetection ) {
			if ( text.length > suppressedTextLength ) {
				suppressDetection = false;
			} else {
				suppressedTextLength = text.length;
				freeText.value = text;
				return;
			}
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
		suppressedTextLength = 0;
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
