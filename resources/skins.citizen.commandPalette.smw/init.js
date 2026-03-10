/**
 * Semantic MediaWiki Ask query mode for the command palette.
 * Loaded conditionally only when SMW is installed.
 */
const { cdxIconAdd, cdxIconListBullet, cdxIconTag, cdxIconWikitext } = require( './icons.json' );
const config = require( './config.json' );
const parseIncompleteCondition = require( './queryParser.js' );

/**
 * Builds a state object for emptyState / noResults display.
 *
 * @param {string} key The suffix for the i18n message key (e.g. 'noresults').
 * @return {{ title: string, description: string, icon: string }}
 */
function makeState( key ) {
	return {
		title: mw.message( 'citizen-command-palette-mode-smw-' + key + '-title' ).text(),
		description: mw.message( 'citizen-command-palette-mode-smw-' + key + '-description' ).text(),
		icon: cdxIconWikitext
	};
}

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
 * Matches a completed SMW printout at the start of text.
 * Detects patterns like |?Population or |?Located in.
 *
 * Requires a delimiter (| or [) after the property name to avoid
 * premature tokenization during character-by-character typing.
 * This means printouts only tokenize when the user has moved on
 * to typing the next token (e.g. "|?Breed group|?Origin").
 *
 * @param {string} text The input text to check.
 * @return {{ label: string, raw: string }|null} Match result or null.
 */
function matchSmwPrintout( text ) {
	const m = /^\|(\?[^|[\]]+)(?=[|[\]])/.exec( text );
	if ( !m ) {
		return null;
	}
	const raw = m[ 0 ];
	const label = m[ 1 ].slice( 1 );
	return { label, raw };
}

/**
 * Extracts a display string from a single SMW printout value.
 * Page-type values have a fulltext property; others use the raw value.
 *
 * @param {Object|string} value A single printout value from the API.
 * @return {string} Display string.
 */
function formatPrintoutValue( value ) {
	if ( typeof value === 'object' && value !== null ) {
		if ( value.fulltext !== undefined ) {
			return String( value.fulltext );
		}
		if ( value.raw !== undefined ) {
			return String( value.raw );
		}
		return String( value );
	}
	return String( value );
}

/**
 * Converts SMW printouts from the Ask API into detail pairs.
 *
 * @param {Object} printouts The printouts object from a result subject.
 * @return {Object|undefined} Detail object with pairs array, or undefined.
 */
function adaptPrintouts( printouts ) {
	if ( !printouts || typeof printouts !== 'object' ) {
		return undefined;
	}
	const pairs = Object.entries( printouts ).map( ( [ label, values ] ) => ( {
		label,
		value: Array.isArray( values ) ? values.map( formatPrintoutValue ).join( ', ' ) : ''
	} ) );
	if ( pairs.length === 0 ) {
		return undefined;
	}
	return { pairs };
}

/**
 * Adapts a single SMW Ask API result into a CommandPaletteItem.
 *
 * @param {Object} subject The result subject from the SMW API.
 * @param {number} index Result index for unique ID generation.
 * @return {Object} A CommandPaletteItem.
 */
function adaptSmwResult( subject, index ) {
	const item = {
		id: 'citizen-command-palette-item-smw-' + index,
		type: 'smw',
		label: subject.fulltext,
		url: subject.fullurl
	};
	const detail = adaptPrintouts( subject.printouts );
	if ( detail ) {
		item.detail = detail;
	}
	return item;
}

/**
 * Creates a fetcher for SMW browse suggestions.
 *
 * @param {string} browse The smwbrowse type ('property' or 'category').
 * @param {string} typePrefix The item type prefix (e.g. 'smw-property').
 * @param {string} icon The icon for result items.
 * @return {function(string): Promise<Array>} Fetcher function.
 */
function createSmwBrowseFetcher( browse, typePrefix, icon ) {
	return function ( fragment ) {
		return new mw.Api().get( {
			action: 'smwbrowse',
			browse: browse,
			params: JSON.stringify( { search: fragment, limit: 10 } ),
			maxage: config.wgSearchSuggestCacheExpiry,
			smaxage: config.wgSearchSuggestCacheExpiry
		} ).then( ( data ) => {
			const items = Object.values( data.query || {} );
			return items.map( ( item, index ) => ( {
				id: 'citizen-command-palette-item-' + typePrefix + '-' + index,
				type: typePrefix,
				thumbnailIcon: icon,
				label: item.label,
				highlightQuery: true
			} ) );
		} ).catch( ( error ) => {
			if ( error !== 'AbortError' ) {
				mw.log.error( '[commandPalette] SMW ' + browse + ' query failed:', error );
			}
			return [];
		} );
	};
}

const fetchPropertySuggestions = createSmwBrowseFetcher( 'property', 'smw-property', cdxIconTag );
const fetchCategorySuggestions = createSmwBrowseFetcher( 'category', 'smw-category', cdxIconTag );

/**
 * Fetches SMW value suggestions for a specific property.
 *
 * @param {string} fragment The partial value to search for.
 * @param {string} property The property name to fetch values for.
 * @return {Promise<Array>} Array of CommandPaletteItems.
 */
function fetchValueSuggestions( fragment, property ) {
	return new mw.Api().get( {
		action: 'smwbrowse',
		browse: 'pvalue',
		params: JSON.stringify( { search: fragment, property: property, limit: 10 } ),
		maxage: config.wgSearchSuggestCacheExpiry,
		smaxage: config.wgSearchSuggestCacheExpiry
	} ).then( ( data ) => {
		const values = data.query || [];
		return values.map( ( value, index ) => ( {
			id: 'citizen-command-palette-item-smw-value-' + index,
			type: 'smw-value',
			thumbnailIcon: cdxIconAdd,
			label: value,
			value: property,
			highlightQuery: true
		} ) );
	} ).catch( ( error ) => {
		if ( error !== 'AbortError' ) {
			mw.log.error( '[commandPalette] SMW pvalue query failed:', error );
		}
		return [];
	} );
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
 * and any text outside of conditions and printout statements must be
 * empty or whitespace-only. This prevents sending malformed queries like
 * "[[Category:City]]some freetext" which the API would reject.
 *
 * @param {string} askQuery The combined Ask query string.
 * @return {boolean}
 */
function isCompleteAskQuery( askQuery ) {
	const stripped = askQuery
		.replace( /\[\[[^\]]+\]\]/g, '' )
		.replace( /\|\?[^|[\]]+/g, '' );
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
	// Check for incomplete condition — show suggestions instead of Ask results
	const incomplete = parseIncompleteCondition( subQuery );
	if ( incomplete ) {
		if ( incomplete.stage === 'property' ) {
			return fetchPropertySuggestions( incomplete.fragment );
		}
		if ( incomplete.stage === 'category' ) {
			return fetchCategorySuggestions( incomplete.fragment );
		}
		if ( incomplete.stage === 'value' ) {
			return fetchValueSuggestions( incomplete.fragment, incomplete.property );
		}
		if ( incomplete.stage === 'printout' ) {
			return fetchPropertySuggestions( incomplete.fragment )
				.then( ( items ) => items.map( ( item ) => Object.assign(
					{}, item, {
						id: item.id.replace( 'smw-property', 'smw-printout' ),
						type: 'smw-printout',
						thumbnailIcon: cdxIconListBullet
					}
				) ) );
		}
		return [];
	}

	const askQuery = buildAskQuery( subQuery, tokens || [] );
	if ( !askQuery.trim() || !isCompleteAskQuery( askQuery ) ) {
		return [];
	}

	const api = new mw.Api();
	try {
		const data = await api.get( {
			action: 'ask',
			query: askQuery + '|limit=10',
			format: 'json',
			maxage: config.wgSearchSuggestCacheExpiry,
			smaxage: config.wgSearchSuggestCacheExpiry
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
	emptyState: makeState( 'empty' ),
	noResults( query, tokens ) {
		const incomplete = parseIncompleteCondition( query );
		const stageKeys = {
			property: 'noproperties',
			category: 'nocategories',
			value: 'novalues',
			printout: 'noprintouts'
		};
		if ( incomplete && stageKeys[ incomplete.stage ] ) {
			return makeState( stageKeys[ incomplete.stage ] );
		}

		const fullQuery = buildAskQuery( query, tokens || [] );
		if ( !isCompleteAskQuery( fullQuery ) ) {
			return makeState( 'malformed' );
		}
		return makeState( 'noresults' );
	},
	tokenPattern: [
		{ modeId: 'smw', position: 'any', activeIn: 'smw', match: matchSmwCondition },
		{ modeId: 'smw', position: 'any', activeIn: 'smw', match: matchSmwPrintout, variant: 'outlined' }
	],
	getResults: getSmwResults,
	onResultSelect( item ) {
		switch ( item.type ) {
			case 'smw-value':
				return { action: 'updateQuery', payload: '[[' + item.value + '::' + item.label + ']]' };
			case 'smw-property':
				return { action: 'updateQuery', payload: '[[' + item.label + '::' };
			case 'smw-category':
				return { action: 'updateQuery', payload: '[[Category:' + item.label + ']]' };
			case 'smw-printout':
				return { action: 'updateQuery', payload: '|?' + item.label };
			default:
				return item.url ?
					{ action: 'navigate', payload: item.url } :
					{ action: 'none' };
		}
	}
};
