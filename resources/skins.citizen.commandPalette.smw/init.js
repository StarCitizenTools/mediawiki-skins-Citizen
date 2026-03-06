/**
 * Semantic MediaWiki Ask query mode for the command palette.
 * Loaded conditionally only when SMW is installed.
 */
const { cdxIconWikitext } = require( './icons.json' );

/**
 * Matches a completed SMW condition at the start of text.
 * Detects patterns like [[Category:City]] or [[Located in::Germany]].
 *
 * Known limitation: nested bracket syntax (e.g. [[Has value::[[Nested]]]])
 * is not supported — the regex stops at the first ]] pair.  This is
 * acceptable because nested subqueries are rare in interactive Ask input.
 *
 * @param {string} text The input text to check.
 * @return {{ label: string, raw: string }|null} Match result or null.
 */
function matchSmwCondition( text ) {
	const m = /^\[\[([^\]]+)\]\]/.exec( text );
	if ( !m ) {
		return null;
	}
	const raw = m[ 0 ];
	const inner = m[ 1 ];
	const label = inner
		.replace( /::/, ': ' )
		.replace( /^(Category):/, '$1: ' );
	return { label, raw };
}

/**
 * Adapts a single SMW Ask API result into a CommandPaletteItem.
 *
 * @param {Object} subject The result subject from the SMW API.
 * @param {number} index Result index for unique ID generation.
 * @return {Object} A CommandPaletteItem.
 */
function adaptSmwResult( subject, index ) {
	return {
		id: 'citizen-command-palette-item-smw-' + index,
		type: 'smw',
		label: subject.fulltext,
		url: subject.fullurl
	};
}

/**
 * Builds the Ask query string from tokens and free text.
 *
 * @param {string} subQuery The free text portion.
 * @param {Array} tokens The token array.
 * @return {string} The combined Ask query.
 */
function buildAskQuery( subQuery, tokens ) {
	const tokenParts = tokens
		.filter( ( t ) => t.modeId === 'smw' )
		.map( ( t ) => t.raw );
	return tokenParts.join( '' ) + subQuery;
}

/**
 * Tests whether an Ask query string is valid to send to the API.
 * The query must contain at least one complete condition ([[...]]),
 * and any text outside of conditions must be empty or whitespace-only.
 * This prevents sending malformed queries like
 * "[[Category:City]]some freetext" which the API would reject.
 *
 * Known limitation: printout statements (e.g. |?Property) are not
 * supported — they would be rejected as non-condition text, and would
 * also conflict with the |limit=10 parameter appended by getSmwResults.
 *
 * @param {string} askQuery The combined Ask query string.
 * @return {boolean}
 */
function isCompleteAskQuery( askQuery ) {
	const stripped = askQuery.replace( /\[\[[^\]]+\]\]/g, '' );
	return stripped.trim() === '' && /\[\[[^\]]+\]\]/.test( askQuery );
}

/**
 * Fetches results from the SMW Ask API.
 *
 * @param {string} subQuery The free text portion of the query.
 * @param {AbortSignal} [_signal] Unused — mw.Api does not support AbortSignal.
 *   Kept for interface conformance with PaletteMode.getResults.
 * @param {Array} [tokens] Optional tokens array.
 * @return {Promise<Array>} Array of CommandPaletteItems.
 */
async function getSmwResults( subQuery, _signal, tokens ) {
	const askQuery = buildAskQuery( subQuery, tokens || [] );
	if ( !askQuery.trim() || !isCompleteAskQuery( askQuery ) ) {
		return [];
	}

	const api = new mw.Api();
	try {
		const data = await api.get( {
			action: 'ask',
			query: askQuery + '|limit=10',
			format: 'json'
		} );

		const results = data?.query?.results;
		if ( !results ) {
			return [];
		}

		return Object.values( results ).map( adaptSmwResult );
	} catch ( error ) {
		// mw.Api rejects with string error codes (not Error objects),
		// so we compare with !== rather than error.name.
		if ( error !== 'AbortError' ) {
			mw.log.error( '[commandPalette] SMW query failed:', error );
		}
		return [];
	}
}

module.exports = {
	id: 'smw',
	triggers: [ '/smw:' ],
	icon: cdxIconWikitext,
	label: mw.message( 'citizen-command-palette-command-smw-label' ).text(),
	description: mw.message( 'citizen-command-palette-command-smw-description' ).text(),
	placeholder: mw.message( 'citizen-command-palette-mode-smw-placeholder' ).text(),
	emptyState: {
		title: mw.message( 'citizen-command-palette-mode-smw-empty-title' ).text(),
		description: mw.message( 'citizen-command-palette-mode-smw-empty-description' ).text(),
		icon: cdxIconWikitext
	},
	noResults( query, tokens ) {
		const fullQuery = buildAskQuery( query, tokens || [] );
		if ( !isCompleteAskQuery( fullQuery ) ) {
			return {
				title: mw.message( 'citizen-command-palette-mode-smw-malformed-title' ).text(),
				description: mw.message( 'citizen-command-palette-mode-smw-malformed-description' ).text(),
				icon: cdxIconWikitext
			};
		}
		return {
			title: mw.message( 'citizen-command-palette-mode-smw-noresults-title' ).text(),
			description: mw.message( 'citizen-command-palette-mode-smw-noresults-description' ).text(),
			icon: cdxIconWikitext
		};
	},
	tokenPattern: {
		modeId: 'smw',
		position: 'any',
		activeIn: 'smw',
		match: matchSmwCondition
	},
	getResults: getSmwResults,
	onResultSelect( item ) {
		return item.url ?
			{ action: 'navigate', payload: item.url } :
			{ action: 'none' };
	}
};
